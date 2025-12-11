#!/bin/bash
# Script to update all backend services to Java 17

export JAVA_HOME=$(/usr/libexec/java_home -v 17)

services=("api-gateway" "auth-service" "discovery-server" "notification-service" "tenant-service" "user-service")

for service in "${services[@]}"; do
  echo "Updating $service to Java 17..."
  cd "backend/$service"
  
  # Update pom.xml for Java 17
  sed -i '' 's/<java.version>21<\/java.version>/<java.version>17<\/java.version>/g' pom.xml
  sed -i '' 's/<source>21<\/source>/<source>17<\/source>/g' pom.xml
  sed -i '' 's/<target>21<\/target>/<target>17<\/target>/g' pom.xml
  
  cd ../..
done

echo "All services updated to Java 17"
