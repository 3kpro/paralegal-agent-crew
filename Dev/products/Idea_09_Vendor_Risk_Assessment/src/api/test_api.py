import sys
import os

# Add project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_api_routes():
    print("Testing API Gateway...")
    
    # 1. Health Check
    print("[1] Testing Health Check /health ...")
    response = client.get("/health")
    assert response.status_code == 200
    print("SUCCESS: Health check passed.")
    
    # 2. Get Vendors
    print("[2] Testing GET /api/v1/vendors ...")
    response = client.get("/api/v1/vendors")
    assert response.status_code == 200
    vendors = response.json()
    assert len(vendors) >= 3
    print(f"SUCCESS: Retrieved {len(vendors)} vendors.")
    
    # 3. Get Single Vendor
    v_id = vendors[0]['id']
    print(f"[3] Testing GET /api/v1/vendors/{v_id} ...")
    response = client.get(f"/api/v1/vendors/{v_id}")
    assert response.status_code == 200
    assert response.json()['name'] == vendors[0]['name']
    print("SUCCESS: Single vendor retrieval passed.")
    
    # 4. Start Assessment
    print("[4] Testing POST /api/v1/assessments/start ...")
    payload = {"vendor_domain": "example.com"}
    response = client.post("/api/v1/assessments/start", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    print(f"SUCCESS: Assessment started. Score: {data['risk_score']}")

if __name__ == "__main__":
    test_api_routes()
