#!/bin/bash
source "$(dirname "$0")/common.sh"
deploy_nextjs_service "process-server-portal" "frontend/process-server-portal" $PORT_PROCESS_SERVER_PORTAL
