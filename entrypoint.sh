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

# Fix permissions
echo "Setting permissions..."
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Start PHP-FPM
echo "Starting PHP-FPM..."
exec "$@" 