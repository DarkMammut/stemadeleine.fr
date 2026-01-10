#!/usr/bin/env bash
# Render build script for Spring Boot application

set -e

echo "🔨 Building Spring Boot application..."

# Build the application with Maven
./mvnw clean package -DskipTests

echo "✅ Build completed successfully!"

