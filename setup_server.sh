#!/bin/bash

# Server Setup Script for Ubuntu 24.10
# Usage: sudo ./setup_server.sh

echo "=========================================="
echo "🛠️  Setting up ProcessServe Environment"
echo "=========================================="

# 1. Update System
echo "🔄 Updating system packages..."
apt update && apt upgrade -y

# 2. Install Java 17 (OpenJDK)
echo "☕️ Installing OpenJDK 17..."
apt install -y openjdk-17-jdk maven

# 3. Install Node.js 20 (LTS)
echo "🟢 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 4. Install PM2
echo "🚀 Installing PM2..."
npm install -g pm2

# 5. Install & Configure Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx
echo "🔧 Configuring Nginx..."
cp ./nginx.conf /etc/nginx/sites-available/default
nginx -t
systemctl restart nginx

# 6. Configure Firewall (UFW)
echo "🛡️  Configuring Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 3000/tcp # Gateway Proxy
ufw allow 8080/tcp # API Gateway
# Enable UFW if not already enabled (be careful not to lock yourself out)
# ufw enable 

echo "=========================================="
echo "✅ Server Setup Complete!"
echo "=========================================="
echo "Java Version:"
java -version
echo "Node Version:"
node -v
echo "NPM Version:"
npm -v
echo "PM2 Version:"
pm2 -v
