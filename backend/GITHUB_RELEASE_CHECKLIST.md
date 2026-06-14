# GitHub Release Checklist

## 1. Repository Preparation
- [ ] Ensure the repository name is clear and professional (e.g. `employee-management-system`)
- [ ] Add a project description and topics/tags on GitHub
- [ ] Set repository visibility to Public (required for submission)
- [ ] Confirm `README.md` is complete and up to date
- [ ] Confirm `.gitignore` excludes `node_modules`, `.env`, logs, uploads, and build artifacts
- [ ] Ensure `.github/workflows/nodejs-ci.yml` exists and runs tests
- [ ] Include `.dockerignore`, `Dockerfile`, and `docker-compose.yml`

## 2. Code & Documentation
- [ ] Confirm `server.js` and route structure are final and working
- [ ] Confirm backend dependencies are correct in `package.json`
- [ ] Confirm `db/init.sql` contains the full production database schema
- [ ] Confirm `README.md` includes:
  - Project overview
  - Setup instructions
  - Environment variables
  - Run commands
  - API docs and deployment instructions
- [ ] Confirm `DEPLOYMENT.md` has Render + PostgreSQL deployment steps
- [ ] Confirm `presentation-outline.md` is complete and presentation-ready
- [ ] Add `.env.example` for environment variable guidance
- [ ] Add `tests/health.test.js` and ensure tests run successfully

## 3. Final Verification
- [ ] Run local tests: `npm test`
- [ ] Run syntax checks for key files: `node --check server.js ...`
- [ ] Run `docker compose up --build` locally if possible
- [ ] Confirm `/api/v1/health` returns `status: ok`
- [ ] Confirm Swagger docs are available at `/api/docs`
- [ ] Confirm database schema is accessible in `db/init.sql`
- [ ] Confirm the app starts with `npm start`

## 4. Deployment & Live URLs
- [ ] Deploy backend to Render or equivalent
- [ ] Deploy frontend to Vercel or equivalent
- [ ] Connect backend to cloud PostgreSQL
- [ ] Confirm live backend URL is working
- [ ] Confirm live frontend URL is working (if frontend exists)
- [ ] Confirm API docs and health endpoint are accessible in production
- [ ] Record the live URLs for submission:
  - GitHub repo link
  - Backend URL
  - Frontend URL

## 5. Release Assets
- [ ] Add `db/init.sql` as the database schema file
- [ ] Add `README.md` as the main documentation file
- [ ] Add `DEPLOYMENT.md` for deployment-specific guidance
- [ ] Add `presentation-outline.md` for final presentation prep
- [ ] Capture screenshots of:
  - live app running
  - API docs page
  - database schema or admin view
  - test execution / CI status
- [ ] Record a short demo video showing:
  - login flow
  - employee dashboard or API calls
  - leave management workflow
  - asset assignment and audit trails

## 6. GitHub Release Publish
- [ ] Create a new GitHub release draft
- [ ] Set the release title and tag version (e.g. `v1.0.0`)
- [ ] Write release notes summarizing:
  - project features
  - what’s included
  - deployment URLs
- [ ] Attach any final documents or screenshots if desired
- [ ] Publish the release when ready

## 7. Submission Package
- [ ] Submit the GitHub repository URL
- [ ] Submit the live backend API URL
- [ ] Submit the live frontend URL
- [ ] Submit the database schema file location (`db/init.sql`)
- [ ] Submit the project documentation PDF or link
- [ ] Submit the presentation PPT or link
- [ ] Submit screenshots and demo video link

## 8. Final Quality Checks
- [ ] Ensure there are no leftover placeholder credentials in `.env.example`
- [ ] Ensure no sensitive values were committed
- [ ] Confirm GitHub repo has a valid commit history
- [ ] Confirm all important files are in the repository root or documented clearly
- [ ] Confirm the backend works in a production-like environment
- [ ] Confirm the frontend calls the backend successfully (if integrated)

---

### Optional Extras
- [ ] Add `CHANGELOG.md` if you want release history
- [ ] Add GitHub Issues / Project board for task tracking
- [ ] Add `CONTRIBUTING.md` for future collaborators
- [ ] Add `LICENSE` if required by the program
