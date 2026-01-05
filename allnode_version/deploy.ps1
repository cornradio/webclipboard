# Deployment Script for WebClipboard
# This script builds, tests, pushes to Docker Hub, and exports a backup TAR.

# --- Configuration ---
$ImageRepo = "kasusa/webclipboard-v2.0"
$TimeTag = (Get-Date -Format "yyyyMMdd-HHmm")
$FullImageName = "${ImageRepo}:${TimeTag}"
$LatestImageName = "${ImageRepo}:latest"
$TarFileName = "webclipboard_v2.tar"
$LocalPort = 3000
$TestContainerName = "webclipboard-test"

Write-Host ">>> Starting Deployment Process <<<" -ForegroundColor Cyan

# 1. Build the Docker image
Write-Host "[1/4] Building Docker image..." -ForegroundColor Yellow
Write-Host "Tag 1: $FullImageName"
Write-Host "Tag 2: $LatestImageName"

docker build -t "$FullImageName" -t "$LatestImageName" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please check your Dockerfile or network." -ForegroundColor Red
    exit 1
}

# 2. Local Test Run
Write-Host "[2/4] Initializing local test run..." -ForegroundColor Yellow
# Stop existing test container if it exists
docker rm -f $TestContainerName 2>$null

Write-Host "Starting container $TestContainerName on port $LocalPort..."
docker run -d --name $TestContainerName -p ${LocalPort}:3000 "$LatestImageName"

Write-Host "Waiting 3 seconds for service to initialize..."
Start-Sleep -Seconds 3

Write-Host "`nTest URL: http://localhost:$LocalPort" -ForegroundColor Cyan
Write-Host "Please open the link above in your browser to verify the application." -ForegroundColor Gray
$userInput = Read-Host "Is the local test successful? (Type 'y' to continue pushing, any other key to abort)"

if ($userInput -ne "y") {
    Write-Host "Aborting deployment as per user request." -ForegroundColor Red
    docker stop $TestContainerName
    docker rm $TestContainerName
    exit 1
}

Write-Host "Cleaning up test container..."
docker stop $TestContainerName
docker rm $TestContainerName

# 3. Push to Docker Hub
Write-Host "[3/4] Pushing images to Docker Hub..." -ForegroundColor Yellow
Write-Host "Pushing $FullImageName ..."
docker push "$FullImageName"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed for timestamped tag. Are you logged in?" -ForegroundColor Red
    exit 1
}

Write-Host "Pushing $LatestImageName ..."
docker push "$LatestImageName"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed for 'latest' tag." -ForegroundColor Red
    exit 1
}
Write-Host "Docker Hub updated successfully!" -ForegroundColor Green
Write-Host "Check it here: https://hub.docker.com/r/$ImageRepo" -ForegroundColor Cyan

# 4. Save to Tar for local backup
Write-Host "[4/4] Creating local backup TAR: $TarFileName ..." -ForegroundColor Yellow
if (Test-Path $TarFileName) {
    Remove-Item $TarFileName
}
docker save -o $TarFileName "$LatestImageName"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Export failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Backup saved to $TarFileName" -ForegroundColor Green

Write-Host "`n>>> All tasks completed successfully! <<<" -ForegroundColor Cyan
Write-Host "Final Docker Hub URL: https://hub.docker.com/r/$ImageRepo" -ForegroundColor Green
