# Vercel Deployment Guide - Step by Step

## Prerequisites
- Frontend code (React + Vite) in a GitHub repository
- Backend API deployed on Render
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
2. Search for your repo: `LoginApp`
3. Click **"Import"**

### 2.2 Configure Project
1. **Project Name:** `employee-management-system`
2. **Framework Preset:** Select **"Vite"**
3. **Root Directory:** Select `/frontend` (important!)
4. **Build Command:** `npm run build` (should auto-detect)
5. **Output Directory:** `dist` (should auto-detect)

### 2.3 Add Environment Variables
Scroll down to **"Environment Variables"** and add:

```
VITE_API_URL=https://employee-management-system-api.onrender.com/api/v1
```

**IMPORTANT:** Vite uses `VITE_` prefix for public environment variables, not `REACT_APP_`

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait for deployment (3-5 minutes)
3. Once complete, you'll see a green "Ready" status
4. Copy your frontend URL: `https://employee-management-system.vercel.app`

---

## Step 3: Update Frontend to Use Backend URL

In your frontend code, make sure API calls use the environment variable:

### For Vite React (Your App):

**File: `src/api.js` or `src/services/api.js`**
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if logged in
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

**File: `src/components/Login.jsx` (or similar)**
```javascript
import apiClient from '../api';

const handleLogin = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    localStorage.setItem('token', response.data.token);
    // Redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

---

## Step 4: Test Frontend Deployment

### 4.1 Access Your Frontend
Navigate to:
```
https://employee-management-system.vercel.app
```

### 4.2 Check Deployment Logs
1. Go to Vercel dashboard → Your Project → **Deployments**
2. Click on latest deployment
3. Check **"Build Logs"** and **"Runtime Logs"** for errors
4. Look for build errors or environment variable issues

### 4.3 Test Login Flow
1. Go to login page
2. Try logging in with test credentials (e.g., username: `admin`, password: `admin123`)
3. Check if the request hits your backend API

### 4.4 Check Network Tab (Browser DevTools)
1. Open your frontend URL: `https://employee-management-system.vercel.app`
2. Press `F12` → **Network** tab
3. Try login
4. Look for requests to your Render backend URL
5. Verify they return 200 status
6. Check **Console** tab for any JavaScript errors

---

## Step 5: Troubleshoot Common Vercel Issues

### Issue: "Build failed"
**Solution:**
1. Check **Build Logs** in Vercel dashboard
2. Ensure Root Directory is set to `/frontend`
3. Verify all dependencies are in `package.json`
4. Run locally: `npm install && npm run build`

### Issue: "Blank white page or 404"
**Solution:**
1. Check if environment variable `VITE_API_URL` is set correctly
2. Check browser Console tab for errors
3. Verify the build output exists
4. Try redeploy: click **Redeploy** in Vercel dashboard

### Issue: "API calls failing / CORS errors"
**Solution:**
1. Verify `VITE_API_URL` matches your backend URL exactly
2. Check backend CORS is enabled: `app.use(cors());` in `server.js`
3. Check Network tab to see actual request URL
4. If URL is localhost, env var didn't load - redeploy

### Issue: "Environment variables not working"
**Solution:**
1. Go to Vercel → Project Settings → **Environment Variables**
2. Delete and re-add `VITE_API_URL`
3. Click **Redeploy** to trigger rebuild
4. Wait 5 minutes for new deployment

---

## Step 6: Record Your URLs

Save these for submission:

| Item | Your URL |
|------|----------|
| **Frontend Live** | `https://employee-management-system.vercel.app` |
| **Backend Live** | `https://employee-management-system-api.onrender.com/api/v1` |
| **Swagger Docs** | `https://employee-management-system-api.onrender.com/api/docs` |

---



---

## Redeployment After Backend Changes

If you update your backend, redeploy frontend:
1. Go to Vercel dashboard → Your Project
2. Click **"Deployments"**
3. Click on the latest deployment
4. Click **"Redeploy"**

Or simply push to GitHub and Vercel will auto-redeploy.

---

## Redeployment Steps (If You Update Frontend)

1. Push changes to GitHub: `git push origin main`
2. Vercel auto-deploys on GitHub push
3. OR manually redeploy in Vercel dashboard:
   - Click **Deployments** → Latest deployment → **Redeploy**
4. Wait 3-5 minutes for new deployment
5. Clear browser cache: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
6. Test the app

---

## Done! 🎉

Your full-stack Employee Management System is now live:
- **Frontend:** https://employee-management-system.vercel.app
- **Backend:** https://employee-management-system-api.onrender.com/api/v1
- **Database:** Render PostgreSQL
- **API Docs:** https://employee-management-system-api.onrender.com/api/docs
