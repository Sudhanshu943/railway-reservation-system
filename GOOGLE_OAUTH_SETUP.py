"""
GOOGLE OAUTH SETUP INSTRUCTIONS
================================

STEP 1: Get Google OAuth Credentials
------------------------------------
1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing one)
3. Enable Google+ API:
   - Go to APIs & Services > Library
   - Search for "Google+ API"
   - Click Enable
4. Create OAuth Credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     * http://localhost:3000 (for development)
     * https://yourdomain.com (for production)
   - Add authorized redirect URIs:
     * http://localhost:3000/login
     * http://localhost:3000/signup
     * https://yourdomain.com/login (production)
     * https://yourdomain.com/signup (production)
   - Copy your Client ID


STEP 2: Configure Backend (.env file)
-------------------------------------
1. Copy backend/.env.example to backend/.env
2. Set GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
3. Update other settings as needed (SECRET_KEY, DATABASE_URL, etc.)

Example backend/.env:
```
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./railway.db
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```


STEP 3: Configure Frontend (.env.local file)
--------------------------------------------
1. Create frontend/.env.local (NOT .env - Next.js uses .env.local for development)
2. Or copy frontend/.env.example to frontend/.env.local
3. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID=same-google-client-id-as-backend

Example frontend/.env.local:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```


STEP 4: Install Dependencies
----------------------------
Backend:
  cd backend
  pip install -r requirements.txt

Frontend:
  cd frontend
  npm install


STEP 5: Database Migration (if using new database)
-------------------------------------------------
Backend:
  python -c "from database import create_tables; create_tables()"
  # OR the database tables will be created automatically on first startup


STEP 6: Start the Application
----------------------------
Backend (Terminal 1):
  cd backend
  python -m uvicorn main:app --reload --port 8000

Frontend (Terminal 2):
  cd frontend
  npm run dev
  # Opens at http://localhost:3000


AUTHENTICATION FLOW
===================

1. USER CLICKS "SIGN IN WITH GOOGLE"
   - Google OAuth button (GoogleLogin component) opens Google sign-in popup

2. GOOGLE AUTHENTICATION
   - User authenticates with Google
   - Google returns an ID token

3. SEND TO BACKEND
   - Frontend sends ID token to: POST /api/auth/google-login
   - Request body: { "token": "google-id-token" }

4. BACKEND VERIFICATION
   - Backend verifies the ID token using Google's public key
   - Extracts email, name, and Google ID from token

5. DATABASE OPERATIONS
   - Check if user exists by email
   - If new user: Create user with google_id (no password needed)
   - If existing user: Update google_id if missing

6. JWT TOKEN CREATION
   - Backend creates JWT token with user email as subject
   - Sets HTTP-only secure cookie with the JWT token
   - Returns JWT token and user data to frontend

7. FRONTEND STORAGE
   - Frontend stores JWT token in localStorage
   - Frontend stores user data in localStorage
   - User is now authenticated


SESSION & COOKIE MANAGEMENT
===========================

HTTP-Only Cookies:
  - Backend sets "access_token" as HTTP-only, secure, same-site cookie
  - Prevents JavaScript from accessing the token (XSS protection)
  - Automatically sent by browser with each request

LocalStorage (Secondary):
  - Frontend stores JWT token for programmatic access
  - Used with Authorization: Bearer header
  - More vulnerable to XSS but allows JavaScript requests

Token Expiration:
  - Default: 30 minutes (configurable via ACCESS_TOKEN_EXPIRE_MINUTES)
  - After expiration, user must log in again

Logout:
  - DELETE /api/auth/logout clears the HTTP-only cookie
  - Frontend removes localStorage token and user data
  - User session is terminated


SECURITY NOTES
==============

1. GOOGLE_CLIENT_ID must be kept on backend AND frontend
   - Backend uses it to verify tokens
   - Frontend needs it for GoogleLogin component

2. HTTPS in Production
   - Set secure=True in cookie settings (already done)
   - Ensures cookies only sent over HTTPS

3. CORS Settings
   - Update ALLOWED_ORIGINS in production
   - Currently allows all origins (not recommended for production)

4. Environment Variables
   - Never commit .env files to git
   - Use .env.example as template
   - Add .env and .env.local to .gitignore

5. Token Security
   - JWT tokens contain user email claim (sub)
   - Server verifies token signature before trusting claims
   - Tokens are cryptographically signed with SECRET_KEY


TROUBLESHOOTING
===============

Issue: "Invalid Google token" error
Solution: 
  - Verify GOOGLE_CLIENT_ID is correct on both backend and frontend
  - Check token hasn't expired
  - Ensure request is coming from authorized domain

Issue: "Email not found in Google token"
Solution:
  - User's Google account doesn't have email shared
  - Try logging in with different Google account

Issue: CORS errors
Solution:
  - Add frontend URL to ALLOWED_ORIGINS in backend .env
  - Verify withCredentials=true in axios client

Issue: Cookies not being set
Solution:
  - Check if using HTTPS (required for secure cookies in production)
  - Verify withCredentials=true in axios client
  - Check SameSite and Secure cookie flags


ENDPOINTS
=========

Authentication:
  POST   /api/auth/register          - Register with email/password
  POST   /api/auth/login             - Login with email/password
  POST   /api/auth/google-login      - Login/signup with Google token
  GET    /api/auth/logout            - Logout (clear cookie)
  GET    /api/auth/me                - Get current user info

Trains:
  GET    /api/trains                 - Get all trains
  GET    /api/trains/search          - Search trains by source/destination

Bookings:
  POST   /api/bookings               - Create booking
  GET    /api/bookings/mine          - Get user's bookings
  GET    /api/bookings/{id}          - Get booking details
  PUT    /api/bookings/{id}/cancel   - Cancel booking
"""
