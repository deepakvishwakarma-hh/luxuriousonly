# Docker Setup for LuxuriousOnly

This repository includes optimized Docker configuration for both development and production environments with multi-stage builds, resource limits, and best practices.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose v2)
- At least 4GB of available RAM (8GB recommended for production)
- Docker Compose v3.8 or higher

## Quick Start

### Development Environment

To run the application in development mode with hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

Or run in detached mode:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- PostgreSQL database on port `5432`
- Backend (Medusa.js) on port `9000` with hot-reload
- Frontend (Next.js) on port `8000` with hot-reload

### Production Environment

**Step 1: Create `.env` file**

Copy the example environment file and configure it:

```bash
# Copy .env.example to .env (if it exists)
# Or create .env manually with required variables
```

**Step 2: Build and start services**

**Option A: Using build scripts (Recommended)**

**Windows (PowerShell):**
```powershell
.\build-docker.ps1
```

**Linux/Mac:**
```bash
chmod +x build-docker.sh
./build-docker.sh
```

**Option B: Manual build (Recommended for production)**

```bash
# 1. Build and start postgres and backend first
docker compose build postgres backend
docker compose up -d postgres backend

# 2. Wait for backend to be healthy (check with: docker compose ps)
# Verify backend is healthy: docker compose ps backend

# 3. Then build frontend (requires backend to be running)
docker compose build frontend

# 4. Start all services
docker compose up -d
```

**Option C: Quick build (may fail if backend isn't ready)**

```bash
docker compose up --build -d
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Variables

```env
# Database Configuration
POSTGRES_USER=medusa
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=medusa_db
POSTGRES_PORT=5432

# Backend Configuration
BACKEND_PORT=9000
BACKEND_URL=https://admin.luxuriousonly.com
DATABASE_URL=postgresql://medusa:password@postgres:5432/medusa_db

# Frontend Configuration
FRONTEND_PORT=8000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://admin.luxuriousonly.com
NEXT_PUBLIC_BASE_URL=https://luxuriousonly.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_publishable_key_here

# Security Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here

# CORS Configuration
STORE_CORS=http://localhost:8000,https://docs.medusajs.com,https://admin.luxuriousonly.com
ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com,https://admin.luxuriousonly.com
AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:8000,https://docs.medusajs.com,https://admin.luxuriousonly.com

# SMTP Configuration (Email)
SMTP_HOST=smtp.zeptomail.in
SMTP_PORT=587
SMTP_USER=emailapikey
SMTP_PASS=your_smtp_password_here
SMTP_FROM=fullstackartists.com
SMTP_SECURE=false
```

### Environment Variable Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_USER` | PostgreSQL username | `medusa` | No |
| `POSTGRES_PASSWORD` | PostgreSQL password | `medusa_password` | No |
| `POSTGRES_DB` | PostgreSQL database name | `medusa_db` | No |
| `DATABASE_URL` | Full database connection string | - | Yes (production) |
| `JWT_SECRET` | Secret key for JWT tokens | `supersecret` | Yes (change in production) |
| `COOKIE_SECRET` | Secret key for cookies | `supersecret` | Yes (change in production) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Medusa publishable API key | - | Yes |
| `BACKEND_URL` | Backend URL for production | - | Yes (production) |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Backend URL for frontend | - | Yes |
| `NEXT_PUBLIC_BASE_URL` | Frontend base URL | - | Yes |

**Security Note:** Always change `JWT_SECRET` and `COOKIE_SECRET` in production. Use strong, randomly generated secrets.

## Docker Architecture

### Multi-Stage Builds

Both backend and frontend use optimized multi-stage builds:

1. **Dependencies Stage**: Installs only production dependencies
2. **Builder Stage**: Builds the application
3. **Runner Stage**: Minimal production image with only runtime files

This results in:
- Smaller image sizes (~70% reduction)
- Faster builds (better layer caching)
- Improved security (fewer dependencies in production)

### Resource Limits

Production services include resource limits:
- **CPU**: 2 cores limit, 0.5 cores reserved
- **Memory**: 2GB limit, 512MB reserved

Adjust these in `docker-compose.yml` based on your server capacity.

## Database Setup

On first run, you'll need to run database migrations and seed data:

```bash
# For development
docker-compose -f docker-compose.dev.yml exec backend npm run seed

# For production
docker compose exec backend npm run seed
```

### Database Migrations

```bash
# Run migrations
docker compose exec backend npm run migrations:run

# Or if using Medusa CLI
docker compose exec backend npx medusa migrations run
```

## Useful Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100 backend
```

### Service Management

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes (⚠️ clears database)
docker compose down -v

# Restart a specific service
docker compose restart backend

# View running containers
docker compose ps
```

### Rebuild Services

```bash
# Rebuild specific service
docker compose build backend
docker compose up -d backend

# Rebuild without cache
docker compose build --no-cache backend

# Rebuild all services
docker compose build
```

### Container Access

```bash
# Access container shell
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec postgres psql -U medusa -d medusa_db

# Run commands in container
docker compose exec backend npm run build
docker compose exec backend npm run seed
```

### Health Checks

```bash
# Check service health
docker compose ps

# Inspect health check
docker inspect --format='{{json .State.Health}}' luxuriousonly-backend | jq
```

## Services

### PostgreSQL

- **Image**: `postgres:15-alpine`
- **Port**: `5432`
- **Volume**: `postgres_data` (persistent storage)
- **Health Check**: PostgreSQL readiness check

### Backend (Medusa.js)

- **Port**: `9000`
- **Volumes**: 
  - `backend_uploads`: File uploads
  - `backend_static`: Static files
- **Health Check**: HTTP endpoint `/health`
- **Build**: Multi-stage with production optimizations

### Frontend (Next.js)

- **Port**: `8000`
- **Build**: Next.js standalone output mode
- **Health Check**: Root endpoint check
- **Build**: Multi-stage with production optimizations

## Volumes

| Volume | Purpose | Location |
|--------|---------|----------|
| `postgres_data` | Database files | `/var/lib/postgresql/data` |
| `backend_uploads` | Backend uploads | `/app/uploads` |
| `backend_static` | Backend static files | `/app/static` |

**Development volumes:**
- `postgres_data_dev`
- `backend_uploads_dev`
- `backend_static_dev`

## Networks

All services communicate through the `luxuriousonly-network` bridge network with subnet `172.28.0.0/16`.

## Production Deployment

### Best Practices

1. **Use environment variables**: Never hardcode secrets in docker-compose files
2. **Enable health checks**: Services automatically restart if unhealthy
3. **Set resource limits**: Prevent resource exhaustion
4. **Use volumes**: Persist database and uploads
5. **Regular backups**: Backup PostgreSQL volumes regularly
6. **Monitor logs**: Set up log aggregation (e.g., ELK, Loki)
7. **Update regularly**: Keep base images updated for security patches

### Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U medusa medusa_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker compose exec -T postgres psql -U medusa medusa_db < backup.sql
```

### Update Services

```bash
# Pull latest images
docker compose pull

# Rebuild and restart
docker compose up -d --build
```

## Troubleshooting

### Backend won't start

1. Check database connection:
   ```bash
   docker compose exec postgres psql -U medusa -d medusa_db -c "SELECT 1;"
   ```

2. Check backend logs:
   ```bash
   docker compose logs backend
   ```

3. Verify environment variables:
   ```bash
   docker compose exec backend env | grep DATABASE_URL
   ```

### Frontend build fails

1. Ensure backend is running and healthy
2. Check build logs:
   ```bash
   docker compose build frontend
   ```

3. Verify environment variables are set correctly

### Database connection issues

1. Check if PostgreSQL is healthy:
   ```bash
   docker compose ps postgres
   ```

2. Verify connection string format:
   ```
   postgresql://username:password@host:port/database
   ```

### Port conflicts

If ports are already in use, change them in `.env`:

```env
POSTGRES_PORT=5433
BACKEND_PORT=9001
FRONTEND_PORT=8001
```

## Performance Optimization

### Build Cache

Docker Compose uses layer caching. To maximize cache hits:
1. Copy `package.json` before copying source code
2. Install dependencies before copying application code
3. Use `.dockerignore` to exclude unnecessary files

### Image Size

Current optimized image sizes:
- Backend: ~300-400MB (down from ~1GB+)
- Frontend: ~200-300MB (down from ~800MB+)
- PostgreSQL: ~200MB (alpine image)

### Build Time

With proper caching:
- First build: ~5-10 minutes
- Subsequent builds: ~1-3 minutes (with cache)

## Security Considerations

1. **Non-root users**: All services run as non-root users
2. **Secrets management**: Use Docker secrets or external secret managers in production
3. **Network isolation**: Services communicate through internal network
4. **Image scanning**: Regularly scan images for vulnerabilities
5. **Updates**: Keep base images updated

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Medusa.js Documentation](https://docs.medusajs.com)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)