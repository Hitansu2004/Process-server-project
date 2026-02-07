#!/bin/bash

# Configuration
SERVER_USER="ubuntu"
SERVER_IP="51.222.26.163"

echo "Restarting Discovery Server..."
ssh $SERVER_USER@$SERVER_IP "export PATH=/usr/bin:/bin:/usr/sbin:/sbin; sudo systemctl restart discovery-server"

echo "Restarting API Gateway..."
ssh $SERVER_USER@$SERVER_IP "export PATH=/usr/bin:/bin:/usr/sbin:/sbin; sudo systemctl restart api-gateway"

echo "Infrastructure restarted. Please wait 30-60 seconds for registration."
