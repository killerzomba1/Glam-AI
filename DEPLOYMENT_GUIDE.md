# Glam AI Makeup App - Deployment Pipeline

## Overview
This deployment pipeline supports local development, CI/CD via GitHub Actions, and production deployments to Docker Swarm or Kubernetes.

## Files Created

### 1. **Dockerfile** (Multi-stage build)
- Stage 1: Build Node.js app
- Stage 2: Serve optimized production build
- Includes health checks and security best practices

### 2. **docker-compose.yml** (Development)
- Local development with hot reload
- Volume mounts for source code and public files
- Environment configuration
- Health checks

### 3. **.dockerignore**
- Optimizes build context by excluding unnecessary files
- Reduces build time and final image size

### 4. **.github/workflows/deploy.yml** (CI/CD Pipeline)
Automated workflow that:
- Triggers on push to `main`/`develop` and pull requests
- Runs linting and tests (if available)
- Builds multi-platform Docker image
- Pushes to Docker Hub (on main branch)
- Scans for vulnerabilities with Docker Scout
- Deploys to Kubernetes or Docker Swarm

Required GitHub Secrets:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `KUBE_CONFIG` (for Kubernetes deployments)

### 5. **k8s/deployment.yaml** (Kubernetes Production)
Complete K8s manifest with:
- Deployment with 3 replicas
- Rolling update strategy
- Service (ClusterIP)
- HorizontalPodAutoscaler (3-10 replicas)
- ConfigMap for configuration
- NetworkPolicy for security
- Resource limits and requests
- Liveness/readiness probes

### 6. **docker-compose.prod.yml** (Docker Swarm)
Production stack for Docker Swarm with:
- 3 replicas with rolling updates
- Health checks
- Logging configuration
- Overlay network

### 7. **deploy.sh** (Manual deployment script)
Interactive script for:
- Building Docker image
- Running tests
- Security scanning with Docker Scout
- Pushing to Docker Hub
- Optional deployment to Kubernetes or Swarm

## Quick Start

### Local Development
```bash
# Start with hot reload
docker compose up --pull always

# Access at http://localhost:3000
```

### Manual Deployment
```bash
# Make deploy script executable (Linux/macOS)
chmod +x deploy.sh

# Run deployment
./deploy.sh your-docker-username
```

### GitHub Actions (Automatic)
1. Push code to `main` branch
2. Workflow automatically:
   - Builds image
   - Runs tests/linting
   - Pushes to Docker Hub
   - Scans for vulnerabilities
   - Deploys to Kubernetes (if configured)

### Kubernetes Deployment
```bash
# Update image reference in k8s/deployment.yaml
sed -i 's/YOUR_USERNAME/your-username/g' k8s/deployment.yaml

# Apply manifest
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get pods -n glam-app
kubectl logs -n glam-app -l app=glam-app

# Port forward for testing
kubectl port-forward -n glam-app svc/glam-app 3000:80
```

### Docker Swarm Deployment
```bash
# Update image reference
sed -i 's/YOUR_USERNAME/your-username/g' docker-compose.prod.yml

# Initialize Swarm (if not already)
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml glam-app

# Check services
docker stack services glam-app
docker service logs glam-app_glam-app
```

## Configuration

### Environment Variables
- `NODE_ENV`: Set to `production` for deployments
- `REACT_APP_API_URL`: Backend API endpoint

### Kubernetes ConfigMap
Edit `k8s/deployment.yaml` to update:
```yaml
data:
  api-url: "https://your-api-endpoint.com"
```

## Monitoring & Logging

### Kubernetes
```bash
# View logs
kubectl logs -n glam-app -l app=glam-app -f

# Check events
kubectl get events -n glam-app

# Describe deployment
kubectl describe deployment glam-app -n glam-app
```

### Docker Compose / Swarm
```bash
# View logs
docker compose logs -f
docker service logs glam-app_glam-app -f
```

## Security Features

✓ Multi-stage Docker builds for smaller images
✓ Non-root user in containers
✓ Read-only root filesystem
✓ Network policies in Kubernetes
✓ Vulnerability scanning with Docker Scout
✓ Health checks (liveness/readiness)
✓ Pod security context
✓ Resource limits and requests

## Scaling

### Kubernetes HPA
Auto-scales between 3-10 replicas based on:
- CPU utilization > 70%
- Memory utilization > 80%

### Docker Swarm
Update replica count in `docker-compose.prod.yml`:
```yaml
deploy:
  replicas: 5
```

Then redeploy:
```bash
docker stack deploy -c docker-compose.prod.yml glam-app
```

## Troubleshooting

### Image not building
```bash
docker build --no-cache -t glam-ai-app .
```

### Pods not starting
```bash
kubectl describe pod <pod-name> -n glam-app
kubectl logs <pod-name> -n glam-app
```

### Port already in use
```bash
# Change port in docker-compose.yml or use different port
docker compose up -p glam-app-alt
```

### Docker Swarm service unhealthy
```bash
docker service ps glam-app_glam-app
docker logs <container-id>
```

## Next Steps

1. Update `DOCKER_USERNAME` in all files with your actual Docker Hub username
2. Set GitHub Secrets for automatic CI/CD
3. Configure DNS/ingress for production
4. Set up monitoring (Prometheus, Grafana)
5. Enable container registry scanning (Docker Scout)
6. Add backup strategy for persistent data if needed
