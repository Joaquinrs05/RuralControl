# Dockerfile
FROM php:8.3-fpm

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl bcmath

# Instalar Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Crear directorio de trabajo
WORKDIR /var/www

# Copiar archivos de la app
COPY . .

# Instalar dependencias de PHP
RUN composer install

# Dar permisos necesarios a Laravel
RUN chown -R www-data:www-data /var/www && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Exponer el puerto para php artisan serve (opcional)
EXPOSE 8000
