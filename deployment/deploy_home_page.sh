#!/bin/bash
source "$(dirname "$0")/common.sh"
deploy_nextjs_service "home-page" "frontend/home-page" $PORT_HOME_PAGE
