Frame(d) - Deliverable 1
=========================

Structure
---------
frontend/   React + Vite + react-router-dom app (Splash, Home, Profile, Post pages)
backend/    Express server with stubbed /api/auth/signin and /api/auth/signup

Running locally without Docker
-------------------------------
Backend:
  cd backend
  npm install
  npm run dev        # runs on http://localhost:4000

Frontend:
  cd frontend
  npm install
  npm run dev         # runs on http://localhost:5173

Running with Docker (each service in its own container)
---------------------------------------------------------
Build and run the backend:
  docker build -t framed-backend ./backend
  docker run -p 4000:4000 framed-backend

Build and run the frontend:
  docker build -t framed-frontend ./frontend
  docker run -p 5173:5173 -e VITE_API_BASE=http://localhost:4000 framed-frontend

Or, run both together with Docker Compose:
  docker-compose up --build

Then visit:
  Frontend: http://localhost:5173
  Backend health check: http://localhost:4000/api/health

Notes
-----
- All post/profile/comment data is dummy data (src/data/dummyData.js).
- Login/Sign up forms have client-side validation (email format, password
  length, matching password confirmation) and submit to the stubbed
  Express endpoints.
- Profile and Post pages use dynamic routes (/profile/:id, /post/:id) -
  the same dummy content renders for any id passed in.
