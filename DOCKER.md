# Docker Setup for LuxuriousOnly

This repository includes Docker configuration for both development and production environments.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- At least 4GB of available RAM

## Quick Start

### Development Environment

To run the application in development mode with hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

This will start:
- PostgreSQL database on port `5432`
- Backend (Medusa.js) on port `9000`
- Frontend (Next.js) on port `8000`

### Production Environment

**Important:** The frontend build requires the backend to be available. Use the build script to ensure proper build order:

**Windows (PowerShell):**
```powershell
.\build-docker.ps1
```

**Linux/Mac:**
```bash
chmod +x build-docker.sh
./build-docker.sh
```

**Or manually build in order:**
```bash
# 1. Build and start postgres and backend first
docker compose build postgres backend
docker compose up -d postgres backend

# 2. Wait for backend to be healthy (check with: docker compose ps)
# 3. Then build frontend
docker compose build frontend

# 4. Start all services
docker compose up -d
```

**Quick build (may fail if backend isn't ready):**
```bash
docker compose up --build
```

## Environment Variables

Create a `.env` file in the root directory or set environment variables before running:

```env
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key_here
```

**Required Environment Variables:**
- `JWT_SECRET`: Secret key for JWT token generation (defaults to "supersecret" if not set)
- `COOKIE_SECRET`: Secret key for cookie encryption (defaults to "supersecret" if not set)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`: Medusa publishable API key (required for frontend)

**Note:** The Docker Compose files automatically configure:
- `MEDUSA_BACKEND_URL`: Server-side backend URL (internal Docker network)
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL`: Client-side backend URL (for browser access)

## Database Setup

On first run, you'll need to run database migrations and seed data:

```bash
# For development
docker-compose -f docker-compose.dev.yml exec backend npm run seed

# For production
docker-compose exec backend npm run seed
```

## Useful Commands

### View logs
```bash
docker-compose logs -f [service_name]
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes (clears database)
```bash
docker-compose down -v
```

### Rebuild a specific service
```bash
docker-compose build [service_name]
docker-compose up [service_name]
```

### Access container shell
```bash
docker-compose exec [service_name] sh
```

## Services

- **postgres**: PostgreSQL 15 database
- **backend**: Medusa.js backend API
- **frontend**: Next.js frontend application

## Ports

- `5432`: PostgreSQL
- `9000`: Backend API
- `8000`: Frontend application

## Volumes

- `postgres_data`: Persistent database storage
- `backend_uploads`: Backend file uploads storage

