import sys
import os
import io

# Setup paths
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
os.environ["DB_ENGINE"] = "mongodb"

from fastapi.testclient import TestClient
from app.main import app
from app.db.mongo import get_mongo_db

print("\n--- 1. Testing MongoDB Atlas Ping ---")
db = get_mongo_db()
ping_res = db.command("ping")
print(" MongoDB Atlas Ping Result:", ping_res)

client = TestClient(app)

print("\n--- 2. Testing Auth Signup in MongoDB Atlas ---")
import time
test_email = f"student_{int(time.time())}@admissions.edu"
signup_payload = {
    "email": test_email,
    "password": "SecurePassword123!",
    "full_name": "Atlas Test Applicant"
}
res = client.post("/api/v1/auth/signup", json=signup_payload)
assert res.status_code == 201, res.text
token_data = res.json()
token = token_data["access_token"]
print(" User successfully created in MongoDB Atlas! JWT received.")

headers = {"Authorization": f"Bearer {token}"}
res = client.get("/api/v1/auth/me", headers=headers)
assert res.status_code == 200, res.text
user_me = res.json()
print(" Auth /me from MongoDB:", user_me["email"], "| MongoDB ID:", user_me["id"])

print("\n--- 3. Testing User Profile in MongoDB Atlas ---")
res = client.get("/api/v1/profile/me", headers=headers)
assert res.status_code == 200, res.text
profile = res.json()
print(" Default profile fetched from MongoDB:", profile["gpa"], profile["target_program"])

patch_payload = {
    "gpa": 9.1,
    "gre": 328.0,
    "toefl": 112.0,
    "publications": 3,
    "work_months": 24
}
res = client.put("/api/v1/profile/me", headers=headers, json=patch_payload)
assert res.status_code == 200, res.text
updated = res.json()
assert updated["gpa"] == 9.1
assert updated["publications"] == 3
print(" Profile updated in MongoDB Atlas! GPA:", updated["gpa"], "| Pubs:", updated["publications"])

print("\n--- 4. Testing Document Upload in MongoDB Atlas ---")
# Create mock PDF bytes
pdf_header = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n212\n%%EOF"
files = {"file": ("test_sop.pdf", io.BytesIO(pdf_header), "application/pdf")}
data = {"file_type": "SOP"}

res = client.post("/api/v1/documents/upload", headers=headers, files=files, data=data)
assert res.status_code == 201, res.text
doc = res.json()
doc_id = doc["id"]
print(" Document stored in MongoDB Atlas! Doc ID:", doc_id, "| Name:", doc["filename"])

res = client.get("/api/v1/documents/list", headers=headers)
assert res.status_code == 200, res.text
doc_list = res.json()
assert doc_list["total"] >= 1
print(" Documents fetched from MongoDB Atlas:", doc_list["total"], "documents found.")

print("\n--- 5. Testing 8-Criteria SOP Rubric Evaluation with MongoDB Document Reference ---")
# Direct text test to verify rubric
sample_sop = """
During my undergraduate studies in Computer Engineering, I led a project developing an automated
anomaly detection framework for distributed cloud clusters using PyTorch and Kafka. We benchmarked
several autoencoder architectures against real-time telemetry streams, reducing false alarm rates by 23%.
My goal is to pursue advanced research in Distributed Systems and Reliable AI at Carnegie Mellon University,
specifically contributing to ongoing research on fault-tolerant consensus protocols under Dr. Satyanarayanan.
"""
critique_payload = {
    "sop_text": sample_sop,
    "sop_id": f"DOC-{doc_id}",
    "university": "Carnegie Mellon University",
    "program": "Master of Science in Computer Science",
    "program_information": "Rigorous thesis curriculum in distributed cloud systems."
}
res = client.post("/api/v1/llm/critique-sop", headers=headers, json=critique_payload)
assert res.status_code == 200, res.text
critique = res.json()
print(" SOP Rubric Evaluation Successful!")
print(" Weighted Score (out of 10):", critique["weighted_score_10"])
print(" Weighted Score (out of 100):", critique["weighted_score_100"])

print("\n ALL MONGODB ATLAS END-TO-END TESTS PASSED SUCCESSFULLY! ")
