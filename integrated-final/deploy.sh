#!/bin/bash
set -e
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="line-ai-assistant"
REGION="asia-east1"

echo "請輸入 Gemini API Key:"
read -s GOOGLE_API_KEY

echo "啟用 API..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

echo "構建應用..."
npm install && npm run build

echo "構建 Docker..."
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME}

echo "部署到 Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 1Gi \
  --set-env-vars "GOOGLE_API_KEY=${GOOGLE_API_KEY},NODE_ENV=production"

echo "部署完成!"
