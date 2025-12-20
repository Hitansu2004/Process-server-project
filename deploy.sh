#!/bin/bash

# ProcessServe Deployment Script
# Usage: ./deploy.sh

echo "=========================================="
echo "🚀 Starting Deployment Process"
echo "=========================================="

# 1. Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# 1.5 Install Root Dependencies (dotenv for PM2)
echo "📦 Installing root dependencies..."
npm install dotenv

# 2. Build Backend Services
echo "☕️ Building Backend Services (Maven)..."
# We can build all from the root if there is a parent pom, or iterate.
# Since there isn't a root pom shown in the file list, we'll iterate or assume independent builds.
# Based on previous steps, we built them individually. Let's try to build them efficiently.

# List of backend services
BACKEND_SERVICES=(
    "backend/discovery-server"
    "backend/api-gateway"
    "backend/auth-service"
    "backend/user-service"
    "backend/tenant-service"
    "backend/order-service"
    "backend/notification-service"
)

for service in "${BACKEND_SERVICES[@]}"; do
    echo "🔨 Building $service..."
    cd $service
    mvn clean package -DskipTests
    if [ $? -ne 0 ]; then
        echo "❌ Build failed for $service"
        exit 1
    fi
    cd - > /dev/null
done

# 3. Build Frontend Services
echo "⚛️ Building Frontend Services (Next.js)..."

FRONTEND_SERVICES=(
    "frontend/gateway-proxy"
    "frontend/home-page"
    "frontend/customer-portal"
    "frontend/process-server-portal"
    "frontend/admin-panel"
    "frontend/super-admin"
)

for service in "${FRONTEND_SERVICES[@]}"; do
    echo "🔨 Building $service..."
    cd $service
    npm install
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed for $service"
        exit 1
    fi
    cd - > /dev/null
done

# 4. Restart PM2
echo "🔄 Restarting PM2 services..."
pm2 restart ecosystem.config.js --env production

echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
