# Cloud Run 部署指南

這份文件說明如何將 LINE AI Assistant 部署到 Google Cloud Run。

## 前置需求

### 1. Google Cloud Platform 帳號
- 建立或登入 [Google Cloud Console](https://console.cloud.google.com/)
- 建立一個新的專案或選擇現有專案
- 啟用必要的 API：
  - Cloud Run API
  - Cloud Build API
  - Container Registry API

### 2. 本地開發工具
- 安裝 [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- 安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop)（用於本地測試）
- 安裝 [Node.js 20+](https://nodejs.org/)

### 3. API 金鑰
- 取得 [Google Gemini API Key](https://makersuite.google.com/app/apikey)

## 部署方法

### 方法一：使用自動化腳本（推薦）

這是最簡單的部署方式，腳本會自動處理所有步驟。

#### 步驟 1：進入專案目錄
```bash
cd integrated-final
```

#### 步驟 2：執行部署腳本
```bash
./deploy.sh
```

腳本會引導您輸入：
- GCP Project ID
- 部署區域（預設：asia-east1）
- 服務名稱（預設：line-ai-assistant）
- Google API Key

#### 步驟 3：等待部署完成
腳本會自動完成以下步驟：
1. 安裝依賴套件
2. 建置前端應用程式
3. 建置 Docker Image
4. 推送 Image 到 Container Registry
5. 部署到 Cloud Run
6. 輸出服務 URL

### 方法二：使用 Cloud Build（自動化 CI/CD）

這種方法適合團隊開發和持續部署。

#### 步驟 1：設定環境變數
在 Google Cloud Console 的 Secret Manager 中建立 secret：
1. 前往 [Secret Manager](https://console.cloud.google.com/security/secret-manager)
2. 建立新的 secret，名稱為 `GOOGLE_API_KEY`
3. 將您的 Gemini API Key 作為 secret 值

#### 步驟 2：授予 Cloud Build 權限
```bash
# 取得 Cloud Build 服務帳號
PROJECT_ID="your-project-id"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# 授予必要權限
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
```

#### 步驟 3：觸發 Cloud Build
```bash
cd integrated-final
gcloud builds submit --config=cloudbuild.yaml
```

#### 步驟 4：設定觸發器（選用）
在 Cloud Console 設定 GitHub 觸發器，當推送到特定分支時自動部署：
1. 前往 [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. 點擊「建立觸發器」
3. 連接您的 GitHub 儲存庫
4. 設定觸發條件（例如：推送到 main 分支）
5. 選擇 `cloudbuild.yaml` 作為建置配置檔案

### 方法三：手動部署

如果您想要完全控制每個步驟，可以手動執行：

#### 步驟 1：建置前端
```bash
cd integrated-final
npm install
npm run build
```

#### 步驟 2：建置並推送 Docker Image
```bash
PROJECT_ID="your-project-id"
IMAGE_NAME="gcr.io/$PROJECT_ID/line-ai-assistant"

# 建置 image
docker build -t $IMAGE_NAME:latest .

# 推送到 Container Registry
docker push $IMAGE_NAME:latest
```

#### 步驟 3：部署到 Cloud Run
```bash
gcloud run deploy line-ai-assistant \
  --image $IMAGE_NAME:latest \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --port 8080 \
  --set-env-vars "GOOGLE_API_KEY=your_api_key,NODE_ENV=production,PORT=8080" \
  --max-instances 10 \
  --min-instances 0 \
  --timeout 300
```

## 配置選項

### 資源配置
根據流量調整資源設定：

| 流量等級 | Memory | CPU | Max Instances |
|---------|--------|-----|---------------|
| 低流量  | 512Mi  | 1   | 5             |
| 中流量  | 1Gi    | 2   | 20            |
| 高流量  | 2Gi    | 4   | 50            |

### 區域選擇
選擇靠近目標用戶的區域以降低延遲：
- `asia-east1`（台灣）
- `asia-northeast1`（東京）
- `asia-southeast1`（新加坡）

### 環境變數
可以透過 Cloud Run 設定以下環境變數：

| 變數名稱 | 必要 | 說明 |
|---------|------|------|
| `GOOGLE_API_KEY` | 是 | Gemini API 金鑰 |
| `NODE_ENV` | 否 | 執行環境（預設：production） |
| `PORT` | 否 | 伺服器端口（預設：8080） |

## 監控與維護

### 查看日誌
```bash
# 即時日誌
gcloud run services logs tail line-ai-assistant --region asia-east1

# 最近的日誌
gcloud run services logs read line-ai-assistant --region asia-east1 --limit 100
```

### 監控指標
在 [Cloud Console](https://console.cloud.google.com/run) 可以查看：
- 請求數量
- 延遲時間
- CPU 使用率
- 記憶體使用率
- 錯誤率

### 更新部署
當您修改代碼後，重新執行部署腳本或觸發 Cloud Build：
```bash
# 使用腳本
./deploy.sh

# 或使用 Cloud Build
gcloud builds submit --config=cloudbuild.yaml
```

### 回滾版本
如果新版本有問題，可以回滾到先前的版本：
```bash
# 列出所有版本
gcloud run revisions list --service line-ai-assistant --region asia-east1

# 回滾到特定版本
gcloud run services update-traffic line-ai-assistant \
  --to-revisions REVISION_NAME=100 \
  --region asia-east1
```

## 成本優化

### 建議的成本控制措施
1. **設定最小實例數為 0**：沒有流量時自動縮減到零
2. **設定合理的最大實例數**：避免突發流量導致高額費用
3. **使用適當的資源配置**：不要過度配置記憶體和 CPU
4. **監控 API 使用量**：Gemini API 也有費用，定期檢查用量

### 預估成本
Cloud Run 按使用量計費：
- 請求數：每百萬次請求約 $0.40 USD
- CPU 時間：每 vCPU-秒約 $0.00002400 USD
- 記憶體時間：每 GiB-秒約 $0.00000250 USD

Gemini API 費用另計，請參考 [Gemini API Pricing](https://ai.google.dev/pricing)。

## 疑難排解

### 部署失敗
1. 檢查 Cloud Build 日誌：
   ```bash
   gcloud builds list --limit 5
   gcloud builds log BUILD_ID
   ```

2. 確認權限設定正確
3. 檢查 API 是否已啟用

### 服務無法存取
1. 確認服務允許未經身份驗證的存取：
   ```bash
   gcloud run services add-iam-policy-binding line-ai-assistant \
     --region asia-east1 \
     --member="allUsers" \
     --role="roles/run.invoker"
   ```

2. 檢查防火牆規則

### API 錯誤
1. 檢查環境變數中的 API Key 是否正確
2. 確認 API Key 有足夠的配額
3. 查看服務日誌尋找詳細錯誤訊息

### 記憶體不足
如果服務出現 OOM（Out of Memory）錯誤：
```bash
gcloud run services update line-ai-assistant \
  --memory 1Gi \
  --region asia-east1
```

## 安全性最佳實踐

1. **使用 Secret Manager**：不要在代碼中硬編碼敏感資訊
2. **限制服務存取**：考慮使用 Cloud IAM 限制誰可以存取服務
3. **啟用 HTTPS**：Cloud Run 預設啟用 HTTPS
4. **定期更新依賴**：保持依賴套件為最新版本
5. **監控異常活動**：設定警報通知異常流量或錯誤

## 進階配置

### 自定義網域
將自定義網域映射到 Cloud Run 服務：
```bash
gcloud run domain-mappings create \
  --service line-ai-assistant \
  --domain your-domain.com \
  --region asia-east1
```

### VPC 連接
如果需要連接到 VPC 網路中的資源：
```bash
gcloud run services update line-ai-assistant \
  --vpc-connector YOUR_CONNECTOR_NAME \
  --region asia-east1
```

### 設定 Cloud CDN
為靜態資源啟用 CDN 快取以提升效能並降低成本。

## 支援與資源

- [Cloud Run 官方文件](https://cloud.google.com/run/docs)
- [Cloud Build 文件](https://cloud.google.com/build/docs)
- [Gemini API 文件](https://ai.google.dev/docs)
- [專案 GitHub 儲存庫](https://github.com/liboyin9087-jpg/autoline)

如有問題，請在 GitHub 上開 Issue。
