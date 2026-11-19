# CodeStride Backend - Production Docker & Deployment Guide

This document details the production-ready Docker configuration for the **CodeStride Spring Boot Backend**, including container architecture, local build/run workflows, environment variable specifications, and deployment on **Render**.

---

## 1. Container Architecture & Design

The Docker image employs a **multi-stage build** adhering to cloud-native production standards:

```
+-------------------------------------------------------------+
| Stage 1: Builder (maven:3.9.9-eclipse-temurin-21-alpine)    |
| - Resolves POM dependencies (cached in Docker layer)        |
| - Compiles Java 21 source code                              |
| - Packages executable Spring Boot fat JAR                   |
+-------------------------------------------------------------+
                             |
                             v (Copies only target/app.jar)
+-------------------------------------------------------------+
| Stage 2: Runtime (eclipse-temurin:21-jre-alpine)            |
| - Lightweight JRE 21 (~140MB base)                          |
| - Runs under unprivileged user: appuser (UID/GID 1001)      |
| - Memory-tuned for containers (-XX:MaxRAMPercentage=75.0)   |
| - PID 1 process execution for POSIX SIGTERM signal handling |
| - Native Spring Boot graceful shutdown (30s drain timeout)  |
| - Actuator health monitoring endpoint (/actuator/health)     |
+-------------------------------------------------------------+
```

### Key Production Features
1. **Lightweight & Secure Base Image**: Uses `eclipse-temurin:21-jre-alpine` (official Eclipse Temurin OpenJDK 21 LTS runtime). No compiler, build tools, source code, or Maven repository caches exist in the final production artifact.
2. **Least-Privilege Security**: Runs as unprivileged user `appuser` (UID `1001`, GID `1001`) with no shell access (`/sbin/nologin`).
3. **Container-Aware Memory Management**: `JAVA_OPTS` defaults to `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError` to dynamically configure heap limits within container cgroups (preventing silent host OOM kills).
4. **Graceful Shutdown**: Starts via `exec java ...` so the JVM runs as PID 1, cleanly intercepting `SIGTERM` signals from Render/Docker and draining active HTTP connections.
5. **Render Dynamic PORT Support**: Reads `${PORT}` injected by Render at runtime, defaulting to `8080` for local runs.
6. **Hardened Actuator Health Monitoring**: Exposes `/actuator/health` as the primary aggregated health endpoint with `show-details=never` to prevent leaking internal database, disk, or host metrics to unauthenticated callers. Spring Boot also exposes liveness and readiness probe health groups (`/actuator/health/liveness` and `/actuator/health/readiness`), while Render utilizes `/actuator/health` as the overall deployment health check.

---

## 2. Environment Variables Reference

Configure the following variables in your local environment or host dashboard:

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | **Yes** | *None* | MongoDB Atlas connection string (e.g. `mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net/codestride?retryWrites=true&w=majority`). |
| `MONGODB_DATABASE` | No | `codestride` | MongoDB target database name. |
| `APP_JWT_SECRET` | **Yes** | *None* | Cryptographic HMAC-SHA secret key for JWT signing (minimum 256 bits / 32 bytes). |
| `APP_CORS_ALLOWED_ORIGINS` | No | `http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000` | Comma-separated list of allowed origins (e.g. your Vercel frontend URL: `https://your-app.vercel.app`). |
| `PORT` | No | `8080` | Port on which the Spring Boot application listens. Automatically set by Render in production. |
| `JAVA_OPTS` | No | *(Container flags)* | Optional JVM startup flags to append or customize runtime memory behavior. |

> **Security Note:** Never commit actual values for `MONGODB_URI` or `APP_JWT_SECRET` to version control. They are protected by `.dockerignore` and `.gitignore`.

---

## 3. Local Docker Build & Execution

### Prerequisites
- Docker Engine / Docker Desktop installed and running.
- A valid MongoDB Atlas connection string.

### Step 1: Build the Docker Image

Run the build command from the project root directory:

```bash
docker build -t codestride-backend:latest .
```

To build with BuildKit optimizations and clean output:

```bash
DOCKER_BUILDKIT=1 docker build -t codestride-backend:latest .
```

### Step 2: Configure Local Environment

Copy `.env.example` to `.env` and fill in your test credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```properties
PORT=8080
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/codestride?retryWrites=true&w=majority
MONGODB_DATABASE=codestride
APP_JWT_SECRET=<your-secure-random-secret>
```

### Step 3: Run the Container

**Option A: Run using `--env-file` (Recommended for local dev):**

```bash
docker run -d \
  --name codestride-backend \
  -p 8080:8080 \
  --env-file .env \
  --memory=512m \
  codestride-backend:latest
```

**Option B: Run passing inline environment variables:**

```bash
docker run -d \
  --name codestride-backend \
  -p 8080:8080 \
  -e PORT=8080 \
  -e MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/codestride?retryWrites=true&w=majority" \
  -e MONGODB_DATABASE=codestride \
  -e APP_JWT_SECRET="<your-secure-random-secret>" \
  --memory=512m \
  codestride-backend:latest
```

---

## 4. Local Testing & Verification

### 1. Check Container Health and Logs
```bash
# View live application logs
docker logs -f codestride-backend

# Check container status and health check state
docker ps --filter "name=codestride-backend"
```

Expected log output:
```text
Started CodestrideBackendApplication in ... seconds (process running for ...)
```

### 2. Verify Health Check Endpoint
Query the public actuator health endpoint:

```bash
curl -i http://localhost:8080/actuator/health
```

Expected response:
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.spring-boot.actuator.v3+json
Transfer-Encoding: chunked

{"status":"UP"}
```

> **Note on Health Endpoints & Groups:**
> - `/actuator/health` is the aggregated master health endpoint used by Render for deployment monitoring and the Docker container `HEALTHCHECK`.
> - Spring Boot also exposes dedicated health probe groups at `/actuator/health/liveness` and `/actuator/health/readiness` (enabled via `management.endpoint.health.probes.enabled=true`).

### 3. Verify Non-Root User Execution
Verify that the container process runs with unprivileged security:

```bash
docker exec codestride-backend whoami
# Output: appuser

docker exec codestride-backend id -u
# Output: 1001
```

### 4. Verify Graceful Shutdown
Test how the container responds to standard termination signals:

```bash
docker stop --time 30 codestride-backend
```

Expected log output:
```text
Commencing graceful shutdown. Waiting for active requests to complete
Graceful shutdown complete
```

### 5. Cleanup Local Container
```bash
docker rm -f codestride-backend
```

---

## 5. Render Deployment Instructions

Follow these steps to deploy CodeStride Backend as a Web Service on [Render](https://render.com):

### Step 1: Push Changes to GitHub
Ensure the following files are committed to your GitHub repository:
- `Dockerfile`
- `.dockerignore`
- `src/main/resources/application.properties`
- `DOCKER_DEPLOYMENT.md`

```bash
git add Dockerfile .dockerignore src/main/resources/application.properties .env.example DOCKER_DEPLOYMENT.md
git commit -m "feat(devops): add production-ready Docker configuration for Render"
git push origin main
```

### Step 2: Create Web Service on Render
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository (`codestride-backend`).
4. In the configuration page, configure:
   - **Name**: `codestride-backend` (or your preferred name)
   - **Region**: Select the region closest to your MongoDB Atlas cluster (e.g. Frankfurt, Oregon, Singapore).
   - **Branch**: `main`
   - **Root Directory**: Leave blank (root of repository).
   - **Runtime**: Select **Docker**.
   - **Instance Type**: Starter ($7/mo) or Free (Free tier is suitable for testing).

### Step 3: Configure Environment Variables
Under the **Environment Variables** section on Render, add:

| Key | Value | Notes |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/codestride?retryWrites=true&w=majority` | Atlas connection string. Ensure network access (0.0.0.0/0 or Render IP egress) is allowed in MongoDB Atlas. |
| `MONGODB_DATABASE` | `codestride` | Database name. |
| `APP_JWT_SECRET` | *(Your 256-bit random secret)* | Secure key of at least 32 characters. |
| `APP_CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Vercel production frontend URL (comma-separated if multiple domains/previews). |

> **Note on `PORT`:** Render automatically injects the `PORT` environment variable (e.g. `10000`). The Docker entrypoint and `application.properties` automatically bind Spring Boot to this dynamic port. You do not need to manually configure `PORT` in Render's dashboard.

### Step 4: Configure Health Check Path
1. Scroll down to **Advanced** settings.
2. In the **Health Check Path** field, enter:
   ```text
   /actuator/health
   ```
3. Render will poll this endpoint during rolling deploys. A deploy is only promoted to live traffic once `/actuator/health` responds with HTTP 200 OK.
   *(Note: While Spring Boot also exposes specific liveness and readiness probe groups at `/actuator/health/liveness` and `/actuator/health/readiness`, `/actuator/health` serves as the overall composite health endpoint monitored by Render.)*

### Step 5: Deploy
Click **Create Web Service**. Render will:
1. Clone the repository.
2. Build the multi-stage Dockerfile.
3. Start the container with assigned `PORT`.
4. Validate the `/actuator/health` health check.
5. Provide your live public HTTPS URL (e.g., `https://codestride-backend.onrender.com`).

---

## 6. Production Troubleshooting

| Issue | Root Cause | Solution |
|---|---|---|
| Container fails with `MongoSocketOpenException` or timeout | MongoDB Atlas Network Access whitelist does not allow Render's IP addresses. | In MongoDB Atlas -> Network Access, add `0.0.0.0/0` (Allow Access from Anywhere) or the dedicated Render outbound IP range. |
| `IllegalArgumentException: The secret key must be at least 256 bits` | `APP_JWT_SECRET` is shorter than 32 characters (256 bits). | Generate a secure key: `openssl rand -hex 32` and set it in `APP_JWT_SECRET`. |
| Render reports `Health check failed` on `/actuator/health` | Port mismatch or missing environment variable causing Spring Boot initialization failure. | Check Render logs for Spring Boot startup stack trace. Verify `MONGODB_URI` and `APP_JWT_SECRET` are correctly configured. |
| Container terminated with Exit Code 137 (OOMKilled) | JVM exceeded container memory limits on small instance plans. | Ensure `JAVA_OPTS` retains `-XX:MaxRAMPercentage=75.0`. If running on a 512MB plan, consider setting `-Xmx384m`. |
