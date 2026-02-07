#!/bin/bash

# ============================================
# SSL/HTTPS Setup Script
# ============================================
# Uses Let's Encrypt to obtain SSL certificates
# Configures automatic renewal
# ============================================

set -e

DOMAIN1="ezcollab.com"
DOMAIN2="app.ezcollab.com"
EMAIL="hitansu0007@gmail.com"

echo "🔒 Setting up SSL certificates with Let's Encrypt..."

# Update package list
sudo apt-get update

# Install Certbot and Nginx plugin
sudo apt-get install -y certbot python3-certbot-nginx

echo "📜 Obtaining SSL certificates for $DOMAIN1 and $DOMAIN2..."

# Obtain SSL certificates
# Note: This will automatically modify nginx configuration
sudo certbot --nginx -d $DOMAIN1 -d $DOMAIN2 --non-interactive --agree-tos -m $EMAIL --redirect

# Test automatic renewal
echo "🔄 Testing automatic renewal..."
sudo certbot renew --dry-run

# Enable automatic renewal via systemd timer
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo ""
echo "✅ SSL certificates obtained and configured!"
echo "Certificates location: /etc/letsencrypt/live/$DOMAIN1/"
echo "Automatic renewal enabled via systemd timer"

# Verify nginx configuration
sudo nginx -t

# Reload nginx to apply changes
sudo systemctl reload nginx

echo ""
echo "🌐 HTTPS is now enabled for:"
echo "  - https://$DOMAIN1"
echo "  - https://$DOMAIN2"
