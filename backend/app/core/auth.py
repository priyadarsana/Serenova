"""
Authentication utilities for JWT validation and user extraction.
"""
from fastapi import Header, HTTPException, Depends
from typing import Optional

# For now, mock JWT validation since we're using simple tokens
# In production, install PyJWT: pip install PyJWT
# Then uncomment: import jwt

def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract userId from Authorization header.
    
    For now, we're using the format: Bearer <userId>
    In production, decode a real JWT token.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # Remove "Bearer " prefix if present
        token = authorization.replace("Bearer ", "")
        
        # For now, the token IS the userId (mock implementation)
        # In production, decode JWT: jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if not token or token == "null" or token == "undefined":
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication: {str(e)}")

def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Extract userId from Authorization header, but don't require it.
    Returns None if not authenticated.
    """
    if not authorization:
        return None
    
    try:
        token = authorization.replace("Bearer ", "")
        if not token or token == "null" or token == "undefined":
            return None
        return token
    except:
        return None
