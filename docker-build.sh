#!/bin/bash

# docker-build.sh
# Unified script to build the project in Docker environment

set -e # Exit on any error

echo "🔧 Building InvoiceShelf in Docker..."

# Ensure we're in the correct directory
cd /var/www/html

# Make sure node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing Node.js dependencies..."
  npm ci || npm install
fi

# Make sure our proxy file exists in the Docker container
if [ ! -f "tiptap-pm-proxy.js" ]; then
  echo "⚠️ Missing TipTap/PM proxy file, creating it..."
  # Copy from host if available
  cp -f /var/www/html/tiptap-pm-proxy.js /var/www/html/ 2>/dev/null || true
fi

# Attempt build
echo "🚀 Starting build process..."
NODE_ENV=production npm run build

echo "✅ Build completed!" 