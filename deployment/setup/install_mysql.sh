#!/bin/bash

# ============================================
# MySQL Installation Script
# ============================================
# Installs MySQL 9.x (matching local: 9.5.0)
# Creates database and user
# ============================================

set -e

DB_NAME="processserve_db"
DB_USER="dbuser"
DB_PASSWORD="dbuser!!"
ROOT_PASSWORD="Love2work!!"

echo "🗄️  Installing MySQL Server..."

# Update package list
sudo apt-get update

# Install MySQL Server
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

echo "📊 Configuring MySQL..."

# Secure installation and set root password
sudo mysql <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$ROOT_PASSWORD';
FLUSH PRIVILEGES;
EOF

# Create database and user
sudo mysql -uroot -p"$ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

# Verify installation
echo ""
echo "✅ MySQL installation complete!"
echo "Installed version:"
mysql --version

echo ""
echo "Database created: $DB_NAME"
echo "User created: $DB_USER"

# Test connection
echo ""
echo "Testing database connection..."
mysql -u$DB_USER -p"$DB_PASSWORD" -e "SHOW DATABASES;" | grep $DB_NAME && echo "✅ Database connection successful!"
