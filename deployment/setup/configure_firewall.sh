#!/bin/bash

# ============================================
# Firewall Configuration Script
# ============================================
# Configures UFW to allow only necessary ports
# ============================================

set -e

echo "🔥 Configuring UFW firewall..."

# Install UFW if not installed
sudo apt-get update
sudo apt-get install -y ufw

# Reset UFW to default settings
sudo ufw --force reset

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (port 22) - CRITICAL: Don't lock yourself out!
sudo ufw allow 22/tcp comment 'SSH'

# Allow HTTP (port 80)
sudo ufw allow 80/tcp comment 'HTTP'

# Allow HTTPS (port 443)
sudo ufw allow 443/tcp comment 'HTTPS'

# Deny direct access to application ports (force through nginx)
# Backend services: 8080-8085
sudo ufw deny 8080:8085/tcp comment 'Backend services - blocked (use nginx)'

# Eureka
sudo ufw deny 8761/tcp comment 'Eureka - blocked (use nginx)'

# Frontend services: 3000-3005
sudo ufw deny 3000:3005/tcp comment 'Frontend services - blocked (use nginx)'

# MySQL - only localhost access
sudo ufw deny 3306/tcp comment 'MySQL - blocked (localhost only)'

# Enable UFW
sudo ufw --force enable

# Show status
echo ""
echo "✅ Firewall configured successfully!"
echo ""
sudo ufw status verbose

echo ""
echo "📋 Summary:"
echo "  ✅ Allowed: SSH (22), HTTP (80), HTTPS (443)"
echo "  ❌ Blocked: Application ports (must use nginx reverse proxy)"
