# Environment Configuration Guide

## Overview
The frontend now uses environment variables to configure the backend API URL. This allows the app to work in both local development and production (Vercel) environments.

## How It Works

The `frontend/src/config.ts` file exports the API URL:
```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'
```

All API calls now use this `API_URL` instead of hardcoded URLs.

## Setup Instructions

### Local Development

1. Create a `.env` file in the `frontend/` directory:
   ```bash
   cd frontend
   echo "VITE_API_URL=http://localhost:8001" > .env
   ```

2. Start your backend server on port 8001

3. Start the frontend:
   ```bash
   npm run dev
   ```

### Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your deployed backend URL (e.g., `https://your-backend.onrender.com`)
   - **Environment**: Production (and Preview if needed)

4. Redeploy your frontend for changes to take effect

## What Was Fixed

✅ Replaced 30+ hardcoded `http://localhost:8001` URLs across 10 files:
- `Auth.tsx` - Authentication endpoints
- `UserContext.tsx` - User management
- `VoiceStressAnalysis.tsx` - Voice analysis
- `SupportBot.tsx` - Chat functionality
- `MentalHealthAssessment.tsx` - Assessment saving
- `Insights.tsx` - Insights and analytics
- `ConversationHistory.tsx` - Conversation management
- `CheckInText.tsx` - Text check-in
- `CheckInChat.tsx` - Chat check-in
- `Activities.tsx` - Gratitude journal

## Troubleshooting

**"Failed to fetch" error during signup:**
- Check that `VITE_API_URL` is set correctly in Vercel
- Verify your backend is deployed and accessible
- Check browser console for the actual URL being called
- Ensure CORS is configured on your backend to allow requests from your Vercel domain

**Local development not working:**
- Make sure `.env` file exists in `frontend/` directory
- Restart the dev server after creating/modifying `.env`
- Check that backend is running on port 8001
