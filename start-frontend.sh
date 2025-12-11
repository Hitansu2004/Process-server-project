#!/bin/bash
# Script to start all frontend services

echo "Starting all frontend applications..."

# Start Customer Portal
echo "Starting Customer Portal on port 3000..."
cd frontend/customer-portal
nohup npm run dev > /tmp/customer-portal.log 2>&1 &
echo $! > /tmp/customer-portal.pid
cd ../..
sleep 5

# Start Delivery Portal
echo "Starting Delivery Portal on port 3001..."
cd frontend/delivery-portal
nohup npm run dev > /tmp/delivery-portal.log 2>&1 &
echo $! > /tmp/delivery-portal.pid
cd ../..
sleep 5

# Start Admin Panel
echo "Starting Admin Panel on port 3002..."
cd frontend/admin-panel
nohup npm run dev > /tmp/admin-panel.log 2>&1 &
echo $! > /tmp/admin-panel.pid
cd ../..
sleep 5

# Start Super Admin
echo "Starting Super Admin on port 3003..."
cd frontend/super-admin
nohup npm run dev > /tmp/super-admin.log 2>&1 &
echo $! > /tmp/super-admin.pid
cd ../..
sleep 5

echo "All frontend services started!"
echo "Customer Portal: http://localhost:3000"
echo "Delivery Portal: http://localhost:3001"
echo "Admin Panel: http://localhost:3002"
echo "Super Admin: http://localhost:3003"
