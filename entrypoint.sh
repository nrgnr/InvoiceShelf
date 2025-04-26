#!/bin/sh
set -e

# Wait for MySQL to be ready (if needed)
if [ -n "$DB_HOST" ]; then
    echo "Waiting for MySQL to be ready..."
    while ! nc -z $DB_HOST $DB_PORT; do
        sleep 1
    done
    echo "MySQL is ready!"
fi

# Install dependencies if needed
if [ ! -d "vendor" ]; then
    echo "Installing dependencies..."
    composer install --no-interaction --no-dev --optimize-autoloader
fi

# Install Node.js dependencies and build assets if in production
if [ "$APP_ENV" = "production" ]; then
    echo "Installing Node.js dependencies..."
    # Force npm to ignore engine requirements
    npm config set engine-strict false
    # Install all dependencies including dev dependencies needed for build
    npm install --no-audit --no-fund
    
    # Skip copy and create patch files directly
    echo "Creating patch files directly in the container..."
    mkdir -p patches
    
    # No need to copy/create patch file since we apply fixes directly

    # Add debug logging for @tiptap/pm issue
    echo "==== DEBUGGING @tiptap/pm ISSUE ===="
    echo "Checking if @tiptap/pm package exists:"
    if [ -d "node_modules/@tiptap/pm" ]; then
        echo "✅ @tiptap/pm directory found"
        
        echo "Package.json content:"
        cat node_modules/@tiptap/pm/package.json | grep -A 10 '"exports": {'
        
        echo "Checking for index files:"
        ls -la node_modules/@tiptap/pm/index* || echo "❌ No index files found"
        
        echo "Applying manual fix for @tiptap/pm..."
        # Create index.js if it doesn't exist
        if [ ! -f "node_modules/@tiptap/pm/index.js" ]; then
            echo "Creating index.js..."
            echo 'export * from "./state/dist/index.js"' > node_modules/@tiptap/pm/index.js
            echo "✅ index.js created"
        fi
        
        # Check if '.' export exists in package.json
        if ! grep -q '"."' node_modules/@tiptap/pm/package.json; then
            echo "Adding root export to package.json..."
            # Using temp file for sed on macOS/Linux compatibility
            sed -i.bak '/"exports": {/a \    ".": {\n      "types": "./state/dist/index.d.ts",\n      "import": "./index.js",\n      "require": "./state/dist/index.cjs"\n    },' node_modules/@tiptap/pm/package.json
            rm -f node_modules/@tiptap/pm/package.json.bak
            echo "✅ Root export added to package.json"
        fi
        
        echo "After fixes, package.json exports:"
        cat node_modules/@tiptap/pm/package.json | grep -A 10 '"exports": {'
    else
        echo "❌ @tiptap/pm directory not found!"
        echo "Checking npm list:"
        npm list @tiptap/pm
    fi
    echo "==== END DEBUGGING ===="

    echo "Building frontend assets..."
    # Use more verbose logging for the build
    export NODE_OPTIONS="--trace-warnings"
    # Redirect stderr to a log file while still showing it on the console
    NODE_ENV=production npm run build 2>&1 | tee /tmp/vite-build.log

    # Check build result and provide debugging if it failed
    if [ $? -ne 0 ]; then
        echo "❌ Build failed!"
        echo "Checking for @tiptap/pm errors in build log:"
        grep -i tiptap /tmp/vite-build.log
        
        echo "Trying alternative solution - directly modify node_modules with brute force approach..."
        # Create a minimal export file
        mkdir -p node_modules/@tiptap/pm/dist
        echo 'export * from "./state/dist/index.js";' > node_modules/@tiptap/pm/dist/index.js
        echo '{
          "name": "@tiptap/pm",
          "type": "module",
          "exports": {
            ".": {
              "import": "./dist/index.js",
              "require": "./state/dist/index.cjs"
            },
            "./state": {
              "import": "./state/dist/index.js",
              "require": "./state/dist/index.cjs"
            }
          }
        }' > node_modules/@tiptap/pm/package.json
        
        echo "Retrying build with forced fix..."
        NODE_ENV=production npm run build
    else
        echo "✅ Build completed successfully"
    fi

    # After build, we can remove dev dependencies
    echo "Removing development dependencies..."
    npm prune --production
fi

# Ensure Laravel key exists
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Clear and cache config
echo "Optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations (safe if SESSION_DRIVER=database)
echo "Running migrations..."
php artisan migrate --force

# Set up storage and bootstrap cache
echo "Setting up storage..."
php artisan storage:link
mkdir -p /var/www/html/storage/app/public
mkdir -p /var/www/html/storage/framework/{sessions,views,cache}
mkdir -p /var/www/html/storage/logs

# Fix permissions
echo "Setting permissions..."
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
find /var/www/html/storage -type d -exec chmod 775 {} \;
find /var/www/html/storage -type f -exec chmod 664 {} \;
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Create database marker if not exists
if [ ! -f "/var/www/html/storage/app/database_created" ]; then
    echo "Creating database marker..."
    echo "$(date +%s)" > /var/www/html/storage/app/database_created
    chown www-data:www-data /var/www/html/storage/app/database_created
fi

# Clear cache one more time to ensure clean state
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Start PHP-FPM
echo "Starting PHP-FPM..."
exec "$@" 