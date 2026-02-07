#!/bin/bash

# ============================================
# MASTER SETUP SCRIPT
# ============================================
# Orchestrates complete server setup
# Stops before application deployment
# ============================================

set -e

SERVER_IP="51.222.26.163"
SERVER_USER="ubuntu"
DEPLOYMENT_DIR="/home/ubuntu/deployment"
REPORT_FILE="$DEPLOYMENT_DIR/setup_report.txt"

echo "============================================"
echo "🚀 PROCESSSERVE SERVER SETUP - PHASE 1"
echo "============================================"
echo "Server: $SERVER_IP"
echo "User: $SERVER_USER"
echo "$(date)"
echo "============================================"
echo ""

# Create report header
{
    echo "============================================"
    echo "PROCESSSERVE SERVER SETUP REPORT"
    echo "============================================"
    echo "Server: $SERVER_IP"
    echo "Started: $(date)"
    echo "============================================"
    echo ""
} > $REPORT_FILE

# Function to log
log_step() {
    echo ""
    echo "============================================"
    echo "$1"
    echo "============================================"
    echo ""
    echo "$1" >> $REPORT_FILE
}

# Step 1: Configure Passwordless Sudo
log_step "STEP 1: Configuring Passwordless Sudo"
bash configure_sudo.sh 2>&1 | tee -a $REPORT_FILE
echo "✅ Passwordless sudo configured" >> $REPORT_FILE

# Step 2: Update System
log_step "STEP 2: Updating System Packages"
sudo apt-get update 2>&1 | tee -a $REPORT_FILE
sudo apt-get upgrade -y 2>&1 | tee -a $REPORT_FILE
echo "✅ System updated" >> $REPORT_FILE

# Step 3: Install Java
log_step "STEP 3: Installing Java"
bash install_java.sh 2>&1 | tee -a $REPORT_FILE
echo "✅ Java installed" >> $REPORT_FILE

# Step 4: Install Maven
log_step "STEP 4: Installing Maven"
bash install_maven.sh 2>&1 | tee -a $REPORT_FILE
echo "✅ Maven installed" >> $REPORT_FILE

# Step 5: Install Node.js & npm
log_step "STEP 5: Installing Node.js & npm"
bash install_node.sh 2>&1 | tee -a $REPORT_FILE
echo "✅ Node.js installed" >> $REPORT_FILE

# Step 6: Install MySQL
log_step "STEP 6: Installing MySQL"
bash install_mysql.sh 2>&1 | tee -a $REPORT_FILE
echo "✅ MySQL installed" >> $REPORT_FILE

# Step 7: Install Nginx
log_step "STEP 7: Installing Nginx"
bash install_nginx.sh 2>&1 | tee -a $REPORT_FILE

# Copy nginx configuration
log_step "STEP 7b: Configuring Nginx"
sudo cp ../nginx.conf /etc/nginx/sites-available/ezcollab
sudo ln -sf /etc/nginx/sites-available/ezcollab /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
echo "✅ Nginx configured" >> $REPORT_FILE

# Step 8: Setup SSL
log_step "STEP 8: Setting up SSL Certificates"
bash setup_ssl.sh 2>&1 | tee -a $REPORT_FILE
echo "✅ SSL configured" >> $REPORT_FILE

# Step 9: Configure Firewall
log_step "STEP 9: Configuring Firewall"
bash configure_firewall.sh 2>&1 | tee -a $REPORT_FILE
echo "✅ Firewall configured" >> $REPORT_FILE

# Step 10: Create Application Directories
log_step "STEP 10: Creating Application Directories"
mkdir -p /home/ubuntu/apps
mkdir -p /home/ubuntu/logs
echo "✅ Application directories created" >> $REPORT_FILE

# Step 11: Run Verification
log_step "STEP 11: Running Verification"
bash verify_setup.sh 2>&1 | tee -a $REPORT_FILE

# Final Report
{
    echo ""
    echo "============================================"
    echo "SETUP COMPLETE - PHASE 1"
    echo "============================================"
    echo "Completed: $(date)"
    echo ""
    echo "📋 INSTALLED SOFTWARE:"
    echo "  - Java: $(java -version 2>&1 | head -1)"
    echo "  - Maven: $(mvn -version | head -1)"
    echo "  - Node: $(node -v)"
    echo "  - npm: $(npm -v)"
    echo "  - MySQL: $(mysql --version)"
    echo "  - Nginx: $(nginx -v 2>&1)"
    echo ""
    echo "🔥 FIREWALL STATUS:"
    sudo ufw status | grep -E 'Status|22|80|443'
    echo ""
    echo "🌐 DOMAINS CONFIGURED:"
    echo "  - https://ezcollab.com"
    echo "  - https://app.ezcollab.com"
    echo ""
    echo "✅ NEXT STEPS:"
    echo "  1. Review this setup report"
    echo "  2. Verify domain DNS is pointing to $SERVER_IP"
    echo "  3. Test domain access in browser"
    echo "  4. When ready, approve Discovery Service deployment"
    echo ""
    echo "⚠️  DEPLOYMENT READY BUT NOT STARTED"
    echo "  Discovery Service deployment awaits your approval"
    echo "  Run: ./deploy_discovery_service.sh (ONLY after approval)"
    echo ""
    echo "============================================"
} | tee -a $REPORT_FILE

echo ""
echo "📄 Full report saved to: $REPORT_FILE"
echo ""
echo "🛑 SETUP COMPLETE - AWAITING APPROVAL FOR DISCOVERY SERVICE DEPLOYMENT"
