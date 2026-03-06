from fastapi.testclient import TestClient

def test_mark_attendance(client: TestClient):
    # Setup employee first
    resp = client.post(
        "/api/v1/employees/",
        json={
            "employee_id": "EMP2000",
            "full_name": "Attendance Tester",
            "email": "attendance@example.com",
            "department": "Engineering"
        },
    )
    assert resp.status_code == 201
    emp_guid = resp.json()["id"]

    # Mark attendance
    att_resp = client.post(
        "/api/v1/attendance/",
        json={
            "employee_id": emp_guid,
            "date": "2026-06-01",
            "status": "Present"
        }
    )
    assert att_resp.status_code == 201
    data = att_resp.json()
    assert data["status"] == "Present"
    assert data["employee_id"] == emp_guid

def test_duplicate_attendance_prevented(client: TestClient):
    # Setup employee
    resp = client.post(
        "/api/v1/employees/",
        json={
            "employee_id": "EMP2001",
            "full_name": "Duplicate Tester",
            "email": "duplicate_att@example.com",
            "department": "Engineering"
        },
    )
    emp_guid = resp.json()["id"]

    # Mark attendance 1
    client.post(
        "/api/v1/attendance/",
        json={"employee_id": emp_guid, "date": "2026-06-02", "status": "Present"}
    )
    
    # Mark attendance 2 (Same Date!)
    att_resp_2 = client.post(
        "/api/v1/attendance/",
        json={"employee_id": emp_guid, "date": "2026-06-02", "status": "Absent"}
    )
    
    # Should get 409 Conflict
    assert att_resp_2.status_code == 409
    assert "already marked" in att_resp_2.json()["detail"]
