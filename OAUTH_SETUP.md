# OAuth Setup Instructions

## Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. **Create OAuth credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000`
5. **Copy Client ID**:
   - Copy the Client ID
   - Paste in `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`

## Facebook OAuth Setup

1. **Go to Facebook Developers**: https://developers.facebook.com/
2. **Create a new app**:
   - Click "My Apps" → "Create App"
   - Use case: "Authenticate and request data from users with Facebook Login"
   - App type: "Consumer"
3. **Add Facebook Login**:
   - Dashboard → Add Product → Facebook Login → Set Up
4. **Configure OAuth Redirect URIs**:
   - Settings → Basic
   - Add `http://localhost:3000/` to "App Domains"
   - Save changes
5. **Get App ID**:
   - Dashboard → Settings → Basic
   - Copy "App ID"
   - Paste in `frontend/index.html` replace `YOUR_FACEBOOK_APP_ID`

## Testing

1. Start backend: `cd backend && .venv\Scripts\python.exe run_backend.py`
2. Start frontend: `cd frontend && npm run dev`
3. Visit: http://localhost:3000/auth
4. Test Google/Facebook login buttons

## Production Setup

- Update redirect URIs to your production domain
- Enable proper HTTPS
- Add proper error handling
- Implement JWT token verification on backend
- Store tokens securely (httpOnly cookies)
