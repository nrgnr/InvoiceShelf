#!/bin/bash

# A convenient script to build the application inside Docker
# This handles the TipTap PM fix and builds the application

set -e # Exit on any error

echo "🐳 Running build in Docker container..."

# Copy our fix scripts to the container
echo "📂 Copying fix scripts to container..."
docker compose cp fix-tiptap-docker.js invoiceshelf-app:/var/www/html/ 2>/dev/null || true
docker compose cp tiptap-pm-proxy.js invoiceshelf-app:/var/www/html/ 2>/dev/null || true
docker compose cp docker-build.sh invoiceshelf-app:/var/www/html/

# Run the build script in the container
echo "🚀 Starting build process in container..."
docker compose exec invoiceshelf-app bash /var/www/html/docker-build.sh

echo "✅ Docker build process completed!" 