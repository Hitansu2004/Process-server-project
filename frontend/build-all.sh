#!/bin/bash

# Build all frontend portals
# Run from the frontend directory

echo "🚀 Starting Frontend Build Process..."
echo "===================================="

# Function to build a portal
build_portal() {
    local portal=$1
    echo "🔨 Building $portal..."
    cd "$portal" || exit
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    echo "🏗️  Running build..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed for $portal"
        exit 1
    fi
    
    echo "✅ $portal built successfully"
    cd ..
    echo ""
}

# Build all portals
build_portal "home-page"
build_portal "delivery-portal"
build_portal "admin-panel"
build_portal "super-admin"
build_portal "customer-portal"

echo "===================================="
echo "✨ All frontend portals built successfully!"
