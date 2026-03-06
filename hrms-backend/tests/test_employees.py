from fastapi.testclient import TestClient

def test_create_employee(client: TestClient):
    response = client.post(
        "/api/v1/employees/",
        json={
            "employee_id": "EMP1000",
            "full_name": "Test User",
            "email": "test@example.com",
            "department": "Engineering"
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["employee_id"] == "EMP1000"
    assert data["full_name"] == "Test User"
    assert "id" in data

def test_create_employee_duplicate_email(client: TestClient):
    # Setup initial
    client.post(
        "/api/v1/employees/",
        json={
            "employee_id": "EMP1001",
            "full_name": "Test User 2",
            "email": "duplicate@example.com",
            "department": "Engineering"
        },
    )
    # Attempt duplicate email
    response = client.post(
        "/api/v1/employees/",
        json={
            "employee_id": "EMP1002",
            "full_name": "Test User 3",
            "email": "duplicate@example.com",
            "department": "Engineering"
        },
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "Email already registered"
