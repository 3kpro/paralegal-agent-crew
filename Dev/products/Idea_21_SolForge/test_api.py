
from fastapi.testclient import TestClient
from src.api.main import app
import logging
import os

# Configure logging to suppress startup logs
logging.basicConfig(level=logging.ERROR)

def test_api_endpoints():
    print("Testing API Endpoints...")
    
    # Clean up DB for fresh test
    if os.path.exists("solforge.db"):
        os.remove("solforge.db")
        
    with TestClient(app) as client:
        # Note: TestClient runs lifespan events automatically
        
        # 1. Test Root
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "SolForge API is running"}
        
        # 2. Test Status
        response = client.get("/api/v1/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "uptime" in data
        
        # 3. Test Lanes List
        response = client.get("/api/v1/lanes")
        assert response.status_code == 200
        lanes = response.json()
        assert len(lanes) == 3 # Default lanes created on init
        lane_id = lanes[0]["id"]
        
        # 4. Test Single Lane
        response = client.get(f"/api/v1/lanes/{lane_id}")
        assert response.status_code == 200
        assert response.json()["id"] == lane_id
        
        # 5. Test Stop Lane
        response = client.post(f"/api/v1/lanes/{lane_id}/stop")
        assert response.status_code == 200
        
        # Verify status changed
        response = client.get(f"/api/v1/lanes/{lane_id}")
        assert response.json()["status"] == "paused"
        
        # 6. Test Start Lane
        response = client.post(f"/api/v1/lanes/{lane_id}/start")
        assert response.status_code == 200
        
        # Verify status changed
        response = client.get(f"/api/v1/lanes/{lane_id}")
        assert response.json()["status"] == "active"
        
        # 7. Test Trades (Empty initially)
        response = client.get(f"/api/v1/lanes/{lane_id}/trades")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
    print("API tests passed!")

if __name__ == "__main__":
    test_api_endpoints()
