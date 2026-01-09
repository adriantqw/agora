#!/bin/bash

# Docker Build and Push Script for Agora Frontend
# Usage: ./docker-deploy.sh [tag]
# Example: ./docker-deploy.sh v1.0.0
# Default tag: latest

# Set the tag (default to 'latest' if not provided)
TAG="${1:-latest}"

# Docker registry configuration
REGISTRY="us-central1-docker.pkg.dev"
PROJECT="agora-483710"
REPOSITORY="agora-frontend"
IMAGE_NAME="agora-frontend"

# Full image path
IMAGE_PATH="${REGISTRY}/${PROJECT}/${REPOSITORY}/${IMAGE_NAME}:${TAG}"

# Navigate to the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo "========================================="
echo "Building and pushing Docker image"
echo "Tag: $TAG"
echo "Image: $IMAGE_PATH"
echo "========================================="

# Build the Docker image
echo ""
echo "Building Docker image..."
docker build --platform linux/amd64 --target production -t "$IMAGE_PATH" .

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Error: Docker build failed"
    exit 1
fi

echo ""
echo "Build successful!"
echo ""

# Push the Docker image
echo "Pushing Docker image..."
docker push "$IMAGE_PATH"

# Check if push was successful
if [ $? -ne 0 ]; then
    echo "Error: Docker push failed"
    exit 1
fi

echo ""
echo "========================================="
echo "Successfully deployed!"
echo "Image: $IMAGE_PATH"
echo "========================================="
