# HealthNexus

Deploy-ready MERN hospital platform with:

- React frontend for department discovery, specialist browsing, appointment intake, about, and contact pages
- React care-desk dashboard for reviewing appointments and inbound messages
- Express + MongoDB backend with seeded departments, doctors, appointment requests, and contact messages
- Production static serving so the backend can host the built frontend
- Docker support for running the app and MongoDB together

## Stack

- MongoDB
- Express
- React
- Node.js

## Local setup

1. Install frontend dependencies in `frontend`
2. Install backend dependencies in `backend`
3. Copy `backend/.env.example` to `backend/.env`
4. Optionally copy `frontend/.env.example` to `frontend/.env`
5. Start MongoDB locally
6. Run `npm run dev:backend` from the project root
7. Run `npm run dev:frontend` from the project root

## Root scripts

- `npm run dev:backend`
- `npm run dev:frontend`
- `npm run build`
- `npm start`
- `npm run seed`

## Backend environment

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=your-mongodb-uri
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SEED_ON_START=false
```

Notes:

- Use your MongoDB Atlas or other live `MONGO_URI` here.
- Keep `SEED_ON_START=false` for real databases so demo records are not inserted on every fresh deployment.
- Use `npm run seed` only when you explicitly want sample records.

## Frontend environment

Optional for separate frontend deployment:

```env
REACT_APP_API_URL=https://your-render-backend.onrender.com/api
```

If the backend serves the frontend in production, this variable can be omitted.

## Vercel + Render deployment

Recommended split:

- Deploy `frontend` to Vercel
- Deploy `backend` to Render
- Use MongoDB Atlas or another external MongoDB provider

### Vercel frontend

Project settings:

- Root Directory: `frontend`
- Framework Preset: `Create React App`
- Build Command: `npm run build`
- Output Directory: `build`
- Environment Variable: `REACT_APP_API_URL=https://your-render-backend.onrender.com/api`

The frontend includes [frontend/vercel.json](./frontend/vercel.json) so React Router routes rewrite to `index.html`.

### Render backend

You can deploy the backend either:

- manually as a Web Service with Root Directory `backend`
- or with the included [render.yaml](./render.yaml) Blueprint

Manual Render settings:

- Service Type: `Web Service`
- Runtime: `Node`
- Root Directory: `backend`
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/api/ready`

Render environment variables:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=your-real-mongodb-uri
FRONTEND_URL=https://your-frontend.vercel.app
SEED_ON_START=false
MONGO_MAX_POOL_SIZE=10
MONGO_SERVER_SELECTION_TIMEOUT_MS=10000
```

If you want Vercel preview deployments to call the backend too, set `FRONTEND_URL=*`. That is broader than a single-domain allowlist, but this backend is currently public and tokenless anyway, so the tradeoff is operational simplicity.

## Production build

1. Run `npm run build` from the project root
2. Start the server with `npm start`
3. The Express server will serve `frontend/build` in production
4. Check `GET /api/health` for liveness and `GET /api/ready` for MongoDB readiness

## App routes

- `/` public hospital landing page
- `/departments` department directory
- `/doctors` specialist directory
- `/appointments` patient appointment request flow
- `/contact` care-desk contact form
- `/care-desk` internal operations dashboard for queue management

## Docker

To run the full stack with Docker:

```bash
docker compose up --build
```

The app will be available at `http://localhost:5000`.
