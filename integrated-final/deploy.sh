#!/usr/bin/env bash

print_info() { echo "[INFO] $*"; }
print_warning() { echo "[WARN] $*"; }
print_error() { echo "[ERROR] $*"; }

# 預設值
DEFAULT_PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
DEFAULT_REGION="asia-east1"
DEFAULT_SERVICE_NAME="line-ai-assistant"

# 互動式輸入
read -p "輸入 GCP Project ID [$DEFAULT_PROJECT_ID]: " PROJECT_ID
PROJECT_ID=${PROJECT_ID:-$DEFAULT_PROJECT_ID}

if [ -z "$PROJECT_ID" ]; then
    print_error "必須提供 Project ID"
    exit 1
fi

read -p "輸入部署區域 [$DEFAULT_REGION]: " REGION
REGION=${REGION:-$DEFAULT_REGION}

read -p "輸入服務名稱 [$DEFAULT_SERVICE_NAME]: " SERVICE_NAME
SERVICE_NAME=${SERVICE_NAME:-$DEFAULT_SERVICE_NAME}

read -p "輸入您的 Google API Key (Gemini): " GOOGLE_API_KEY

if [ -z "$GOOGLE_API_KEY" ]; then
    print_error "必須提供 Google API Key"
    exit 1
fi

# 確認部署
print_info "部署設定："
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service Name: $SERVICE_NAME"
echo ""
read -p "確認部署? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "取消部署"
    exit 0
fi

# 設定 gcloud project
print_info "設定 GCP Project..."
gcloud config set project $PROJECT_ID

# 安裝依賴
print_info "安裝依賴套件..."
npm install

# 建置前端
print_info "建置前端應用程式..."
npm run build

# 建置 Docker image
print_info "建置 Docker Image..."
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
docker build -t $IMAGE_NAME:latest .

# 推送 image 到 Google Container Registry
print_info "推送 Image 到 Container Registry..."
docker push $IMAGE_NAME:latest

# 部署到 Cloud Run
print_info "部署到 Cloud Run..."
# 注意：不要把 PORT 加到 --set-env-vars，Cloud Run 會自動注入 PORT。保留 --port 參數告訴 Cloud Run 容器監聽哪個埠。
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --port 8080 \
  --set-env-vars "GOOGLE_API_KEY=$GOOGLE_API_KEY,NODE_ENV=production" \
  --max-instances 10 \
  --min-instances 0 \
  --timeout 300

# 取得服務 URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

print_info "部署完成！"
echo ""
echo "=================================="
echo "Service URL: $SERVICE_URL"
echo "=================================="
echo ""
print_info "您可以使用以下命令查看日誌："
echo "  gcloud run services logs read $SERVICE_NAME --region $REGION --limit 100"
echo ""
print_info "要更新服務，請重新執行此腳本。"
