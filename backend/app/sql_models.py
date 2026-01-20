from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    username = Column(String)
    password = Column(String) # Hashed in real app, plain for now per previous mock
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String)
    company = Column(String)
    location = Column(String)
    salary = Column(String, nullable=True)
    matchScore = Column(Integer)
    description = Column(Text)
    requirements = Column(JSON) # Storing list of strings as JSON
    postedAt = Column(String)
    type = Column(String)

class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, ForeignKey("jobs.id"))
    user_id = Column(String, ForeignKey("users.id"))
    appliedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
