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

# Apply direct fix to @tiptap/pm
echo "🔧 Applying TipTap PM fix..."
node fix-tiptap-docker.js

# Attempt build
echo "🚀 Starting build process..."
NODE_ENV=production npm run build

echo "✅ Build completed!" 