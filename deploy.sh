#!/bin/bash

# Google Cloud Run 快速部署腳本
# 使用方法: ./deploy.sh [PROJECT_ID]

set -e  # 遇到錯誤時停止

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "================================================"
echo "  Google Cloud Run 快速部署工具"
echo "  Autoline 應用程式"
echo "================================================"
echo -e "${NC}"

# 檢查參數
if [ -z "$1" ]; then
    echo -e "${YELLOW}請提供 GCP 專案 ID${NC}"
    echo "使用方法: ./deploy.sh YOUR_PROJECT_ID"
    exit 1
fi

PROJECT_ID=$1
REGION="asia-east1"
SERVICE_NAME="autoline"

echo -e "${GREEN}✓${NC} 使用專案 ID: $PROJECT_ID"
echo -e "${GREEN}✓${NC} 部署地區: $REGION"
echo -e "${GREEN}✓${NC} 服務名稱: $SERVICE_NAME"
echo ""

# 設定專案
echo -e "${BLUE}► 設定 GCP 專案...${NC}"
gcloud config set project "$PROJECT_ID"

# 檢查是否已登入
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠ 未登入 Google Cloud，開始登入...${NC}"
    gcloud auth login
fi

# 啟用必要的 API
echo -e "${BLUE}► 啟用必要的 API...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
echo -e "${GREEN}✓${NC} API 已啟用"

# 詢問是否設定密鑰
echo ""
read -p "是否需要設定 GOOGLE_API_KEY 密鑰？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}► 設定 API 金鑰密鑰...${NC}"
    read -p "請輸入您的 Gemini API 金鑰: " API_KEY
    
    # 檢查密鑰是否已存在
    if gcloud secrets describe GOOGLE_API_KEY >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠ 密鑰已存在，將建立新版本...${NC}"
        echo -n "$API_KEY" | gcloud secrets versions add GOOGLE_API_KEY --data-file=-
    else
        echo -n "$API_KEY" | gcloud secrets create GOOGLE_API_KEY \
            --data-file=- \
            --replication-policy="automatic"
    fi
    
    # 設定權限
    PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
    gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
        --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet 2>/dev/null || true
    
    echo -e "${GREEN}✓${NC} API 金鑰密鑰設定完成"
fi

# 執行建置和部署
echo ""
echo -e "${BLUE}► 開始建置和部署...${NC}"
echo -e "${YELLOW}這可能需要 5-10 分鐘，請耐心等待...${NC}"
echo ""

# 驗證 cloudbuild.yaml 存在
if [ ! -f "cloudbuild.yaml" ]; then
    echo -e "${RED}✗ 錯誤：找不到 cloudbuild.yaml 檔案${NC}"
    echo "請確認您在專案根目錄執行此腳本"
    exit 1
fi

gcloud builds submit --config=cloudbuild.yaml

# 取得服務 URL
echo ""
echo -e "${BLUE}► 取得服務資訊...${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo -e "${GREEN}"
echo "================================================"
echo "  ✓ 部署成功！"
echo "================================================"
echo -e "${NC}"
echo -e "${GREEN}服務 URL:${NC} $SERVICE_URL"
echo -e "${GREEN}健康檢查:${NC} $SERVICE_URL/api/health"
echo ""
echo -e "${BLUE}有用的指令：${NC}"
echo "  查看日誌: gcloud run services logs tail $SERVICE_NAME --region=$REGION"
echo "  查看詳情: gcloud run services describe $SERVICE_NAME --region=$REGION"
echo "  查看控制台: https://console.cloud.google.com/run"
echo ""
echo -e "${GREEN}部署完成！🚀${NC}"
