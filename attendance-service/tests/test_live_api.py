import httpx
import json

BASE_URL = "http://localhost:8002"

def main():
    print("==================================================")
    print("TESTING LIVE FASTAPI ENDPOINTS AT", BASE_URL)
    print("==================================================\n")

    client = httpx.Client(base_url=BASE_URL)

    # 1. Health check
    res = client.get("/health")
    print("1. GET /health:")
    print(json.dumps(res.json(), indent=2))
    print()

    # 2. Login
    res = client.post("/auth/login", json={"badge_id": "EMP101", "pin": "1234"})
    print("2. POST /auth/login (Alice EMP101):")
    login_data = res.json()
    print(json.dumps(login_data, indent=2))
    print()
    emp_alice_id = login_data["employee"]["id"]

    # Login Diana (EMP104) dynamically
    res_diana = client.post("/auth/login", json={"badge_id": "EMP104", "pin": "1234"})
    emp_diana_id = res_diana.json()["employee"]["id"]

    # 3. Today's Attendance for Alice & Diana
    print(f"3. GET /attendance/today for Alice (ID {emp_alice_id}) & Diana (ID {emp_diana_id}):")
    for emp_id in [emp_alice_id, emp_diana_id]:
        res = client.get(f"/attendance/today?employee_id={emp_id}")
        data = res.json()
        print(f"--- Employee ID {emp_id} ---")
        print(json.dumps(data, indent=2))
    print()

    # 4. History for Alice
    res = client.get(f"/attendance/history?employee_id={emp_alice_id}")
    print(f"4. GET /attendance/history for Employee ID {emp_alice_id} (Alice):")
    print(json.dumps(res.json(), indent=2))
    print()

    # 5. Summary
    res = client.get("/attendance/summary")
    print("5. GET /attendance/summary:")
    print(json.dumps(res.json(), indent=2))
    print()

    # 6. Dashboard Overview
    res = client.get("/dashboard/overview")
    print("6. GET /dashboard/overview:")
    print(json.dumps(res.json(), indent=2))
    print()

    # 7. Submit a punch and verify recalculation
    print(f"7. POST /punch (Offline idempotent punch for Diana ID {emp_diana_id} to complete her day):")
    punch_payload = {
        "employee_id": emp_diana_id,
        "punch_type": "out",
        "timestamp": "2026-08-05T18:15:00+05:30",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "source": "android",
        "client_generated_id": "live-test-diana-out-001"
    }
    res = client.post("/punch", json=punch_payload)
    print("Punch Result:", json.dumps(res.json(), indent=2))

    # Verify Diana's updated status after punch-out
    res = client.get(f"/attendance/today?employee_id={emp_diana_id}")
    print("Diana's Updated Attendance Today:", json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    main()
