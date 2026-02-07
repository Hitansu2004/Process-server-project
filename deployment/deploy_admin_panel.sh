#!/bin/bash
source "$(dirname "$0")/common.sh"
deploy_nextjs_service "admin-panel" "frontend/admin-panel" $PORT_ADMIN_PANEL
