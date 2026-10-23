FROM python:3.11-slim

# Prevent Python from writing .pyc files & buffer stdout/stderr
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

# Install system dependencies (build-essential, curl, libgomp1 for XGBoost OpenMP)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first to leverage Docker layer caching
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Pre-download ONNX model during Docker build so runtime container NEVER downloads 79MB in 512MB RAM
RUN python -c "from chromadb.utils.embedding_functions import DefaultEmbeddingFunction; DefaultEmbeddingFunction()"

# Copy backend application
COPY backend/ /app/backend/

# Copy ML pipeline models, feature metadata, and university catalog
COPY model_building/src/ /app/model_building/src/
COPY model_building/data/processed/ /app/model_building/data/processed/
COPY model_building/models/xgboost_admissions_model.joblib /app/model_building/models/
COPY model_building/models/raw_xgb_tree_model.joblib /app/model_building/models/
COPY model_building/models/model_features.json /app/model_building/models/
COPY model_building/models/feature_scaler.joblib /app/model_building/models/

WORKDIR /app/backend

EXPOSE 8080

# Start Uvicorn on dynamic $PORT (defaults to 8080 or Render's $PORT)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1"]
