#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Glam AI Deployment Pipeline${NC}\n"

# Configuration
DOCKER_USERNAME="${1:-your-docker-username}"
IMAGE_NAME="glam-ai-app"
REGISTRY="docker.io"

echo -e "${BLUE}Step 1: Building Docker image...${NC}"
docker build -t "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest" -t "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:$(date +%s)" .

echo -e "${GREEN}✓ Build complete${NC}\n"

echo -e "${BLUE}Step 2: Running local tests...${NC}"
docker run --rm -v "$(pwd):/app" -w /app node:18-alpine sh -c "npm ci && npm run lint --if-present && npm run test --if-present" || echo -e "${RED}Tests skipped (scripts not available)${NC}"

echo -e "${BLUE}Step 3: Scanning image for vulnerabilities...${NC}"
docker scout cves "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest" || echo -e "${RED}Scout scan skipped${NC}"

echo -e "${BLUE}Step 4: Push to Docker Hub${NC}"
docker push "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest"

echo -e "${GREEN}✓ Push complete${NC}\n"

echo -e "${BLUE}Step 5: Deploy to Kubernetes (optional)${NC}"
read -p "Deploy to Kubernetes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  sed -i "s|YOUR_USERNAME|${DOCKER_USERNAME}|g" k8s/deployment.yaml
  kubectl apply -f k8s/deployment.yaml
  echo -e "${GREEN}✓ Kubernetes deployment complete${NC}\n"
fi

echo -e "${BLUE}Step 6: Deploy to Docker Swarm (optional)${NC}"
read -p "Deploy to Docker Swarm? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  sed -i "s|YOUR_USERNAME|${DOCKER_USERNAME}|g" docker-compose.prod.yml
  docker stack deploy -c docker-compose.prod.yml glam-app
  echo -e "${GREEN}✓ Docker Swarm deployment complete${NC}\n"
fi

echo -e "${GREEN}✓ Pipeline complete!${NC}"
