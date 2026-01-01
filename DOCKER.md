# Docker Build & Deployment Guide

## Quick Start - Run Everything

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

Access:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/q/swagger-ui

## Individual Builds

### Frontend (React/Vite + Nginx)

```bash
cd app
docker build -t rmcampos/bean-score/beanscore:frontend-latest .
docker run -p 5173:80 -it --rm \
    -e VITE_BACKEND_SERVER="http://localhost:8080" \
    -e VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY \
    rmcampos/bean-score/beanscore:frontend-latest
```

**Image details:**
- Multi-stage build with Node 20 Alpine
- Final image: ~50MB (nginx:alpine + built assets)
- Optimized for production with security headers

### Backend (Quarkus Native)

```bash
cd backend
docker build -t rmcampos/bean-score/beanscore:backend-latest .

# Only needed if running outside docker compose
#DBHOST=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' beanscore-postgres)

docker run -p 8080:8080 -it --rm \
    --network beans-score_default \
    -e QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://beanscore-postgres:5432/beanscore \
    -e QUARKUS_DATASOURCE_USERNAME=beanscore \
    -e QUARKUS_DATASOURCE_PASSWORD=beanscore123 \
    rmcampos/bean-score/beanscore:backend-latest
```

**Image details:**
- Multi-stage build with Mandrel (GraalVM)
- Native executable compilation
- Final image: ~150-200MB (quarkus-micro-image + native app)
- Startup time: **~0.05 seconds** (vs ~2-3 seconds JVM)
- Memory usage: **~50MB** (vs ~200-300MB JVM)

**Build time:** 5-10 minutes (native compilation is intensive)

## Production Deployment

### Environment Variables

Create a `.env` file for production:

```env
# Database
DB_URL=jdbc:postgresql://your-db-host:5432/beanscore
DB_USERNAME=your-username
DB_PASSWORD=your-password

# Backend
BACKEND_PORT=8080

# Frontend
FRONTEND_PORT=80
```

### Using Docker Compose with env file

```bash
docker-compose --env-file .env up -d
```

## Optimization Tips

### Frontend
- Gzip compression enabled in nginx
- Static assets cached
- SPA routing configured (fallback to index.html)

### Backend Native Build
- **Faster builds**: Use `docker build --build-arg MAVEN_OPTS="-Dmaven.repo.local=/cache/.m2"`
- **Multi-platform**: Add `--platform linux/amd64,linux/arm64`
- **Reduce size**: Already using minimal base image (quarkus-micro-image)

## Troubleshooting

### Backend build fails (Out of memory)

Native builds need significant RAM. Increase Docker memory:

```bash
# Docker Desktop: Settings → Resources → Memory (recommend 8GB+)
```

Or build with less optimization:

```bash
# Add to backend/Dockerfile build command:
RUN ./mvnw package -Pnative -DskipTests -Dquarkus.native.additional-build-args=--initialize-at-build-time=
```

### Database connection issues

Ensure PostgreSQL is ready before backend starts:

```bash
docker-compose up postgres
# Wait for "database system is ready to accept connections"
docker-compose up backend
```

## Development vs Production

**Development:**
```bash
# Use local dev setup (faster)
cd backend && ./mvnw quarkus:dev
cd app && npm run dev
```

**Production:**
```bash
# Use Docker (optimized native build)
docker-compose up --build
```

## Clean Up

```bash
# Stop all containers
docker-compose down

# Remove volumes (deletes database data)
docker-compose down -v

# Remove images
docker rmi beanscore-frontend beanscore-backend
```
