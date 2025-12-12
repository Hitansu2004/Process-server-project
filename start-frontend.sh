#!/bin/bash
# Script to start frontend gateway and all portal services

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

# Start all Frontend Portals with Gateway
# Run from project root directory

echo "🎨 Starting ProcessServe Frontend Gateway & Portals"
echo "=========================================="

# Kill existing frontend processes
echo "Stopping existing portals and gateway..."
pkill -f "next dev" 2>/dev/null
pkill -f "node server.js" 2>/dev/null
kill_port 3000  # Gateway
kill_port 3010  # Home (internal)
kill_port 3011  # Delivery (internal)
kill_port 3012  # Admin (internal)
kill_port 3013  # Super Admin (internal)
kill_port 3014  # Customer (internal)
sleep 2

# Create logs directory
mkdir -p frontend/logs

cd frontend

# 1. Home Page (Port 3010) - Internal
echo ""
echo "1️⃣  Starting Home Page on internal port 3010..."
cd home-page
npm run dev > ../logs/home-page.log 2>&1 &
cd ..
echo "   ✅ Started"
sleep 3

# 2. Delivery Portal (Port 3011 - Internal)
echo ""
echo "2️⃣  Starting Delivery Portal (Process Servers) on internal port 3011..."
cd delivery-portal
npm run dev > ../logs/delivery-portal.log 2>&1 &
cd ..
echo "   ✅ Started"
sleep 3

# 3. Admin Panel (Port 3012 - Internal)
echo ""
echo "3️⃣  Starting Admin Panel on internal port 3012..."
cd admin-panel
npm run dev > ../logs/admin-panel.log 2>&1 &
cd ..
echo "   ✅ Started"
sleep 3

# 4. Super Admin (Port 3013 - Internal)
echo ""
echo "4️⃣  Starting Super Admin on internal port 3013..."
cd super-admin
npm run dev > ../logs/super-admin.log 2>&1 &
cd ..
echo "   ✅ Started"
sleep 3

# 5. Customer Portal (Port 3014 - Internal)
echo ""
echo "5️⃣  Starting Customer Portal on internal port 3014..."
cd customer-portal
npm run dev > ../logs/customer-portal.log 2>&1 &
cd ..
echo "   ✅ Started"
sleep 3

# 6. API Gateway Proxy (Port 3000)
echo ""
echo "6️⃣  Starting Frontend API Gateway on port 3000..."
cd gateway-proxy
npm start > ../logs/gateway-proxy.log 2>&1 &
cd ..
echo "   ✅ Started"
sleep 2

cd ..

echo ""
echo "=========================================="
echo "✨ All Frontend Services Started!"
echo ""
echo "🌐 UNIFIED ACCESS via Gateway (Port 3000):"
echo "  🏠 Home Page:        http://localhost:3000/"
echo "  ⚙️  Admin Panel:      http://localhost:3000/admin"
echo "  👥 Customer Portal:  http://localhost:3000/customer"
echo "  🚚 Delivery Portal:  http://localhost:3000/delivery"
echo "  👑 Super Admin:      http://localhost:3000/super-admin"
echo "  🔌 Backend API:      http://localhost:3000/api"
echo ""
echo "🔧 Direct Portal Access (Internal Ports):"
echo "  🏠 Home:             http://localhost:3000"
echo "  🚚 Delivery:         http://localhost:3011"
echo "  ⚙️  Admin:            http://localhost:3012"
echo "  👑 Super Admin:      http://localhost:3013"
echo "  👥 Customer:         http://localhost:3014"
echo ""
echo "⚡ Performance Features Enabled:"
echo "  ✅ Image optimization (WebP/AVIF)"
echo "  ✅ GPU-accelerated scrolling"
echo "  ✅ Lazy loading with React Query"
echo "  ✅ Bundle compression (Gzip/Brotli)"
echo "  ✅ API request caching"
echo ""
echo "📋 Logs: frontend/logs/"
echo "⏳ All services will be ready in ~10 seconds"
echo ""
echo "To stop all: pkill -f 'next dev' && pkill -f 'node server.js'"
echo "=========================================="
