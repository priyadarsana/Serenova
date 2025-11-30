"""
User profile and data management endpoints.
Stores user information in MongoDB Atlas (with file fallback).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from datetime import datetime
import json
import os
import hashlib
from app.core.database import get_collection, clean_for_storage

router = APIRouter()

# Fallback file-based storage
USERS_DIR = "data/users"
os.makedirs(USERS_DIR, exist_ok=True)

class AssessmentScore(BaseModel):
    date: str
    depressionScore: int
    anxietyScore: int
    stressScore: int
    overallScore: int
    severity: str

class UserProfile(BaseModel):
    userId: str
    email: Optional[EmailStr] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    age: Optional[int] = None
    createdAt: str
    lastActive: str
    consentGiven: bool = False
    
class UserData(BaseModel):
    profile: UserProfile
    assessmentHistory: List[AssessmentScore] = []
    conversationIds: List[str] = []
    preferences: Dict = {}
    emergencyContacts: List[Dict] = []
    therapistInfo: Optional[Dict] = None

class CreateUserRequest(BaseModel):
    email: Optional[EmailStr] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    age: Optional[int] = None
    consentGiven: bool = False

class UpdateProfileRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    age: Optional[int] = None
    email: Optional[EmailStr] = None

class AddAssessmentRequest(BaseModel):
    depressionScore: int
    anxietyScore: int
    stressScore: int
    overallScore: int
    severity: str

class PreferencesRequest(BaseModel):
    theme: Optional[str] = None
    notifications: Optional[bool] = None
    reminderTime: Optional[str] = None
    language: Optional[str] = None

def generate_user_id(email: Optional[str] = None) -> str:
    """Generate a unique user ID."""
    if email:
        return hashlib.sha256(email.encode()).hexdigest()[:16]
    else:
        import uuid
        return str(uuid.uuid4())[:16]

def get_user_file_path(user_id: str) -> str:
    """Get the file path for a user's data."""
    return os.path.join(USERS_DIR, f"{user_id}.json")

def use_mongodb() -> bool:
    """Check if MongoDB is available."""
    return get_collection('users') is not None

async def save_user_to_db(user_data: dict):
    """Save user to MongoDB or file."""
    users_col = get_collection('users')
    
    if users_col is not None:
        # MongoDB storage - clean data to minimize storage
        cleaned_data = clean_for_storage(user_data)
        users_col.update_one(
            {'_id': user_data['profile']['userId']},
            {'$set': cleaned_data},
            upsert=True
        )
    else:
        # File storage fallback
        file_path = get_user_file_path(user_data['profile']['userId'])
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(user_data, f, indent=2)

async def get_user_from_db(user_id: str) -> Optional[dict]:
    """Get user from MongoDB or file."""
    users_col = get_collection('users')
    
    if users_col is not None:
        # MongoDB storage
        user_data = users_col.find_one({'_id': user_id})
        return user_data
    else:
        # File storage fallback
        file_path = get_user_file_path(user_id)
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

async def delete_user_from_db(user_id: str):
    """Delete user from MongoDB or file."""
    users_col = get_collection('users')
    
    if users_col is not None:
        # MongoDB storage
        users_col.delete_one({'_id': user_id})
    else:
        # File storage fallback
        file_path = get_user_file_path(user_id)
        if os.path.exists(file_path):
            os.remove(file_path)

@router.post("/create")
async def create_user(request: CreateUserRequest):
    """Create a new user profile."""
    try:
        user_id = generate_user_id(request.email)
        
        # Check if user already exists
        existing_user = await get_user_from_db(user_id)
        if existing_user:
            return {"userId": user_id, "message": "User already exists", "existing": True}
        
        now = datetime.now().isoformat()
        
        user_data = {
            "profile": {
                "userId": user_id,
                "email": request.email,
                "firstName": request.firstName,
                "lastName": request.lastName,
                "age": request.age,
                "createdAt": now,
                "lastActive": now,
                "consentGiven": request.consentGiven
            },
            "assessmentHistory": [],
            "conversationIds": [],
            "preferences": {
                "theme": "light",
                "notifications": True,
                "language": "en"
            },
            "emergencyContacts": [],
            "therapistInfo": None
        }
        
        await save_user_to_db(user_data)
        
        return {"userId": user_id, "message": "User created successfully", "existing": False}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile and data."""
    try:
        # Handle guest mode
        if user_id == "guest" or user_id == "anonymous":
            return {
                "profile": {
                    "userId": user_id,
                    "firstName": "Guest",
                    "createdAt": datetime.now().isoformat(),
                    "lastActive": datetime.now().isoformat(),
                    "consentGiven": False
                },
                "assessmentHistory": [],
                "conversationIds": [],
                "preferences": {},
                "emergencyContacts": []
            }
        
        user_data = await get_user_from_db(user_id)
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update last active
        user_data["profile"]["lastActive"] = datetime.now().isoformat()
        await save_user_to_db(user_data)
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get user profile: {str(e)}")

@router.put("/profile/{user_id}")
async def update_user_profile(user_id: str, request: UpdateProfileRequest):
    """Update user profile information."""
    try:
        user_data = await get_user_from_db(user_id)
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update fields
        if request.firstName is not None:
            user_data["profile"]["firstName"] = request.firstName
        if request.lastName is not None:
            user_data["profile"]["lastName"] = request.lastName
        if request.age is not None:
            user_data["profile"]["age"] = request.age
        if request.email is not None:
            user_data["profile"]["email"] = request.email
        
        user_data["profile"]["lastActive"] = datetime.now().isoformat()
        
        await save_user_to_db(user_data)
        
        return {"message": "Profile updated successfully", "profile": user_data["profile"]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.post("/assessment/{user_id}")
async def add_assessment_result(user_id: str, request: AddAssessmentRequest):
    """Add an assessment result to user's history."""
    try:
        user_data = await get_user_from_db(user_id)
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Add assessment
        assessment = {
            "date": datetime.now().isoformat(),
            "depressionScore": request.depressionScore,
            "anxietyScore": request.anxietyScore,
            "stressScore": request.stressScore,
            "overallScore": request.overallScore,
            "severity": request.severity
        }
        
        user_data["assessmentHistory"].append(assessment)
        user_data["profile"]["lastActive"] = datetime.now().isoformat()
        
        await save_user_to_db(user_data)
        
        return {"message": "Assessment added successfully", "assessment": assessment}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add assessment: {str(e)}")

@router.get("/assessments/{user_id}")
async def get_assessment_history(user_id: str):
    """Get user's assessment history."""
    try:
        user_data = await get_user_from_db(user_id)
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"assessmentHistory": user_data["assessmentHistory"]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get assessments: {str(e)}")

@router.post("/conversation/{user_id}")
async def link_conversation(user_id: str, session_id: str):
    """Link a conversation to a user's profile."""
    try:
        user_data = await get_user_from_db(user_id)
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Add conversation ID if not already present
        if session_id not in user_data["conversationIds"]:
            user_data["conversationIds"].append(session_id)
        
        user_data["profile"]["lastActive"] = datetime.now().isoformat()
        
        await save_user_to_db(user_data)
        
        return {"message": "Conversation linked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to link conversation: {str(e)}")

@router.put("/preferences/{user_id}")
async def update_preferences(user_id: str, request: PreferencesRequest):
    """Update user preferences."""
    try:
        user_data = await get_user_from_db(user_id)
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update preferences
        if request.theme is not None:
            user_data["preferences"]["theme"] = request.theme
        if request.notifications is not None:
            user_data["preferences"]["notifications"] = request.notifications
        if request.reminderTime is not None:
            user_data["preferences"]["reminderTime"] = request.reminderTime
        if request.language is not None:
            user_data["preferences"]["language"] = request.language
        
        user_data["profile"]["lastActive"] = datetime.now().isoformat()
        
        await save_user_to_db(user_data)
        
        return {"message": "Preferences updated successfully", "preferences": user_data["preferences"]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update preferences: {str(e)}")

@router.delete("/profile/{user_id}")
async def delete_user(user_id: str):
    """Delete a user and all their data."""
    try:
        user_data = await get_user_from_db(user_id)
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        await delete_user_from_db(user_id)
        
        return {"message": "User data deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")
