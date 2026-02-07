#!/bin/bash
source "$(dirname "$0")/common.sh"
deploy_java_service "auth-service" "backend/auth-service"
