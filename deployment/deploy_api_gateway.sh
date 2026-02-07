#!/bin/bash
source "$(dirname "$0")/common.sh"
deploy_java_service "api-gateway" "backend/api-gateway"
