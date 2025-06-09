CREATE DATABASE IF NOT EXISTS users_service;
CREATE DATABASE IF NOT EXISTS houses_service;

GRANT ALL PRIVILEGES ON users_service.* TO 'joaquin'@'%';
GRANT ALL PRIVILEGES ON houses_service.* TO 'joaquin'@'%';

FLUSH PRIVILEGES;
