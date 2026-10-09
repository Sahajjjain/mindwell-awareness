# MindWell — Mental Health Awareness (MERN)

A small, non-diagnostic mental-health awareness platform built with React, Express, Node.js and MongoDB.

## Features
- Responsive public site with educational articles and support resources.
- Public article API backed by MongoDB, with safe fallback seed content if MongoDB is not configured.
- Admin login using a password hash and JWT.
- Admin dashboard to create, edit, publish/unpublish, and delete articles.
- Helmet security headers, API rate limiting, input validation, and protected admin routes.
- Clear non-diagnostic disclaimer and crisis-support guidance.

## Requirements
- Node.js 20+ recommended
- MongoDB Atlas URI or local MongoDB

## 1. Install dependencies
Open a terminal in this folder:

```bash
cd server
cp .env.example .env
npm install
```

Windows PowerShell alternative for copying env:
```powershell
Copy-Item .env.example .env
```

Then create the frontend:
```bash
cd ../client
npm install
```

## 2. Configure server
Edit `server/.env`:
- `MONGODB_URI`: your MongoDB connection string
- `JWT_SECRET`: use a long random secret
- `ADMIN_EMAIL`: email for the first admin account
- `ADMIN_PASSWORD`: a strong temporary password (change it before deployment)
- `CLIENT_ORIGIN`: `http://localhost:5173`

On startup, the server creates the admin account if it doesn't exist. The password is hashed with bcrypt.

## 3. Run locally
Terminal 1:
```bash
cd server
npm run dev
```

Terminal 2:
```bash
cd client
npm run dev
```

Open http://localhost:5173

Admin: open `/admin` and sign in using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## API
- `GET /api/health`
- `GET /api/articles`
- `GET /api/articles/:slug`
- `POST /api/admin/login`
- `GET /api/admin/articles` (JWT)
- `POST /api/admin/articles` (JWT)
- `PUT /api/admin/articles/:id` (JWT)
- `PATCH /api/admin/articles/:id/publish` (JWT)
- `DELETE /api/admin/articles/:id` (JWT)

## Deploy
- Deploy `server` to Render or another Node host.
- Set its environment variables using `.env.example`.
- Deploy `client` to Vercel or Netlify and set `VITE_API_URL` to the deployed server URL (no trailing slash).
- Set `CLIENT_ORIGIN` on the server to the deployed frontend URL.
- Add your production MongoDB URI and a long, unique `JWT_SECRET`.
- Never commit `.env` or expose admin credentials.

## Health and safety
This project provides general education only; it does not diagnose, treat, or replace professional care. Articles are starter educational content and should be reviewed against current, reputable sources before public use. If someone may be in immediate danger, contact local emergency services or go to the nearest emergency department. In India, Tele-MANAS can be reached at 14416 or 1-800-891-4416; verify availability and details before publishing.

## Before a public launch
- Replace starter resources with verified local resources.
- Add tests, accessibility checks, privacy policy, terms, and monitoring.
- Consider secure httpOnly cookies and CSRF protection if moving beyond this demo. This MVP stores the short-lived admin token in sessionStorage, which is safer than localStorage for persistence but still accessible to JavaScript.
