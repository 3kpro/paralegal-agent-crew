#!/bin/bash

# XELORA Deployment Script
# Safely merges feature branch to main and deploys to production via Vercel

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get branch name from argument
BRANCH=${1:-feature/topic-scrapper}

echo -e "${YELLOW}🚀 XELORA Deployment Script${NC}"
echo "Branch to deploy: $BRANCH"
echo ""

# Step 1: Switch to main
echo -e "${YELLOW}1. Switching to main branch...${NC}"
git checkout main
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to checkout main${NC}"
  exit 1
fi

# Step 2: Pull latest
echo -e "${YELLOW}2. Pulling latest from origin/main...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to pull from origin${NC}"
  exit 1
fi

# Step 3: Merge feature branch
echo -e "${YELLOW}3. Merging $BRANCH into main...${NC}"
git merge "$BRANCH"
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Merge conflict detected. Resolve manually and try again.${NC}"
  exit 1
fi

# Step 4: Push to main
echo -e "${YELLOW}4. Pushing to origin/main...${NC}"
git push origin main
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to push to origin${NC}"
  exit 1
fi

# Success
echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo -e "${GREEN}✓ Changes merged and pushed to main${NC}"
echo -e "${GREEN}✓ Vercel will auto-deploy from main in ~2-3 minutes${NC}"
echo ""
echo "Monitor deployment: https://vercel.com/3kpro/content-cascade-ai-landing"
