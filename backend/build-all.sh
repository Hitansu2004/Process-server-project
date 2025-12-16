#!/bin/bash

# Build all backend services
# This script can be run from anywhere

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR"

# Set JAVA_HOME to Java 17
export JAVA_HOME="/usr/local/Cellar/openjdk@17/17.0.16/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

echo "🚀 Starting Backend Build Process..."
echo "Using Java: $(java -version 2>&1 | head -n 1)"
echo "===================================="

# Function to build a service
build_service() {
    local service=$1
    local goal=$2
    
    if [ -z "$goal" ]; then
        goal="package"
    fi

    echo "🔨 Building $service..."
    cd "$BACKEND_DIR/$service" || exit
    mvn clean $goal -DskipTests
    if [ $? -ne 0 ]; then
        echo "❌ Build failed for $service"
        exit 1
    fi
    echo "✅ $service built successfully"
    echo ""
}

# Build shared library first (install to local repo)
build_service "shared" "install"

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
