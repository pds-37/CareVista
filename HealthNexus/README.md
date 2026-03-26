# CareVista

CareVista is a production-ready MERN hospital web platform with a patient-facing website, appointment intake flow, contact center form, and a lightweight care-desk dashboard for reviewing requests and updating statuses.

## Tech Stack

- MongoDB Atlas
- Express
- React
- Node.js
- Axios
- Mongoose

## Project Structure

```text
carevista/
|-- backend/
|-- frontend/
|-- .gitignore
|-- package.json
`-- README.md
```

## Features

- Homepage with hero, stats, department preview, featured doctors, testimonials, FAQ, and CTA
- Full departments directory backed by MongoDB
- Doctor search with department filtering and debounced keyword search
- Appointment request form with client-side validation and backend persistence
- Contact form with validation and backend persistence
- Care-desk dashboard with live overview stats, polling, and inline status updates
- Static About page with mission, values, history timeline, and careers CTA
- Ready for MongoDB Atlas, Render, and Vercel deployment

## Local Development Setup

1. Clone the repository and move into the `carevista/` folder.

```bash
git clone <your-repository-url>
cd carevista
```

2. Install all dependencies.

```bash
npm run install:all
```

3. Create `backend/.env` from `backend/.env.example`.

Use these values for local development:

```env
MONGO_URI=your_mongodb_atlas_or_local_connection_string
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
SEED_ON_START=true
```

4. Start both the backend and frontend from the root.

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## MongoDB Atlas Setup

1. Create a free MongoDB Atlas cluster.
2. Create a database user with a username and password.
3. In Network Access, allow `0.0.0.0/0` if you want Render and local devices to connect. For tighter security, limit access to the IP ranges you control.
4. Copy the connection string and replace the placeholder credentials.
5. Paste the final connection string into `MONGO_URI` in `backend/.env`.

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/carevista?retryWrites=true&w=majority
```

## Backend Deployment to Render

1. Push the project to GitHub.
2. In Render, create a new Web Service from the repository.
3. Set the Root Directory to `backend`.
4. Use these service settings:
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add these environment variables:
   - `MONGO_URI=your_atlas_connection_string`
   - `FRONTEND_URL=https://your-vercel-app.vercel.app`
   - `NODE_ENV=production`
   - `SEED_ON_START=false`
6. Optionally use `backend/render.yaml` as a starting blueprint.
7. After deploy, verify:
   - `https://your-render-url.onrender.com/api/health`
   - `https://your-render-url.onrender.com/api/ready`

## Frontend Deployment to Vercel

1. Create a new Vercel project from the same GitHub repository.
2. Set the Root Directory to `frontend`.
3. Use these settings:
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add this environment variable:

```env
REACT_APP_API_URL=https://your-render-url.onrender.com/api
```

5. Deploy the project.
6. After you receive the Vercel URL, update Render:
   - `FRONTEND_URL=https://your-vercel-app.vercel.app`

## Post-Deployment Smoke Test

Verify these URLs and actions after deployment:

### Backend URLs

- `GET /api/health` returns `{ "status": "ok" }`
- `GET /api/ready` returns `{ "status": "ready", "db": "connected" }`
- `GET /api/site/overview` returns hero, stats, departments, doctors, testimonials, FAQ, and about snippet
- `GET /api/site/departments` returns all six seeded departments
- `GET /api/site/doctors` returns all seeded doctors
- `GET /api/site/doctors?department=Cardiology` filters correctly
- `GET /api/site/doctors?search=neurology` filters correctly
- `GET /api/site/care-desk/overview` returns appointments, messages, and dashboard stats

### Frontend Routes

- `/` loads the hero, stats, specialties, physicians, testimonials, FAQ, and CTA
- `/departments` lists all departments with services and leadership
- `/doctors` loads doctors, department filter works, and keyword search updates after debounce
- `/appointments` validates required fields, submits successfully, and shows the success summary
- `/contact` validates required fields, submits successfully, and shows the thank-you message
- `/care-desk` loads stats, appointments, messages, and allows status updates without a full refresh
- `/about` renders mission, values, timeline, and careers section
- Navbar links navigate correctly
- Mobile navigation opens and closes correctly

### Manual Form Actions

1. Submit an appointment with missing fields and confirm field-level validation appears.
2. Submit a valid appointment and confirm it appears in `/care-desk`.
3. Submit a contact message and confirm it appears in `/care-desk`.
4. Change an appointment status and confirm the badge and stats update.
5. Change a message status and confirm the badge and unread count update.

## Scripts

From the root:

```bash
npm run install:all
npm run dev
npm run build
```

From `backend/`:

```bash
npm run dev
npm start
```

From `frontend/`:

```bash
npm start
npm run build
```
