# Vercel + Vite React Troubleshooting Guide

## 🚨 Common Issues & Quick Fixes

### Problem 1: Blank White Page
**Symptoms:** App loads but shows nothing, no console errors

**Solutions:**
1. Check browser console for JavaScript errors (`F12` → Console)
2. Clear browser cache: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
3. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Check if Vercel build succeeded:
   - Go to Vercel dashboard → Your Project → **Deployments**
   - Click latest deployment → **Build Logs**
   - Look for errors like "build failed" or missing dependencies

---

### Problem 2: "Environment Variables Not Loading"
**Symptoms:** API calls go to `localhost` instead of Render backend

**Root Cause:** `VITE_API_URL` is set in Vercel but not being used

**Quick Fix:**
1. In Vercel dashboard:
   - Project Settings → **Environment Variables**
   - Verify `VITE_API_URL` is set to: `https://employee-management-system-api.onrender.com/api/v1`
2. Click **Redeploy** in Deployments tab
3. Wait 5 minutes
4. In your frontend code, verify you're reading it correctly:

```javascript
// Correct for Vite:
const API_URL = import.meta.env.VITE_API_URL;

// Wrong for Vite (this is React/CRA syntax):
// const API_URL = process.env.REACT_APP_API_URL;
```

---

### Problem 3: "API Calls Failing / 404 Errors"
**Symptoms:** Login button doesn't work, API returns 404 or CORS error

**Check 1: Verify Backend URL**
1. Open your app in browser
2. Press `F12` → **Network** tab
3. Try to login
4. Find the failed request
5. Check the full URL in Network tab
6. Should be: `https://employee-management-system-api.onrender.com/api/v1/auth/login`

**Check 2: Verify Backend is Running**
1. Go directly to: `https://employee-management-system-api.onrender.com/api/v1/health`
2. Should return: `{"status":"ok","database":"connected"}`
3. If you get 502 or 503, backend is down - check Render dashboard

**Check 3: Verify CORS is Enabled**
1. In your backend `server.js`, check for:
```javascript
app.use(cors());
```
2. If missing, add it before routes
3. Restart backend

**Check 4: Check API Response Format**
1. Open Network tab again
2. Click on the failed login request
3. Click **Response** tab
4. Should show actual error message from backend
5. Share the error for debugging

---

### Problem 4: "Module Not Found" or Build Error
**Symptoms:** Vercel build fails, error shows "Cannot find module"

**Solutions:**
1. Install missing dependencies locally:
```bash
cd frontend
npm install
npm run build
```
2. If successful locally but fails on Vercel:
   - Clear Vercel build cache:
     - Vercel dashboard → Project Settings → **Build & Development**
     - Click **Clear Cache**
   - Redeploy
3. Check `vite.config.js` exists and has React plugin

---

### Problem 5: "Root Directory Not Set Correctly"
**Symptoms:** Vercel looking for root package.json instead of frontend package.json

**Solutions:**
1. In Vercel dashboard → Project Settings → **Root Directory**
2. Set to: `/frontend`
3. Save and Redeploy

---

### Problem 6: "Login Works But Dashboard is Blank"
**Symptoms:** Login succeeds but no data shows on dashboard

**Solutions:**
1. Check if token is being stored:
   - `F12` → **Application** → **Local Storage**
   - Look for `token` or `authorization` key
   - Should have JWT value
2. Check if API calls are being made:
   - `F12` → **Network** tab
   - Navigate around dashboard
   - Should see requests to backend
   - If no requests, check frontend code for data fetching

---

## 🔧 Step-by-Step Debugging

### Step 1: Test Backend Directly
Open this in browser (replace with your Render URL):
```
https://employee-management-system-api.onrender.com/api/v1/health
```
**Expected:** `{"status":"ok"...}`

### Step 2: Check Frontend Environment Variable
Add this to your frontend `src/App.jsx` or main component:
```javascript
useEffect(() => {
  console.log('API URL:', import.meta.env.VITE_API_URL);
  console.log('All env vars:', import.meta.env);
}, []);
```
- Open `F12` → **Console**
- Check what `VITE_API_URL` shows
- Should be your Render backend URL, not `undefined`

### Step 3: Test API Call Directly
In browser console, run:
```javascript
fetch('https://employee-management-system-api.onrender.com/api/v1/health')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(e => console.error(e))
```
- Should log the health status
- If error, backend is down

### Step 4: Check Frontend Logs
1. Open Vercel dashboard → Your Project
2. Click **Deployments** → Latest → **Runtime Logs**
3. Look for any errors
4. Check if app is trying to call backend

---

## ✅ Verification Checklist

- [ ] Backend is deployed on Render and health endpoint works
- [ ] Frontend build succeeds in Vercel (check Build Logs)
- [ ] `VITE_API_URL` env var is set in Vercel
- [ ] `VITE_API_URL` matches your Render backend URL exactly
- [ ] Frontend uses `import.meta.env.VITE_API_URL` (not `process.env.REACT_APP_API_URL`)
- [ ] CORS is enabled in backend: `app.use(cors());`
- [ ] Login endpoint is: `/api/v1/auth/login` (matches backend)
- [ ] Token is stored in localStorage after login
- [ ] Network requests show backend URL (not localhost)
- [ ] No JavaScript errors in browser console

---

## 📞 If Still Not Working

**Collect this info and share:**
1. Exact error message from browser console
2. Screenshot of Network tab showing failed request
3. Full URL of your frontend (from Vercel)
4. Full URL of your backend (from Render)
5. Frontend code snippet for API call
6. Backend server.js top 30 lines

---

## Quick Reset (Nuclear Option)

If nothing works:

**1. Rebuild Frontend Locally:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
git add . && git commit -m "Reset frontend build" && git push origin main
```

**2. Trigger Vercel Redeploy:**
- Vercel dashboard → Deployments → Latest → **Redeploy**

**3. Check Logs:**
- Vercel → Deployments → Latest → **Build Logs**

**4. Test Again:**
- Open your Vercel URL
- `F12` → Console for errors
- Check Network tab for API calls
