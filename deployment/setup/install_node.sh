#!/bin/bash

# ============================================
# Node.js & npm Installation Script
# ============================================
# Installs Node.js 24.6.0 and npm 11.5.1
# Uses NodeSource repository
# ============================================

set -e

NODE_MAJOR=24

echo "🟢 Installing Node.js v$NODE_MAJOR and npm..."

# Update package list
sudo apt-get update

# Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg

# Create keyrings directory
sudo mkdir -p /etc/apt/keyrings

# Download and add NodeSource GPG key
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

# Add NodeSource repository
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# Update package list with new repository
sudo apt-get update

# Install Node.js (includes npm)
sudo apt-get install -y nodejs

# Verify installation
echo ""
echo "✅ Node.js and npm installation complete!"
echo "Installed versions:"
node -v
npm -v
