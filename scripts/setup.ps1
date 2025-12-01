# ==============================================
# Tournament Platform - Initial Setup Script (Windows)
# ==============================================

Write-Host "🚀 Starting Tournament Platform Setup..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Blue
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 20+ first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Blue
} catch {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Please update .env with your configuration!" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
npm install
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
Set-Location frontend
npm install
Set-Location ..
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Blue
npx prisma generate
Write-Host "✓ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Ask if user wants to run database migrations
$response = Read-Host "Do you want to run database migrations now? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "🗄️  Running database migrations..." -ForegroundColor Blue
    npx prisma migrate dev --name init
    Write-Host "✓ Database migrations completed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipping database migrations. Run 'npx prisma migrate dev' manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host "1. Update your .env file with production values"
Write-Host "2. Start development with: npm run dev:all:windows"
Write-Host "3. Or use Docker with: docker-compose up"
Write-Host ""
