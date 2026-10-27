#!/bin/bash
# MsAdmit FastAPI Backend Startup Script

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_ROOT="$(dirname "$DIR")"

echo "========================================="
echo "   MsAdmit FastAPI Backend Server"
echo "========================================="

# Prefer model_building virtualenv where XGBoost & SHAP are installed
if [ -d "$PROJECT_ROOT/model_building/venv" ]; then
    PYTHON_EXEC="$PROJECT_ROOT/model_building/venv/bin/python"
elif [ -d "$DIR/venv" ]; then
    PYTHON_EXEC="$DIR/venv/bin/python"
else
    PYTHON_EXEC="python3"
fi

cd "$DIR"

# Check if port 8000 is already in use and free it
PORT_PID=$(lsof -ti :8000 || true)
if [ -n "$PORT_PID" ]; then
    echo "Port 8000 is occupied by PID $PORT_PID. Freeing port 8000..."
    kill -9 $PORT_PID 2>/dev/null || true
    sleep 1
    echo "✓ Port 8000 released successfully."
fi

echo "Using Python: $PYTHON_EXEC"
echo "Starting Uvicorn server on http://localhost:8000 ..."
echo "API Docs available at: http://localhost:8000/docs (and /api/v1/docs)"
echo "========================================="

exec "$PYTHON_EXEC" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
