# MongoDB Atlas Setup Guide for Serenova

## 🎯 Quick Setup (5 minutes)

### Step 1: Create Free MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub or email
3. Choose **FREE M0 Cluster** (512MB storage, no credit card needed)

### Step 2: Create Your Cluster
1. Click "Build a Database"
2. Choose **M0 FREE** tier
3. Cloud Provider: **AWS** (recommended)
4. Region: Choose closest to you (e.g., US East)
5. Cluster name: `serenova` (or keep default `Cluster0`)
6. Click **Create**

⏱️ Wait 1-3 minutes for cluster deployment...

### Step 3: Set Up Database Access
1. Click **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Authentication: **Password**
4. Username: `serenova_user`
5. Password: Click **Autogenerate Secure Password** ⚠️ **SAVE THIS PASSWORD!**
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### Step 4: Set Up Network Access
1. Click **Network Access** (left sidebar)
2. Click **Add IP Address**
3. For development: Click **Allow Access from Anywhere** (0.0.0.0/0)
   - ⚠️ For production: Add only your server IP
4. Click **Confirm**

### Step 5: Get Connection String
1. Click **Database** (left sidebar)
2. Click **Connect** button on your cluster
3. Choose **Drivers**
4. Driver: **Python**, Version: **3.12 or later**
5. Copy connection string (looks like):
   ```
   mongodb+srv://serenova_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace** `<password>` with your actual password from Step 3

### Step 6: Update Backend .env File

```powershell
cd backend
.venv\Scripts\activate
pip install pymongo==4.10.1
```

## Step 7: Restart Backend

```powershell
uvicorn app.main:app --reload
```

You should see: "✅ Connected to MongoDB Atlas"

## MongoDB Atlas Free Tier (M0) Limits

✅ **Included:**
- 512 MB storage (enough for ~10,000+ user profiles)
- Shared RAM and CPU
- TLS/SSL encryption
- Basic monitoring
- 3-node replica set
- Daily backups

⚠️ **Limits:**
- Max 100 database connections
- Limited throughput
- No advanced features (analytics, full-text search)

## Database Schema

**Collections:**

1. `users` - User profiles
   ```json
   {
     "_id": "user_abc123",
     "email": "user@example.com",
     "firstName": "John",
     "age": 25,
     "createdAt": "2025-11-28T10:00:00Z",
     "assessmentHistory": [...],
     "conversationIds": [...]
   }
   ```

2. `conversations` - Chat conversations
   ```json
   {
     "_id": "session_xyz789",
     "userId": "user_abc123",
     "messages": [
       {"role": "user", "content": "...", "timestamp": "..."}
     ],
     "mainEmotion": "anxious",
     "riskLevel": "medium",
     "savedAt": "2025-11-28T11:00:00Z"
   }
   ```

3. `assessments` - Optional separate collection for assessments
   ```json
   {
     "_id": "assessment_def456",
     "userId": "user_abc123",
     "depressionScore": 8,
     "anxietyScore": 12,
     "stressScore": 10,
     "date": "2025-11-28T09:00:00Z"
   }
   ```

## Best Practices for Free Tier

1. **Efficient Queries**: Use indexes on userId, createdAt
2. **Clean Old Data**: Delete test data regularly
3. **Limit Message Size**: Store only essential text, no raw audio
4. **Connection Pooling**: Reuse connections (maxPoolSize=10)
5. **Monitor Usage**: Check Atlas dashboard weekly

## Troubleshooting

**Connection timeout:**
- Check network access whitelist
- Verify password has no special characters that need URL encoding

**Authentication failed:**
- Double-check username and password
- Ensure user has "Read and write" privileges

**Database not found:**
- MongoDB creates databases automatically on first insert
- No need to manually create "serenova" database

## Migration from File Storage

The app will automatically:
1. Try MongoDB first
2. Fall back to file storage if MongoDB unavailable
3. You can migrate data later using a Python script

## Security Notes

🔒 **For Production:**
- Use environment variables for connection string
- Whitelist only your server IP
- Enable MongoDB Atlas alerts
- Rotate database passwords regularly
- Use TLS 1.2+ (enabled by default)
