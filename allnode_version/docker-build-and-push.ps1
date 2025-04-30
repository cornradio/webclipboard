# Define image name
$imageName = "kasusa/webclipboard-v2.0"

# Dynamically generate tag: Use current date and time
$tagPrefix = (Get-Date -Format "yyyyMMddHHmmss")
$fullTag = "${imageName}:${tagPrefix}"
$latestTag = "${imageName}:latest" # Define the latest tag

# 1. Build Docker image with both tags
Write-Host "Building Docker image with tags: $fullTag and $latestTag..."
# Build with the custom tag first
docker build -t "$fullTag" .

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker image build failed for $fullTag!"
    exit 1
} else {
    Write-Host "Docker image built successfully: $fullTag"
    # Tag the same image with :latest
    docker tag "$fullTag" "$latestTag"
    Write-Host "Docker image tagged successfully as: $latestTag"
}

# 2. Push both tags to registry
Write-Host "Pushing Docker image tags to registry..."
Write-Host "Pushing $fullTag..."
docker push "$fullTag"

# Check if push of custom tag was successful
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker image push failed for $fullTag!"
    exit 1
} else {
    Write-Host "Docker image pushed successfully: $fullTag"
}

Write-Host "Pushing $latestTag..."
docker push "$latestTag"

# Check if push of latest tag was successful
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker image push failed for $latestTag!"
    exit 1
} else {
    Write-Host "Docker image pushed successfully: $latestTag"
}

Write-Host "Docker build and push process completed."
