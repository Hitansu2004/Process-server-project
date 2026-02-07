#!/bin/bash

# Common Deployment Functions

# Load Configuration
source "$(dirname "$0")/config.env"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO] $1${NC}"; }
log_step() { echo -e "${BLUE}[STEP] $1${NC}"; }
log_warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }
log_error() { echo -e "${RED}[ERROR] $1${NC}"; }

# Check if a command succeeded
check_status() {
    if [ $? -ne 0 ]; then
        log_error "$1 failed!"
        exit 1
    fi
}

# Deploy Java Service (Spring Boot)
deploy_java_service() {
    local service_name=$1
    local local_dir=$2
    local jar_name="$service_name-1.0.0.jar"
    local remote_dir="$REMOTE_APP_DIR/$service_name"

    log_step "Deploying $service_name..."

    # 1. Build Locally
    log_info "Building $service_name locally..."
    cd "$LOCAL_PROJECT_DIR/$local_dir" || exit 1
    mvn clean package -DskipTests
    check_status "Maven build"
    
    # 2. Prepare Remote Directory
    log_info "Preparing remote directory..."
    ssh "$SERVER_USER@$SERVER_IP" "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin && mkdir -p $remote_dir"
    
    # 3. Transfer JAR
    log_info "Transferring JAR..."
    scp "target/$jar_name" "$SERVER_USER@$SERVER_IP:$remote_dir/$jar_name"
    check_status "SCP transfer"

    # 4. Create/Update Systemd Service
    log_info "Updating systemd service..."
    ssh "$SERVER_USER@$SERVER_IP" "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin && sudo bash -c 'cat > /etc/systemd/system/$service_name.service <<EOF
[Unit]
Description=$service_name
After=syslog.target network.target

[Service]
User=$SERVER_USER
WorkingDirectory=$remote_dir
ExecStart=/usr/bin/java -jar $remote_dir/$jar_name
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF'"
    
    # 5. Restart Service
    log_info "Restarting service..."
    ssh "$SERVER_USER@$SERVER_IP" "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin && sudo systemctl daemon-reload && sudo systemctl enable $service_name && sudo systemctl restart $service_name"
    check_status "Service restart"

    # 6. Verify
    log_info "Verifying service status..."
    sleep 5
    ssh "$SERVER_USER@$SERVER_IP" "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin && sudo systemctl status $service_name --no-pager"
}

# Deploy Next.js Service
deploy_nextjs_service() {
    local service_name=$1
    local local_dir=$2
    local port=$3
    local remote_dir="$REMOTE_APP_DIR/$service_name"

    log_step "Deploying $service_name..."

    # 1. Zip Source
    log_info "Zipping source code..."
    cd "$LOCAL_PROJECT_DIR/$local_dir" || exit 1
    # Create temp zip
    zip -r "$service_name.zip" . -x "node_modules/*" ".next/*" ".git/*" ".env.local"
    check_status "Zip creation"

    # 2. Prepare Remote Directory
    log_info "Preparing remote directory..."
    ssh "$SERVER_USER@$SERVER_IP" "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin && mkdir -p $remote_dir"

    # 3. Transfer Zip
    log_info "Transferring source..."
    scp "$service_name.zip" "$SERVER_USER@$SERVER_IP:$remote_dir/"
    check_status "SCP transfer"
    rm "$service_name.zip"

    # 4. Remote Setup & Build
    log_info "Building on server (this may take a while)..."
    ssh "$SERVER_USER@$SERVER_IP" "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin && bash -s" <<EOF
        export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
        
        # Install unzip if needed
        if ! command -v unzip &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y unzip
        fi

        cd $remote_dir
        unzip -o $service_name.zip
        rm $service_name.zip

        # Create .env.production
        echo "NEXT_PUBLIC_API_URL=$API_URL" > .env.production

        # Install & Build
        npm install
        npm run build
EOF
    check_status "Remote build"

    # 5. Create/Update Systemd Service
    log_info "Updating systemd service..."
    ssh "$SERVER_USER@$SERVER_IP" "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin && sudo bash -c 'cat > /etc/systemd/system/$service_name.service <<EOF
[Unit]
Description=$service_name
After=network.target

[Service]
User=$SERVER_USER
WorkingDirectory=$remote_dir
ExecStart=/usr/bin/npm start -- -p $port
Restart=always
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_API_URL=$API_URL
Environment=PATH=/usr/bin:/usr/local/bin

[Install]
WantedBy=multi-user.target
EOF'"

    # 6. Restart Service
    log_info "Restarting service..."
    ssh "$SERVER_USER@$SERVER_IP" "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin && sudo systemctl daemon-reload && sudo systemctl enable $service_name && sudo systemctl restart $service_name"
    check_status "Service restart"

    # 7. Verify
    log_info "Verifying service status..."
    sleep 5
    ssh "$SERVER_USER@$SERVER_IP" "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin && sudo systemctl status $service_name --no-pager"
}
