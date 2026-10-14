"""Evaluation metrics and assessment utilities for MsAdmit models."""

import numpy as np
import pandas as pd
from typing import Dict
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


def evaluate_regression_model(y_true: pd.Series, y_pred: np.ndarray) -> Dict[str, float]:
    """Calculate key regression performance metrics."""
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    
    metrics = {
        "MAE": round(float(mae), 4),
        "MSE": round(float(mse), 4),
        "RMSE": round(float(rmse), 4),
        "R2_Score": round(float(r2), 4)
    }
    return metrics


def print_evaluation_report(metrics: Dict[str, float]) -> None:
    """Print formatted evaluation report."""
    print("=" * 40)
    print(" 📊 MODEL PERFORMANCE REPORT")
    print("=" * 40)
    for k, v in metrics.items():
        print(f" - {k:<12}: {v}")
    print("=" * 40)
