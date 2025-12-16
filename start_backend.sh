#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

# Ports to free up
# Set JAVA_HOME to Java 17 if needed (optional, can use system default)
export JAVA_HOME="/usr/local/Cellar/openjdk@17/17.0.16/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

PORTS="8761 8080 8081 8082 8083 8084 8085"

echo "Killing processes on ports: $PORTS"
for port in $PORTS; do
  pid=$(lsof -ti :$port)
  if [ -n "$pid" ]; then
    echo "Killing process on port $port (PID: $pid)"
    kill -9 $pid
  fi
done

echo "Starting Backend Services..."

# Function to start a service
start_service() {
  service_name=$1
  dir_name=$2
  echo "Starting $service_name..."
  cd "$PROJECT_ROOT/backend/$dir_name" || exit
  nohup mvn spring-boot:run > "$PROJECT_ROOT/backend/${dir_name}.log" 2>&1 &
  cd "$PROJECT_ROOT" || exit
}

# 1. Eureka Server
start_service "Discovery Server" "discovery-server"
echo "Waiting for Discovery Server to initialize (20s)..."
sleep 20

# 2. API Gateway
start_service "API Gateway" "api-gateway"
echo "Waiting for API Gateway to initialize (15s)..."
sleep 15

# 3. Other Services
start_service "Auth Service" "auth-service"
start_service "Tenant Service" "tenant-service"
start_service "Order Service" "order-service"
start_service "Notification Service" "notification-service"
start_service "User Service" "user-service"

echo "All backend services triggered. Check logs in respective directories for status."
echo "Discovery Server: http://localhost:8761"
echo "API Gateway: http://localhost:8080"
