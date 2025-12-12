#!/bin/bash

# ==========================================
# 🚀 Autoline 自動部署腳本 (零互動模式 - 已內建 Key)
# ==========================================

set -e # 遇到錯誤立即停止

# 顏色設定
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 您的 API Key 已安全地寫入此腳本中
# 這樣可以避免手機連線中斷
GOOGLE_API_KEY="AIzaSyCNs0SuKTIDlIxF1jHwhcwzWUxQTaw--JA"

echo -e "${BLUE}=== 開始部署程序 (零互動) ===${NC}"

# 1. 自動抓取 Project ID
PROJECT_ID=$(gcloud config get-value project)
echo -e "${GREEN}✓ 使用專案: $PROJECT_ID${NC}"

# 2. 設定 API Key (無需互動，自動執行)
echo -e "${BLUE}► 正在自動更新 Gemini API Key 至 Secret Manager...${NC}"
echo -n "$GOOGLE_API_KEY" | gcloud secrets create GOOGLE_API_KEY --data-file=- --replication-policy="automatic" 2>/dev/null || \
echo -n "$GOOGLE_API_KEY" | gcloud secrets versions add GOOGLE_API_KEY --data-file=-

echo -e "${GREEN}✓ API Key 已成功設置為安全密鑰。${NC}"

# 3. 執行 Cloud Build 部署
echo ""
echo -e "${BLUE}► 啟動 Cloud Build (上次建置失敗，這次將重新嘗試)...${NC}"
echo "正在提交建置任務 (約 3-5 分鐘)..."

gcloud builds submit --config=cloudbuild.yaml

# 4. 顯示結果
echo ""
echo -e "${GREEN}=== 🎉 部署任務已提交！ ===${NC}"
SERVICE_URL=$(gcloud run services describe line-ai-assistant --region asia-east1 --format 'value(status.url)' 2>/dev/null)
echo -e "您的網站網址 (部署完成後生效): ${BLUE}$SERVICE_URL${NC}"
echo -e "請稍候 3-5 分鐘，Cloud Build 完成後即可訪問。"
