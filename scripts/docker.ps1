# ==============================================
# Tournament Platform - Docker Management (Windows)
# ==============================================

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('up', 'down', 'restart', 'logs', 'clean')]
    [string]$Command
)

# Check if docker is installed
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker is not installed." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is installed
try {
    docker-compose --version | Out-Null
} catch {
    Write-Host "❌ docker-compose is not installed." -ForegroundColor Red
    exit 1
}

switch ($Command) {
    'up' {
        Write-Host "🐳 Starting Docker containers..." -ForegroundColor Blue
        docker-compose up -d
        Write-Host ""
        Write-Host "✅ Containers started!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Access your application:" -ForegroundColor Blue
        Write-Host "  Frontend: http://localhost:3001"
        Write-Host "  Backend API: http://localhost:3000/api/v1"
        Write-Host "  API Docs: http://localhost:3000/api"
        Write-Host "  PostgreSQL: localhost:5432"
        Write-Host "  Redis: localhost:6379"
        Write-Host ""
        Write-Host "View logs with: npm run docker:logs" -ForegroundColor Yellow
    }

    'down' {
        Write-Host "🛑 Stopping Docker containers..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✅ Containers stopped" -ForegroundColor Green
    }

    'restart' {
        Write-Host "🔄 Restarting Docker containers..." -ForegroundColor Yellow
        docker-compose restart
        Write-Host "✅ Containers restarted" -ForegroundColor Green
    }

    'logs' {
        Write-Host "📋 Showing container logs..." -ForegroundColor Blue
        docker-compose logs -f
    }

    'clean' {
        Write-Host "🧹 Cleaning up Docker resources..." -ForegroundColor Red
        $confirmation = Read-Host "This will remove ALL containers, volumes, and images. Continue? (y/n)"
        if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
            docker-compose down -v --rmi all
            Write-Host "✅ Cleanup completed" -ForegroundColor Green
        } else {
            Write-Host "Cleanup cancelled" -ForegroundColor Yellow
        }
    }
}
