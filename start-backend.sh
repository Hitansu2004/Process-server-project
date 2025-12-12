#!/bin/bash
# Script to build and start all backend services

export JAVA_HOME=$(/usr/libexec/java_home -v 17)

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
# Kill all backend service ports
kill_port 8761  # discovery-server
kill_port 8080  # api-gateway
kill_port 8082  # auth-service
kill_port 8083  # order-service
kill_port 8084  # tenant-service
kill_port 8085  # user-service
kill_port 8086  # notification-service

echo ""
echo "=== Building all backend services with Java 17 ==="

# Build all services
cd backend

# 1. Start Discovery Server (Eureka) - Must start first
echo ""
echo "1️⃣  Starting Discovery Server (Eureka) on port 8761..."
cd discovery-server
mvn spring-boot:run > ../logs/discovery-server.log 2>&1 &
DISCOVERY_PID=$!
cd ..
echo "   Started with PID: $DISCOVERY_PID"
echo "   ⏳ Waiting 30 seconds for Eureka to be ready..."
sleep 30

# Check Eureka status
if curl -s http://localhost:8761 > /dev/null 2>&1; then
    echo "   ✅ Discovery Server is UP and ready"
else
    echo "   ⚠️  Discovery Server may still be starting..."
fi

# 2. Start API Gateway
echo ""
echo "2️⃣  Starting API Gateway on port 8080..."
cd api-gateway
mvn spring-boot:run > ../logs/api-gateway.log 2>&1 &
cd ..
echo "   ✅ Started"
sleep 5

# 3. Start Auth Service  
echo ""
echo "3️⃣  Starting Auth Service..."
cd auth-service
mvn spring-boot:run > ../logs/auth-service.log 2>&1 &
cd ..
echo "   ✅ Started"
sleep 5

# 4. Start User Service
echo ""
echo "4️⃣  Starting User Service..."
cd user-service
mvn spring-boot:run > ../logs/user-service.log 2>&1 &
cd ..
echo "   ✅ Started"
sleep 5

# 5. Start Tenant Service
echo ""
echo "5️⃣  Starting Tenant Service..."
cd tenant-service
mvn spring-boot:run > ../logs/tenant-service.log 2>&1 &
cd ..
echo "   ✅ Started"
sleep 5

# 6. Start Order Service
echo ""
echo "6️⃣  Starting Order Service..."
cd order-service
mvn spring-boot:run > ../logs/order-service.log 2>&1 &
cd ..
echo "   ✅ Started"
sleep 5

# 7. Start Notification Service
echo ""
echo "7️⃣  Starting Notification Service..."
cd notification-service
mvn spring-boot:run > ../logs/notification-service.log 2>&1 &
cd ..
echo "   ✅ Started"

cd ..

echo ""
echo "=========================================="
echo "✨ All Backend Services Started!"
echo ""
echo "Services:"
echo "  🔍 Discovery Server: http://localhost:8761"
echo "  🌐 API Gateway:      http://localhost:8080"
echo "  🔐 Auth Service:     (registered with Eureka)"
echo "  👤 User Service:     (registered with Eureka)"
echo "  🏢 Tenant Service:   (registered with Eureka)"
echo "  📦 Order Service:    (registered with Eureka)"
echo "  🔔 Notification:     (registered with Eureka)"
echo ""
echo "📋 Logs: backend/logs/"
echo "⏳ Services will register with Eureka in ~30 seconds"
echo ""
echo "To stop: pkill -f 'java.*spring-boot'"
echo "=========================================="
