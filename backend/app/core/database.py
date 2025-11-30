"""
MongoDB database connection and configuration.
Uses MongoDB Atlas free tier (M0 cluster - 512MB storage).
"""

import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

# Global MongoDB client
_client = None
_db = None

def get_database():
    """Get MongoDB database connection."""
    global _client, _db
    
    if _db is not None:
        return _db
    
    if not MONGODB_URL or MONGODB_URL == "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority":
        print("⚠️ MongoDB URL not configured. Using fallback file storage.")
        return None
    
    try:
        _client = MongoClient(
            MONGODB_URL,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            maxPoolSize=10  # Limit connections for free tier
        )
        
        # Test connection
        _client.admin.command('ping')
        
        _db = _client['serenova']
        print("✅ Connected to MongoDB Atlas")
        
        # Create indexes for performance (stays within free tier)
        create_indexes()
        
        return _db
        
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("⚠️ Falling back to file storage")
        return None
    except Exception as e:
        print(f"❌ MongoDB error: {e}")
        return None

def get_collection(name: str):
    """Get a MongoDB collection by name."""
    db = get_database()
    if db is None:
        return None
    return db[name]

def create_indexes():
    """Create indexes for better query performance (free tier optimized)."""
    try:
        db = get_database()
        if db is None:
            return
        
        # Users collection indexes
        db.users.create_index("userId", unique=True)
        db.users.create_index("email")
        
        # Conversations collection indexes
        db.conversations.create_index("sessionId", unique=True)
        db.conversations.create_index("userId")
        db.conversations.create_index("savedAt")
        
        # Assessments collection indexes
        db.assessments.create_index("userId")
        db.assessments.create_index("date")
        
        print("✅ MongoDB indexes created")
    except Exception as e:
        print(f"⚠️ Index creation skipped: {e}")

def clean_for_storage(data: dict) -> dict:
    """
    Remove unnecessary fields to minimize storage.
    Keep only essential data for M0 512MB limit.
    """
    # Remove null/None values
    cleaned = {k: v for k, v in data.items() if v is not None}
    
    # Limit message history to last 100 messages per conversation
    if 'messages' in cleaned and isinstance(cleaned['messages'], list):
        cleaned['messages'] = cleaned['messages'][-100:]
    
    return cleaned

def cleanup_old_data(days_old: int = 90):
    """
    Clean up old data to stay within free tier limits.
    Call this periodically to remove data older than X days.
    """
    try:
        db = get_database()
        if db is None:
            return False
        
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        
        # Clean old conversations
        result = db.conversations.delete_many({
            "savedAt": {"$lt": cutoff_date.isoformat()}
        })
        
        print(f"🧹 Cleaned {result.deleted_count} old conversations")
        return True
    except Exception as e:
        print(f"⚠️ Cleanup failed: {e}")
        return False

def close_connection():
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
        print("MongoDB connection closed")
