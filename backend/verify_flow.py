from fastapi.testclient import TestClient
from backend.main import app
from backend.core.config import settings

client = TestClient(app)

def test_flow():
    print("1. Testing Bootstrap (Admin should exist)")
    # We login as admin to verify existence
    login_payload = {
        "login_id": settings.INITIAL_ADMIN_EMAIL,
        "password": settings.INITIAL_ADMIN_PASSWORD
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200, f"Login failed: {response.text}"
    token_data = response.json()
    token = token_data["access_token"]
    print("   [Success] Admin logged in. Token received.")

    print("\n2. Testing Admin Access to Dashboard")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/admin/dashboard", headers=headers)
    assert response.status_code == 200, f"Admin dashboard access failed: {response.text}"
    print("   [Success] Admin accessed dashboard.")

    print("\n3. Testing Forced Password Change")
    # Initial Admin has must_change_password=True. 
    # Try accessing protected route again? Actually logic is client-side usually but we have backend flag.
    # We didn't block other routes based on this flag strictly in deps, but we verify we can change password.
    
    change_password_payload = {
        "new_password": "newsecurepassword123",
        "confirm_password": "newsecurepassword123"
    }
    response = client.post("/auth/change-password", json=change_password_payload, headers=headers)
    assert response.status_code == 200, f"Password change failed: {response.text}"
    print("   [Success] Password changed.")

    print("\n4. Testing Login with New Password")
    login_payload["password"] = "newsecurepassword123"
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200, f"Login with new password failed: {response.text}"
    token_new = response.json()["access_token"]
    print("   [Success] Admin logged in with new password.")

    print("\n5. Testing Password Change Re-use (Should Fail if not required logic enforced, but our endpoint logic is: Only users with must_change_password=true can access)")
    # Since we set must_change_password=False after change, this should now fail with 400
    headers_new = {"Authorization": f"Bearer {token_new}"}
    response = client.post("/auth/change-password", json=change_password_payload, headers=headers_new)
    assert response.status_code == 400, "Password change should be denied if not required"
    print("   [Success] Repeated password change denied as expected.")

    print("\nVerification Complete!")

if __name__ == "__main__":
    test_flow()
