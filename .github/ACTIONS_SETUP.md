# GitHub Actions 設定指南

本專案包含自動化部署到 Google Cloud Run 的 GitHub Actions 工作流程。

## 已配置的 Actions

### 1. Deploy to Cloud Run (deploy-cloudrun.yml)

自動將應用程式部署到 Google Cloud Run。

**觸發條件：**
- 當推送到 `main` 分支且 `integrated-final/` 目錄有變更時
- 手動觸發（workflow_dispatch）

**功能：**
- 安裝依賴並建置前端
- 建置 Docker Image
- 推送到 Google Container Registry
- 部署到 Cloud Run
- 輸出部署 URL

## 設定步驟

### 步驟 1：建立 GCP 服務帳號

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇您的專案
3. 前往「IAM 與管理」→「服務帳號」
4. 點擊「建立服務帳號」
5. 設定名稱（例如：github-actions）
6. 授予以下角色：
   - Cloud Run Admin
   - Storage Admin
   - Service Account User

### 步驟 2：建立並下載金鑰

1. 點擊剛建立的服務帳號
2. 前往「金鑰」分頁
3. 點擊「新增金鑰」→「建立新的金鑰」
4. 選擇 JSON 格式
5. 下載金鑰檔案

### 步驟 3：在 GitHub 設定 Secrets

1. 前往您的 GitHub 儲存庫
2. 點擊「Settings」→「Secrets and variables」→「Actions」
3. 點擊「New repository secret」
4. 新增以下 secrets：

#### GCP_SA_KEY
- 名稱：`GCP_SA_KEY`
- 值：貼上剛才下載的 JSON 金鑰檔案的完整內容

#### GCP_PROJECT_ID
- 名稱：`GCP_PROJECT_ID`
- 值：您的 GCP 專案 ID（例如：gen-lang-client-0093815006）

### 步驟 4：設定 Secret Manager（用於 API Key）

在 GCP 中建立 Secret：

```bash
# 建立 secret
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create GOOGLE_API_KEY \
  --data-file=- \
  --replication-policy="automatic"

# 授予 Cloud Run 存取權限
gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 步驟 5：啟用必要的 API

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

## 使用方式

### 自動部署

當您推送代碼到 `main` 分支，並且 `integrated-final/` 目錄有變更時，Actions 會自動執行部署。

```bash
git add .
git commit -m "Update application"
git push origin main
```

### 手動觸發

1. 前往 GitHub 儲存庫的「Actions」分頁
2. 選擇「Deploy to Cloud Run」工作流程
3. 點擊「Run workflow」
4. 選擇分支並點擊「Run workflow」

## 監控部署

### 查看執行狀態

1. 前往 GitHub 儲存庫的「Actions」分頁
2. 點擊最新的工作流程執行
3. 查看各個步驟的執行狀態和日誌

### 部署成功後

部署成功後，您會在 Summary 看到：
- 服務名稱
- 部署區域
- 服務 URL
- Commit SHA

## 常見問題

### 問題 1：權限錯誤

**錯誤訊息：** `Permission denied` 或 `403 Forbidden`

**解決方法：**
- 確認服務帳號有正確的角色
- 檢查 Secret Manager 的 IAM 權限
- 確認已啟用所有必要的 API

### 問題 2：Secret 不存在

**錯誤訊息：** `Secret GOOGLE_API_KEY not found`

**解決方法：**
```bash
# 確認 secret 是否存在
gcloud secrets list

# 如果不存在，建立它
echo -n "YOUR_API_KEY" | gcloud secrets create GOOGLE_API_KEY --data-file=-
```

### 問題 3：Docker build 失敗

**錯誤訊息：** `Error building Docker image`

**解決方法：**
- 確認 Dockerfile 語法正確
- 檢查 `npm run build` 是否成功
- 查看完整的建置日誌

### 問題 4：部署超時

**解決方法：**
```yaml
# 在 workflow 中增加 timeout
jobs:
  deploy:
    timeout-minutes: 30  # 增加這行
```

## 自訂配置

### 修改部署區域

編輯 `.github/workflows/deploy-cloudrun.yml`：

```yaml
env:
  REGION: asia-northeast1  # 改為您想要的區域
```

### 修改資源配置

編輯部署步驟中的資源參數：

```yaml
- name: Deploy to Cloud Run
  run: |
    gcloud run deploy $SERVICE_NAME \
      --memory 1Gi \      # 增加記憶體
      --cpu 2 \           # 增加 CPU
      --max-instances 20  # 增加最大實例數
```

### 添加環境變數

```yaml
--set-env-vars "NODE_ENV=production,PORT=8080,CUSTOM_VAR=value"
```

## 進階功能

### 添加測試步驟

在部署前添加測試：

```yaml
- name: Run tests
  working-directory: integrated-final
  run: npm test
```

### 添加代碼檢查

```yaml
- name: Lint code
  working-directory: integrated-final
  run: npm run lint
```

### 條件部署

只在特定條件下部署：

```yaml
- name: Deploy to Cloud Run
  if: github.ref == 'refs/heads/main'
  run: |
    # 部署命令
```

## 安全性建議

1. **不要在代碼中包含敏感資訊**
   - 使用 GitHub Secrets 和 GCP Secret Manager
   - 不要提交 `.env` 檔案

2. **定期輪換金鑰**
   - 每 90 天更換服務帳號金鑰
   - 刪除舊的、未使用的金鑰

3. **限制權限**
   - 只授予必要的最小權限
   - 使用特定的服務帳號而非專案擁有者

4. **啟用稽核日誌**
   - 監控部署活動
   - 設定警報通知異常活動

## 成本控制

1. **避免不必要的部署**
   - 使用 `paths` 過濾器只在相關檔案變更時部署
   - 考慮使用分支保護規則

2. **優化建置時間**
   - 使用 npm cache
   - 使用 Docker layer caching

3. **監控使用量**
   - 定期檢查 Cloud Run 使用量
   - 設定預算警報

## 相關文件

- [GitHub Actions 文件](https://docs.github.com/en/actions)
- [Cloud Run 文件](https://cloud.google.com/run/docs)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs)
- [專案部署指南](./CLOUD_RUN_DEPLOYMENT.md)

## 需要幫助？

如果您遇到問題：
1. 查看 Actions 執行日誌
2. 檢查 Cloud Run 服務日誌
3. 在 GitHub 上開 Issue
