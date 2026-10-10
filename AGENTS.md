# Agent guide (Kairos)

Map + RAG assistant monorepo: `frontend/` (Vite + React + Mapbox), `backend/` (FastAPI).

## Before you finish any task

Run from repo root:

```bash
docker compose build
npm run check:lines
```

**Verification:** `docker compose build` is the only routine automated test we run (frontend `tsc` + Vite, backend image). Do not run `npm run check` / Vitest / pytest on every task unless asked.

`npm run check` (format, lint, unit tests) is still available when you want a full local pass.

After Docker/nginx/auth changes: `docker compose up --build -d` then `npm run test:smoke`.

## Tests

- Add or extend tests when you change behavior, fix bugs, or add endpoints/UI.
- After meaningful feature work, add at least one test that would have caught a regression.
- Prefer small, focused test files under `frontend/src/**/*.test.tsx` and `backend/tests/`.

## File size (critical)

- **Target ~120 lines** per production module; **hard max 200** (enforced by `npm run check:lines`).
- Test files may go up to **350** lines.
- If a file grows past ~100 lines, split it proactively (hooks, components, routers, services).

## Hygiene

- No dead code, commented-out blocks, or drive-by refactors.
- Match existing patterns in the folder you touch.
- Backend: thin routers; logic in `app/services/` when it grows.
- Frontend: one component per file; colocate styles only when tiny.

## Formatters

| Area     | Format              | Lint        |
|----------|---------------------|-------------|
| Frontend | Prettier            | oxlint      |
| Backend  | `ruff format`       | `ruff check`|

## Local dev

```bash
# terminal 1
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000

# terminal 2
cd frontend && npm run dev
```

Copy `frontend/.env.example` and `backend/.env.example` for Mapbox token and future API keys.

Docker: root `.env` feeds `docker compose` (Mapbox token is a **build arg** for the frontend image).

Auth: JWT from `POST /api/auth/login`; assistant routes require `Authorization: Bearer`.
