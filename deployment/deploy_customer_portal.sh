#!/bin/bash
source "$(dirname "$0")/common.sh"
deploy_nextjs_service "customer-portal" "frontend/customer-portal" $PORT_CUSTOMER_PORTAL
