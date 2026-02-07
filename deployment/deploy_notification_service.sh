#!/bin/bash
source "$(dirname "$0")/common.sh"
deploy_java_service "notification-service" "backend/notification-service"
