import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_success():
    email = "newstudent@mergington.edu"
    activity = "Chess Club"
    # Remove if already present
    data = client.get("/activities").json()
    if email in data[activity]["participants"]:
        data[activity]["participants"].remove(email)
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]


def test_signup_duplicate():
    email = "michael@mergington.edu"
    activity = "Chess Club"
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]


def test_signup_activity_not_found():
    response = client.post("/activities/Nonexistent/signup?email=test@mergington.edu")
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]


def test_signup_activity_full():
    activity = "Chess Club"
    # Fill up the activity
    data = client.get("/activities").json()
    max_participants = data[activity]["max_participants"]
    # Add fake emails until full
    for i in range(max_participants - len(data[activity]["participants"])):
        client.post(f"/activities/{activity}/signup?email=fake{i}@mergington.edu")
    response = client.post(f"/activities/{activity}/signup?email=overflow@mergington.edu")
    assert response.status_code == 400
    assert "Activity is full" in response.json()["detail"]
