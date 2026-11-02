FRAME(D) - COS 216 FINAL PROJECT
GitHub: <paste your public repository link here>

REQUIREMENTS
- Docker Desktop (with Docker Compose)

BUILD AND RUN (both containers + MongoDB)
1. Open a terminal in this folder (the one containing docker-compose.yml).
2. Run:   docker compose up --build
3. Open:  http://localhost:3000
   (Backend API: http://localhost:5000/api, MongoDB runs in its own container.)
   Test data is created automatically on first start.

STOP:           docker compose down
RESET DATA:     docker compose down -v   (then up --build again to re-seed)

LOGINS
- Regular user: test@test.com / test1234   (1+ post, 1 album, 2 friends)
- Admin:        admin@example.com / admin1234
- Other users (alice, bob, carol, dave, erin, frank): <name>@example.com / test1234

DATABASE EXPORT / IMPORT (folder: database/)
- Export:  docker compose exec mongo mongodump --db socialapp --out /dump
           docker compose cp mongo:/dump ./database
- Import:  docker compose cp ./database mongo:/dump
           docker compose exec mongo mongorestore --drop /dump
Passwords are stored unhashed, as required for marking.

DIRECTORY STRUCTURE
docker-compose.yml     Runs mongo, backend and frontend containers
database/              Exported MongoDB data (mongodump)
backend/               Node + Express API (port 5000)
  server.js            Starts the API, the only DB connection, runs the seed
  seed.js              Creates the test data on first start
  middleware/          auth.js - cookie session check (JWT in an httpOnly cookie)
  models/              Mongoose schemas
  routes/              auth, users, posts, albums, feed, search, notifications, admin
  utils/helpers.js     Shared helpers (error handling, cascade deletes, post decoration)
frontend/              React + Vite + Tailwind (port 3000)
  public/              favicon.svg, images/ (splash.jpg, seed/ photos)
  src/api.js           fetch wrapper
  src/AuthContext.jsx  Logged-in user state
  src/theme.js         Light/dark theme switch
  src/components/      Reusable components (PostCard, AlbumCard, Field, ...)
  src/pages/           One file per page/route