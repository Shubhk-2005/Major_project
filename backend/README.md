# 🚀 MsAdmit FastAPI Backend

This is the production backend service for **MsAdmit (AI-Powered Admission Competitiveness & Profile Optimizer)**.

It connects:
1. **XGBoost & TreeSHAP ML Inference**: Real-time admission competitiveness prediction, 3-3-3 portfolio generation, and feature impact diagnostics.
2. **Google Gemini LLM Advisory Engine**: Automated Statement of Purpose (SOP) line-by-line critique and strategic optimization roadmap synthesis.
3. **Document Vault & Cloudinary Storage**: Uploading, text extraction (`pypdf`), and storage for applicant SOPs, Resumes, and Transcripts.
4. **JWT Authentication & Profile Management**: Secure signup, login, password hashing via bcrypt, and persistence with SQLAlchemy.

---

## 📁 Architecture Overview

```text
backend/
├── app/
│   ├── api/
│   │   ├── deps.py               # JWT authentication dependencies & session injection
│   │   └── v1/
│   │       ├── api.py            # API v1 aggregator
│   │       └── endpoints/
│   │           ├── auth.py       # Signup, Login, /me
│   │           ├── profile.py    # User academic & quantitative profile
│   │           ├── predict.py    # XGBoost score & 3-3-3 portfolio recommendations
│   │           ├── documents.py  # PDF upload, text parsing & Cloudinary
│   │           └── llm.py        # Gemini SOP critique & roadmap generation
│   ├── core/
│   │   ├── config.py             # Pydantic Settings configuration
│   │   ├── database.py           # SQLAlchemy SQLite / PostgreSQL engine & sessions
│   │   └── security.py           # Password hashing & JWT access token management
│   ├── models/                   # SQLAlchemy DB entities (User, UserProfile, Document)
│   ├── schemas/                  # Pydantic validation schemas
│   ├── services/
│   │   ├── ml_service.py         # XGBoost model & SHAP explainer wrapper
│   │   ├── llm_service.py        # Google Gemini Flash advisory service
│   │   └── document_service.py   # Cloudinary upload & PDF extraction
│   └── main.py                   # FastAPI application root & middleware
├── .env                          # Environment secrets (JWT, Gemini, Cloudinary)
├── requirements.txt              # Backend dependencies
├── run.sh                        # One-click startup script
└── test_backend.py               # Comprehensive end-to-end integration test
```

---

## ⚡ Quick Start

### 1. Ensure Dependencies are Installed
From the repository root:
```bash
./model_building/venv/bin/pip install -r backend/requirements.txt
```

### 2. Start the Backend Server
```bash
./backend/run.sh
```
Or directly via uvicorn:
```bash
cd backend
../model_building/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Server will be running at: **`http://localhost:8000`**  
Interactive Swagger Docs: **`http://localhost:8000/api/v1/docs`**  
ReDoc: **`http://localhost:8000/api/v1/redoc`**

---

## 🔑 Environment Variables (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite (`sqlite:///./msadmit.db`) or PostgreSQL URI |
| `SECRET_KEY` | Secret key for signing JWT tokens |
| `GEMINI_API_KEY` | Google Gemini API key for SOP critique & roadmap |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | Cloudinary access API key |
| `CLOUDINARY_API_SECRET` | Cloudinary secret |
| `CORS_ORIGINS` | JSON list of allowed origins (e.g. `["http://localhost:5173"]`) |

---

## 📡 API Endpoints

### 🔐 Authentication
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Authenticate and receive JWT access token
- `GET /api/v1/auth/me` - Fetch authenticated user info

### 👤 Profile
- `GET /api/v1/profile/me` - Fetch profile metrics (GPA, GRE, TOEFL, publications, etc.)
- `PUT /api/v1/profile/me` - Update profile metrics

### 🧠 Machine Learning & SHAP
- `POST /api/v1/predict/score` - Compute overall admission score & SHAP factor contributions
- `POST /api/v1/predict/recommend` - Generate 3-3-3 Target/Consider/Reach university portfolio with SHAP strengths & bottlenecks

### 📄 Document Vault
- `POST /api/v1/documents/upload` - Upload PDF document, extract text, upload to Cloudinary/local
- `GET /api/v1/documents/list` - List all uploaded documents for user
- `GET /api/v1/documents/files/{filename}` - Download/view file

### 🤖 LLM Advisory (Gemini)
- `POST /api/v1/llm/critique-sop` - Evaluates SOP strictly using the 8-Criteria Rubric:
  1. **Academic Preparation** (Weight: 20%)
  2. **Concrete and Quantified Evidence** (Weight: 15%)
  3. **Experience and Meaning** (Weight: 15%)
  4. **Specificity of Goals** (Weight: 15%)
  5. **Program Fit** (Weight: 15%)
  6. **Non-Technical Strengths** (Weight: 5%)
  7. **Narrative Quality** (Weight: 10%)
  8. **Compliance** (Weight: 5%)
  - Returns raw criterion scores (0-10), supporting evidence quotes, strengths, and weaknesses.
  - **Separate Python calculation**: Computes `weighted_score_10` and `weighted_score_100` with automatic re-normalization if compliance is unavailable (N/A).
- `POST /api/v1/llm/generate-roadmap` - High-impact strategic timeline roadmap

---

## 🍃 MongoDB & SQL Database Readiness

The backend is built with dual database readiness:
- **Default (SQL)**: Works with PostgreSQL or local SQLite via SQLAlchemy.
- **MongoDB**: Drivers `pymongo` and `motor` are installed and configured via `backend/app/db/mongo.py`.
- **To switch to MongoDB**:
  1. Open `backend/.env`
  2. Set `DB_ENGINE="mongodb"`
  3. Set `MONGO_URI="mongodb://localhost:27017"` (or your MongoDB Atlas connection string)
  4. Set `MONGO_DB_NAME="msadmit"`

