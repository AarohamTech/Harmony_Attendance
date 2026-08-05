import httpx
import json
import uuid
from datetime import datetime, timezone

BASE_URL = "http://localhost:8002"

def main():
    print("==================================================")
    print("END-TO-END VERIFICATION: APP CLIENT -> BACKEND DB")
    print("==================================================\n")

    client = httpx.Client(base_url=BASE_URL)

    # 1. Login with PIN 1234 (Seeded for Alice - EMP101)
    print("Step 1: Test Login via PIN '1234'...")
    login_resp = client.post("/auth/login", json={"pin": "1234"})
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_data = login_resp.json()
    print("Login Success! Employee Session Created:")
    print(json.dumps(login_data["employee"], indent=2))
    token = login_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    emp_id = login_data["employee"]["id"]
    print()

    # 2. Fetch Dashboard & Today's Attendance before punch
    print("Step 2: Fetch Dashboard & Today's Attendance...")
    today_resp = client.get(f"/attendance/today?employee_id={emp_id}", headers=headers)
    print("Today's Current Record in DB:")
    print(json.dumps(today_resp.json(), indent=2))
    print()

    # 3. Perform Punch In with unique client_generated_id
    punch_in_id = f"client-punch-in-{uuid.uuid4()}"
    print(f"Step 3: Perform Punch In (client_generated_id={punch_in_id})...")
    punch_in_payload = {
        "employee_id": emp_id,
        "punch_type": "in",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "latitude": 12.9716,
        "longitude": 77.5946,
        "source": "web",
        "client_generated_id": punch_in_id
    }
    punch_in_resp = client.post("/punch", json=punch_in_payload, headers=headers)
    assert punch_in_resp.status_code == 200, f"Punch In failed: {punch_in_resp.text}"
    print("Punch In Recorded in DB:")
    print(json.dumps(punch_in_resp.json(), indent=2))
    print()

    # 4. Test Idempotency (resending same punch_in_id)
    print(f"Step 4: Test Offline Queue Idempotency (re-sending same client_generated_id)...")
    dup_resp = client.post("/punch", json=punch_in_payload, headers=headers)
    assert dup_resp.status_code == 200
    assert dup_resp.json()["id"] == punch_in_resp.json()["id"]
    print("Idempotency Confirmed! No duplicate punch record created.")
    print()

    # 5. Perform Punch Out
    punch_out_id = f"client-punch-out-{uuid.uuid4()}"
    print(f"Step 5: Perform Punch Out (client_generated_id={punch_out_id})...")
    punch_out_payload = {
        "employee_id": emp_id,
        "punch_type": "out",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "latitude": 12.9716,
        "longitude": 77.5946,
        "source": "web",
        "client_generated_id": punch_out_id
    }
    punch_out_resp = client.post("/punch", json=punch_out_payload, headers=headers)
    assert punch_out_resp.status_code == 200, f"Punch Out failed: {punch_out_resp.text}"
    print("Punch Out Recorded in DB:")
    print(json.dumps(punch_out_resp.json(), indent=2))
    print()

    # 6. Verify final recalculated AttendanceDay status
    print("Step 6: Fetch Updated Attendance Day from DB...")
    updated_today = client.get(f"/attendance/today?employee_id={emp_id}", headers=headers)
    print("Final Updated Attendance Day Record:")
    print(json.dumps(updated_today.json(), indent=2))
    print()

    print("==================================================")
    print("ALL E2E INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    main()
