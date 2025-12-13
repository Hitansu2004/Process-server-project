#!/bin/bash

# Ports to free up
PORTS="3000 3001 3002 3003 3004"

echo "Killing processes on ports: $PORTS"
for port in $PORTS; do
  pid=$(lsof -ti :$port)
  if [ -n "$pid" ]; then
    echo "Killing process on port $port (PID: $pid)"
    kill -9 $pid
  fi
done

echo "Starting Frontend Services..."

# Function to start a portal
start_portal() {
    local dir=$1
    local name=$2
    local port=$3
    
    echo "Starting $name on port $port..."
    cd "frontend/$dir" || exit
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies for $name..."
        npm install > /dev/null 2>&1
    fi
    
    # Start dev server
    nohup npm run dev > "../logs/${name}.log" 2>&1 &
    echo "✅ $name started (PID: $!)"
    cd ../..
}

# Create logs directory
mkdir -p frontend/logs

# Start each portal
start_portal "home-page" "Home Page" "3000"
start_portal "delivery-portal" "Delivery Portal" "3001"
start_portal "admin-panel" "Admin Panel" "3002"
start_portal "super-admin" "Super Admin" "3003"
start_portal "customer-portal" "Customer Portal" "3004"

echo ""
echo "================================================"
echo "✨ All portals are starting up!"
echo "Check logs in frontend/logs/ for details."
echo ""
echo "Portal URLs:"
echo "  🏠 Home Page:        http://localhost:3000"
echo "  🚚 Delivery Portal:  http://localhost:3001"
echo "  ⚙️  Admin Panel:      http://localhost:3002"
echo "  👑 Super Admin:      http://localhost:3003"
echo "  👥 Customer Portal:  http://localhost:3004"
