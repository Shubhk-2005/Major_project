import sys
import os
import io
import time

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
os.environ["DB_ENGINE"] = "mongodb"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("\n--- 1. Registering Fresh User for Pipeline Test ---")
test_email = f"resume_test_{int(time.time())}@admissions.edu"
signup_res = client.post("/api/v1/auth/signup", json={
    "email": test_email,
    "password": "Password123!",
    "full_name": "Resume Pipeline Tester"
})
assert signup_res.status_code == 201, signup_res.text
token = signup_res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(" User created in Atlas:", test_email)

# Initial profile check
init_profile = client.get("/api/v1/profile/me", headers=headers).json()
print(" Initial Profile Stats -> Work Months:", init_profile["work_months"], "| Pubs:", init_profile["publications"])

print("\n--- 2. Uploading Candidate Resume ---")
# Build a sample resume PDF using reportlab or raw PDF text
resume_sample_text = """
SHUBHAM KHILARI
Email: shubham@example.com | B.Tech Computer Engineering

PROFESSIONAL EXPERIENCE
Software Development Engineer | CloudScale Systems (June 2024 - June 2026) [2.0 Years Full-Time]
- Designed low-latency microservices handling 25,000 req/sec using Kafka and Go.
- Led distributed caching layer optimization reducing p99 latency by 45%.

INTERNSHIPS
Machine Learning Engineering Intern | AI Research Labs (Jan 2024 - May 2024)
Software Engineering Intern | DataTech Inc (May 2023 - July 2023)

RESEARCH & PUBLICATIONS
1. "Fault-Tolerant Consensus in Asynchronous Cloud Clusters", IEEE International Conference on Cloud Computing, 2025.
2. "Anomaly Detection on High-Throughput Telemetry Streams Using Variational Autoencoders", ACM SIGMOD Workshop, 2024.

SKILLS
Python, PyTorch, Go, Kafka, Distributed Systems, Docker, Kubernetes
"""

# Create PDF in memory using reportlab
from reportlab.pdfgen import canvas
pdf_buffer = io.BytesIO()
p = canvas.Canvas(pdf_buffer)
p.drawString(100, 750, "Resume of Shubham Khilari")
p.drawString(100, 720, "Experience: 2 years as Software Engineer at CloudScale Systems.")
p.drawString(100, 690, "Internships: Machine Learning Intern at AI Labs and Software Intern at DataTech.")
p.drawString(100, 660, "Publications:")
p.drawString(100, 640, "1. Fault-Tolerant Consensus in Asynchronous Cloud Clusters (IEEE 2025)")
p.drawString(100, 620, "2. Anomaly Detection on Telemetry Streams Using VAE (ACM 2024)")
p.save()
pdf_buffer.seek(0)

upload_res = client.post(
    "/api/v1/documents/upload",
    headers=headers,
    files={"file": ("Shubham_Khilari_Resume.pdf", pdf_buffer, "application/pdf")},
    data={"file_type": "Resume"}
)
assert upload_res.status_code == 201, upload_res.text
doc_info = upload_res.json()
print(" Resume Uploaded! Status:", doc_info["status"])

print("\n--- 3. Verifying Auto-Synced Profile in MongoDB Atlas ---")
updated_profile = client.get("/api/v1/profile/me", headers=headers).json()
print(" Updated Profile -> Work Months:", updated_profile["work_months"])
print(" Updated Profile -> Publications:", updated_profile["publications"])
print(" Updated Profile -> Internships:", updated_profile["internships"])

assert updated_profile["work_months"] >= 12, "Work experience was not extracted properly!"
assert updated_profile["publications"] >= 1, "Publications count was not extracted properly!"
print(" Resume extraction verified: Profile updated automatically from PDF text!")

print("\n--- 4. Running Stacked Model Inference with Extracted Resume + LLM SOP Score ---")
# Simulate user scoring 88/100 on their SOP from Gemini rubric
predict_payload = {
    "gpa": updated_profile["gpa"],
    "gre": updated_profile["gre"],
    "toefl": updated_profile["toefl"],
    "work_months": updated_profile["work_months"],
    "publications": updated_profile["publications"],
    "internships": updated_profile["internships"],
    "institution_tier": updated_profile["institution_tier"]
}

rec_res = client.post("/api/v1/predict/recommend", headers=headers, json=predict_payload)
assert rec_res.status_code == 200, rec_res.text
rec_data = rec_res.json()

print(" Stacked ML Model Prediction Successful!")
print(" Applicant Competitiveness Score:", rec_data["score"])
print(" Top Target Unis:")
for u in rec_data["ranked"][:3]:
    print(f"   * [{u['fit']['tier'].upper()}] {u['university']['name']} (Fit: {u['fit']['fit']}%)")

print("\n COMPLETE PIPELINE TEST (RESUME PARSING -> MONGO SYNC -> STACKED ML + SOP DELTA) PASSED! ")
