#!/bin/bash

# Configuration
SERVER_IP="51.222.26.163"
USER="ubuntu"
LOCAL_CONFIG="nginx_ssl.conf"
REMOTE_DIR="/home/ubuntu/deployment"
REMOTE_CONFIG="$REMOTE_DIR/nginx.conf"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Updating Nginx configuration on $SERVER_IP...${NC}"

# Define PATH for remote commands
REMOTE_PATH="export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# 1. Create remote directory
echo -e "${GREEN}Creating remote directory...${NC}"
ssh "$USER@$SERVER_IP" "$REMOTE_PATH && mkdir -p $REMOTE_DIR"

# 2. Transfer config
echo -e "${GREEN}Transferring nginx.conf...${NC}"
scp "$LOCAL_CONFIG" "$USER@$SERVER_IP:$REMOTE_CONFIG"

# 3. Apply and Reload
echo -e "${GREEN}Applying configuration...${NC}"
ssh "$USER@$SERVER_IP" "$REMOTE_PATH && sudo cp $REMOTE_CONFIG /etc/nginx/sites-available/ezcollab && sudo nginx -t && sudo systemctl reload nginx"

echo -e "${GREEN}Nginx configuration updated!${NC}"
