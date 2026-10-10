#!/bin/sh
set -e

export PORT="${PORT:-8080}"
envsubst '${PORT}' < /etc/nginx/kairos.conf.template > /etc/nginx/conf.d/default.conf

cd /app/backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 &
exec nginx -g 'daemon off;'
