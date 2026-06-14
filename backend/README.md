# Employee Management System - Backend

This repository contains the backend API for the Employee Management System built with Node.js, Express, and PostgreSQL.

## ✅ Final Delivery Checklist

- [x] Backend code pushed to GitHub
- [x] Docker / Docker Compose support added
- [x] PostgreSQL schema and database scripts included
- [x] API documentation via Swagger available at `/api/docs`
- [x] Health endpoint available at `/api/v1/health`
- [x] CI workflow added in `.github/workflows/nodejs-ci.yml`

## 🚀 Features

- Authentication with JWT
- Employee CRUD operations
- Department, skill, asset management
- Leave application and approval workflow
- Notification and audit trail support
- API versioning (`/api/v1`, `/api/v2`)
- Swagger API docs
- Health check endpoint
- Background leave reminder job

## 📁 Important Files

- `server.js` - application entry point
- `routes/v1` - versioned API routes
- `controllers` - request handlers
- `services` - business logic
- `repositories` - DB access layer
- `config/db.js` - PostgreSQL connection
- `db/init.sql` - database schema and init scripts
- `swagger.js` - Swagger documentation config
- `tests/health.test.js` - health check regression test

## ⚙️ Local Setup

1. Copy environment file:

```bash
cp .env.example .env
```

2. Update `.env` values:

```env
PORT=8000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=employee_management
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

3. Install dependencies:

```bash
npm install
```

4. Start PostgreSQL and initialize schema:

```bash
psql -U $DB_USER -d $DB_NAME -f db/init.sql
```

5. Run the app:

```bash
npm start
```

6. Open API docs:

```
http://localhost:8000/api/docs
```

## 🧪 Tests

Run tests with:

```bash
npm test
```

## 🐳 Docker

Build and run locally with Docker:

```bash
docker build -t loginapp-backend .
docker run -p 8000:8000 --env-file .env loginapp-backend
```

Use Docker Compose for backend + PostgreSQL:

```bash
docker compose up --build
```

## ☁️ Deploying to Render

1. Create a new Web Service on Render, connect GitHub repo.
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard from `.env`
5. Configure a managed PostgreSQL database on Render or external DB.
6. Update `DATABASE_URL` or corresponding values if using an external DB.

## 🌐 Backend API Base URL

- Example: `https://your-backend-service.onrender.com/api/v1`

## 📌 Notes for Presentation

- Backend live URL
- Swagger docs URL
- Database schema file: `db/init.sql`
- Deployment docs in this `README.md`
- CI workflow: `.github/workflows/nodejs-ci.yml`

## 📄 Deliverables to Submit

- GitHub repo link
- Live backend API URL
- Database schema file: `db/init.sql`
- README with setup and deployment instructions
- Presentation outline in `presentation-outline.md`
- Screenshots or demo recording of API docs and live service
