# RideSnap deployment: Render + Vercel + hosted MySQL

## 1. GitHub
Push this project to GitHub. Do not commit `.env` files or `node_modules`.

## 2. Backend on Render
Create a Node Web Service from this repository.
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

Add these Render environment variables:
- `DB_HOST` = your hosted MySQL host
- `DB_PORT` = `3306`
- `DB_USER` = your MySQL user
- `DB_PASSWORD` = your MySQL password
- `DB_NAME` = `ridesnap`
- `JWT_SECRET` = a long random secret
- `FRONTEND_URL` = your Vercel frontend URL, without a trailing slash

After deploy, test `https://YOUR-RENDER-URL.onrender.com/health`.

## 3. Frontend on Vercel
Import the same GitHub repository.
- Root Directory: `frontend`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Add the Vercel environment variable:
- `VITE_BACKEND_URL` = your Render backend URL, without `/api`

Redeploy after adding the variable.

## 4. Local development
Backend `.env` should contain your local MySQL values and `FRONTEND_URL=http://localhost:3000`.
Frontend can use the Vite proxy without setting `VITE_BACKEND_URL`.
