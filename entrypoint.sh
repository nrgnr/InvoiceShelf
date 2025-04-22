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

    echo "Building frontend assets..."
    NODE_ENV=production npm run build

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