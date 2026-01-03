#!/bin/bash
# Build script that ensures backend is built and running before frontend build

set -e

echo "🔨 Step 1: Building backend..."
docker compose build backend

echo "🔨 Step 2: Building postgres (if needed)..."
docker compose build postgres || true

echo "🚀 Step 3: Starting postgres and backend..."
docker compose up -d postgres backend

echo "⏳ Step 4: Waiting for backend to be healthy..."
timeout=120
elapsed=0
while [ $elapsed -lt $timeout ]; do
  if docker compose ps backend | grep -q "healthy"; then
    echo "✅ Backend is healthy!"
    break
  fi
  echo "Waiting for backend to be healthy... ($elapsed/$timeout seconds)"
  sleep 5
  elapsed=$((elapsed + 5))
done

if [ $elapsed -ge $timeout ]; then
  echo "❌ Backend failed to become healthy within $timeout seconds"
  docker compose logs backend
  exit 1
fi

echo "🔨 Step 5: Building frontend (backend is now available)..."
docker compose build frontend

echo "✅ All services built successfully!"
echo "🚀 Starting all services..."
docker compose up -d

echo "✅ Done! Services are running."

