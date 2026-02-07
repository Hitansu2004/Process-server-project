#!/bin/bash

# ============================================
# Nginx Installation & Configuration Script
# ============================================
# Installs nginx and configures reverse proxy
# ============================================

set -e

echo "🌐 Installing Nginx..."

# Update package list
sudo apt-get update

# Install Nginx
sudo apt-get install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo "📝 Configuring Nginx for ezcollab.com and app.ezcollab.com..."

# Backup default config if exists
if [ -f /etc/nginx/sites-available/default ]; then
    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
fi

# Note: nginx.conf will be copied by master_setup.sh
# This script just ensures nginx is installed

# Test nginx configuration
sudo nginx -t

echo ""
echo "✅ Nginx installation complete!"
echo "Status:"
sudo systemctl status nginx --no-pager | head -5
