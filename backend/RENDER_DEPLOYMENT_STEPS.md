# Render Deployment Guide - Step by Step

## Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Click "Sign up" → Select "Sign up with GitHub"
3. Authorize Render to access your GitHub account
4. Verify your email

---

## Step 2: Deploy Backend Service

### 2.1 Create Web Service
1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Search for your repo: `employee-management-system` (or `LoginApp`)
3. Click **"Connect"** next to the repo
4. Fill in the configuration:

| Field | Value |
|-------|-------|
| **Name** | `employee-management-system-api` |
| **Environment** | `Node` |
| **Region** | Select closest to your location |
| **Branch** | `main` |
| **Root Directory** | `backend` (important if monorepo!) |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### 2.2 Set Environment Variables
In Render dashboard, scroll down to **"Environment"** section:

```
PORT=8000
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_NAME=employee_management
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key_here
```

**Get these values from:**
- If using Render PostgreSQL: Use the connection string from Render database dashboard
- If using external DB: Use your cloud database connection details

### 2.3 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (3-5 minutes)
3. Once complete, you'll see a green "Live" status
4. Copy your service URL (looks like: `https://employee-management-system-api.onrender.com`)

---

## Step 3: Create PostgreSQL Database on Render

### 3.1 Create Managed Database
1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Fill in:

| Field | Value |
|-------|-------|
| **Name** | `employee-management-db` |
| **Database** | `employee_management` |
| **User** | `postgres` |
| **Region** | Same as Web Service |

3. Click **"Create Database"**
4. Wait for creation (2-3 minutes)

### 3.2 Get Connection Details
1. Once created, click on the database
2. Copy the **Internal Database URL** or use:
   - **Host:** (from connection string)
   - **User:** `postgres`
   - **Password:** (from connection string)
   - **Database:** `employee_management`
   - **Port:** `5432`

### 3.3 Initialize Database Schema
1. Open a terminal on your machine
2. Run:

```bash
# Connect to remote database and run init script
psql "postgres://user:password@host:5432/employee_management" -f db/init.sql
```

Or use a GUI tool like pgAdmin or DBeaver to connect and run `db/init.sql`

### 3.4 Update Web Service with DB Connection
1. Go back to your Web Service
2. Click **"Environment"** → **"Edit"**
3. Update the DB variables:

```
DB_HOST=your-database-hostname.onrender.com
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_NAME=employee_management
DB_PORT=5432
```

4. Click **"Save"** (service will restart automatically)

---

## Step 4: Test Backend Deployment

### 4.1 Health Check
Navigate to:
```
https://employee-management-system-api.onrender.com/api/v1/health
```

You should see:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 4.2 Swagger Docs
Navigate to:
```
https://employee-management-system-api.onrender.com/api/docs
```

You should see the full API documentation.

### 4.3 Test Authentication
Use Swagger or cURL to test login:

```bash
curl -X POST "https://employee-management-system-api.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## Step 5: Record Your URLs

Save these for submission:

| Item | Your URL |
|------|----------|
| **Backend Base** | `https://employee-management-system-api.onrender.com/api/v1` |
| **Swagger Docs** | `https://employee-management-system-api.onrender.com/api/docs` |
| **Health Check** | `https://employee-management-system-api.onrender.com/api/v1/health` |

---

## Common Issues & Fixes

### Issue: "Build failed"
- **Cause:** Missing environment variables
- **Fix:** Check `Build Command` is `npm install` and all env vars are set

### Issue: "Application failed to start"
- **Cause:** Database connection failed
- **Fix:** Verify DB_HOST, DB_USER, DB_PASSWORD are correct in Environment

### Issue: "502 Bad Gateway"
- **Cause:** Service crashed
- **Fix:** Check Render logs → "Logs" tab in dashboard

---

## Done! 🎉

Your backend is now live on Render. Move on to frontend deployment on Vercel.
