# Vercel Deployment Guide - Step by Step

## Prerequisites
- Your frontend code (React, Next.js, or similar) in a GitHub repository
- Environment variable for backend API URL

---

## Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub
4. Verify your email

---

## Step 2: Deploy Frontend

### 2.1 Import GitHub Repository
1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Search for your frontend repo
3. Click **"Import"**

### 2.2 Configure Project
1. **Project Name:** (auto-filled from repo)
2. **Framework Preset:** Auto-detected (React, Next.js, etc.)
3. **Root Directory:** Leave as `.` (or `/frontend` if frontend is in subfolder)

### 2.3 Add Environment Variables
Scroll down to **"Environment Variables"**:

```
REACT_APP_API_URL=https://employee-management-system-api.onrender.com/api/v1
```

Or if using Next.js:
```
NEXT_PUBLIC_API_URL=https://employee-management-system-api.onrender.com/api/v1
```

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait for deployment (2-5 minutes)
3. Once complete, you'll see a green deployment status
4. Copy your frontend URL (looks like: `https://employee-management-system.vercel.app`)

---

## Step 3: Update Frontend to Use Backend URL

In your frontend code, make sure API calls use the environment variable:

### Example (React with fetch):
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Make API call
fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
})
```

### Example (Next.js):
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
```

### Example (Axios):
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'
});

export default apiClient;
```

---

## Step 4: Test Frontend Deployment

### 4.1 Access Your Frontend
Navigate to:
```
https://employee-management-system.vercel.app
```

### 4.2 Test Login Flow
1. Go to login page
2. Try logging in with test credentials
3. Check if the request hits your backend API

### 4.3 Check Network Tab (Browser DevTools)
1. Open your frontend URL
2. Press `F12` → **Network** tab
3. Try login
4. Look for requests to your Render backend URL
5. Verify they return 200 status

---

## Step 5: Record Your URLs

Save these for submission:

| Item | Your URL |
|------|----------|
| **Frontend Live** | `https://employee-management-system.vercel.app` |
| **Backend Live** | `https://employee-management-system-api.onrender.com/api/v1` |
| **Swagger Docs** | `https://employee-management-system-api.onrender.com/api/docs` |

---

## Common Issues & Fixes

### Issue: "Build Failed"
- **Cause:** Missing dependencies or build script error
- **Fix:** Check `package.json` has all dependencies, run `npm install` locally first

### Issue: "API calls returning 404 or CORS errors"
- **Cause:** Backend API URL is wrong or CORS not enabled
- **Fix:** Check `REACT_APP_API_URL` env var matches your Render URL exactly

### Issue: "Environment variables not loading"
- **Cause:** Redeployment needed after adding env vars
- **Fix:** Go to **Deployments** → click on latest → **Redeploy**

---

## Redeployment After Backend Changes

If you update your backend, redeploy frontend:
1. Go to Vercel dashboard → Your Project
2. Click **"Deployments"**
3. Click on the latest deployment
4. Click **"Redeploy"**

Or simply push to GitHub and Vercel will auto-redeploy.

---

## Done! 🎉

Your full-stack application is now live:
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Render PostgreSQL
