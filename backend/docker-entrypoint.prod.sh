#!/bin/sh
set -e

echo "VolleyCoaching Backend Starting (Production)..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until pg_isready -h postgres -p 5432 -U "$POSTGRES_USER"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is ready!"

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy
npx prisma db execute --file prisma/maintenance/20260928_training_plan.sql --schema prisma/schema.prisma

npx prisma db execute --file prisma/maintenance/20260929_usb_rosters.sql --schema prisma/schema.prisma

# Production never seeds automatically: initialization is an explicit maintenance action.

echo "Starting backend server..."
exec npx tsx src/server.ts
