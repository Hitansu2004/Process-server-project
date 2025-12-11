#!/bin/bash
# Script to start all frontend services

# Function to kill process on a specific port
kill_port() {
    local port=$1
    echo "Checking for processes on port $port..."
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process $pid on port $port..."
        kill -9 $pid 2>/dev/null
        sleep 1
    else
        echo "No process found on port $port"
    fi
}

echo "=== Cleaning up existing processes ==="
# Kill all frontend service ports
kill_port 3000  # customer-portal
kill_port 3001  # delivery-portal
kill_port 3002  # admin-panel
kill_port 3003  # super-admin

echo ""
echo "=== Starting all frontend applications ==="

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
