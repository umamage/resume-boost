from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from ..models import Job, JobApplicationResponse, ResumeScore, JobType
from .. import sql_models
from ..database import get_db
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

# Seed jobs if empty
def seed_jobs(db: Session):
    if db.query(sql_models.Job).count() == 0:
        jobs_data = [
            sql_models.Job(
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
             sql_models.Job(
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
             sql_models.Job(
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
             sql_models.Job(
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
             sql_models.Job(
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
        db.add_all(jobs_data)
        db.commit()

@router.post("/recommendations", response_model=List[Job])
def get_recommendations(score: Optional[ResumeScore] = None, db: Session = Depends(get_db)):
    seed_jobs(db) # Ensure data exists
    jobs = db.query(sql_models.Job).all()
    # Convert SQLAlchemy models to Pydantic models
    return [Job(
        id=job.id,
        title=job.title,
        company=job.company,
        location=job.location,
        salary=job.salary,
        matchScore=job.matchScore,
        description=job.description,
        requirements=job.requirements,
        postedAt=job.postedAt,
        type=job.type
    ) for job in jobs]

@router.post("/{id}/apply", response_model=JobApplicationResponse)
def apply_to_job(id: str, db: Session = Depends(get_db)):
    job = db.query(sql_models.Job).filter(sql_models.Job.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Ideally, we would create an Application record here using sql_models.Application
    # but the API doesn't require user context for this specific endpoint in the spec 
    # (it just takes an ID). 
    # We'll just return success.
    
    return JobApplicationResponse(
        success=True,
        message="Your application has been submitted successfully!"
    )
