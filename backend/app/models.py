from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum

class User(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: EmailStr
    username: str
    createdAt: datetime

class LoginCredentials(BaseModel):
    email: EmailStr
    password: str

class SignupCredentials(BaseModel):
    username: str
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    user: User
    token: str

class ResumeCategories(BaseModel):
    formatting: int
    keywords: int
    experience: int
    education: int
    skills: int

class ResumeScore(BaseModel):
    overall: int
    categories: ResumeCategories
    suggestions: List[str]

class JobType(str, Enum):
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    CONTRACT = "Contract"
    REMOTE = "Remote"

class Job(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    company: str
    location: str
    salary: Optional[str] = None
    matchScore: int
    description: str
    requirements: List[str]
    postedAt: str
    type: JobType

class JobApplicationResponse(BaseModel):
    success: bool
    message: str
