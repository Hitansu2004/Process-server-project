#!/bin/bash

# ============================================
# Passwordless Sudo Configuration
# ============================================
# Configures passwordless sudo for ubuntu user
# Requires root password ONE TIME only
# ============================================

set -e

echo "🔐 Configuring passwordless sudo for ubuntu user..."

# Create sudoers file for ubuntu user
echo "ubuntu ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/ubuntu-nopasswd > /dev/null

# Set proper permissions
sudo chmod 0440 /etc/sudoers.d/ubuntu-nopasswd

# Verify configuration
sudo visudo -c -f /etc/sudoers.d/ubuntu-nopasswd

echo "✅ Passwordless sudo configured successfully!"
echo "Testing: Running 'sudo whoami' (should not ask for password)..."
sudo whoami

echo ""
echo "✅ Configuration complete! You will not be prompted for password again."
