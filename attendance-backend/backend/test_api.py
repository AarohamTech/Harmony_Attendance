import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app, init_db

def test_all_endpoints():
    print("[TEST] Initializing database...")
    init_db()
    
    client = TestClient(app)

    # 1. Health Root
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print("[OK] GET / passed:", r.json()["app"])

    # 2. Auth Login (Valid)
    r = client.post("/auth/login", json={"pin": "1234"})
    assert r.status_code == 200, f"Login failed: {r.text}"
    data = r.json()
    token = data["access_token"]
    emp = data["employee"]
    print("[OK] POST /auth/login passed:", emp["name"], "| Token:", token[:20] + "...")

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Auth Login (Invalid)
    r = client.post("/auth/login", json={"pin": "999999"})
    assert r.status_code == 401, f"Expected 401 for invalid login, got {r.status_code}"
    print("[OK] POST /auth/login invalid credentials rejected with 401")

    # 4. Auth Me
    r = client.get("/auth/me", headers=headers)
    assert r.status_code == 200, f"Get me failed: {r.text}"
    print("[OK] GET /auth/me passed:", r.json()["email"])

    # 5. Profile Update
    r = client.put("/profile/update", json={"role": "Lead UX Architect"}, headers=headers)
    assert r.status_code == 200, f"Profile update failed: {r.text}"
    print("[OK] PUT /profile/update passed:", r.json()["role"])

    # 6. Dashboard Overview
    r = client.get("/dashboard/overview")
    assert r.status_code == 200, f"Dashboard overview failed: {r.text}"
    ov = r.json()
    print("[OK] GET /dashboard/overview passed | Total Staff:", ov["total_employees"], "| Present:", ov["today_present"])

    # 7. Dashboard Charts
    r = client.get("/dashboard/charts")
    assert r.status_code == 200, f"Dashboard charts failed: {r.text}"
    ch = r.json()
    print("[OK] GET /dashboard/charts passed | Leave Stats:", ch["leave_statistics"], "| Face Success Rate:", ch["face_success_rate"])

    # 8. Attendance Today
    r = client.get(f"/attendance/today?employee_id={emp['id']}")
    assert r.status_code == 200, f"Attendance today failed: {r.text}"
    print("[OK] GET /attendance/today passed | Status:", r.json()["status"])

    # 9. Attendance History
    r = client.get(f"/attendance/history?employee_id={emp['id']}")
    assert r.status_code == 200, f"Attendance history failed: {r.text}"
    print("[OK] GET /attendance/history passed | Logs count:", len(r.json()))

    # 10. Punch In
    punch_payload = {
        "client_generated_id": f"test-punch-{os.urandom(4).hex()}",
        "employee_id": emp["id"],
        "punch_type": "in",
        "timestamp": "2026-08-05T08:58:00Z",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "source": "web",
        "face_image": "sample_face_base64"
    }
    r = client.post("/punch", json=punch_payload)
    assert r.status_code == 200, f"Punch in failed: {r.text}"
    print("[OK] POST /punch in passed | Punch In Time:", r.json()["punch_in_time"])

    # 11. Employees List
    r = client.get("/employees?page=1&limit=10")
    assert r.status_code == 200, f"Employees list failed: {r.text}"
    print("[OK] GET /employees passed | Total:", r.json()["total"])

    # 12. Requests (GET & POST)
    r = client.get(f"/requests?employee_id={emp['id']}")
    assert r.status_code == 200, f"Get requests failed: {r.text}"
    print("[OK] GET /requests passed | Count:", len(r.json()))

    req_payload = {
        "employee_id": emp["id"],
        "request_type": "leave",
        "target_date": "2026-08-10",
        "reason": "Family Vacation - Requesting 3 days leave"
    }
    r = client.post("/requests", json=req_payload)
    assert r.status_code == 200, f"Submit request failed: {r.text}"
    print("[OK] POST /requests passed | Request ID:", r.json()["id"])

    # 13. Notifications
    r = client.get(f"/notifications?employee_id={emp['id']}")
    assert r.status_code == 200, f"Get notifications failed: {r.text}"
    print("[OK] GET /notifications passed | Unread count:", len(r.json()))

    r = client.put(f"/notifications/read-all?employee_id={emp['id']}")
    assert r.status_code == 200, f"Read all notifications failed: {r.text}"
    print("[OK] PUT /notifications/read-all passed")

    # 14. Face Registration
    face_payload = {"direction": "front", "base64Image": "sample_base64_face_image_string"}
    r = client.post("/face/register", json=face_payload, headers=headers)
    assert r.status_code == 200, f"Face register failed: {r.text}"
    print("[OK] POST /face/register passed:", r.json()["message"])

    # 15. Reports Export (CSV, XLSX, PDF)
    r = client.get("/reports/export?format=csv")
    assert r.status_code == 200 and "text/csv" in r.headers["content-type"], f"CSV export failed: {r.status_code}"
    print("[OK] GET /reports/export?format=csv passed")

    r = client.get("/reports/export?format=xlsx")
    assert r.status_code == 200 and "spreadsheetml" in r.headers["content-type"], f"XLSX export failed: {r.status_code}"
    print("[OK] GET /reports/export?format=xlsx passed")

    r = client.get("/reports/export?format=pdf")
    assert r.status_code == 200 and "application/pdf" in r.headers["content-type"], f"PDF export failed: {r.status_code}"
    print("[OK] GET /reports/export?format=pdf passed")

    print("\n[SUCCESS] ALL 15 API ENDPOINTS VERIFIED & WORKING PERFECTLY!")


if __name__ == "__main__":
    test_all_endpoints()
