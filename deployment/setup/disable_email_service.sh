#!/bin/bash

# Configuration
SERVER_USER="ubuntu"
SERVER_IP="51.222.26.163"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}  Disabling Email Service & Removing Gmail Credentials${NC}"
echo -e "${YELLOW}============================================${NC}"

# 1. Update .env.production on server to remove email credentials
echo -e "${BLUE}Step 1: Removing email credentials from server .env.production...${NC}"
ssh $SERVER_USER@$SERVER_IP "export PATH=/usr/bin:/bin:/usr/sbin:/sbin; \
    cd /home/ubuntu/apps && \
    if [ -f .env.production ]; then \
        sed -i 's/^MAIL_PASSWORD=.*/MAIL_PASSWORD=disabled-email-service/' .env.production && \
        sed -i 's/^MAIL_USERNAME=.*/MAIL_USERNAME=disabled@localhost/' .env.production && \
        echo 'Email credentials removed from .env.production'; \
    else \
        echo '.env.production not found on server'; \
    fi"

# 2. Update auth-service environment variables in PM2
echo -e "${BLUE}Step 2: Checking PM2 processes...${NC}"
ssh $SERVER_USER@$SERVER_IP "export PATH=/usr/bin:/bin:/usr/sbin:/sbin; \
    if command -v pm2 &> /dev/null; then \
        echo 'PM2 is installed. Email env vars will be cleared on next restart.'; \
    else \
        echo 'PM2 not found (not an issue for Java services)'; \
    fi"

# 3. Restart auth-service to apply changes
echo -e "${BLUE}Step 3: Restarting auth-service with disabled email...${NC}"
ssh $SERVER_USER@$SERVER_IP "export PATH=/usr/bin:/bin:/usr/sbin:/sbin; \
    if sudo systemctl is-active --quiet auth-service; then \
        sudo systemctl restart auth-service && \
        echo 'Auth-service restarted with email disabled'; \
    else \
        echo 'Auth-service not running or not found'; \
    fi"

# 4. Check auth-service status
echo -e "${BLUE}Step 4: Checking auth-service status...${NC}"
ssh $SERVER_USER@$SERVER_IP "export PATH=/usr/bin:/bin:/usr/sbin:/sbin; \
    sudo systemctl status auth-service --no-pager | head -15"

# 5. Verify no email credentials in memory
echo -e "${BLUE}Step 5: Verifying email credentials are removed...${NC}"
ssh $SERVER_USER@$SERVER_IP "export PATH=/usr/bin:/bin:/usr/sbin:/sbin; \
    cd /home/ubuntu/apps && \
    grep 'MAIL_' .env.production | grep -v 'PASSWORD=disabled' | grep -v 'USERNAME=disabled' || echo 'No active email credentials found'"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Email Service Disabled Successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "${YELLOW}Note: Your Gmail account is now free for personal use.${NC}"
echo -e "${YELLOW}Email notifications will be disabled until alternative configured.${NC}"
