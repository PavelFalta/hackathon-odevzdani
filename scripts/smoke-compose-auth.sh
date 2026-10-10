#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BASE_URL="${SMOKE_BASE_URL:-http://localhost:8080}"
USER="${SMOKE_USER:-kairos}"
PASS="${SMOKE_PASS:-posledni-khk}"

echo "Smoke: POST ${BASE_URL}/api/auth/login"

http_code="$(
  curl -sS -o /tmp/posledni-login.json -w "%{http_code}" \
    -X POST "${BASE_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${USER}\",\"password\":\"${PASS}\"}"
)"

if [[ "$http_code" != "200" ]]; then
  echo "Login failed (HTTP ${http_code}). Response:"
  cat /tmp/posledni-login.json || true
  echo
  echo "Hint: docker compose ps && docker compose logs backend frontend"
  exit 1
fi

python3 - <<'PY'
import json
data = json.load(open("/tmp/posledni-login.json"))
assert data.get("access_token"), "missing access_token"
assert data.get("username") == "kairos"
print("Smoke: login OK")
PY
