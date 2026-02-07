#!/bin/bash

# ============================================================
# PROCESS SERVER PRICING FEATURE DEPLOYMENT
# ============================================================
# This script:
# 1. Uploads the pricing migration SQL to the server
# 2. Runs the migration on the database
# 3. Deploys the updated order-service with pricing endpoints
# ============================================================

set -e  # Exit on any error

# Load common functions
source "$(dirname "$0")/common.sh"

log_info "Starting Process Server Pricing Feature Deployment..."

# ============================================================
# STEP 1: Upload Migration SQL
# ============================================================
log_info "Uploading pricing migration SQL..."

scp "$PROJECT_ROOT/database/migrations/add_process_server_pricing.sql" \
    $SERVER_USER@$SERVER_HOST:~/migrations/

log_success "Migration SQL uploaded"

# ============================================================
# STEP 2: Run Migration
# ============================================================
log_info "Running database migration..."

ssh $SERVER_USER@$SERVER_HOST << 'ENDSSH'
    set -e
    
    echo "Running add_process_server_pricing.sql migration..."
    
    # Run migration
    export MYSQL_PWD='dbuser!!'
    mysql -u dbuser -D processserve_db < ~/migrations/add_process_server_pricing.sql
    
    if [ $? -eq 0 ]; then
        echo "✓ Migration completed successfully"
    else
        echo "✗ Migration failed!"
        exit 1
    fi
    
    # Verify table was created
    echo "Verifying process_server_pricing table..."
    mysql -u dbuser -D processserve_db -e "DESCRIBE process_server_pricing;"
    
    # Check sample data
    echo "Checking sample data..."
    mysql -u dbuser -D processserve_db -e "SELECT process_server_id, zip_code, process_service_fee, certified_mail_fee, rush_service_fee, remote_service_fee FROM process_server_pricing LIMIT 5;"
    
    echo "✓ Table verified successfully"
ENDSSH

log_success "Database migration completed"

# ============================================================
# STEP 3: Deploy Updated Order Service
# ============================================================
log_info "Deploying updated order-service..."

# Build the JAR if not already built
if [ ! -f "$PROJECT_ROOT/backend/order-service/target/order-service-1.0.0.jar" ]; then
    log_info "Building order-service JAR..."
    cd "$PROJECT_ROOT/backend/order-service"
    mvn clean package -DskipTests
    cd "$PROJECT_ROOT/deployment"
fi

# Upload the JAR
log_info "Uploading order-service JAR..."
scp "$PROJECT_ROOT/backend/order-service/target/order-service-1.0.0.jar" \
    $SERVER_USER@$SERVER_HOST:~/jars/

# Restart the order-service
log_info "Restarting order-service..."

ssh $SERVER_USER@$SERVER_HOST << 'ENDSSH'
    set -e
    
    echo "Stopping existing order-service..."
    pkill -f 'order-service-1.0.0.jar' || true
    sleep 2
    
    echo "Starting order-service with new pricing endpoints..."
    cd ~/jars
    
    nohup java -jar order-service-1.0.0.jar \
        --server.port=8080 \
        --spring.profiles.active=prod \
        > ~/logs/order-service.log 2>&1 &
    
    echo "Waiting for service to start..."
    sleep 10
    
    # Check if service is running
    if pgrep -f 'order-service-1.0.0.jar' > /dev/null; then
        echo "✓ Order service started successfully"
        
        # Test pricing endpoint
        echo "Testing pricing endpoint..."
        curl -s http://localhost:8080/api/process-servers/pricing/ps-profile-001 > /dev/null
        
        if [ $? -eq 0 ]; then
            echo "✓ Pricing endpoint is responding"
        else
            echo "✗ Pricing endpoint not responding"
            exit 1
        fi
    else
        echo "✗ Order service failed to start"
        echo "Checking logs..."
        tail -50 ~/logs/order-service.log
        exit 1
    fi
ENDSSH

log_success "Order service deployed successfully"

# ============================================================
# DEPLOYMENT SUMMARY
# ============================================================
log_info "==================================================="
log_success "✓ Process Server Pricing Feature Deployed!"
log_info "==================================================="
echo ""
echo "New API Endpoints Available:"
echo "  GET    /api/process-servers/pricing/{processServerId}"
echo "  POST   /api/process-servers/pricing/{processServerId}/calculate"
echo "  POST   /api/process-servers/pricing"
echo "  PUT    /api/process-servers/pricing/{pricingId}"
echo "  POST   /api/process-servers/pricing/batch"
echo "  DELETE /api/process-servers/pricing/{pricingId}"
echo ""
echo "Sample Test Commands:"
echo "  # Get all pricing for ps-profile-001"
echo "  curl http://ezcollab.com:8080/api/process-servers/pricing/ps-profile-001"
echo ""
echo "  # Calculate pricing for zip 75022"
echo "  curl -X POST http://ezcollab.com:8080/api/process-servers/pricing/ps-profile-001/calculate \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"zipCode\":\"75022\",\"processService\":true,\"rush\":true}'"
echo ""
echo "Next Steps:"
echo "  1. Test pricing endpoints with curl or Postman"
echo "  2. Create pricing management UI in process-server-portal"
echo "  3. Update order creation flow in customer-portal"
echo "  4. Update order editing flow"
echo ""

log_info "Deployment complete!"
