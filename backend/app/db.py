from typing import Dict, List, Optional
from .models import User, Job, JobType
from datetime import datetime

class MockDB:
    def __init__(self):
        self.users: Dict[str, dict] = {}  # email -> user_dict (with password)
        self.jobs: List[Job] = self._seed_jobs()
        self.tokens: Dict[str, str] = {} # token -> email

    def _seed_jobs(self) -> List[Job]:
        return [
            Job(
                id="1",
                title="Senior Software Engineer",
                company="TechCorp Inc.",
                location="San Francisco, CA",
                salary="$150,000 - $200,000",
                matchScore=92,
                description="Join our innovative team to build next-generation cloud solutions.",
                requirements=["5+ years experience", "React/TypeScript", "Cloud platforms"],
                postedAt="2 days ago",
                type=JobType.FULL_TIME
            ),
            Job(
                id="2",
                title="Full Stack Developer",
                company="StartupXYZ",
                location="Remote",
                salary="$120,000 - $160,000",
                matchScore=88,
                description="Build and scale our core product with modern technologies.",
                requirements=["3+ years experience", "Node.js", "React", "PostgreSQL"],
                postedAt="1 week ago",
                type=JobType.REMOTE
            ),
             Job(
                id="3",
                title="Frontend Engineer",
                company="DesignStudio",
                location="New York, NY",
                salary="$110,000 - $140,000",
                matchScore=85,
                description="Create beautiful, responsive user interfaces for our clients.",
                requirements=["2+ years experience", "React", "CSS/Tailwind", "Figma"],
                postedAt="3 days ago",
                type=JobType.FULL_TIME
            ),
            Job(
                id="4",
                title="Backend Developer",
                company="DataFlow Systems",
                location="Austin, TX",
                salary="$130,000 - $170,000",
                matchScore=79,
                description="Design and implement robust backend services and APIs.",
                requirements=["4+ years experience", "Python/Django", "REST APIs", "AWS"],
                postedAt="5 days ago",
                type=JobType.FULL_TIME
            ),
            Job(
                id="5",
                title="DevOps Engineer",
                company="CloudNative Co",
                location="Seattle, WA",
                salary="$140,000 - $180,000",
                matchScore=74,
                description="Manage and improve our cloud infrastructure and CI/CD pipelines.",
                requirements=["3+ years experience", "Kubernetes", "Terraform", "AWS/GCP"],
                postedAt="1 day ago",
                type=JobType.CONTRACT
            ),
        ]

    def create_user(self, user: User, password: str) -> User:
        user_dict = user.model_dump()
        user_dict['password'] = password
        self.users[user.email] = user_dict
        return user

    def get_user_by_email(self, email: str) -> Optional[dict]:
        return self.users.get(email)

    def save_token(self, token: str, email: str):
        self.tokens[token] = email

    def get_user_by_token(self, token: str) -> Optional[User]:
        email = self.tokens.get(token)
        if not email:
            return None
        user_data = self.users.get(email)
        if not user_data:
            return None
        return User(**user_data) # Exclude password by re-validating against User model

    def get_all_jobs(self) -> List[Job]:
        return self.jobs

    def get_job(self, job_id: str) -> Optional[Job]:
        for job in self.jobs:
            if job.id == job_id:
                return job
        return None

db = MockDB()
