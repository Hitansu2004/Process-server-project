#!/bin/bash
# Script to build and start all backend services

export JAVA_HOME=$(/usr/libexec/java_home -v 17)

echo "Building all backend services with Java 17..."

# Build all services
cd backend

# Build discovery server first
echo "Building discovery-server..."
cd discovery-server && mvn clean install -DskipTests && cd ..

# Build other services
for service in api-gateway auth-service tenant-service user-service notification-service order-service; do
  echo "Building $service..."
  cd $service && mvn clean install -DskipTests && cd ..
done

# Order service already built
echo "All services built successfully!"

cd ..

echo "Starting services..."

# Start discovery server first
echo "Starting discovery-server on port 8761..."
cd backend/discovery-server
nohup java -jar target/*.jar > /tmp/discovery-server.log 2>&1 &
echo $! > /tmp/discovery-server.pid
cd ../..
sleep 10

# Start other services
echo "Starting auth-service on port 8082..."
cd backend/auth-service
nohup java -jar target/*.jar > /tmp/auth-service.log 2>&1 &
echo $! > /tmp/auth-service.pid
cd ../..
sleep 3

echo "Starting tenant-service on port 8084..."
cd backend/tenant-service
nohup java -jar target/*.jar > /tmp/tenant-service.log 2>&1 &
echo $! > /tmp/tenant-service.pid
cd ../..
sleep 3

echo "Starting user-service on port 8085..."
cd backend/user-service
nohup java -jar target/*.jar > /tmp/user-service.log 2>&1 &
echo $! > /tmp/user-service.pid
cd ../..
sleep 3

echo "Starting notification-service on port 8086..."
cd backend/notification-service
nohup java -jar target/*.jar > /tmp/notification-service.log 2>&1 &
echo $! > /tmp/notification-service.pid
cd ../..
sleep 3

# Start order-service
echo "Starting order-service on port 8083..."
cd backend/order-service
nohup java -jar target/*.jar > /tmp/order-service.log 2>&1 &
echo $! > /tmp/order-service.pid
cd ../..
sleep 3

# Start API Gateway last
echo "Starting api-gateway on port 8080..."
cd backend/api-gateway
nohup java -jar target/*.jar > /tmp/api-gateway.log 2>&1 &
echo $! > /tmp/api-gateway.pid
cd ../..
sleep 5

echo "All backend services started!"
echo "Discovery Server: http://localhost:8761"
echo "API Gateway: http://localhost:8080"
echo "Auth Service: http://localhost:8082"
echo "Order Service: http://localhost:8083"
echo "Tenant Service: http://localhost:8084"
echo "User Service: http://localhost:8085"
echo "Notification Service: http://localhost:8086"
