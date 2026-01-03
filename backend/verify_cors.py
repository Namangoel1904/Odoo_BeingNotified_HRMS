from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def verify_cors():
    print("Verifying CORS Headers...")
    response = client.options(
        "/auth/login",
        headers={
            "Origin": "http://localhost:8000",
            "Access-Control-Request-Method": "POST",
        }
    )
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {response.headers}")
    
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "*"
    print("[Success] CORS Verified.")

if __name__ == "__main__":
    verify_cors()
