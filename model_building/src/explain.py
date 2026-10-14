"""Explainable AI (XAI) and Profile Optimizer module using SHAP for MsAdmit."""

import os
import ctypes
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

# Preload OpenMP library on macOS for XGBoost/SHAP
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

import shap
import xgboost as xgb


class AdmissionExplainer:
    """SHAP Explainer and What-If Counterfactual Optimizer for admission decisions."""

    def __init__(
        self,
        raw_model_path: str = "model_building/models/raw_xgb_tree_model.joblib",
        features_meta_path: str = "model_building/models/model_features.json"
    ):
        if not os.path.exists(raw_model_path):
            raise FileNotFoundError(f"Model file not found: {raw_model_path}")

        self.model = joblib.load(raw_model_path)
        with open(features_meta_path, "r") as f:
            meta = json.load(f)
            self.feature_names = meta["features"]

        # TreeExplainer is fast and exact for tree-based ensembles
        self.explainer = shap.TreeExplainer(self.model)

    def explain_university_fit(
        self,
        feature_row: np.ndarray,
        uni_name: str,
        applicant_profile: Dict[str, Any],
        base_fit_score: float
    ) -> Dict[str, Any]:
        """Generate local SHAP feature attributions for an applicant at a specific university."""
        if feature_row.ndim == 1:
            feature_row = feature_row.reshape(1, -1)

        shap_values = self.explainer(feature_row)
        values = shap_values.values[0]

        impacts = []
        for feat, val in zip(self.feature_names, values):
            # Human readable label
            label_map = {
                "gpa_gap": "GPA relative to admitted median",
                "gre_gap": "GRE relative to admitted median",
                "gpa_imputed": "Undergraduate GPA",
                "gre_imputed": "GRE Total Score",
                "toefl_imputed": "English Proficiency (TOEFL equiv)",
                "research_publications": "Research Publications",
                "work_experience_years": "Full-Time Work Experience",
                "internship_experience_years": "Internships",
                "research_experience_years": "Research Experience",
                "uni_admit_rate": "University Historical Selectivity",
                "qs_rank": "University QS CS Prestige Rank",
                "tier_num": "Institutional Competitiveness Tier"
            }
            clean_label = label_map.get(feat, feat)

            impacts.append({
                "feature": feat,
                "label": clean_label,
                "shap_impact": round(float(val), 4),
                "direction": "positive" if val >= 0 else "negative"
            })

        # Sort by absolute SHAP impact magnitude
        impacts.sort(key=lambda x: abs(x["shap_impact"]), reverse=True)

        top_strengths = [
            f for f in impacts if f["direction"] == "positive" and f["feature"] not in ["gre_missing", "toefl_missing"]
        ][:3]
        top_weaknesses = [
            f for f in impacts if f["direction"] == "negative" and f["feature"] not in ["gre_missing", "toefl_missing"]
        ][:3]

        return {
            "university_name": uni_name,
            "fit_score": round(base_fit_score, 1),
            "top_strengths": top_strengths,
            "top_bottlenecks": top_weaknesses,
            "all_impacts": impacts
        }
