#!/bin/bash

# A convenient script to build the application inside Docker
# This handles the TipTap PM fix and builds the application

set -e # Exit on any error

echo "🐳 Running build in Docker container..."

# Copy our fix script to the container
echo "📂 Copying fix script to container..."
docker compose cp fix-tiptap-docker.js invoiceshelf-app:/var/www/html/

# Copy our build script
echo "📂 Copying build script to container..."
docker compose cp docker-build.sh invoiceshelf-app:/var/www/html/

# Run the build script in the container
echo "🚀 Starting build process in container..."
docker compose exec invoiceshelf-app bash /var/www/html/docker-build.sh

echo "✅ Docker build process completed!" 