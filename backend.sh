#!/bin/bash
# MsAdmit FastAPI Backend Startup Script
# Run from repository root: ./backend.sh

set -e

# Detect script directory (repository root)
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
BACKEND_DIR="$ROOT_DIR/backend"

# Terminal Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}   🎓 MsAdmit - FastAPI Backend & ML Engine Server   ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Detect Python virtual environment
if [ -d "$ROOT_DIR/model_building/venv" ]; then
    PYTHON_EXEC="$ROOT_DIR/model_building/venv/bin/python"
    echo -e "${GREEN}✓ Using virtualenv:${NC} model_building/venv (XGBoost, SHAP & FastAPI)"
elif [ -d "$BACKEND_DIR/venv" ]; then
    PYTHON_EXEC="$BACKEND_DIR/venv/bin/python"
    echo -e "${GREEN}✓ Using virtualenv:${NC} backend/venv"
elif [ -d "$ROOT_DIR/venv" ]; then
    PYTHON_EXEC="$ROOT_DIR/venv/bin/python"
    echo -e "${GREEN}✓ Using virtualenv:${NC} root venv"
else
    PYTHON_EXEC="python3"
    echo -e "${YELLOW}! No local venv found, falling back to system python3${NC}"
fi

# Set OpenMP path if installed via Homebrew (for macOS Apple Silicon)
if [ -d "/opt/homebrew/opt/libomp/lib" ]; then
    export DYLD_LIBRARY_PATH="/opt/homebrew/opt/libomp/lib:$DYLD_LIBRARY_PATH"
elif [ -d "/usr/local/opt/libomp/lib" ]; then
    export DYLD_LIBRARY_PATH="/usr/local/opt/libomp/lib:$DYLD_LIBRARY_PATH"
fi

# Check if port 8000 is already in use
PORT_PID=$(lsof -ti :8000 || true)
if [ -n "$PORT_PID" ]; then
    echo -e "${YELLOW}Warning: Port 8000 is currently occupied by PID $PORT_PID.${NC}"
    echo -e "You can kill it using: ${BLUE}kill -9 $PORT_PID${NC}"
    echo ""
fi

cd "$BACKEND_DIR"

echo -e "${GREEN}✓ Working Directory:${NC} $BACKEND_DIR"
echo -e "${GREEN}✓ Backend URL:${NC}       ${BLUE}http://localhost:8000${NC}"
echo -e "${GREEN}✓ Interactive Docs:${NC}  ${BLUE}http://localhost:8000/docs${NC} (or /api/v1/docs)"
echo -e "${CYAN}====================================================${NC}"
echo -e "${YELLOW}Starting Uvicorn server in auto-reload mode...${NC}"
echo ""

exec "$PYTHON_EXEC" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
