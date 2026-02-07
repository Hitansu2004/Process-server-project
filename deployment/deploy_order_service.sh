#!/bin/bash
source "$(dirname "$0")/common.sh"
deploy_java_service "order-service" "backend/order-service"
