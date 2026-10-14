import sys
import os
import json

# Setup paths
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
os.environ["DATABASE_URL"] = "sqlite:///./test_msadmit.db"

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine

# Initialize tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

print("\n--- 1. Testing Health Endpoints ---")
res = client.get("/health")
assert res.status_code == 200, res.text
print(" Health Check passed:", res.json())

print("\n--- 2. Testing Auth Signup & Login ---")
signup_payload = {
    "email": "testuser@admissions.edu",
    "password": "Password123!",
    "full_name": "Test Applicant"
}
res = client.post("/api/v1/auth/signup", json=signup_payload)
assert res.status_code == 201, res.text
token_data = res.json()
token = token_data["access_token"]
print(" Signup successful! Token received.")

headers = {"Authorization": f"Bearer {token}"}
res = client.get("/api/v1/auth/me", headers=headers)
assert res.status_code == 200, res.text
print(" Auth /me passed:", res.json()["email"])

print("\n--- 3. Testing User Profile Get & Update ---")
res = client.get("/api/v1/profile/me", headers=headers)
assert res.status_code == 200, res.text
print(" Initial profile loaded:", res.json()["gpa"])

patch_payload = {
    "gpa": 8.8,
    "gre": 326.0,
    "publications": 2,
    "work_months": 18
}
res = client.put("/api/v1/profile/me", headers=headers, json=patch_payload)
assert res.status_code == 200, res.text
updated_profile = res.json()
assert updated_profile["gpa"] == 8.8
assert updated_profile["gre"] == 326.0
print(" Profile update successful:", updated_profile["gpa"], updated_profile["gre"])

print("\n--- 4. Testing ML Predict & SHAP Feature Attributions ---")
predict_payload = {
    "gpa": 8.8,
    "gre": 326.0,
    "toefl": 110.0,
    "publications": 2,
    "work_months": 18,
    "internships": 2,
    "institution_tier": 2
}
res = client.post("/api/v1/predict/score", json=predict_payload)
assert res.status_code == 200, res.text
score_data = res.json()
print(" ML Prediction Score:", score_data["score"], "Percentile:", score_data["percentile"])
print(" SHAP Factors Count:", len(score_data["factors"]))
for f in score_data["factors"][:3]:
    print(f"   * {f['label']}: {f['contribution']} pts ({f['value']})")

print("\n--- 5. Testing ML 3-3-3 Portfolio Recommendation ---")
res = client.post("/api/v1/predict/recommend", json=predict_payload)
assert res.status_code == 200, res.text
rec_data = res.json()
ranked = rec_data["ranked"]
print(" Total Ranked Universities returned:", len(ranked))
print(" Summary:", rec_data["portfolio_summary"])
for r in ranked[:3]:
    uni = r["university"]
    fit = r["fit"]
    print(f"   * [{fit['tier'].upper()}] {uni['name']} - Fit: {fit['fit']}% (Reasons: {len(fit['reasons'])})")

print("\n--- 6. Testing LLM SOP 8-Criteria Rubric Evaluation (User Prompt) ---")
sample_sop = """
During my undergraduate studies in Computer Engineering, I led a project developing an automated
anomaly detection framework for distributed cloud clusters using PyTorch and Kafka. We benchmarked
several autoencoder architectures against real-time telemetry streams, reducing false alarm rates by 23%.
My goal is to pursue advanced research in Distributed Systems and Reliable AI at Carnegie Mellon University,
specifically contributing to ongoing research on fault-tolerant consensus protocols under Dr. Satyanarayanan.
"""
critique_payload = {
    "sop_text": sample_sop,
    "sop_id": "SOP-101",
    "university": "Carnegie Mellon University",
    "program": "Master of Science in Computer Science",
    "program_information": "Rigorous thesis and coursework curriculum in distributed cloud systems."
}
res = client.post("/api/v1/llm/critique-sop", json=critique_payload)
assert res.status_code == 200, res.text
critique = res.json()
print(" SOP ID:", critique["sop_id"])
print(" University:", critique["university"])
print(" Program-calculated Weighted Score (out of 10):", critique["weighted_score_10"])
print(" Program-calculated Weighted Score (out of 100):", critique["weighted_score_100"])
print(" Criteria Evaluated:")
for crit_name, crit_data in critique["criteria"].items():
    score_display = f"{crit_data['score']}/10" if crit_data['score'] is not None else "N/A"
    print(f"   * {crit_name}: {score_display} | Strength: {crit_data['strength'][:60]}...")

print("\n--- 7. Testing LLM Strategic Roadmap Generation ---")
roadmap_payload = {
    "gpa": 8.8,
    "gre": 326.0,
    "toefl": 110.0,
    "publications": 2,
    "work_months": 18,
    "target_universities": ["CMU", "Stanford", "NUS", "UW"]
}
res = client.post("/api/v1/llm/generate-roadmap", json=roadmap_payload)
assert res.status_code == 200, res.text
roadmap = res.json()
print(" Roadmap Timeline Months:", roadmap["suggested_timeline_months"])
print(" Key Priorities Count:", len(roadmap["key_priorities"]))
for p in roadmap["key_priorities"][:2]:
    print(f"   * [{p['area']}] ({p['timeline']}): {p['action_item']}")

print("\n--- 8. Testing MongoDB Architecture Readiness ---")
from app.db.mongo import get_mongo_client, get_mongo_db
m_client = get_mongo_client()
m_db = get_mongo_db()
print(" MongoDB PyMongo Driver successfully configured.")
print(" Target MongoDB database:", m_db.name)

# Clean test db
if os.path.exists("test_msadmit.db"):
    os.remove("test_msadmit.db")

print("\n ALL END-TO-END TESTS PASSED SUCCESSFULLY! ")
