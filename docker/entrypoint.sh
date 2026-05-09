#!/bin/bash
set -e

echo "[entrypoint] Running database migrations..."
cd /app/packages/database
npx prisma migrate deploy
cd /app

echo "[entrypoint] Starting application..."
exec "$@"
