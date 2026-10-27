import sys
import os
import io

# Add backend directory to sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(script_dir, ".."))
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("Testing FastAPI Backend Endpoints...")
    client = TestClient(app)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200
    print("[OK] GET /health PASSED")

    # 2. Registration
    user_data = {
        "email": "analyst@cybersecurity.org",
        "username": "sec_analyst",
        "password": "SecurePassword123!"
    }
    res = client.post("/api/v1/auth/register", json=user_data)
    if res.status_code != 201:
        # Try login if already exists
        res = client.post("/api/v1/auth/login", json={
            "username_or_email": user_data["username"],
            "password": user_data["password"]
        })
    
    assert res.status_code == 200 or res.status_code == 201
    auth_json = res.json()
    token = auth_json["token"]["access_token"]
    print("[OK] Auth Registration/Login PASSED. Token acquired.")

    headers = {"Authorization": f"Bearer {token}"}

    # 3. GET /auth/me
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200
    print(f"[OK] GET /api/v1/auth/me PASSED (User: {res.json()['username']})")

    # 4. Upload sample CSV
    data_path = os.path.join(backend_dir, "..", "data", "CICIDS2017_sample.csv")
    with open(data_path, "rb") as f:
        file_bytes = f.read()

    files = {"file": ("test_sample.csv", file_bytes[:50000], "text/csv")}
    res = client.post("/api/v1/predictions/upload", headers=headers, files=files)
    assert res.status_code == 200
    upload_res = res.json()
    print(f"[OK] POST /api/v1/predictions/upload PASSED (Total Flows: {upload_res['total_flows']}, Attacks: {upload_res['attack_count']})")

    # 5. GET /dashboard-stats
    res = client.get("/api/v1/predictions/dashboard-stats", headers=headers)
    assert res.status_code == 200
    stats = res.json()
    print(f"[OK] GET /api/v1/predictions/dashboard-stats PASSED (Total Predictions: {stats['total_predictions']}, Accuracy: {stats['model_accuracy']}%)")

    # 6. GET /history
    res = client.get("/api/v1/predictions/history?page=1&size=10", headers=headers)
    assert res.status_code == 200
    hist = res.json()
    print(f"[OK] GET /api/v1/predictions/history PASSED (Records returned: {len(hist['records'])})")

    # 7. Export CSV / Excel / PDF
    for fmt in ["csv", "xlsx", "pdf"]:
        res = client.get(f"/api/v1/predictions/export?format={fmt}", headers=headers)
        assert res.status_code == 200
        print(f"[OK] GET /api/v1/predictions/export?format={fmt} PASSED (Bytes: {len(res.content)})")

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
