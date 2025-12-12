#!/bin/bash
echo "🚀 開始安裝修復檔案..."

# 複製檔案
cp App.tsx ~/autoline-main/integrated-final/src/
cp components/InputArea.tsx ~/autoline-main/integrated-final/src/components/

echo "✅ 檔案已複製"

# 設定 API Key
gcloud run services update line-ai-assistant \
  --region asia-east1 \
  --set-env-vars GOOGLE_API_KEY="AIzaSyCNs0SuKTIDlIxF1jHwhcwzWUxQTaw--JA"

echo "✅ API Key 已設定"

# 重新部署
cd ~/autoline-main/integrated-final
npm run build
./deploy.sh

echo "🎉 部署完成！"
echo "🌐 網址: https://line-ai-assistant-970949752172.asia-east1.run.app"
