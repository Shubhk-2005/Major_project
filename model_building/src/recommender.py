"""Portfolio Recommendation Engine for MsAdmit.

Evaluates an applicant's multi-modal profile against the complete university
catalog using vectorized batch inference, assigns Target/Consider/Reach tiers,
and recommends a balanced 3-3-3 portfolio with SHAP-powered profile optimization.
"""

import os
import json
import joblib
import ctypes
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple

# Preload OpenMP library on macOS for XGBoost
for lib_candidate in [
    "/opt/homebrew/opt/libomp/lib/libomp.dylib",
    "/usr/local/opt/libomp/lib/libomp.dylib"
]:
    if os.path.exists(lib_candidate):
        try:
            ctypes.CDLL(lib_candidate)
            break
        except Exception:
            pass

from explain import AdmissionExplainer


class PortfolioRecommender:
    """Production recommendation engine predicting admission chances and suggesting portfolios."""

    def __init__(
        self,
        model_path: str = "model_building/models/xgboost_admissions_model.joblib",
        catalog_path: str = "model_building/data/processed/university_catalog.json",
        features_meta_path: str = "model_building/models/model_features.json",
        explainer: Optional[AdmissionExplainer] = None
    ):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model artifact not found at {model_path}. Run train.py first.")

        self.model = joblib.load(model_path)
        # Ensure scikit-learn cross-version compatibility for final_estimator_ (LogisticRegression)
        if hasattr(self.model, "final_estimator_") and not hasattr(self.model.final_estimator_, "multi_class"):
            self.model.final_estimator_.multi_class = "auto"

        with open(catalog_path, "r") as f:
            self.catalog = json.load(f)

        with open(features_meta_path, "r") as f:
            meta = json.load(f)
            self.feature_columns = meta["features"]

        self.explainer = explainer or AdmissionExplainer(features_meta_path=features_meta_path)
        self.uni_list = [
            u for u in self.catalog.values()
            if str(u.get("country", "")).strip().lower() not in ["india", "pakistan"]
        ]

    def _build_batch_features(self, profile: Dict[str, Any]) -> Tuple[np.ndarray, List[Dict[str, Any]]]:
        """Construct a vectorized 2D feature matrix for the applicant across all universities."""
        raw_gpa = float(profile.get("raw_gpa") or profile.get("gpa", 3.3))
        gpa = (raw_gpa / 10.0) * 4.0 if raw_gpa > 4.0 else raw_gpa

        gre = profile.get("gre")
        toefl = profile.get("toefl")

        gre_missing = 1 if gre is None or pd.isna(gre) or float(gre) == 0 else 0
        toefl_missing = 1 if toefl is None or pd.isna(toefl) or float(toefl) == 0 else 0

        gre_val = float(gre) if gre_missing == 0 else 315.0
        toefl_val = float(toefl) if toefl_missing == 0 else 104.0

        work_years = float(profile.get("work_experience_years", 0.0))
        intern_years = float(profile.get("internship_experience_years", 0.0))
        res_years = float(profile.get("research_experience_years", 0.0))
        pubs = float(profile.get("research_publications", 0.0))

        has_research = 1 if (pubs > 0 or res_years > 0) else 0
        has_work_exp = 1 if work_years > 0 else 0
        has_internship = 1 if intern_years > 0 else 0
        is_fall = 1 if profile.get("intake_term", "fall").lower() in ["fall", "autumn"] else 0

        # Institutional Tier of the Applicant's Undergraduate College:
        # Tier 1: All 23-25 IITs + IISc
        # Tier 2: All NITs, IIITs, BITS
        # Tier 3: All other institutions (State, Autonomous, Affiliated, including Fr. CRIT)
        applicant_tier = int(profile.get("institution_tier") or 3)

        # Undergraduate Institutional Rigor Multiplier on CACI
        tier_caci_mult = 1.05 if applicant_tier == 1 else 1.00 if applicant_tier == 2 else 0.92
        caci = (
            0.55 * ((gpa * tier_caci_mult) / 4.0)
            + 0.35 * (max(0.0, min(80.0, gre_val - 260.0)) / 80.0)
            + 0.10 * (max(0.0, min(60.0, toefl_val - 60.0)) / 60.0)
        )

        rows = []
        unis = []

        for u in self.uni_list:
            effective_gpa = gpa * (1.04 if applicant_tier == 1 else 1.00 if applicant_tier == 2 else 0.93)
            gpa_gap = effective_gpa - u["median_gpa"]
            gre_gap = gre_val - u["median_gre"]

            # Asymmetric non-linear penalties
            asym_gpa = gpa_gap if gpa_gap >= 0 else -2.5 * (gpa_gap ** 2)
            gre_gap_sc = gre_gap / 10.0
            asym_gre = gre_gap_sc if gre_gap_sc >= 0 else -2.0 * (gre_gap_sc ** 2)

            # Synergy & compensation ratios
            qs_rank = float(u["qs_rank"])
            rank_factor = (100.0 - min(100.0, qs_rank)) / 100.0
            research_synergy = pubs * rank_factor

            gpa_deficit = max(0.05, min(2.0, u["median_gpa"] - effective_gpa))
            industry_comp = min(15.0, work_years / gpa_deficit)

            qs_score = float(u.get("qs_score", 35.0))
            admit_rate = float(u["admit_rate"])
            # Institutional selectivity gap adjusted for undergraduate tier
            tier_penalty = 0.0 if applicant_tier == 1 else (0.04 if applicant_tier == 2 else 0.09)
            inst_diff = ((qs_score / 100.0) * (1.0 - admit_rate)) + tier_penalty

            feat_row = [
                effective_gpa,
                gre_val,
                toefl_val,
                caci,
                work_years,
                intern_years,
                res_years,
                pubs,
                has_research,
                has_work_exp,
                has_internship,
                gre_missing,
                toefl_missing,
                qs_rank,
                qs_score,
                u["tier_num"],
                admit_rate,
                inst_diff,
                gpa_gap,
                gre_gap,
                asym_gpa,
                asym_gre,
                research_synergy,
                industry_comp,
                is_fall
            ]
            rows.append(feat_row)
            unis.append(u)

        return np.array(rows, dtype=np.float32), unis

    def recommend_portfolio(
        self,
        profile: Dict[str, Any],
        top_k: int = 3,
        include_shap: bool = True
    ) -> Dict[str, Any]:
        """Generate a 3-3-3 portfolio (Target, Consider, Reach) with XAI explanations.

        Parameters:
            profile: dict containing applicant attributes:
                - gpa: float (4.0 scale)
                - gre: float (e.g. 320) or None
                - toefl: float (e.g. 105) or None
                - work_experience_years: float (e.g. 1.5)
                - internship_experience_years: float (e.g. 0.5)
                - research_experience_years: float (e.g. 1.0)
                - research_publications: int (e.g. 1)
                - sop_score: float (optional 0-100 rubric score from future LLM evaluation)
            top_k: number of universities per category (default: 3)
        """
        X_batch, unis = self._build_batch_features(profile)

        # 1. Vectorized model inference (empirical probability from Stacking Ensemble)
        p_quant = self.model.predict_proba(X_batch)[:, 1]

        # 2. Strict decoupling: SOP/LOR are qualitative documents evaluated separately in Ms AI Score
        # and are NOT used to shift or bias university admission predictions.
        sop_delta = 0.0

        applicant_tier = int(profile.get("institution_tier") or 3)

        evaluated = []
        for i, u in enumerate(unis):
            empirical_prob = float(p_quant[i])
            # Institutional selectivity calibration based on UG tier:
            # Tier 1 (IIT): +4% boost to empirical probability
            # Tier 2 (NIT/IIIT): +1% boost
            # Tier 3 (Other colleges): -4.5% penalty for top 50 programs (tier 1), -2.5% for others
            if applicant_tier == 1:
                tier_adjustment = 0.04
            elif applicant_tier == 2:
                tier_adjustment = 0.01
            else:
                tier_adjustment = -0.045 if u.get("tier_num", 2) == 1 else -0.025

            calibrated_prob = float(np.clip(empirical_prob + tier_adjustment, 0.05, 0.95))
            composite_fit = calibrated_prob * 100.0

            # Tier classification
            if composite_fit >= 60.0:
                tier = "target"
                tier_label = "Target (Match)"
            elif composite_fit >= 40.0:
                tier = "consider"
                tier_label = "Consider (Attainable)"
            else:
                tier = "reach"
                tier_label = "Reach (Dream)"

            evaluated.append({
                "university_name": u["university_name"],
                "display_name": u["display_name"],
                "country": u.get("country", ""),
                "qs_rank": u["qs_rank"],
                "tier": tier,
                "tier_label": tier_label,
                "fit_score": round(composite_fit, 1),
                "empirical_admit_prob": round(empirical_prob * 100.0, 1),
                "median_gpa": u["median_gpa"],
                "median_gre": u["median_gre"],
                "admit_rate": round(u["admit_rate"] * 100.0, 1),
                "feature_row": X_batch[i]
            })

        # 3. Rank and select Top-K distinct universities per tier with guaranteed 3-3-3 balance
        global_seen_unis = set()

        def select_distinct_top_k(items: List[Dict[str, Any]], k: int, global_seen: set) -> List[Dict[str, Any]]:
            selected = []
            for item in items:
                key = item["display_name"].strip().lower()
                if key not in global_seen:
                    global_seen.add(key)
                    selected.append(item)
                    if len(selected) == k:
                        break
            return selected

        # If strict thresholds yield at least top_k for both target and consider, use them:
        strict_targets = [e for e in evaluated if e["fit_score"] >= 55.0]
        strict_considers = [e for e in evaluated if 38.0 <= e["fit_score"] < 55.0]
        strict_reaches = [e for e in evaluated if e["fit_score"] < 38.0]

        if len(strict_targets) >= top_k and len(strict_considers) >= top_k:
            strict_targets.sort(key=lambda x: (x["qs_rank"], -x["fit_score"]))
            top_targets = select_distinct_top_k(strict_targets, top_k, global_seen_unis)

            strict_considers.sort(key=lambda x: (x["qs_rank"], -x["fit_score"]))
            top_considers = select_distinct_top_k(strict_considers, top_k, global_seen_unis)

            viable_reaches = [r for r in strict_reaches if r["fit_score"] >= 10.0] or strict_reaches
            viable_reaches.sort(key=lambda x: (x["qs_rank"], -x["fit_score"]))
            top_reaches = select_distinct_top_k(viable_reaches, top_k, global_seen_unis)
        else:
            # Dynamic Relative Portfolio Allocation:
            # Guarantees that every applicant (regardless of high/low baseline score)
            # receives a tailored 3-3-3 portfolio of Target (best matches), Consider (attainable), and Reach (dream).
            all_sorted_by_fit = sorted(evaluated, key=lambda x: -x["fit_score"])

            # 1. Targets: The best matching universities in the catalog for this student
            top_targets = []
            for e in all_sorted_by_fit:
                key = e["display_name"].strip().lower()
                if key not in global_seen_unis:
                    item_copy = dict(e)
                    item_copy["tier"] = "target"
                    item_copy["tier_label"] = "Target (Match)"
                    global_seen_unis.add(key)
                    top_targets.append(item_copy)
                    if len(top_targets) == top_k:
                        break

            # 2. Considers: Next solid tier of matches
            top_considers = []
            for e in all_sorted_by_fit:
                key = e["display_name"].strip().lower()
                if key not in global_seen_unis:
                    item_copy = dict(e)
                    item_copy["tier"] = "consider"
                    item_copy["tier_label"] = "Consider (Attainable)"
                    global_seen_unis.add(key)
                    top_considers.append(item_copy)
                    if len(top_considers) == top_k:
                        break

            # 3. Reaches: Ambitious top QS prestige programs
            remaining = [e for e in evaluated if e["display_name"].strip().lower() not in global_seen_unis]
            remaining.sort(key=lambda x: (x["qs_rank"], -x["fit_score"]))
            top_reaches = []
            for e in remaining:
                key = e["display_name"].strip().lower()
                if key not in global_seen_unis:
                    item_copy = dict(e)
                    item_copy["tier"] = "reach"
                    item_copy["tier_label"] = "Reach (Dream)"
                    global_seen_unis.add(key)
                    top_reaches.append(item_copy)
                    if len(top_reaches) == top_k:
                        break

        top_targets.sort(key=lambda x: -x["fit_score"])
        top_considers.sort(key=lambda x: -x["fit_score"])
        top_reaches.sort(key=lambda x: -x["fit_score"])

        # 4. Attach SHAP explanations if requested
        if include_shap:
            for item in top_targets + top_considers + top_reaches:
                feat_row = item.pop("feature_row")
                shap_info = self.explainer.explain_university_fit(
                    feat_row, item["university_name"], profile, item["fit_score"]
                )
                item["top_strengths"] = shap_info["top_strengths"]
                item["top_bottlenecks"] = shap_info["top_bottlenecks"]
        else:
            for item in top_targets + top_considers + top_reaches:
                item.pop("feature_row", None)

        portfolio_summary = {
            "applicant_summary": {
                "gpa": profile.get("gpa"),
                "gre": profile.get("gre"),
                "toefl": profile.get("toefl"),
                "work_experience_years": profile.get("work_experience_years", 0),
                "research_publications": profile.get("research_publications", 0),
                "sop_score": profile.get("sop_score")
            },
            "portfolio": {
                "target": top_targets,
                "consider": top_considers,
                "reach": top_reaches
            },
            "counts": {
                "total_target_available": len(top_targets),
                "total_consider_available": len(top_considers),
                "total_reach_available": len(top_reaches)
            }
        }

        return portfolio_summary

    def simulate_what_if(
        self,
        base_profile: Dict[str, Any],
        profile_patch: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Simulate how updating profile levers changes fit scores and university tiers."""
        base_results = self.recommend_portfolio(base_profile, top_k=3, include_shap=False)

        sim_profile = {**base_profile, **profile_patch}
        sim_results = self.recommend_portfolio(sim_profile, top_k=3, include_shap=False)

        changes = []
        for tier_key in ["reach", "consider", "target"]:
            base_unis = {u["university_name"]: u for u in base_results["portfolio"][tier_key]}
            sim_unis = {u["university_name"]: u for u in sim_results["portfolio"][tier_key]}

            for name, b_uni in base_unis.items():
                if name in sim_unis:
                    s_uni = sim_unis[name]
                    delta = round(s_uni["fit_score"] - b_uni["fit_score"], 1)
                    changes.append({
                        "university": name,
                        "old_tier": b_uni["tier"],
                        "new_tier": s_uni["tier"],
                        "old_fit": b_uni["fit_score"],
                        "new_fit": s_uni["fit_score"],
                        "delta": f"+{delta}%" if delta >= 0 else f"{delta}%"
                    })

        return {
            "levers_tested": profile_patch,
            "impact_on_portfolio": changes
        }


if __name__ == "__main__":
    recommender = PortfolioRecommender()
    sample_profile = {
        "gpa": 3.65,
        "gre": 321.0,
        "toefl": 106.0,
        "work_experience_years": 1.5,
        "internship_experience_years": 1.0,
        "research_experience_years": 1.0,
        "research_publications": 1,
        "sop_score": 82.0
    }
    result = recommender.recommend_portfolio(sample_profile, top_k=3)
    print("\n" + "=" * 60)
    print(" 🎓 RECOMMENDED 3-3-3 BALANCED PORTFOLIO")
    print("=" * 60)
    for category in ["target", "consider", "reach"]:
        print(f"\n📌 {category.upper()}:")
        for uni in result["portfolio"][category]:
            print(f"  • {uni['display_name']} (QS #{uni['qs_rank']}) - Fit Score: {uni['fit_score']}%")
            if "top_strengths" in uni and uni["top_strengths"]:
                print(f"    + Key Strength: {uni['top_strengths'][0]['label']}")
            if "top_bottlenecks" in uni and uni["top_bottlenecks"]:
                print(f"    - Key Detractor: {uni['top_bottlenecks'][0]['label']}")
    print("=" * 60)
