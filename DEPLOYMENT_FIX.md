# Deployment Fix: "Failed to Fetch" Error

## Problem
After deploying to Vercel, signup was showing "failed to fetch" because the frontend was still trying to connect to `localhost:8001` instead of your deployed backend on Render.

## Solution Implemented

### ✅ What Was Fixed

1. **Created centralized API configuration** (`frontend/src/config.ts`):
   ```typescript
   export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'
   ```

2. **Updated 30+ hardcoded URLs** across 10 files to use `API_URL`:
   - Auth.tsx (4 URLs)
   - UserContext.tsx (7 URLs)
   - VoiceStressAnalysis.tsx (2 URLs)
   - SupportBot.tsx (3 URLs)
   - MentalHealthAssessment.tsx (1 URL)
   - Insights.tsx (5 URLs)
   - ConversationHistory.tsx (4 URLs)
   - CheckInText.tsx (1 URL)
   - CheckInChat.tsx (1 URL)
   - Activities.tsx (1 URL)

3. **Created local development environment file** (`.env`)

## Next Steps - CRITICAL!

### 🚨 Configure Vercel Environment Variable

**You MUST do this for your deployed app to work:**

1. Go to https://vercel.com/dashboard
2. Select your Serenova project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (replace with your actual Render backend URL)
   - **Environments**: Check "Production" (and "Preview" if you want)
6. Click **Save**
7. **Redeploy** your frontend:
   - Go to **Deployments** tab
   - Click the ⋯ menu on the latest deployment
   - Select **Redeploy**

### 📝 Find Your Backend URL

Your backend URL should be from Render. It looks like:
- `https://serenova-backend-xxxx.onrender.com`
- Or whatever custom domain you set up

You can find it in your Render dashboard for the backend service.

### ✅ Verify It Works

After redeploying:
1. Open your Vercel app
2. Try to sign up with a new account
3. Check the browser console (F12) - you should see API calls going to your Render URL, not localhost
4. Signup should now work!

## Local Development

For local development, the `.env` file has been created with:
```
VITE_API_URL=http://localhost:8001
```

Just make sure your backend is running on port 8001 locally.

## Troubleshooting

**Still getting "failed to fetch"?**
- Double-check the `VITE_API_URL` in Vercel settings
- Make sure you redeployed after adding the environment variable
- Verify your backend is actually running on Render
- Check CORS settings on your backend - it should allow requests from your Vercel domain

**Backend URL not working?**
- Test it directly in your browser: `https://your-backend.onrender.com/docs`
- If it doesn't load, your backend might not be deployed correctly
