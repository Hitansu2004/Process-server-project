#!/bin/bash

# Quick status check for all ProcessServe services

echo "🔍 ProcessServe Platform Status Check"
echo "======================================"
echo ""

echo "📊 Frontend Portals:"
echo "-------------------"

check_port() {
    port=$1
    name=$2
    if lsof -i :$port | grep -q LISTEN; then
        echo "✅ $name (Port $port): RUNNING"
    else
        echo "❌ $name (Port $port): NOT RUNNING"
    fi
}

check_port 3000 "Home Page      "
check_port 3001 "Delivery Portal"
check_port 3002 "Admin Panel    "
check_port 3003 "Super Admin    "
check_port 3004 "Customer Portal"

echo ""
echo "🔧 Backend Services:"
echo "-------------------"
check_port 8761 "Discovery Server"
check_port 8080 "API Gateway     "

echo ""
echo "======================================"
echo ""
echo "Portal URLs:"
echo "  🏠 Home Page:        http://localhost:3000"
echo "  🚚 Delivery Portal:  http://localhost:3001"
echo "  ⚙️  Admin Panel:      http://localhost:3002"
echo "  👑 Super Admin:      http://localhost:3003"
echo "  👥 Customer Portal:  http://localhost:3004"
echo ""
echo "To view logs: tail -f frontend/logs/*.log"
echo "======================================"
