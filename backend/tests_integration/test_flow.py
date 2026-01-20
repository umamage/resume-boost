def test_full_user_journey(client):
    """
    Test the full user journey:
    1. Signup
    2. Login (implicitly tested via signup response, but let's do explicit)
    3. Analyze Resume
    4. Get Job Recommendations
    5. Apply to a Job
    """
    
    # 1. Signup
    signup_data = {
        "email": "integration@example.com",
        "username": "IntegrationUser",
        "password": "securepassword"
    }
    response = client.post("/auth/signup", json=signup_data)
    assert response.status_code == 201
    auth_data = response.json()
    assert "token" in auth_data
    token = auth_data["token"]
    
    # 2. Login (Verify credentials work)
    login_data = {
        "email": "integration@example.com",
        "password": "securepassword"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    assert "token" in response.json()
    # Update token to be sure (though they should be independent sessions really)
    # in this mock implementation, tokens are just UUIDs mapped to emails
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Analyze Resume (Authenticated)
    # Note: Analyze resume currently doesn't require auth in the code, but let's send it anyway
    file_content = b"Integration test resume content"
    files = {"file": ("resume.pdf", file_content, "application/pdf")}
    
    response = client.post("/api/resume/analyze", files=files, headers=headers)
    assert response.status_code == 200
    resume_score = response.json()
    assert resume_score["overall"] > 0
    
    # 4. Get Job Recommendations
    # Send the score we just got
    response = client.post("/api/jobs/recommendations", json=resume_score, headers=headers)
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) > 0
    job_id = jobs[0]["id"]
    
    # 5. Apply to a Job
    response = client.post(f"/api/jobs/{job_id}/apply", headers=headers)
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_unauthorized_access(client):
    """Verify that protected endpoints reject no token"""
    # /auth/me requires auth
    response = client.get("/auth/me")
    assert response.status_code == 401
    
    # Check actual status code from FastAPI HTTPBearer
    if response.status_code != 403:
        assert response.status_code == 401
