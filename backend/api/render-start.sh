#!/usr/bin/env bash
# Render start script for Spring Boot application

set -e

echo "🚀 Starting Spring Boot application..."

# Start the application
# Render automatically sets PORT environment variable
java -Dserver.port=${PORT:-8080} -jar target/*.jar

