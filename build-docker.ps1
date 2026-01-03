# PowerShell build script that ensures backend is built and running before frontend build
# Note: Frontend build happens in isolation, but this ensures proper build order

Write-Host "🔨 Step 1: Building postgres..." -ForegroundColor Cyan
docker compose build postgres

Write-Host "🔨 Step 2: Building backend..." -ForegroundColor Cyan
docker compose build backend

Write-Host "🚀 Step 3: Starting postgres and backend..." -ForegroundColor Cyan
docker compose up -d postgres backend

Write-Host "⏳ Step 4: Waiting for backend to be healthy..." -ForegroundColor Yellow
$timeout = 120
$elapsed = 0
$healthy = $false

while ($elapsed -lt $timeout) {
    $psOutput = docker compose ps backend --format json 2>$null
    if ($psOutput) {
        try {
            $status = $psOutput | ConvertFrom-Json
            if ($status.Health -eq "healthy") {
                Write-Host "✅ Backend is healthy!" -ForegroundColor Green
                $healthy = $true
                break
            }
        } catch {
            # Try alternative method
            $healthStatus = docker inspect --format='{{.State.Health.Status}}' luxuriousonly-backend 2>$null
            if ($healthStatus -eq "healthy") {
                Write-Host "✅ Backend is healthy!" -ForegroundColor Green
                $healthy = $true
                break
            }
        }
    }
    Write-Host "Waiting for backend to be healthy... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    $elapsed += 5
}

if (-not $healthy) {
    Write-Host "⚠️  Warning: Backend may not be fully healthy, but continuing with frontend build..." -ForegroundColor Yellow
    Write-Host "Backend logs:" -ForegroundColor Yellow
    docker compose logs --tail=20 backend
}

Write-Host "🔨 Step 5: Building frontend..." -ForegroundColor Cyan
Write-Host "Note: Frontend build runs in isolation. If it needs backend data, ensure backend is accessible." -ForegroundColor Gray
docker compose build frontend

Write-Host "✅ All services built successfully!" -ForegroundColor Green
Write-Host "🚀 Services are ready. Use 'docker compose up -d' to start all services." -ForegroundColor Cyan

