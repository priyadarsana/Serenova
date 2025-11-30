"""
OAuth authentication endpoints for Google and Facebook login
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import uuid
import base64
import json
from app.core.database import get_database
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

router = APIRouter()

# Store verification codes temporarily (in production, use Redis or database)
verification_codes = {}

class GoogleAuthRequest(BaseModel):
    credential: str  # JWT token from Google
    
class FacebookAuthRequest(BaseModel):
    accessToken: str
    userId: str

class EmailSignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class EmailVerificationRequest(BaseModel):
    email: EmailStr
    code: str

class EmailLoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupResponse(BaseModel):
    message: str
    email: str

class AuthResponse(BaseModel):
    userId: str
    email: str
    name: str
    provider: str
    token: str

@router.post("/google", response_model=AuthResponse)
async def google_login(auth: GoogleAuthRequest):
    """
    Authenticate user with Google OAuth token.
    Decodes the JWT credential to extract user information.
    """
    try:
        # Split the JWT token
        parts = auth.credential.split('.')
        if len(parts) != 3:
            raise HTTPException(status_code=400, detail="Invalid credential format")
        
        # Decode the payload (middle part)
        payload = parts[1]
        # Add padding if needed
        padding = 4 - len(payload) % 4
        if padding != 4:
            payload += '=' * padding
        
        # Decode base64
        decoded_bytes = base64.urlsafe_b64decode(payload)
        user_info = json.loads(decoded_bytes)
        
        # Extract user information
        email = user_info.get('email', 'user@gmail.com')
        name = user_info.get('name', user_info.get('given_name', 'Google User'))
        google_user_id = user_info.get('sub', str(uuid.uuid4()))
        
        print(f"Google login successful: {name} ({email})")
        
        # Generate unique user ID
        user_id = f"google_{google_user_id}"
        
        # Create or update user profile in database
        try:
            db = get_database()
            if db is not None:
                # Check if user already exists
                existing_user = db.users.find_one({"userId": user_id})
                
                if not existing_user:
                    # Create new user profile
                    user_profile = {
                        "userId": user_id,
                        "email": email,
                        "name": name,
                        "provider": "google",
                        "createdAt": datetime.now(),
                        "preferences": {
                            "theme": "light",
                            "notifications": True
                        }
                    }
                    db.users.insert_one(user_profile)
                    print(f"✅ Created user profile for {email}")
                else:
                    print(f"✅ User profile already exists for {email}")
        except Exception as e:
            print(f"⚠️ Failed to create user profile: {str(e)}")
            # Don't fail the login if database save fails
        
        return AuthResponse(
            userId=user_id,
            email=email,
            name=name,
            provider="google",
            token=user_id  # Token IS the userId for now (mock auth)
        )
    except Exception as e:
        print(f"Google login error: {str(e)}")
        # Fallback to mock response if decoding fails
        fallback_id = "google_user_" + str(uuid.uuid4())
        return AuthResponse(
            userId=fallback_id,
            email="user@gmail.com",
            name="Google User",
            provider="google",
            token=fallback_id
        )

@router.post("/facebook", response_model=AuthResponse)
async def facebook_login(auth: FacebookAuthRequest):
    """
    Authenticate user with Facebook access token.
    In production, verify the access token with Facebook Graph API.
    """
    # TODO: Verify Facebook access token
    # For now, return mock response
    return AuthResponse(
        userId="fb_user_456",
        email="user@facebook.com",
        name="Facebook User",
        provider="facebook",
        token="mock_jwt_token_here"
    )

@router.post("/email-signup", response_model=AuthResponse)
async def email_signup(request: EmailSignupRequest):
    """Register new user with email/password - direct signup"""
    try:
        # Generate user ID
        user_id = f"email_{uuid.uuid4()}"
        
        # Create user profile in database
        try:
            db = get_database()
            if db is not None:
                # Check if user already exists
                existing_user = db.users.find_one({"email": request.email})
                
                if existing_user:
                    raise HTTPException(status_code=400, detail="Email already registered")
                
                # Hash password (in production, use bcrypt)
                # For now, just store it (NOT SECURE - TODO: add bcrypt)
                user_profile = {
                    "userId": user_id,
                    "email": request.email,
                    "name": request.name,
                    "password": request.password,  # TODO: Hash this!
                    "provider": "email",
                    "createdAt": datetime.now(),
                    "preferences": {
                        "theme": "light",
                        "notifications": True
                    }
                }
                db.users.insert_one(user_profile)
                print(f"✅ Created user profile for {request.email}")
        except HTTPException:
            raise
        except Exception as e:
            print(f"⚠️ Failed to create user profile: {str(e)}")
            # Don't fail the signup if database save fails
        
        print(f"User created: {request.name} ({request.email})")
        
        return AuthResponse(
            userId=user_id,
            email=request.email,
            name=request.name,
            provider="email",
            token=user_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")

@router.post("/verify-email", response_model=AuthResponse)
async def verify_email(request: EmailVerificationRequest):
    """Verify email with code and complete signup"""
    try:
        # Check if verification code exists
        if request.email not in verification_codes:
            raise HTTPException(status_code=400, detail="No verification code found. Please sign up again.")
        
        stored_data = verification_codes[request.email]
        
        # Check if code expired
        if datetime.now() > stored_data['expiry']:
            del verification_codes[request.email]
            raise HTTPException(status_code=400, detail="Verification code expired. Please sign up again.")
        
        # Verify code
        if stored_data['code'] != request.code:
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        # Generate user ID and create account
        user_id = str(uuid.uuid4())
        
        # TODO: Hash password and save to MongoDB
        print(f"User verified and created: {stored_data['name']} ({request.email})")
        
        # Clean up verification code
        del verification_codes[request.email]
        
        return AuthResponse(
            userId=user_id,
            email=request.email,
            name=stored_data['name'],
            provider="email",
            token=f"jwt_token_{user_id}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Verification failed: {str(e)}")

def send_verification_email(email: str, code: str, name: str):
    """Send verification email using SMTP"""
    # Email configuration (you'll need to set these environment variables)
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER', '')
    smtp_password = os.getenv('SMTP_PASSWORD', '')
    
    if not smtp_user or not smtp_password:
        print("SMTP credentials not configured. Skipping email send.")
        return
    
    # Create message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Aurora Mind - Verify Your Email'
    msg['From'] = f"Aurora Mind <{smtp_user}>"
    msg['To'] = email
    
    # HTML email body
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <h1 style="color: #667eea; text-align: center; margin-bottom: 10px;">Aurora Mind</h1>
                <p style="color: #64748b; text-align: center; margin-bottom: 30px;">Safe emotional check-ins</p>
                
                <h2 style="color: #1e293b; margin-bottom: 20px;">Welcome, {name}!</h2>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Thank you for signing up for Aurora Mind. To complete your registration, please use the verification code below:
                </p>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; padding: 30px; text-align: center; margin-bottom: 30px;">
                    <p style="color: white; font-size: 14px; margin-bottom: 10px;">Your Verification Code</p>
                    <p style="color: white; font-size: 48px; font-weight: bold; letter-spacing: 8px; margin: 0;">{code}</p>
                </div>
                
                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                    This code will expire in <strong>10 minutes</strong>.
                </p>
                
                <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    If you didn't request this verification code, please ignore this email.
                </p>
            </div>
        </body>
    </html>
    """
    
    msg.attach(MIMEText(html, 'html'))
    
    # Send email
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)

@router.post("/email-login", response_model=AuthResponse)
async def email_login(request: EmailLoginRequest):
    """Login existing user with email/password"""
    try:
        db = get_database()
        
        if db is not None:
            # Find user in database
            user = db.users.find_one({"email": request.email})
            
            if not user:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            # Verify password (TODO: use bcrypt.checkpw for hashed passwords)
            if user.get('password') != request.password:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            print(f"✅ User logged in: {user['name']} ({request.email})")
            
            return AuthResponse(
                userId=user['userId'],
                email=user['email'],
                name=user['name'],
                provider=user.get('provider', 'email'),
                token=user['userId']
            )
        else:
            # Fallback if database not available
            print(f"⚠️ Database not available, using mock login")
            user_id = f"email_{uuid.uuid4()}"
            
            return AuthResponse(
                userId=user_id,
                email=request.email,
                name=request.email.split('@')[0].title(),
                provider="email",
                token=user_id
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Login failed: {str(e)}")

