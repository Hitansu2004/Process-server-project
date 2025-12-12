#!/bin/bash

# Start all frontend portals for ProcessServe Platform
# Run from the frontend directory

echo "🚀 Starting ProcessServe Platform - All Portals"
echo "================================================"
echo ""

# Function to start a portal in the background
start_portal() {
    local dir=$1
    local name=$2
    local port=$3
    
    echo "Starting $name on port $port..."
    cd "$dir" || exit
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies for $name..."
        npm install > /dev/null 2>&1
    fi
    
    # Start dev server
    npm run dev > "../logs/${name}.log" 2>&1 &
    echo "✅ $name started (PID: $!)"
    cd ..
}

# Create logs directory
mkdir -p logs

# Start each portal
echo "🏠 Starting Home Page (Port 3000)..."
start_portal "home-page" "Home Page" "3000"

echo "🚚 Starting Delivery Portal (Port 3001)..."
start_portal "delivery-portal" "Delivery Portal" "3001"

echo "⚙️  Starting Admin Panel (Port 3002)..."
start_portal "admin-panel" "Admin Panel" "3002"

echo "👑 Starting Super Admin (Port 3003)..."
start_portal "super-admin" "Super Admin" "3003"

echo "👥 Starting Customer Portal (Port 3004)..."
start_portal "customer-portal" "Customer Portal" "3004"

echo ""
echo "================================================"
echo "✨ All portals are starting up!"
echo ""
echo "Portal URLs:"
echo "  🏠 Home Page:        http://localhost:3000"
echo "  🚚 Delivery Portal:  http://localhost:3001"
echo "  ⚙️  Admin Panel:      http://localhost:3002"
echo "  👑 Super Admin:      http://localhost:3003"
echo "  👥 Customer Portal:  http://localhost:3004"
echo ""
echo "Logs are being written to: ./logs/"
echo ""
echo "To stop all portals, run: pkill -f 'next dev'"
echo "================================================"
