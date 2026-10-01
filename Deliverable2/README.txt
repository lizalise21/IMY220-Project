FRAME(D) - IMY220 DELIVERABLE
Student: Lizalise Mbonisweni u23587874

REQUIREMENTS
- Docker Desktop installed and running

RUN THE PROJECT (from the folder containing docker-compose.yml)
1. docker compose up --build
2. Open http://localhost:3000

The frontend runs on port 3000 and the API on port 5000.
Stop with Ctrl+C, or: docker compose down

DATABASE (self-hosted MongoDB in Docker)
- The "mongo" service in docker-compose.yml runs MongoDB 7.
- Connection string used by the backend:
  mongodb://mongo:27017/socialapp
- The database is seeded automatically on first start by backend/seed.js
  (4 users, 3 posts, 1 album, comments, and 1 friendship: alice <-> bob).
  No manual import is needed.
- To wipe and re-seed: docker compose down -v
  then: docker compose up --build

TEST ACCOUNTS (password for all: Password123)
- alice@example.com  (friends with bob)
- bob@example.com
- carol@example.com  (no friends, use for friend request demo)
- admin@example.com  (admin role, admin features not part of this deliverable)

COMMANDS USED TO BUILD THE IMAGES AND CONTAINERS
- docker compose build
- docker compose up
(Combined: docker compose up --build)

Individual image commands (equivalent to what compose does):
- docker build -t frame-backend ./backend
- docker build -t frame-frontend ./frontend
- docker pull mongo:7