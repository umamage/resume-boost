from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, resume, jobs
from .database import engine, Base
from . import sql_models

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Resume Boost API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(jobs.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Resume Boost API"}
