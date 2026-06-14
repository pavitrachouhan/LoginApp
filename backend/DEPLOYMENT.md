# Deployment Guide

This guide explains how to deploy the backend API and connect it to a cloud PostgreSQL database.

## 1. Backend Deployment on Render

### Create the Web Service
1. Sign in to Render and create a new Web Service.
2. Connect your GitHub repository.
3. Select the backend directory if using monorepo, otherwise use the repo root.
4. Set the build command:
   - `npm install`
5. Set the start command:
   - `npm start`
6. Set the environment:
   - `Node 20`

### Configure Environment Variables
Set the following variables in Render:

- `PORT` = `8000`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_NAME`
- `DB_PORT`
- `JWT_SECRET`

If you use Render managed Postgres, set these values from the database dashboard.

### Deploy and Test
- Deploy the service
- Visit the live URL
- Test health check: `https://<render-service>.onrender.com/api/v1/health`
- Test docs: `https://<render-service>.onrender.com/api/docs`

## 2. Cloud PostgreSQL Setup

### Option A: Render Managed Postgres
1. Create a new PostgreSQL instance in Render.
2. Add connection details to the Web Service environment variables.
3. Run `db/init.sql` against the new database.

### Option B: External Cloud DB (Railway, ElephantSQL, Supabase)
1. Create the database on your chosen provider.
2. Add the provider connection info to `.env` / Render environment.
3. Ensure the backend can connect from Render.

## 3. Local Docker Deployment

### Build and Run

```bash
docker compose up --build
```

### Access

- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/api/docs`

## 4. Frontend Deployment (Vercel)

If your frontend is in a separate repository:
1. Create a Vercel project and connect GitHub.
2. Set environment variables for API base URL.
3. Deploy and confirm the frontend can consume backend APIs.

## 5. Checklist Before Submission

- [ ] GitHub repository is public and complete
- [ ] Live backend URL is working
- [ ] Live frontend URL is working
- [ ] Swagger docs accessible
- [ ] Database schema file included
- [ ] README with setup + deployment instructions included
- [ ] Presentation outline ready
- [ ] Demo screenshots or screen recording captured
