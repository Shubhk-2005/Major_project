"""Preprocessing and feature engineering pipeline for MsAdmit.

Cleans canonical admissions dataset, harmonizes GPAs and test scores,
enriches records with QS 2026 CS rankings and university admit benchmarks,
and produces the university catalog for batch portfolio evaluation.
"""

import os
import re
import json
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, Optional
from sklearn.model_selection import train_test_split


def clean_institution_name(name: str) -> str:
    """Normalize university names for reliable matching."""
    if not isinstance(name, str):
        return ""
    name = name.lower()
    name = re.sub(r"\(.*?\)", "", name)
    name = re.sub(r"[^a-z0-9 ]", " ", name)
    name = " ".join(name.split())
    # Common acronym and synonym mappings
    synonyms = {
        "cmu": "carnegie mellon university",
        "mit": "massachusetts institute of technology",
        "uc berkeley": "university of california berkeley",
        "ucb": "university of california berkeley",
        "ucla": "university of california los angeles",
        "ucsd": "university of california san diego",
        "uiuc": "university of illinois urbana champaign",
        "gatech": "georgia institute of technology",
        "nyu": "new york university",
        "usc": "university of southern california",
        "asu": "arizona state university",
        "neu": "northeastern university",
        "ncsu": "north carolina state university",
        "suny buffalo": "university at buffalo",
        "stony brook": "stony brook university",
        "tamu": "texas a m university",
        "utd": "university of texas dallas",
        "uta": "university of texas arlington",
        "uw": "university of washington",
    }
    return synonyms.get(name, name)


def parse_gpa_to_4_scale(row: pd.Series) -> float:
    """Standardize undergraduate GPA from various sources onto a 4.0 scale."""
    norm = row.get("cgpa")
    if pd.notna(norm) and 1.5 <= norm <= 4.0:
        return float(norm)

    orig = row.get("cgpa_original")
    scale = row.get("cgpa_scale_original")
    if pd.isna(orig) or orig <= 0:
        return np.nan

    try:
        orig = float(orig)
    except (ValueError, TypeError):
        return np.nan

    # Percentage scale (e.g. 75% -> 3.0 / 4.0)
    if scale == 100 or orig > 10.0:
        if 40.0 <= orig <= 100.0:
            return round(min(4.0, max(1.5, (orig / 100.0) * 4.0)), 2)
        return np.nan

    # 10.0 scale (common in India: Edulix, YMGrad)
    if scale == 10 or orig > 4.0:
        if 4.0 <= orig <= 10.0:
            return round(min(4.0, max(1.5, (orig / 10.0) * 4.0)), 2)
        return np.nan

    # Already on 4.0 scale (common in GradCafe)
    if 1.5 <= orig <= 4.0:
        return round(orig, 2)

    return np.nan


def parse_gre_score(score: Any) -> float:
    """Standardize GRE scores to modern 260-340 scale."""
    if pd.isna(score):
        return np.nan
    try:
        score = float(score)
    except (ValueError, TypeError):
        return np.nan

    if 260.0 <= score <= 340.0:
        return round(score, 1)

    # Old GRE scale (out of 1600) -> convert to 340 scale
    if 400.0 <= score <= 1600.0:
        converted = 260.0 + ((score - 400.0) / 1200.0) * 80.0
        return round(min(340.0, max(260.0, converted)), 1)

    return np.nan


def parse_english_score(toefl: Any, ielts: Any) -> float:
    """Standardize English scores to TOEFL iBT scale (0-120)."""
    # Prefer TOEFL if available and valid
    if pd.notna(toefl):
        try:
            t = float(toefl)
            if 60.0 <= t <= 120.0:
                return round(t, 1)
        except (ValueError, TypeError):
            pass

    # Map IELTS band (0-9) to TOEFL equivalent via ETS official concordance
    if pd.notna(ielts):
        try:
            i = float(ielts)
            if i >= 8.5:
                return 115.0
            if i >= 8.0:
                return 110.0
            if i >= 7.5:
                return 105.0
            if i >= 7.0:
                return 98.0
            if i >= 6.5:
                return 86.0
            if i >= 6.0:
                return 75.0
            if i >= 5.0:
                return 60.0
        except (ValueError, TypeError):
            pass

    return np.nan


def build_university_catalog(
    admissions_df: pd.DataFrame,
    qs_df: pd.DataFrame,
    min_applications: int = 15
) -> Tuple[Dict[str, Dict[str, Any]], pd.DataFrame]:
    """Create university knowledge base strictly for the Top 150 QS ranked institutions."""
    # 1. Load the official Top 150 universities from frontend data definition
    frontend_ts_path = "src/data/qsUniversities.ts"
    qs_top150_list = []
    if os.path.exists(frontend_ts_path):
        with open(frontend_ts_path, "r", encoding="utf-8") as f:
            ts_text = f.read()
        m = re.search(r"export const qsTop150Universities: QsUniversity\[\] = (\[.*?\]);", ts_text, re.DOTALL)
        if m:
            qs_top150_list = json.loads(m.group(1))

    # Fallback to QS CSV if TypeScript file not found
    if not qs_top150_list:
        rank_col = [c for c in qs_df.columns if "2026" in c or "RANK" in c.upper()][0]
        qs_sorted = qs_df.copy()
        qs_sorted["rank_num"] = qs_sorted[rank_col].apply(lambda v: int(re.search(r"\d+", str(v)).group()) if re.search(r"\d+", str(v)) else 999)
        qs_top150 = qs_sorted[qs_sorted["rank_num"] <= 150].sort_values("rank_num")
        for _, r in qs_top150.iterrows():
            qs_top150_list.append({
                "id": f"qs-{r['rank_num']}",
                "name": r["INSTITUTION"],
                "rank": r["rank_num"],
                "overallScore": float(r.get("SCORE", 45.0)) if pd.notna(r.get("SCORE")) else 45.0,
                "country": r.get("COUNTRY/TERRITORY", "USA")
            })

    # Pre-clean admissions university names for matching
    admissions_df_copy = admissions_df.copy()
    admissions_df_copy["clean_uni"] = admissions_df_copy["university_name"].apply(clean_institution_name)

    catalog = {}
    for item in qs_top150_list:
        u_id = item.get("id", f"qs-{item['rank']}")
        name = item["name"]
        rank = int(item["rank"])
        score = float(item.get("overallScore") or 45.0)
        country = item.get("country", "USA")

        u_clean = clean_institution_name(name)
        tokens = [t for t in u_clean.split() if len(t) > 2]

        # Multi-stage fuzzy matching against admissions database
        matches = admissions_df_copy[
            admissions_df_copy["clean_uni"].apply(
                lambda q: u_clean == q or u_clean in q or (len(q) > 6 and q in u_clean) or (len(tokens) >= 2 and all(tok in q for tok in tokens[:2]))
            )
        ]

        if len(matches) >= 10:
            admits = matches[matches["decision_label"] == 1]
            admit_rate = len(admits) / len(matches)
            median_gpa = float(admits["gpa"].median()) if len(admits["gpa"].dropna()) > 0 else 3.5
            median_gre = float(admits["gre"].median()) if len(admits["gre"].dropna()) > 0 else 320.0
            median_toefl = float(admits["toefl"].median()) if len(admits["toefl"].dropna()) > 0 else 105.0
            median_work = float(admits["work_experience_years"].median()) if len(admits) > 0 else 0.0
            median_pubs = float(admits["research_publications"].median()) if len(admits) > 0 else 0.0
            total_apps = len(matches)
        else:
            # Calibrated selectivity priors based on QS rank tier
            if rank <= 20:
                median_gpa, median_gre, median_toefl, admit_rate = 3.85, 327.0, 108.0, 0.18
            elif rank <= 50:
                median_gpa, median_gre, median_toefl, admit_rate = 3.72, 323.0, 106.0, 0.28
            elif rank <= 100:
                median_gpa, median_gre, median_toefl, admit_rate = 3.58, 318.0, 104.0, 0.38
            else:
                median_gpa, median_gre, median_toefl, admit_rate = 3.42, 314.0, 102.0, 0.48
            median_work, median_pubs, total_apps = 0.5, 0.0, len(matches)

        if rank <= 30 or admit_rate < 0.25:
            tier_num, tier_label = 1, "Tier 1 (Elite)"
        elif rank <= 75 or admit_rate < 0.45:
            tier_num, tier_label = 2, "Tier 2 (Highly Competitive)"
        elif rank <= 120 or admit_rate < 0.65:
            tier_num, tier_label = 3, "Tier 3 (Competitive)"
        else:
            tier_num, tier_label = 4, "Tier 4 (Selective)"

        catalog[u_id] = {
            "id": u_id,
            "university_name": name,
            "display_name": name,
            "country": country,
            "qs_rank": rank,
            "qs_score": round(score, 1),
            "tier": tier_label,
            "tier_num": tier_num,
            "admit_rate": round(float(admit_rate), 3),
            "median_gpa": round(float(median_gpa), 2),
            "median_gre": round(float(median_gre), 1),
            "median_toefl": round(float(median_toefl), 1),
            "median_work_years": round(float(median_work), 1),
            "median_publications": round(float(median_pubs), 1),
            "total_applications": int(total_apps)
        }

    catalog_df = pd.DataFrame.from_dict(catalog, orient="index")
    return catalog, catalog_df


def load_and_clean_dataset(
    admissions_csv_path: str,
    qs_csv_path: str,
    output_dir: str = "model_building/data/processed"
) -> Tuple[pd.DataFrame, Dict[str, Dict[str, Any]]]:
    """Execute complete data cleaning and enrichment pipeline."""
    os.makedirs(output_dir, exist_ok=True)
    print("⏳ Loading raw canonical dataset...")
    df = pd.read_csv(admissions_csv_path, low_memory=False)
    qs_df = pd.read_csv(qs_csv_path)

    print(f"Loaded {len(df):,} admissions records.")

    # 1. Standardize core features
    df["gpa"] = df.apply(parse_gpa_to_4_scale, axis=1)
    df["gre"] = df["gre_score"].apply(parse_gre_score)
    df["toefl"] = df.apply(lambda r: parse_english_score(r["toefl_score"], r["ielts_score"]), axis=1)

    # 2. Clean experience & publications (impute missing with 0.0)
    df["work_experience_years"] = pd.to_numeric(df["work_experience_years"], errors="coerce").fillna(0.0).clip(0.0, 12.0)
    df["internship_experience_years"] = pd.to_numeric(df["internship_experience_years"], errors="coerce").fillna(0.0).clip(0.0, 5.0)
    df["research_experience_years"] = pd.to_numeric(df["research_experience_years"], errors="coerce").fillna(0.0).clip(0.0, 5.0)
    df["research_publications"] = pd.to_numeric(df["research_publications"], errors="coerce").fillna(0.0).clip(0.0, 10.0)

    # Binary indicators for missing test scores (allows test-optional modeling)
    df["gre_missing"] = df["gre"].isna().astype(int)
    df["toefl_missing"] = df["toefl"].isna().astype(int)

    # Global median imputation for model training features
    global_median_gpa = round(df["gpa"].median(), 2)
    global_median_gre = round(df["gre"].median(), 1)
    global_median_toefl = round(df["toefl"].median(), 1)

    df["gpa_imputed"] = df["gpa"].fillna(global_median_gpa)
    df["gre_imputed"] = df["gre"].fillna(global_median_gre)
    df["toefl_imputed"] = df["toefl"].fillna(global_median_toefl)

    # 3. Build University Catalog
    print("⏳ Building University Knowledge Base & QS Rankings enrichment...")
    catalog, catalog_df = build_university_catalog(df, qs_df)
    print(f"Enriched {len(catalog):,} universities into catalog.")

    # Save Top-150 catalog as JSON (strictly 150 universities)
    catalog_path = os.path.join(output_dir, "university_catalog.json")
    with open(catalog_path, "w") as f:
        json.dump(catalog, f, indent=2)

    # 4. Map university features into admissions dataset
    name_to_meta = {}
    for meta in catalog.values():
        c_name = clean_institution_name(meta["university_name"])
        name_to_meta[c_name] = meta

    df["clean_uni"] = df["university_name"].apply(clean_institution_name)

    def get_matched_meta(clean_u):
        if clean_u in name_to_meta:
            return name_to_meta[clean_u]
        tokens = [t for t in clean_u.split() if len(t) > 2]
        for c_key, m in name_to_meta.items():
            if clean_u in c_key or c_key in clean_u or (len(tokens) >= 2 and all(t in c_key for t in tokens[:2])):
                return m
        return None

    matched_metas = df["clean_uni"].apply(get_matched_meta)
    valid_mask = matched_metas.notna()
    df_clean = df[valid_mask].copy()
    metas = matched_metas[valid_mask]

    df_clean["qs_rank"] = metas.apply(lambda m: m["qs_rank"])
    df_clean["qs_score"] = metas.apply(lambda m: m["qs_score"]).fillna(35.0)
    df_clean["tier_num"] = metas.apply(lambda m: m["tier_num"])
    df_clean["uni_admit_rate"] = metas.apply(lambda m: m["admit_rate"])
    df_clean["uni_median_gpa"] = metas.apply(lambda m: m["median_gpa"])
    df_clean["uni_median_gre"] = metas.apply(lambda m: m["median_gre"])

    # Relative gap features
    df_clean["gpa_gap"] = df_clean["gpa_imputed"] - df_clean["uni_median_gpa"]
    df_clean["gre_gap"] = df_clean["gre_imputed"] - df_clean["uni_median_gre"]

    # 5. Advanced Domain Feature Engineering (Pillars 1 & 2 for 85%+ accuracy)
    # Seasonality: Fall terms have higher applicant competition
    df_clean["is_fall_intake"] = df_clean["intake_term"].astype(str).str.lower().str.contains("fall|autumn").astype(int)

    # Composite Academic Competitiveness Index (CACI)
    df_clean["caci_index"] = (
        0.55 * (df_clean["gpa_imputed"] / 4.0)
        + 0.35 * ((df_clean["gre_imputed"] - 260.0).clip(0, 80) / 80.0)
        + 0.10 * ((df_clean["toefl_imputed"] - 60.0).clip(0, 60) / 60.0)
    ).round(4)

    # Asymmetric Gap Penalties (Quadratic penalty for falling below median)
    df_clean["asymmetric_gpa_penalty"] = np.where(
        df_clean["gpa_gap"] >= 0,
        df_clean["gpa_gap"],
        -2.5 * (df_clean["gpa_gap"] ** 2)
    ).round(4)

    gre_gap_scaled = df_clean["gre_gap"] / 10.0
    df_clean["asymmetric_gre_penalty"] = np.where(
        gre_gap_scaled >= 0,
        gre_gap_scaled,
        -2.0 * (gre_gap_scaled ** 2)
    ).round(4)

    # Research Prestige Synergy (Publications carry exponential weight at top QS ranks)
    rank_factor = (100.0 - df_clean["qs_rank"].clip(1, 100)) / 100.0
    df_clean["research_prestige_synergy"] = (df_clean["research_publications"] * rank_factor).round(4)

    # Industry Compensation Ratio (Years in industry offsetting GPA deficit)
    gpa_deficit = (df_clean["uni_median_gpa"] - df_clean["gpa_imputed"]).clip(lower=0.05, upper=2.0)
    df_clean["industry_compensation_ratio"] = (df_clean["work_experience_years"] / gpa_deficit).clip(0, 15).round(4)

    # Institutional Selectivity Difficulty
    df_clean["institutional_difficulty"] = ((df_clean["qs_score"] / 100.0) * (1.0 - df_clean["uni_admit_rate"])).round(4)

    # Binary profile indicators
    df_clean["has_research"] = ((df_clean["research_publications"] > 0) | (df_clean["research_experience_years"] > 0)).astype(int)
    df_clean["has_work_exp"] = (df_clean["work_experience_years"] > 0).astype(int)
    df_clean["has_internship"] = (df_clean["internship_experience_years"] > 0).astype(int)

    # Target variable
    df_clean["decision_label"] = pd.to_numeric(df_clean["decision_label"], errors="coerce").fillna(0).astype(int)

    # Save processed CSV
    processed_csv_path = os.path.join(output_dir, "canonical_cleaned.csv")
    df_clean.to_csv(processed_csv_path, index=False)
    print(f"✅ Clean dataset saved to {processed_csv_path} with {len(df_clean):,} rows.")

    return df_clean, catalog
