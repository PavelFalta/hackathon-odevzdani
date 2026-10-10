# Railway production

One **app** service (plus **Postgres**). No Docker Compose. Same idea as local `docker compose`: one public URL serves the SPA and proxies `/api` to FastAPI inside the container.

## Services

| Service  | Root directory | Dockerfile           |
| -------- | -------------- | -------------------- |
| Postgres | (Railway plugin) | —                  |
| App      | `.`            | `Dockerfile.railway` |

Config as Code: `/railway.toml` (or `RAILWAY_DOCKERFILE_PATH=Dockerfile.railway`).

Do **not** set a custom `PORT` variable. Railway injects `PORT`; nginx listens on it and proxies `/api` to uvicorn on `127.0.0.1:8000`.

## Build variables (App service)

| Variable / build arg | Required | Notes |
| -------------------- | -------- | ----- |
| `VITE_MAPBOX_TOKEN` | yes | Docker build arg for the map |
| `OPENAI_API_KEY` | yes | Runtime + **build** (FAISS index) |

`VITE_API_BASE_URL` is intentionally unset so the browser uses relative `/api/...` on the same host.

## Runtime variables (App service)

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `DATABASE_URL` | yes | Reference from Postgres service |
| `JWT_SECRET` | yes | Long random string |
| `CORS_ORIGINS` | yes | `["https://your-app.up.railway.app"]` — same URL as this service |
| `OPENAI_API_KEY` | yes | Realtime, query embeddings, and live event search |
| `WEB_SEARCH_MODEL` | optional | Defaults to `gpt-4.1-mini`; one low-context search per event question |
| `MAPBOX_ACCESS_TOKEN` or `VITE_MAPBOX_TOKEN` | yes | Agent map search |
| `REVIEWS_API_KEY` | optional | Google Places |

Health check: `/api/health`. UI: `/`.

## Postgres

Reference Postgres `DATABASE_URL` on the app service. Private host `*.railway.internal` is reachable only inside Railway.

## Optional split deploy

`backend/Dockerfile.railway` and `frontend/Dockerfile.railway` remain for a two-service setup; production on this branch expects the **monolith** `Dockerfile.railway` only.

## Local parity

Full stack locally: `docker compose up`. This branch is for Railway.
