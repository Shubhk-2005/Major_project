import os
import sys

# Ensure root and backend directories are in Python path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import gradio as gr
from app.main import app

with gr.Blocks(title="MsAdmit API") as demo:
    gr.Markdown("# 🚀 MsAdmit FastAPI Backend is Live!")
    gr.Markdown(
        "All API endpoints, Machine Learning inference (XGBoost + SHAP), "
        "and Vector Search (ChromaDB) are fully operational."
    )

# Mount Gradio interface onto the existing FastAPI application
app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
