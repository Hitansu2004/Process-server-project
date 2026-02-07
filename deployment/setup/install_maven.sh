#!/bin/bash

# ============================================
# Maven Installation Script
# ============================================
# Installs Apache Maven 3.9.11 (exact version match)
# ============================================

set -e

MAVEN_VERSION="3.9.11"
MAVEN_HOME="/opt/maven"

echo "📦 Installing Apache Maven $MAVEN_VERSION..."

# Download Maven
cd /tmp
wget https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.tar.gz

# Extract to /opt
sudo tar -xzf apache-maven-$MAVEN_VERSION-bin.tar.gz -C /opt
sudo mv /opt/apache-maven-$MAVEN_VERSION $MAVEN_HOME

# Set environment variables
echo "export M2_HOME=$MAVEN_HOME" | sudo tee -a /etc/environment > /dev/null
echo "export MAVEN_HOME=$MAVEN_HOME" | sudo tee -a /etc/environment > /dev/null
echo "export PATH=\$PATH:\$MAVEN_HOME/bin" | sudo tee -a /etc/environment > /dev/null

# Load environment variables
export M2_HOME=$MAVEN_HOME
export MAVEN_HOME=$MAVEN_HOME
export PATH=$PATH:$MAVEN_HOME/bin

# Add to profile
echo "export M2_HOME=$MAVEN_HOME" >> ~/.bashrc
echo "export MAVEN_HOME=$MAVEN_HOME" >> ~/.bashrc
echo "export PATH=\$PATH:\$MAVEN_HOME/bin" >> ~/.bashrc

# Cleanup
rm /tmp/apache-maven-$MAVEN_VERSION-bin.tar.gz

# Verify installation
echo ""
echo "✅ Maven installation complete!"
echo "Installed version:"
mvn -version
