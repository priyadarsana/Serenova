"""
Mental Health Assessment endpoints.
Stores comprehensive user assessment data for personalized support.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.core.database import get_collection, clean_for_storage
from app.core.auth import get_current_user

router = APIRouter()

class AssessmentData(BaseModel):
    needImprovement: str
    testFor: str
    ageRange: str
    gender: str
    transgender: bool
    householdIncome: str
    populations: List[str]
    previousTreatment: str
    mainFactors: List[str]
    hasInsurance: str
    physicalConditions: List[str]
    hasPet: str

class AssessmentSaveRequest(BaseModel):
    userId: str
    assessmentData: AssessmentData
    completedAt: str

@router.post("/save")
async def save_assessment(request: AssessmentSaveRequest, user_id: str = Depends(get_current_user)):
    """Save user's mental health assessment."""
    try:
        # Verify the user is saving their own assessment
        if request.userId != user_id:
            raise HTTPException(status_code=403, detail="Cannot save assessment for another user")
        
        assessment_col = get_collection('assessments')
        
        if assessment_col is not None:
            # MongoDB storage
            assessment_doc = {
                '_id': user_id,  # One assessment per user
                'userId': user_id,
                'assessmentData': request.assessmentData.dict(),
                'completedAt': request.completedAt,
                'updatedAt': datetime.now().isoformat()
            }
            
            cleaned_data = clean_for_storage(assessment_doc)
            
            # Upsert - update if exists, insert if not
            assessment_col.update_one(
                {'_id': user_id},
                {'$set': cleaned_data},
                upsert=True
            )
            
            return {
                "success": True,
                "message": "Assessment saved successfully",
                "userId": user_id
            }
        else:
            raise HTTPException(status_code=500, detail="Database not available")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save assessment: {str(e)}")

@router.get("/get")
async def get_assessment(user_id: str = Depends(get_current_user)):
    """Get user's mental health assessment."""
    try:
        assessment_col = get_collection('assessments')
        
        if assessment_col is not None:
            # MongoDB storage
            assessment = assessment_col.find_one({'_id': user_id})
            
            if assessment:
                return {
                    "success": True,
                    "assessmentData": assessment.get('assessmentData'),
                    "completedAt": assessment.get('completedAt')
                }
            else:
                return {
                    "success": False,
                    "message": "No assessment found"
                }
        else:
            raise HTTPException(status_code=500, detail="Database not available")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get assessment: {str(e)}")
