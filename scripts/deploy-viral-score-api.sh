#!/bin/bash

# Deploy Viral Score API to Google Cloud Run
# Requirements:
# - Build container from services/viral-score-api/
# - Deploy to region us-central1
# - Service name: viral-score-api
# - Allow unauthenticated requests
# - Memory: 512Mi
# - Min instances: 0 (scale to zero)
# - Max instances: 10
# - Output deployed URL

set -e  # Exit on any error

echo "🚀 Deploying Viral Score API to Google Cloud Run..."

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 > /dev/null; then
    echo "❌ Not authenticated with gcloud. Please run 'gcloud auth login' first."
    exit 1
fi

# Check if project is set
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project set. Please run 'gcloud config set project YOUR_PROJECT_ID' first."
    exit 1
fi

echo "📦 Building and deploying from source directory: services/viral-score-api/"
echo "🌍 Region: us-central1"
echo "🏷️  Service name: viral-score-api"
echo "🔓 Allow unauthenticated: yes"
echo "💾 Memory: 512Mi"
echo "📊 Min instances: 0"
echo "📈 Max instances: 10"

# Deploy to Cloud Run
gcloud run deploy viral-score-api \
  --source services/viral-score-api/ \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 10 \
  --platform managed \
  --format "value(status.url)"

echo ""
echo "✅ Deployment complete!"
echo "🔗 Your Viral Score API is now live at the URL above."