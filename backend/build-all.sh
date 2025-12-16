#!/bin/bash

# Build all backend services
# Run from the backend directory

echo "🚀 Starting Backend Build Process..."
echo "===================================="

# Function to build a service
build_service() {
    local service=$1
    echo "🔨 Building $service..."
    cd "$service" || exit
    mvn clean package -DskipTests
    if [ $? -ne 0 ]; then
        echo "❌ Build failed for $service"
        exit 1
    fi
    echo "✅ $service built successfully"
    cd ..
    echo ""
}

# Build shared library first
build_service "shared"

# Build other services
build_service "discovery-server"
build_service "api-gateway"
build_service "auth-service"
build_service "user-service"
build_service "tenant-service"
build_service "order-service"
build_service "notification-service"

echo "===================================="
echo "✨ All backend services built successfully!"
