from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import pytest
from app.main import app
from app.database import Base, get_db
from app import sql_models

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# Re-create tables between tests to ensure isolation? 
# For now, let's just create them once globally or use a fixture.
# Pytest fixture approach is cleaner.

@pytest.fixture(autouse=True)
def run_around_tests():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Resume Boost API"}

def test_auth_signup_login():
    # Test Signup
    signup_data = {
        "email": "testuser@example.com",
        "username": "testuser",
        "password": "password123"
    }
    response = client.post("/auth/signup", json=signup_data)
    assert response.status_code == 201
    assert "token" in response.json()
    assert response.json()["user"]["email"] == "testuser@example.com"
    token = response.json()["token"]

    # Test Login
    login_data = {
        "email": "testuser@example.com",
        "password": "password123"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    assert "token" in response.json()
    
    # Test Me
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "testuser@example.com"

def test_job_recommendations():
    # Because valid user is not required for recommendations endpoint currently
    response = client.post("/api/jobs/recommendations", json=None)
    assert response.status_code == 200
    assert len(response.json()) > 0
    
    job_id = response.json()[0]["id"]
    
    # Test Apply
    response = client.post(f"/api/jobs/{job_id}/apply")
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_resume_analyze():
    # Create a dummy file
    file_content = b"dummy resume content"
    files = {"file": ("resume.pdf", file_content, "application/pdf")}
    
    response = client.post("/api/resume/analyze", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "overall" in data
