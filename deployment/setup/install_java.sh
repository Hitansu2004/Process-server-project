#!/bin/bash

# ============================================
# Java Installation Script
# ============================================
# Installs OpenJDK 17 (matching local: 17.0.16)
# ============================================

set -e

echo "☕ Installing OpenJDK 17..."

# Update package list
sudo apt-get update

# Install OpenJDK 17
sudo apt-get install -y openjdk-17-jdk openjdk-17-jre

# Set JAVA_HOME
JAVA_HOME_PATH=$(dirname $(dirname $(readlink -f $(which java))))
echo "export JAVA_HOME=$JAVA_HOME_PATH" | sudo tee -a /etc/environment > /dev/null
echo "export PATH=\$PATH:\$JAVA_HOME/bin" | sudo tee -a /etc/environment > /dev/null

# Load environment variables
export JAVA_HOME=$JAVA_HOME_PATH
export PATH=$PATH:$JAVA_HOME/bin

# Add to profile for all users
echo "export JAVA_HOME=$JAVA_HOME_PATH" >> ~/.bashrc
echo "export PATH=\$PATH:\$JAVA_HOME/bin" >> ~/.bashrc

# Verify installation
echo ""
echo "✅ Java installation complete!"
echo "Installed version:"
java -version
echo ""
echo "JAVA_HOME: $JAVA_HOME"
