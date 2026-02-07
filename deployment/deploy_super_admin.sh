#!/bin/bash
source "$(dirname "$0")/common.sh"
deploy_nextjs_service "super-admin" "frontend/super-admin" $PORT_SUPER_ADMIN
