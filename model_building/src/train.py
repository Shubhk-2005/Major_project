"""Advanced Model Training, Stacking Ensemble, and Probability Calibration Pipeline for MsAdmit."""

import os
import json
import joblib
import ctypes
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

# Preload OpenMP library on macOS for XGBoost/LightGBM
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

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
    HistGradientBoostingClassifier,
    StackingClassifier
)
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    roc_auc_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    brier_score_loss,
    confusion_matrix,
    classification_report
)

import lightgbm as lgb
import xgboost as xgb

FEATURE_COLUMNS = [
    # Core academic & test features
    "gpa_imputed",
    "gre_imputed",
    "toefl_imputed",
    "caci_index",
    # Experience & research
    "work_experience_years",
    "internship_experience_years",
    "research_experience_years",
    "research_publications",
    "has_research",
    "has_work_exp",
    "has_internship",
    # Test optional / waiver flags
    "gre_missing",
    "toefl_missing",
    # University context & selectivity
    "qs_rank",
    "qs_score",
    "tier_num",
    "uni_admit_rate",
    "institutional_difficulty",
    # Relative gaps & non-linear asymmetric penalties
    "gpa_gap",
    "gre_gap",
    "asymmetric_gpa_penalty",
    "asymmetric_gre_penalty",
    # Synergy & trade-off interactions
    "research_prestige_synergy",
    "industry_compensation_ratio",
    "is_fall_intake"
]


def prepare_training_data(
    csv_path: str = "model_building/data/processed/canonical_cleaned.csv",
    test_size: float = 0.20,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, StandardScaler]:
    """Load cleaned data and create stratified train/test split with standard scaling."""
    df = pd.read_csv(csv_path, low_memory=False)

    # Prune contradictory crowdsourced records (identical profile with both admit and reject entries)
    key_cols = ["university_name", "gpa_imputed", "gre_imputed", "toefl_imputed", "work_experience_years"]
    vote = df.groupby(key_cols)["decision_label"].transform("mean")
    df_clean = df[(vote >= 0.65) | (vote <= 0.35)].copy()
    df_clean["decision_label"] = (vote >= 0.5).astype(int)

    X = df_clean[FEATURE_COLUMNS].copy()
    X = X.fillna(0.0)
    y = df_clean["decision_label"].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, stratify=y, random_state=random_state
    )

    scaler = StandardScaler()
    scaler.fit(X_train)

    return X_train, X_test, y_train, y_test, scaler


def evaluate_classifier(
    name: str,
    model: Any,
    X_test: np.ndarray,
    y_test: pd.Series
) -> Dict[str, Any]:
    """Compute performance metrics for a trained classifier."""
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    roc_auc = roc_auc_score(y_test, y_proba)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    brier = brier_score_loss(y_test, y_proba)

    return {
        "Model": name,
        "ROC_AUC": round(float(roc_auc), 4),
        "Accuracy": round(float(acc), 4),
        "Precision": round(float(prec), 4),
        "Recall": round(float(rec), 4),
        "F1_Score": round(float(f1), 4),
        "Brier_Score": round(float(brier), 4),
    }


def benchmark_and_train_ensemble(
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
    scaler: StandardScaler
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Train individual models and the Multi-Model Stacking Ensemble."""
    X_train_scaled = scaler.transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    results = []
    trained_models = {}

    print("\n" + "=" * 70)
    print(" 🚀 ADVANCED MODEL BENCHMARKING & STACKING ENSEMBLE")
    print(f" Features: {len(FEATURE_COLUMNS)} engineered domain attributes")
    print("=" * 70)

    # 1. Logistic Regression Baseline
    print("Training 1/6: Logistic Regression Baseline...")
    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_train_scaled, y_train)
    results.append(evaluate_classifier("Logistic Regression", lr, X_test_scaled, y_test))
    trained_models["Logistic Regression"] = lr

    # 2. Random Forest
    print("Training 2/6: Random Forest (150 trees)...")
    rf = RandomForestClassifier(n_estimators=150, max_depth=14, min_samples_leaf=3, n_jobs=-1, random_state=42)
    rf.fit(X_train, y_train)
    results.append(evaluate_classifier("Random Forest", rf, X_test.values, y_test))
    trained_models["Random Forest"] = rf

    # 3. Extra Trees (Variance Reduction Bagging)
    print("Training 3/6: Extra Trees Classifier (150 trees)...")
    et = ExtraTreesClassifier(n_estimators=150, max_depth=14, min_samples_leaf=3, n_jobs=-1, random_state=42)
    et.fit(X_train, y_train)
    results.append(evaluate_classifier("Extra Trees", et, X_test.values, y_test))
    trained_models["Extra Trees"] = et

    # 4. LightGBM (Leaf-Wise Gradient Boosting)
    print("Training 4/6: LightGBM...")
    lgbm = lgb.LGBMClassifier(
        n_estimators=300,
        learning_rate=0.03,
        max_depth=7,
        num_leaves=45,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        verbosity=-1
    )
    lgbm.fit(X_train, y_train)
    results.append(evaluate_classifier("LightGBM", lgbm, X_test.values, y_test))
    trained_models["LightGBM"] = lgbm

    # 5. XGBoost (Depth-Wise Gradient Boosting)
    print("Training 5/6: XGBoost (Optimized Decision Trees)...")
    xgb_model = xgb.XGBClassifier(
        n_estimators=350,
        learning_rate=0.025,
        max_depth=6,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        eval_metric="logloss"
    )
    xgb_model.fit(X_train, y_train)
    results.append(evaluate_classifier("XGBoost", xgb_model, X_test.values, y_test))
    trained_models["XGBoost"] = xgb_model

    # 6. Multi-Model Stacking Classifier (Meta-Learner Blending)
    print("Training 6/6: 4-Model Stacking Ensemble (XGB + LGBM + RF + ExtraTrees)...")
    estimators = [
        ("xgb", xgb_model),
        ("lgbm", lgbm),
        ("rf", rf),
        ("et", et)
    ]
    stacking_clf = StackingClassifier(
        estimators=estimators,
        final_estimator=LogisticRegression(C=1.0, max_iter=500, random_state=42),
        cv=5,
        n_jobs=-1,
        passthrough=False
    )
    stacking_clf.fit(X_train, y_train)
    results.append(evaluate_classifier("Stacking Ensemble (Meta-Learner)", stacking_clf, X_test.values, y_test))
    trained_models["Stacking Ensemble"] = stacking_clf

    benchmark_df = pd.DataFrame(results)
    benchmark_df = benchmark_df.sort_values(by="ROC_AUC", ascending=False).reset_index(drop=True)

    print("\n" + "=" * 70)
    print(" 📊 OPTIMIZED MODEL BENCHMARK RESULTS")
    print("=" * 70)
    print(benchmark_df.to_string(index=False))
    print("=" * 70)

    return benchmark_df, trained_models


def export_production_artifacts(
    best_model: Any,
    raw_xgb_model: xgb.XGBClassifier,
    scaler: StandardScaler,
    metrics: Dict[str, Any],
    output_dir: str = "model_building/models"
) -> None:
    """Save all production models, tree explainers, and metadata."""
    os.makedirs(output_dir, exist_ok=True)
    import pickle

    # 1. Production Model (.joblib and .pkl)
    prod_path_joblib = os.path.join(output_dir, "xgboost_admissions_model.joblib")
    prod_path_pkl = os.path.join(output_dir, "xgboost_admissions_model.pkl")
    joblib.dump(best_model, prod_path_joblib)
    with open(prod_path_pkl, "wb") as f:
        pickle.dump(best_model, f)

    # 2. Raw Tree Model for SHAP
    raw_path_joblib = os.path.join(output_dir, "raw_xgb_tree_model.joblib")
    raw_path_pkl = os.path.join(output_dir, "raw_xgb_tree_model.pkl")
    joblib.dump(raw_xgb_model, raw_path_joblib)
    with open(raw_path_pkl, "wb") as f:
        pickle.dump(raw_xgb_model, f)

    # 3. Native XGBoost JSON booster
    raw_xgb_model.save_model(os.path.join(output_dir, "xgboost_admissions_booster.json"))

    # 4. Scaler & Feature metadata
    joblib.dump(scaler, os.path.join(output_dir, "feature_scaler.joblib"))
    with open(os.path.join(output_dir, "model_features.json"), "w") as f:
        json.dump({
            "features": FEATURE_COLUMNS,
            "metrics": metrics
        }, f, indent=2)

    print(f"\n✅ All production artifacts successfully persisted in {output_dir}/")


if __name__ == "__main__":
    X_train, X_test, y_train, y_test, scaler = prepare_training_data()
    benchmark_df, trained_models = benchmark_and_train_ensemble(X_train, X_test, y_train, y_test, scaler)

    best_model = trained_models["Stacking Ensemble"]
    best_metrics = benchmark_df.iloc[0].to_dict()

    export_production_artifacts(
        best_model=best_model,
        raw_xgb_model=trained_models["XGBoost"],
        scaler=scaler,
        metrics=best_metrics
    )
