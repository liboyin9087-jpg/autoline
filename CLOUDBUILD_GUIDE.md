# Google Cloud Build 部署指南

本文件說明如何使用 Google Cloud Build 部署 LINE AI Assistant 應用程式。

## 什麼是 Cloud Build？

Google Cloud Build 是 Google Cloud Platform 提供的持續整合和持續部署 (CI/CD) 服務。`cloudbuild.yaml` 檔案定義了建置和部署的步驟。

## 前置需求

### 1. Google Cloud 專案設定

確保您已完成以下設定：

- 建立 Google Cloud 專案
- 啟用必要的 API：
  ```bash
  gcloud services enable cloudbuild.googleapis.com
  gcloud services enable run.googleapis.com
  gcloud services enable containerregistry.googleapis.com
  gcloud services enable secretmanager.googleapis.com
  ```

### 2. 設定 Secret Manager

建立 `GOOGLE_API_KEY` secret 以儲存 Gemini API 金鑰：

```bash
# 建立 secret
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create GOOGLE_API_KEY \
  --data-file=- \
  --replication-policy="automatic"

# 授予 Cloud Build 存取權限
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. 授予 Cloud Build 必要權限

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# 授予 Cloud Run 管理員權限
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/run.admin"

# 授予服務帳號使用者權限
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/iam.serviceAccountUser"
```

## 使用方式

### 方法 1: 手動觸發建置（本機）

從專案根目錄執行：

```bash
gcloud builds submit --config=cloudbuild.yaml
```

這個指令會：
1. 將專案檔案上傳到 Cloud Build
2. 執行 `cloudbuild.yaml` 中定義的所有步驟
3. 自動部署到 Cloud Run

### 方法 2: 設定自動觸發器

您可以設定觸發器，在 GitHub 推送或 PR 合併時自動執行建置。

#### 使用 gcloud 指令建立觸發器

```bash
gcloud builds triggers create github \
  --name="autoline-deploy" \
  --repo-name="autoline" \
  --repo-owner="liboyin9087-jpg" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml"
```

#### 使用 Cloud Console 建立觸發器

1. 前往 [Cloud Build 觸發器頁面](https://console.cloud.google.com/cloud-build/triggers)
2. 點擊「建立觸發器」
3. 連接您的 GitHub 儲存庫
4. 設定觸發條件：
   - **名稱**: autoline-deploy
   - **事件**: 推送到分支
   - **來源**: `^main$`
   - **建置配置**: Cloud Build 配置檔案 (yaml 或 json)
   - **位置**: `/cloudbuild.yaml`
5. 點擊「建立」

### 方法 3: 從 GitHub 手動觸發

如果您已設定觸發器，也可以在 Cloud Console 中手動執行：

1. 前往 [Cloud Build 觸發器](https://console.cloud.google.com/cloud-build/triggers)
2. 找到您的觸發器並點擊「執行」
3. 選擇分支或標籤
4. 點擊「執行觸發器」

## cloudbuild.yaml 檔案說明

本專案的 `cloudbuild.yaml` 包含以下步驟：

### Step 1: 安裝依賴

```yaml
- name: 'node:20-slim'
  entrypoint: npm
  args: ['install']
  dir: 'integrated-final'
```

使用 Node.js 20 容器安裝 npm 套件。

### Step 2: 建置前端

```yaml
- name: 'node:20-slim'
  entrypoint: npm
  args: ['run', 'build']
  dir: 'integrated-final'
```

執行 Vite 建置，產生最佳化的前端資源。

### Step 3: 建置 Docker 映像

```yaml
- name: 'gcr.io/cloud-builders/docker'
  args:
    - 'build'
    - '-t'
    - 'gcr.io/$PROJECT_ID/line-ai-assistant:$BUILD_ID'
    - '-t'
    - 'gcr.io/$PROJECT_ID/line-ai-assistant:latest'
    - '.'
  dir: 'integrated-final'
```

使用 `integrated-final` 目錄中的 Dockerfile 建置容器映像，並標記為建置 ID 和 latest。

### Step 4 & 5: 推送映像到 Container Registry

```yaml
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'gcr.io/$PROJECT_ID/line-ai-assistant:$BUILD_ID']

- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'gcr.io/$PROJECT_ID/line-ai-assistant:latest']
```

將建置好的映像推送到 Google Container Registry。

### Step 6: 部署到 Cloud Run

```yaml
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - 'line-ai-assistant'
    - '--image'
    - 'gcr.io/$PROJECT_ID/line-ai-assistant:$BUILD_ID'
    - '--region'
    - 'asia-east1'
    - '--platform'
    - 'managed'
    - '--allow-unauthenticated'
    - '--memory'
    - '512Mi'
    - '--cpu'
    - '1'
    - '--port'
    - '8080'
    - '--set-env-vars'
    - 'NODE_ENV=production,PORT=8080'  # 多個環境變數用逗號分隔
    - '--update-secrets'
    - 'GOOGLE_API_KEY=GOOGLE_API_KEY:latest'
```

將映像部署到 Cloud Run，並設定資源、環境變數和 secrets。

**注意**: `--set-env-vars` 參數使用逗號分隔多個環境變數，這是 gcloud 的標準格式。

## 配置選項

### 修改部署區域

編輯 `cloudbuild.yaml` 中的 `--region` 參數：

```yaml
args:
  - 'run'
  - 'deploy'
  - 'line-ai-assistant'
  - '--region'
  - 'asia-northeast1'  # 改為東京
  # 或
  # '--region'
  # 'asia-southeast1'  # 新加坡
  # 或
  # '--region'
  # 'us-central1'      # 美國中部
```

### 調整資源配置

根據需求調整記憶體和 CPU：

```yaml
- '--memory'
- '1Gi'     # 增加到 1GB
- '--cpu'
- '2'       # 增加到 2 個 CPU
```

### 設定實例數量

```yaml
- '--max-instances'
- '20'      # 最多 20 個實例
- '--min-instances'
- '1'       # 最少保持 1 個實例（避免冷啟動）
```

### 添加或修改環境變數

使用 `--set-env-vars` 參數設定環境變數。多個變數使用逗號分隔（這是 gcloud 的標準格式）：

```yaml
- '--set-env-vars'
- 'NODE_ENV=production,PORT=8080,CUSTOM_VAR=value,DEBUG=false'
```

若要設定單一環境變數：

```yaml
- '--set-env-vars'
- 'NODE_ENV=production'
```

### 調整建置機器類型

在 `cloudbuild.yaml` 的 `options` 區段：

```yaml
options:
  machineType: 'E2_HIGHCPU_8'    # 8 核高 CPU
  # 或
  # machineType: 'N1_HIGHCPU_8'  # N1 系列
  # machineType: 'E2_HIGHCPU_32' # 32 核（更快但更貴）
  logging: CLOUD_LOGGING_ONLY
```

## 監控建置

### 查看建置歷史

```bash
# 列出最近的建置
gcloud builds list --limit=10

# 查看特定建置的詳細資訊
gcloud builds describe BUILD_ID
```

### 即時查看建置日誌

```bash
# 串流最新建置的日誌
gcloud builds log --stream
```

### 在 Cloud Console 查看

前往 [Cloud Build 歷史記錄](https://console.cloud.google.com/cloud-build/builds) 查看所有建置的狀態、日誌和詳細資訊。

## 疑難排解

### 常見問題

#### 1. 權限錯誤

**錯誤**: `Permission denied` 或 `403 Forbidden`

**解決方案**:
- 確認 Cloud Build 服務帳號有正確的 IAM 角色
- 檢查 Secret Manager 的權限設定
- 確認所有必要的 API 都已啟用

#### 2. Secret 不存在

**錯誤**: `Secret "GOOGLE_API_KEY" not found`

**解決方案**:
```bash
# 檢查 secret 是否存在
gcloud secrets list | grep GOOGLE_API_KEY

# 如果不存在，建立它
echo -n "YOUR_API_KEY" | gcloud secrets create GOOGLE_API_KEY --data-file=-
```

#### 3. 建置超時

**錯誤**: `Build timeout`

**解決方案**: 在 `cloudbuild.yaml` 中增加 timeout：

```yaml
timeout: 1800s  # 增加到 30 分鐘
```

#### 4. 記憶體不足

**錯誤**: `npm install` 或 `npm run build` 失敗

**解決方案**: 使用更大的建置機器：

```yaml
options:
  machineType: 'E2_HIGHCPU_32'  # 使用 32 核機器
```

#### 5. Docker 建置失敗

**解決方案**:
1. 確認 `integrated-final/Dockerfile` 存在且語法正確
2. 檢查前端建置是否成功產生 `dist` 目錄
3. 查看完整的建置日誌找出具體錯誤

### 查看詳細日誌

```bash
# 取得建置 ID
BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)")

# 查看完整日誌
gcloud builds log $BUILD_ID
```

## 成本估算

Cloud Build 的計費方式：

- **免費額度**: 每天前 120 分鐘建置時間免費
- **付費部分**: 超過免費額度後，每分鐘約 $0.003 USD

一次完整建置大約需要 5-10 分鐘，成本約 $0.015-$0.03 USD。

### 成本優化建議

1. **使用適當的機器類型**: 不要過度配置
2. **使用 Docker layer caching**: 可以顯著加快建置速度
3. **只在必要時建置**: 使用路徑過濾器避免不必要的建置
4. **清理舊的容器映像**: 定期刪除不需要的映像以節省儲存成本

## 與 GitHub Actions 的比較

### Cloud Build 的優勢

- ✅ 原生整合 Google Cloud 服務
- ✅ 更快的建置速度（在 GCP 內部網路）
- ✅ 更靈活的建置機器配置
- ✅ 更好的 GCP 權限管理

### GitHub Actions 的優勢

- ✅ 與 GitHub 深度整合
- ✅ 豐富的社群 Actions
- ✅ 更容易設定和維護
- ✅ 免費額度更多（每月 2000 分鐘）

### 建議

- **小型專案**: 使用 GitHub Actions（本專案已配置）
- **大型專案或高頻部署**: 考慮使用 Cloud Build
- **混合使用**: GitHub Actions 用於 CI/測試，Cloud Build 用於生產部署

## 進階功能

### 並行建置

修改 `cloudbuild.yaml` 以並行執行多個步驟。使用 `waitFor` 欄位控制步驟執行順序：

```yaml
steps:
  # 這個步驟會立即執行
  - name: 'step-1'
    id: 'step-1'
    # ...

  # 這個步驟也會立即執行（與 step-1 並行）
  - name: 'step-2'
    id: 'step-2'
    # ... (沒有 waitFor 欄位，或使用空列表)

  # 這個步驟等待 step-1 和 step-2 都完成後才執行
  - name: 'step-3'
    id: 'step-3'
    waitFor: ['step-1', 'step-2']
    # ...
```

**注意**: 預設情況下，每個步驟會等待前一個步驟完成。若要並行執行，需明確指定 `waitFor` 欄位。

### 使用替代變數

在觸發器中定義替代變數：

```yaml
substitutions:
  _SERVICE_NAME: 'my-custom-service'
  _REGION: 'asia-east1'

steps:
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    args:
      - 'run'
      - 'deploy'
      - '${_SERVICE_NAME}'
      - '--region'
      - '${_REGION}'
```

### 建置快取

啟用 Docker layer caching 以加速建置：

```yaml
options:
  machineType: 'E2_HIGHCPU_8'
  logging: CLOUD_LOGGING_ONLY
  volumes:
    - name: 'docker-cache'
      path: '/var/lib/docker'
```

## 相關資源

- [Cloud Build 官方文件](https://cloud.google.com/build/docs)
- [Cloud Run 部署指南](integrated-final/CLOUD_RUN_DEPLOYMENT.md)
- [GitHub Actions 設定指南](.github/ACTIONS_SETUP.md)
- [Cloud Build 價格](https://cloud.google.com/build/pricing)
- [Cloud Build 範例](https://github.com/GoogleCloudPlatform/cloud-build-samples)

## 需要協助？

如果您在使用 Cloud Build 時遇到問題：

1. 查看 [Cloud Build 疑難排解指南](https://cloud.google.com/build/docs/troubleshooting)
2. 檢查建置日誌以找出具體錯誤
3. 在 [GitHub Issues](../../issues) 中提問
4. 參考 [Stack Overflow](https://stackoverflow.com/questions/tagged/google-cloud-build) 上的相關問題
