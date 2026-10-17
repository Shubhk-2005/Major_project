<div align="center">
  <h1>🎓 MsAdmit</h1>
  <h3>AI-Powered Admission Competitiveness, Recommendation Engine & Profile Optimizer</h3>
  <p>An end-to-end full-stack platform leveraging Machine Learning, Explainable AI (SHAP), and Large Language Models (Gemini) to evaluate student profiles, predict admission probabilities across global universities, and generate actionable optimization roadmaps.</p>

  <p>
    <img src="https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Tooling-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/ML%20Engine-XGBoost%20%26%20Stacking-orange?style=for-the-badge&logo=xgboost" alt="XGBoost" />
    <img src="https://img.shields.io/badge/Explainability-SHAP-blue?style=for-the-badge" alt="SHAP" />
    <img src="https://img.shields.io/badge/LLM-Google%20Gemini-8E75B2?style=for-the-badge&logo=google" alt="Gemini" />
    <img src="https://img.shields.io/badge/Database-MongoDB%20Atlas%20%7C%20SQL-47A248?style=for-the-badge&logo=mongodb" alt="Database" />
  </p>
</div>

---

> **Academic Project:** Major Project for final year **B.Tech Computer Engineering**.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features & Modules](#-key-features--modules)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Step-by-Step Setup & How to Run](#-step-by-step-setup--how-to-run)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Backend Setup (FastAPI & ML Engine)](#3-backend-setup-fastapi--ml-engine)
  - [4. Frontend Setup (React & Vite)](#4-frontend-setup-react--vite)
- [Running Both Services](#-running-both-services)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Project Directory Structure](#-project-directory-structure)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [Meet the Team](#-meet-the-team)

---

## 📌 Overview

Applying for Master’s programs abroad (MS in CS, Data Science, etc.) is often ambiguous, expensive, and stressful. Applicants struggle to assess where their profiles stand relative to admission bars, which universities represent realistic targets, and how to improve weak areas before application deadlines.

**MsAdmit** solves this through a unified, data-driven platform:
1. **Predictive Admission Competitiveness:** Uses trained machine learning models to forecast competitiveness scores based on academic GPA, GRE (verbal/quant/analytical), TOEFL/IELTS, undergrad tier, work experience, internships, and research publications.
2. **Explainable AI (SHAP):** Deconstructs admission predictions so students see *exactly* why a university is categorized as Reach, Target, or Consider.
3. **Smart Resume Extraction:** Automatically parses applicant resumes (PDF) into quantitative metrics that directly feed the ML engine.
4. **LLM Statement of Purpose (SOP) Evaluation:** Evaluates candidate statements against an 8-criteria admissions rubric using Google Gemini, highlighting paragraph-by-paragraph strengths and weaknesses.
5. **Interactive What-If Simulator & Strategic Roadmap:** Allows students to simulate the impact of GRE retakes, new publications, or enhanced SOP scores on their overall tier recommendations in real-time.
6. **Active Application Tracker:** Real-time tracking of 6-stage document prep (SOP, LOR 1-3, Transcripts, Resume), deadlines countdown, and application fee budgeting.

---

## ✨ Key Features & Modules

| Module | Route | Description |
|---|---|---|
| **Student Onboarding** | `/onboarding` | Profile intake with PDF Resume extraction (work experience, internships, research papers) feeding ML models. |
| **Applicant Dashboard** | `/app/dashboard` | Competitiveness score, countdown to closest deadlines, tier distribution, and strategic quick-actions. |
| **AI University Recommendations** | `/app/recommendations` | Reach / Target / Consider recommendations based on ML inference and historical university bars. Includes SHAP breakdown drawers. |
| **Application Tracker** | `/app/tracker` | Track shortlisted programs with 6-document status checklists, deadlines, note-taking, fee budgets, and program removal. |
| **What-If ?? Simulator & Roadmap** | `/app/roadmap` | Interactive simulator testing the exact score delta from GRE boosts, publication additions, and SOP refinements. |
| **Document Vault & SOP Feedback** | `/app/documents` | Upload SOP drafts for an 8-criteria rubric evaluation powered by Google Gemini with weighted scoring and line reviews. |
| **QS Top 150 Rankings Explorer** | `/app/qs-rankings` | Search global universities, median admission requirements, tuition, and acceptance statistics. |

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   React + TypeScript + Vite Frontend                   │
│         (TailwindCSS, Framer Motion, Lucide Icons, Context API)        │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ HTTP / JSON REST                │ PDF Document Upload
                   ▼                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Service                         │
│                    (Uvicorn ASGI, JWT Auth, Pydantic)                  │
├───────────────────────────────┬────────────────────────────────────────┤
│     ML & Analytics Engine     │        GenAI & Document Services       │
│  - Stacking & XGBoost Models  │  - Google Gemini Flash 1.5             │
│  - TreeSHAP Feature Insights  │  - PyPDF Text Extraction               │
│  - Recommender (3-3-3 Tiers)  │  - 8-Criteria Rubric SOP Evaluator     │
├───────────────────────────────┴────────────────────────────────────────┤
│                           Data & Persistence                           │
│  - MongoDB Atlas (Motor Async Driver) or SQLAlchemy (SQLite/Postgres)  │
│  - Cloudinary Storage / Local Storage                                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Framer Motion, Lucide React, React Router v6.
- **Backend:** FastAPI, Python 3.10+, Uvicorn, Pydantic v2, PyPDF, Motor (Async MongoDB), PyMongo, SQLAlchemy.
- **Machine Learning & Data Science:** XGBoost, Scikit-learn, Random Forest, Stacking Classifier, SHAP (SHapley Additive exPlanations), Pandas, NumPy.
- **LLM Integration:** Google Gemini API (`google-generativeai`).
- **Database:** Dual support for MongoDB Atlas / MongoDB Local and SQLite / PostgreSQL.
- **Storage & Authentication:** JWT tokens with bcrypt password hashing; Cloudinary & local storage for uploaded documents.

---

## 📋 Prerequisites

Before running the project, ensure you have installed:
- **Node.js** (v18.0.0 or higher) and `npm`
- **Python** (v3.10 or higher)
- **Git**

---

## 🚀 Step-by-Step Setup & How to Run

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Major_Project.git
cd Major_Project
```

---

### 2. Configure Environment Variables

The project uses `.env` files for configuration. Example templates are provided.

#### A. Backend Configuration (`backend/.env`)
Create or edit `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Populate the values inside `backend/.env`:
```env
PROJECT_NAME="MsAdmit API"
API_V1_STR="/api/v1"
SECRET_KEY="your-super-secret-jwt-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Selection: Choose 'mongodb' or 'sql'
DB_ENGINE="mongodb"

# If using MongoDB (Local or Atlas):
MONGO_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority"
MONGO_DB_NAME="msadmit"

# If using SQL (SQLite / PostgreSQL):
# DATABASE_URL="sqlite:///./msadmit.db"

# Google Gemini API Key (Required for SOP critique & AI roadmap)
GEMINI_API_KEY="your-gemini-api-key"

# Cloudinary Storage (Optional for cloud file hosting; falls back to local storage)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# CORS Allowed Origins
CORS_ORIGINS='["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]'
```

#### B. Frontend Configuration (`.env`)
Create `.env` in the project root if using Firebase services:
```bash
cp .env.example .env
```

---

### 3. Backend Setup (FastAPI & ML Engine)

The backend uses Python 3.10+ and integrates the ML models located in `model_building/`.

#### Option A: Using the pre-configured virtual environment (Recommended)
If `model_building/venv` is already present:
```bash
./model_building/venv/bin/pip install -r backend/requirements.txt
```

#### Option B: Creating a fresh virtual environment
```bash
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r backend/requirements.txt
pip install -r model_building/requirements.txt
```

#### Start the Backend Server:
From the project root:
```bash
bash backend/run.sh
```
*Or directly using uvicorn:*
```bash
cd backend
../model_building/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Backend API URL:** `http://localhost:8000`
- **Interactive Swagger Documentation:** `http://localhost:8000/api/v1/docs`
- **Alternative ReDoc Documentation:** `http://localhost:8000/api/v1/redoc`

---

### 4. Frontend Setup (React & Vite)

Open a new terminal window at the project root:

```bash
# 1. Install Node.js dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

The frontend application will now be running at:
👉 **`http://localhost:5173`**

---

## ⚡ Running Both Services (Quick Summary)

| Terminal | Command | Purpose | URL |
|---|---|---|---|
| **Terminal 1 (Backend)** | `bash backend/run.sh` | Starts FastAPI Uvicorn server | `http://localhost:8000` |
| **Terminal 2 (Frontend)** | `npm run dev` | Starts Vite React frontend | `http://localhost:5173` |

---

## 📡 API Endpoints Reference

Interactive documentation with try-it-out capabilities is available at `http://localhost:8000/api/v1/docs`.

### 🔐 Authentication
- `POST /api/v1/auth/signup` - Register a new applicant account.
- `POST /api/v1/auth/login` - Authenticate with email/password and obtain JWT access token.
- `GET /api/v1/auth/me` - Fetch profile information for the authenticated applicant.

### 👤 Academic Profile
- `GET /api/v1/profile/me` - Retrieve user scores (GPA, GRE, TOEFL, experience, publications).
- `PUT /api/v1/profile/me` - Update user metrics.

### 🧠 Machine Learning & Recommendations
- `POST /api/v1/predict/score` - Computes overall profile competitiveness score and SHAP factor contributions.
- `POST /api/v1/predict/recommend` - Computes personalized university recommendations classified into Reach, Target, and Consider tiers with SHAP feature impacts.

### 📄 Document Vault & Parsing
- `POST /api/v1/documents/upload` - Upload PDF (Resume/SOP), extract text, and parse key metrics.
- `GET /api/v1/documents/list` - List uploaded files for user.
- `GET /api/v1/documents/files/{filename}` - Retrieve stored documents.

### 🤖 LLM Advisory (Google Gemini)
- `POST /api/v1/llm/critique-sop` - Evaluates SOP against the 8-Criteria Admissions Rubric (Academic Preparation, Concrete Evidence, Experience, Specificity of Goals, Program Fit, Non-Technical Strengths, Narrative Quality, Compliance) with line-by-line feedback.
- `POST /api/v1/llm/generate-roadmap` - Synthesizes high-impact strategic optimization timeline actions.

---

## 📁 Project Directory Structure

```text
Major_Project/
├── backend/                              # FastAPI Backend
│   ├── app/
│   │   ├── api/                          # REST API router & v1 endpoints
│   │   │   ├── deps.py                   # JWT Auth & DB session dependencies
│   │   │   └── v1/endpoints/
│   │   │       ├── auth.py               # Authentication endpoints
│   │   │       ├── profile.py            # User profile endpoints
│   │   │       ├── predict.py            # ML & recommendation endpoints
│   │   │       ├── documents.py          # Document upload & resume extraction
│   │   │       └── llm.py                # Gemini SOP critique & roadmap
│   │   ├── core/                         # Settings, security & configuration
│   │   ├── db/                           # Dual DB engines: MongoDB (Motor) & SQL
│   │   ├── models/                       # SQLAlchemy models
│   │   ├── schemas/                      # Pydantic request/response schemas
│   │   ├── services/                     # ML wrapper, LLM & document services
│   │   └── main.py                       # Application initialization & CORS
│   ├── run.sh                            # One-click backend startup script
│   └── requirements.txt                  # Backend Python dependencies
│
├── model_building/                       # Machine Learning Workflows
│   ├── Datsets/                          # Historical university admission datasets
│   ├── models/                           # Serialized trained models & scalers
│   ├── notebooks/                        # Jupyter exploration & training notebooks
│   ├── src/                              # Preprocessing, training & SHAP explainers
│   └── requirements.txt                  # ML Python dependencies
│
├── src/                                  # React + TypeScript Frontend
│   ├── components/                       # UI components
│   │   ├── explorer/                     # University drawer & details
│   │   ├── recommendations/              # Recommendation cards & SHAP drawers
│   │   ├── roadmap/                      # What-If simulator & roadmap timeline
│   │   ├── tracker/                      # Application tracker tables & cards
│   │   └── ui/                           # Badges, buttons, modals, layout
│   ├── contexts/                         # React context providers
│   │   ├── ApplicationsContext.tsx       # Dynamic tracked applications state
│   │   ├── AuthContext.tsx               # User authentication state
│   │   └── ProfileContext.tsx            # Academic profile & ML ranked state
│   ├── data/                             # Universities catalog & initial data
│   ├── pages/                            # Application routes
│   │   ├── Dashboard.tsx                 # Overview dashboard
│   │   ├── Documents.tsx                 # Document vault & SOP review
│   │   ├── Onboarding.tsx                # Intake form & resume extraction
│   │   ├── QsRankings.tsx                # QS Top 150 explorer
│   │   ├── Recommendations.tsx           # ML recommendations page
│   │   ├── Roadmap.tsx                   # What-If simulator page
│   │   └── Tracker.tsx                   # Applications tracker page
│   ├── types/                            # TypeScript interfaces & types
│   ├── App.tsx                           # Main router & app layout
│   └── main.tsx                          # React DOM entry point
│
├── index.html                            # Frontend HTML entry point
├── package.json                          # Frontend dependencies & scripts
├── tailwind.config.js                    # Tailwind styling configuration
├── tsconfig.json                         # TypeScript configuration
└── vite.config.ts                        # Vite configuration
```

---

## ❓ Troubleshooting & FAQs

### Q1: `[Errno 48] Address already in use` when starting backend
A process is already listening on port `8000`. You can free up the port with:
```bash
lsof -ti :8000 | xargs kill -9
```
Then run `bash backend/run.sh` again.

### Q2: Gemini API Key returns Quota / Rate limit errors
If your Gemini API key reaches its rate limit, MsAdmit automatically activates a built-in deterministic heuristic fallback evaluator for SOP critiques and resume parsing so the application remains functional without crashing.

### Q3: How do I switch between MongoDB Atlas and SQLite?
In `backend/.env`:
- To use MongoDB: Set `DB_ENGINE="mongodb"` and provide your `MONGO_URI`.
- To use SQLite: Set `DB_ENGINE="sql"` and `DATABASE_URL="sqlite:///./msadmit.db"`.

### Q4: Frontend build check
To test the production build of the frontend at any time:
```bash
npm run build
```

---

## 👥 Meet the Team

Developed with pride for the **B.Tech Computer Engineering Major Project**:

| Name | Role & Core Contribution |
| :--- | :--- |
| **Shubham Khilari** | Full Stack Developer & ML Engineer (Predictive Modeling, FastAPI Backend, React UI) |
| **Racheal Kodiyan** | Developer & Data Acquisition (University Dataset Collection & Feature Engineering) |
| **Shivangi Khandelwal** | Developer & UI/UX Design (Wireframing, Component Architecture, User Flow) |
| **Samiksha Khandagale** | Developer & Technical Documentation (Documentation, Testing & Design QA) |

---

<div align="center">
  <i>Developed with ❤️ for B.Tech Computer Engineering Major Project</i>
</div>
