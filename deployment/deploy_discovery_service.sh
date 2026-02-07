#!/bin/bash
source "$(dirname "$0")/common.sh"
deploy_java_service "discovery-server" "backend/discovery-server"
