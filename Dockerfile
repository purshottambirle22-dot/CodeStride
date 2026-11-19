# ==============================================================================
# Production Multi-Stage Dockerfile for CodeStride Backend (Spring Boot 4 / Java 21)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build stage (Maven + Java 21 LTS)
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy Maven Project Object Model (POM) and download dependencies
# This leverages Docker layer caching to prevent re-downloading dependencies
# when only source code changes.
COPY pom.xml .
RUN mvn dependency:go-offline -B || mvn dependency:resolve -B

# Copy application source code
COPY src ./src

# Build the executable Spring Boot fat JAR (skipping tests; CI runs tests separately)
RUN mvn clean package -DskipTests -B

# Normalize the artifact name for reliable copying in the runtime stage
RUN cp target/codestride-backend-*.jar target/app.jar

# ------------------------------------------------------------------------------
# Stage 2: Production runtime stage (Lightweight Eclipse Temurin JRE 21 Alpine)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="CodeStride DevOps Team"
LABEL description="Production runtime container for CodeStride Spring Boot Backend"

WORKDIR /app

# Install wget for container health checks (--no-cache avoids unnecessary package caches)
# and create a dedicated non-root system group and user (least-privilege security principle)
RUN apk add --no-cache wget && \
    addgroup -S -g 1001 appgroup && \
    adduser -S -u 1001 -G appgroup -s /sbin/nologin appuser

# Configure default container environment variables
# - PORT defaults to 8080 for local execution; Render overrides PORT dynamically at runtime.
# - JAVA_OPTS configures JVM container awareness, 75% max RAM percentage, and fast entropy gathering.
ENV PORT=8080 \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

# Copy the compiled JAR artifact from the builder stage with non-root ownership
COPY --from=builder --chown=appuser:appgroup /build/target/app.jar /app/app.jar

# Switch to the non-root user
USER appuser

# Expose default application port (informative; Render maps dynamic PORT dynamically)
EXPOSE 8080

# Health check configuration targeting Spring Boot Actuator
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/actuator/health || exit 1

# Execute Spring Boot application
# Note: "exec" replaces the shell process with the JVM process, making Java PID 1.
# This ensures POSIX signals (SIGTERM) are handled directly for Spring Boot graceful shutdown.
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
