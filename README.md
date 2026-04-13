# TaskFlow Frontend (UI-only)

This repo is now a frontend-only app backed by a local mock API.

## Stack

- React + TypeScript + Vite
- `json-server`-based custom mock server
- React Query + Axios

## Mock API

- Base URL: `http://localhost:4000`
- Implemented endpoints:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /projects`
  - `POST /projects`
  - `GET /projects/:id`
  - `PATCH /projects/:id`
  - `DELETE /projects/:id`
  - `GET /projects/:id/tasks`
  - `POST /projects/:id/tasks`
  - `PATCH /tasks/:id`
  - `DELETE /tasks/:id`
- Seed data lives in `mock/db.json`
- Mock server implementation lives in `mock/server.mjs`

## Run Locally (without Docker)

1. Install dependencies:
   - `npm ci`
2. Start mock API:
   - `npm run mock:server`
3. In a second terminal, start frontend:
   - `npm run dev`
4. Open:
   - `http://localhost:3000`

## Run With Docker Compose

From repo root:

- `docker compose up --build`

Services exposed:

- Frontend: `http://localhost:3000`
- Mock API: `http://localhost:4000`
