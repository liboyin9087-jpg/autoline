# Google Cloud Run 快速部署指南

這份指南將幫助您快速將應用程式部署到 Google Cloud Run。

## 前置需求

1. **Google Cloud 帳號**：需要有效的 GCP 帳號
2. **Google Cloud SDK**：安裝 gcloud CLI 工具
3. **Docker**（選用）：用於本地測試
4. **Gemini API 金鑰**：從 https://makersuite.google.com/app/apikey 取得

## 快速部署步驟

### 方法一：使用 Cloud Build 自動部署（推薦）

這是最快速的部署方式，會自動建置並部署到 Cloud Run。

#### 1. 初始化 GCP 專案

```bash
# 登入 Google Cloud
gcloud auth login

# 設定專案 ID（替換為您的專案 ID）
gcloud config set project YOUR_PROJECT_ID

# 啟用必要的 API
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

#### 2. 設定 API 金鑰密鑰

```bash
# 建立密鑰（請替換 YOUR_GEMINI_API_KEY 為實際的金鑰）
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create GOOGLE_API_KEY \
  --data-file=- \
  --replication-policy="automatic"

# 給予 Cloud Run 存取密鑰的權限
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### 3. 執行部署

```bash
# 在專案根目錄執行
gcloud builds submit --config=cloudbuild.yaml
```

部署完成後，您會看到服務的 URL，類似：
```
Service [autoline] revision [autoline-xxxxx] has been deployed and is serving 100 percent of traffic.
Service URL: https://autoline-xxxxx-xx.a.run.app
```

### 方法二：手動建置後部署

如果您需要更多控制權，可以手動建置並部署。

#### 1. 建置應用程式

```bash
cd integrated-final

# 安裝依賴
npm install --legacy-peer-deps

# 建置前端
npm run build

# 確認 dist 目錄已建立
ls -la dist/
```

#### 2. 建置 Docker 映像

```bash
# 在 integrated-final 目錄中執行
docker build -t gcr.io/YOUR_PROJECT_ID/autoline:latest .

# 推送到 Container Registry
docker push gcr.io/YOUR_PROJECT_ID/autoline:latest
```

#### 3. 部署到 Cloud Run

```bash
gcloud run deploy autoline \
  --image=gcr.io/YOUR_PROJECT_ID/autoline:latest \
  --region=asia-east1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --min-instances=0 \
  --set-env-vars=NODE_ENV=production \
  --set-secrets=GOOGLE_API_KEY=GOOGLE_API_KEY:latest
```

### 方法三：使用 Cloud Shell（最簡單）

如果您不想在本地安裝工具，可以直接使用 Google Cloud Console 的 Cloud Shell。

1. 前往 [Google Cloud Console](https://console.cloud.google.com)
2. 點擊右上角的 Cloud Shell 圖示啟動終端機
3. 複製您的專案到 Cloud Shell：
   ```bash
   git clone YOUR_REPOSITORY_URL
   cd autoline
   ```
4. 執行方法一的步驟

## 設定說明

### cloudbuild.yaml 設定

`cloudbuild.yaml` 檔案定義了自動化建置和部署流程：

- **建置步驟**：安裝依賴 → 建置前端 → 建置 Docker 映像 → 推送映像 → 部署到 Cloud Run
- **地區設定**：預設使用 `asia-east1`（台灣）
- **資源配置**：1GB 記憶體、1 個 CPU
- **自動擴展**：0-10 個實例

您可以根據需求修改這些設定。

### 環境變數

應用程式需要以下環境變數：

- `GOOGLE_API_KEY`：Gemini API 金鑰（透過 Secret Manager 管理）
- `NODE_ENV`：設定為 `production`
- `PORT`：Cloud Run 會自動設定為 8080

## 更新部署

當您有新的程式碼變更時：

```bash
# 使用 Cloud Build 自動部署
gcloud builds submit --config=cloudbuild.yaml
```

或者使用 GitHub Actions 設定自動部署（見下方）。

## 設定 CI/CD（選用）

您可以設定 GitHub Actions 來實現自動部署。

### 1. 建立服務帳號

```bash
# 建立服務帳號
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# 授予必要權限
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# 建立金鑰
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 2. 設定 GitHub Secrets

在您的 GitHub 儲存庫設定中新增以下 Secrets：

- `GCP_PROJECT_ID`：您的 GCP 專案 ID
- `GCP_SA_KEY`：上一步產生的 key.json 內容

### 3. 建立 GitHub Actions Workflow

參考檔案 `.github/workflows/deploy-cloudrun.yml`，該檔案已配置好以下功能：

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
      
      - name: Deploy to Cloud Run
        run: |
          gcloud builds submit --config=cloudbuild.yaml
```

現在，每次推送到 main 分支時，都會自動部署到 Cloud Run！

## 監控和日誌

### 查看日誌

```bash
# 查看即時日誌
gcloud run services logs tail autoline --region=asia-east1

# 查看最近的日誌
gcloud run services logs read autoline --region=asia-east1 --limit=50
```

### 查看服務狀態

```bash
# 取得服務詳細資訊
gcloud run services describe autoline --region=asia-east1

# 列出所有版本
gcloud run revisions list --service=autoline --region=asia-east1
```

### Cloud Console 監控

前往 [Cloud Run Console](https://console.cloud.google.com/run) 查看：
- 即時流量
- 錯誤率
- 回應時間
- 資源使用情況

## 成本優化

### 1. 自動擴展設定

```bash
# 設定最小實例為 0（無流量時不收費）
gcloud run services update autoline \
  --min-instances=0 \
  --region=asia-east1
```

### 2. 資源配置

根據實際使用情況調整資源：

```bash
# 降低記憶體配置（如果足夠使用）
gcloud run services update autoline \
  --memory=512Mi \
  --region=asia-east1
```

### 3. 使用配額

- Cloud Run 每月有 200 萬次請求免費額度
- 360,000 GB-秒的記憶體免費額度
- 180,000 vCPU-秒的 CPU 免費額度

## 故障排除

### 建置失敗

```bash
# 查看建置日誌
gcloud builds log $(gcloud builds list --limit=1 --format="value(id)")
```

常見問題：
- 依賴安裝失敗：檢查 package.json
- 建置超時：增加 cloudbuild.yaml 中的 timeout
- 記憶體不足：增加 machineType

### 部署失敗

```bash
# 查看部署狀態
gcloud run services describe autoline --region=asia-east1
```

常見問題：
- 容器啟動失敗：檢查 Dockerfile 和 server.js
- 健康檢查失敗：確認應用程式正確監聽 PORT 環境變數
- 密鑰存取錯誤：檢查 Secret Manager 權限

### 應用程式錯誤

```bash
# 查看應用程式日誌
gcloud run services logs tail autoline --region=asia-east1
```

常見問題：
- API 金鑰錯誤：檢查 Secret Manager 中的金鑰
- CORS 錯誤：檢查 server.js 中的 CORS 設定
- 檔案路徑錯誤：確認 dist 目錄結構正確

## 進階設定

### 自訂網域

```bash
# 映射自訂網域
gcloud run domain-mappings create \
  --service=autoline \
  --domain=your-domain.com \
  --region=asia-east1
```

### 設定 VPC 連接器

```bash
# 如果需要連接到 VPC 內的資源
gcloud run services update autoline \
  --vpc-connector=YOUR_CONNECTOR \
  --region=asia-east1
```

### 設定並發處理

```bash
# 設定每個實例最多處理的並發請求數
gcloud run services update autoline \
  --concurrency=80 \
  --region=asia-east1
```

## 安全性建議

1. **使用 Secret Manager**：永遠不要將 API 金鑰直接寫在程式碼中
2. **啟用驗證**（如果不需要公開存取）：
   ```bash
   gcloud run services update autoline \
     --no-allow-unauthenticated \
     --region=asia-east1
   ```
3. **定期更新依賴套件**：
   ```bash
   npm audit fix
   ```
4. **實作速率限制**：在應用程式中加入 rate limiting

## 效能優化

1. **啟用 CDN**：使用 Cloud CDN 快取靜態資源
2. **優化映像大小**：
   - 使用 multi-stage build
   - 移除不必要的檔案
   - 使用 .dockerignore
3. **最佳化 Node.js**：
   - 使用 NODE_ENV=production
   - 啟用 compression
   - 實作快取機制

## 回滾到先前版本

```bash
# 列出所有版本
gcloud run revisions list --service=autoline --region=asia-east1

# 回滾到特定版本
gcloud run services update-traffic autoline \
  --to-revisions=REVISION_NAME=100 \
  --region=asia-east1
```

## 刪除服務

```bash
# 刪除 Cloud Run 服務
gcloud run services delete autoline --region=asia-east1

# 刪除 Container Registry 中的映像
gcloud container images delete gcr.io/YOUR_PROJECT_ID/autoline:TAG
```

## 支援與資源

- [Cloud Run 官方文件](https://cloud.google.com/run/docs)
- [Cloud Build 文件](https://cloud.google.com/build/docs)
- [Secret Manager 文件](https://cloud.google.com/secret-manager/docs)
- [GitHub Actions 與 GCP 整合](https://github.com/google-github-actions)

## 常見問題（FAQ）

**Q: 部署需要多久時間？**
A: 使用 Cloud Build 通常需要 5-10 分鐘，取決於專案大小和網路速度。

**Q: 如何檢查服務是否正常運行？**
A: 訪問 `https://YOUR_SERVICE_URL/api/health` 應該返回 `{"status":"ok"}`

**Q: 可以使用免費額度嗎？**
A: 可以！Cloud Run 有慷慨的免費額度，小型專案通常完全免費。

**Q: 如何設定多個環境（開發/生產）？**
A: 可以部署多個服務（如 autoline-dev、autoline-prod）或使用不同的專案。

**Q: 為什麼要使用 integrated-final 目錄？**
A: 這是專案結構的設計，所有完整的應用程式程式碼都在該目錄中。

## 總結

現在您已經知道如何：
- ✅ 使用 Cloud Build 自動部署
- ✅ 手動建置和部署
- ✅ 設定 CI/CD
- ✅ 監控和除錯
- ✅ 優化成本和效能

開始部署您的應用程式吧！🚀

---

**最後更新**：2025-12-08
**版本**：1.0.0
