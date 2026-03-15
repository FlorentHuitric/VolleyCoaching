#!/bin/sh
set -e

echo "🏐 VolleyCoaching Backend Starting..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h postgres -p 5432 -U volleyuser; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🔄 Running database migrations..."
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
  npx prisma migrate deploy
else
  npx prisma migrate dev --name init --skip-seed
fi

# Seed database if needed
if [ "$SEED_DB" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run prisma:seed || echo "⚠️  No seed file found or seed failed (this is OK for now)"
fi

echo "🚀 Starting backend server..."
exec npm run dev
