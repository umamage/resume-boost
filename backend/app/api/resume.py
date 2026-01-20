from fastapi import APIRouter, UploadFile, File
from ..models import ResumeScore, ResumeCategories
import random

router = APIRouter(prefix="/api/resume", tags=["resume"])

@router.post("/analyze", response_model=ResumeScore)
async def analyze_resume(file: UploadFile = File(...)):
    # Mock processing
    base_score = 65 + random.random() * 25
    
    return ResumeScore(
        overall=int(base_score),
        categories=ResumeCategories(
            formatting=int(60 + random.random() * 35),
            keywords=int(55 + random.random() * 40),
            experience=int(50 + random.random() * 45),
            education=int(70 + random.random() * 25),
            skills=int(60 + random.random() * 35)
        ),
        suggestions=[
            'Add more industry-specific keywords to improve ATS compatibility',
            'Consider adding quantifiable achievements (e.g., "Increased sales by 25%")',
            'Include a professional summary at the top of your resume',
            'Add more technical skills relevant to your target positions',
            'Consider reformatting to use bullet points for better readability',
        ]
    )
