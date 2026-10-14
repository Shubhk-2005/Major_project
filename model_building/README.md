# 🧠 MsAdmit - Machine Learning & Model Building

This directory contains the machine learning pipeline, exploratory data analysis, and model training workflows for **MsAdmit** (AI-Powered Admission Competitiveness and Profile Optimizer).

---

## 📁 Directory Structure

```text
model_building/
├── data/
│   ├── raw/               # Original, unmodified datasets
│   └── processed/         # Cleaned, encoded, and transformed datasets
├── notebooks/             # Jupyter notebooks for experimentation and analysis
│   ├── 01_eda_and_preprocessing.ipynb
│   └── 02_model_training_and_shap.ipynb
├── src/                   # Production-ready Python modules
│   ├── __init__.py
│   ├── preprocess.py      # Data cleaning and feature engineering
│   ├── train.py           # Model training pipeline (XGBoost)
│   ├── evaluate.py        # Model evaluation metrics & cross-validation
│   └── explain.py         # Explainable AI (SHAP value calculations)
├── models/                # Exported trained models (.joblib, .json, .pkl)
├── requirements.txt       # Python dependencies
└── .gitignore             # ML-specific git ignore rules
```

---

## 🚀 Setup & Environment

### 1. Create a Python Virtual Environment

```bash
cd model_building
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Launch Jupyter Notebooks

```bash
jupyter notebook
```

---

## 🧪 Machine Learning Pipeline Overview

1. **Data Ingestion & Cleaning:**
   - Ingest raw applicant and university metrics.
   - Handle missing values, outliers, and type conversions.

2. **Feature Engineering & Transformation:**
   - Standardize academic metrics (GPA, GRE verbal/quant, TOEFL/IELTS).
   - Encode university tiers, research experience, work experience, and publication count.

3. **Predictive Modeling (XGBoost):**
   - Train gradient boosted decision trees for admission probability prediction.
   - Perform hyperparameter tuning via GridSearchCV or Optuna.

4. **Explainable AI (SHAP):**
   - Generate TreeExplainer SHAP values.
   - Identify top positive and negative features influencing admission chances.
   - Formulate actionable profile optimization suggestions for applicants.

5. **Model Export:**
   - Save trained estimators and scalers into `models/` for backend API integration.
