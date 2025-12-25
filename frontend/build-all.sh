#!/bin/bash

# Build all frontend portals
# This script can be run from anywhere

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="$SCRIPT_DIR"

echo "🚀 Starting Frontend Build Process..."
echo "===================================="

# Function to build a portal
build_portal() {
    local portal=$1
    echo "🔨 Building $portal..."
    cd "$FRONTEND_DIR/$portal" || exit
    
    echo "📦 Installing dependencies..."
    npm install
    
    echo "🏗️  Running build..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed for $portal"
        exit 1
    fi
    
    echo "✅ $portal built successfully"
    echo ""
}

# Build all portals
build_portal "home-page"
build_portal "process-server-portal"
build_portal "admin-panel"
build_portal "super-admin"
build_portal "customer-portal"

echo "===================================="
echo "✨ All frontend portals built successfully!"
