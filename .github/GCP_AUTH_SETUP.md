# Google Cloud 認證設定指南

本文件說明如何設定 GitHub Actions 與 Google Cloud Platform 的認證，以便自動部署到 Cloud Run。

## 概述

GitHub Actions 提供兩種方式與 Google Cloud 認證：

### 方案 A：Workload Identity Federation（推薦）✅
- **優點**：最安全、無需管理長期憑證、符合最佳實踐
- **缺點**：設定步驟較多
- **適用**：生產環境、長期使用

### 方案 B：Service Account JSON 金鑰
- **優點**：設定簡單快速
- **缺點**：需要管理長期憑證、安全性較低
- **適用**：測試環境、快速原型

## 方案 A：Workload Identity Federation 設定（推薦）

### 步驟 1：啟用必要的 API

```bash
gcloud services enable iamcredentials.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 步驟 2：建立 Workload Identity Pool

```bash
# 設定變數
export PROJECT_ID="your-gcp-project-id"
export POOL_NAME="github-actions-pool"
export PROVIDER_NAME="github-provider"
export REPO_OWNER="liboyin9087-jpg"
export REPO_NAME="autoline"

# 建立 Workload Identity Pool
gcloud iam workload-identity-pools create "${POOL_NAME}" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# 取得 Pool ID
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe "${POOL_NAME}" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --format="value(name)")
```

### 步驟 3：建立 Workload Identity Provider

```bash
# 建立 Provider（連接 GitHub OIDC）
gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_NAME}" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="${POOL_NAME}" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == '${REPO_OWNER}'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# 取得 Provider 資源名稱
export WORKLOAD_IDENTITY_PROVIDER=$(gcloud iam workload-identity-pools providers describe "${PROVIDER_NAME}" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="${POOL_NAME}" \
  --format="value(name)")

echo "WORKLOAD_IDENTITY_PROVIDER: ${WORKLOAD_IDENTITY_PROVIDER}"
```

### 步驟 4：建立 Service Account

```bash
# 建立 Service Account
export SA_NAME="github-actions-deployer"
export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud iam service-accounts create "${SA_NAME}" \
  --project="${PROJECT_ID}" \
  --display-name="GitHub Actions Deployer"

# 授予必要權限
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"
```

### 步驟 5：授權 Workload Identity Pool 使用 Service Account

```bash
# 允許 GitHub Actions 假冒此 Service Account
gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${REPO_OWNER}/${REPO_NAME}"

echo "Service Account Email: ${SA_EMAIL}"
```

### 步驟 6：在 GitHub 設定 Secrets

前往 GitHub 儲存庫 → Settings → Secrets and variables → Actions，新增以下 secrets：

1. **WORKLOAD_IDENTITY_PROVIDER**
   ```
   projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider
   ```
   （使用步驟 3 中輸出的完整資源名稱）

2. **SERVICE_ACCOUNT_EMAIL**
   ```
   github-actions-deployer@your-project-id.iam.gserviceaccount.com
   ```

3. **GCP_PROJECT_ID**
   ```
   your-gcp-project-id
   ```

4. **API_URL**（如果需要）
   ```
   your-api-url-or-value
   ```

### 步驟 7：更新 Workflow 檔案

編輯 `.github/workflows/deploy-cloudrun.yml`：

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v3
  with:
    # 註解掉 credentials_json
    # credentials_json: ${{ secrets.GCP_SA_KEY }}
    
    # 啟用 Workload Identity Federation
    workload_identity_provider: ${{ secrets.WORKLOAD_IDENTITY_PROVIDER }}
    service_account: ${{ secrets.SERVICE_ACCOUNT_EMAIL }}
```

## 方案 B：Service Account JSON 金鑰設定

### 步驟 1：建立 Service Account

```bash
# 設定變數
export PROJECT_ID="your-gcp-project-id"
export SA_NAME="github-actions-deployer"
export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# 建立 Service Account
gcloud iam service-accounts create "${SA_NAME}" \
  --project="${PROJECT_ID}" \
  --display-name="GitHub Actions Deployer"

# 授予必要權限
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"
```

### 步驟 2：建立並下載 JSON 金鑰

```bash
# 建立金鑰並下載
gcloud iam service-accounts keys create key.json \
  --iam-account="${SA_EMAIL}"

echo "⚠️  金鑰已下載到 key.json，請妥善保管！"
```

### 步驟 3：在 GitHub 設定 Secrets

前往 GitHub 儲存庫 → Settings → Secrets and variables → Actions，新增以下 secrets：

1. **GCP_SA_KEY**
   - 開啟 `key.json` 檔案
   - 複製完整的 JSON 內容（包含大括號）
   - 貼上作為 secret 的值

2. **GCP_PROJECT_ID**
   ```
   your-gcp-project-id
   ```

3. **API_URL**（如果需要）
   ```
   your-api-url-or-value
   ```

### 步驟 4：確認 Workflow 設定

確認 `.github/workflows/deploy-cloudrun.yml` 使用 credentials_json：

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v3
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}
```

### 步驟 5：安全處理金鑰

```bash
# 上傳到 GitHub 後，立即刪除本地金鑰檔案
rm key.json

# 記錄金鑰 ID（用於日後輪換）
gcloud iam service-accounts keys list \
  --iam-account="${SA_EMAIL}"
```

## 關於使用 Compute Engine 預設 Service Account

您提到的 Service Account：
```
970949752172-compute@developer.gserviceaccount.com
```

這是 **Compute Engine 的預設 Service Account**。

### ⚠️ 重要注意事項：

1. **不建議用於 CI/CD**
   - 預設 SA 權限過大（Project Editor）
   - 不符合最小權限原則
   - 可能造成安全風險

2. **建議做法**
   - 建立專用的 Service Account（如上述步驟）
   - 只授予必要的權限
   - 更容易管理和稽核

3. **如果一定要使用預設 SA**
   
   **方案 A（Workload Identity Federation）：**
   ```bash
   # 授權 WIF 使用預設 SA
   export COMPUTE_SA="970949752172-compute@developer.gserviceaccount.com"
   
   gcloud iam service-accounts add-iam-policy-binding "${COMPUTE_SA}" \
     --project="${PROJECT_ID}" \
     --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${REPO_OWNER}/${REPO_NAME}"
   
   # 在 GitHub 設定
   # SERVICE_ACCOUNT_EMAIL = 970949752172-compute@developer.gserviceaccount.com
   ```

   **方案 B（JSON Key）：**
   ```bash
   # 為預設 SA 建立金鑰
   gcloud iam service-accounts keys create compute-key.json \
     --iam-account="970949752172-compute@developer.gserviceaccount.com"
   
   # 將 compute-key.json 內容設定為 GCP_SA_KEY secret
   ```

## 設定 Secret Manager（用於 API Key）

無論選擇哪種認證方式，都需要在 GCP Secret Manager 中設定應用程式需要的密鑰：

```bash
# 建立 GOOGLE_API_KEY secret
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create GOOGLE_API_KEY \
  --project="${PROJECT_ID}" \
  --data-file=- \
  --replication-policy="automatic"

# 授予 Cloud Run 存取權限
# 如果使用專用 SA
gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
  --project="${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"

# 如果使用 Compute Engine 預設 SA
gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
  --project="${PROJECT_ID}" \
  --member="serviceAccount:970949752172-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 驗證設定

### 測試 Workload Identity Federation

```bash
# 本地測試（需要 GitHub CLI 和適當的環境）
gcloud auth print-access-token \
  --impersonate-service-account="${SA_EMAIL}"
```

### 測試 Service Account JSON Key

```bash
# 使用金鑰認證
gcloud auth activate-service-account \
  --key-file=key.json

# 列出專案資源（測試權限）
gcloud run services list --project="${PROJECT_ID}"
```

## 疑難排解

### 錯誤：未收到認證參數

**錯誤訊息：**
```
google-github-actions/auth 步驟沒有收到 exactly one of workload_identity_provider 或 credentials_json
```

**解決方法：**
- 確保只設定一種認證方式（不要同時設定）
- 檢查 secret 名稱是否正確
- 確認 workflow 檔案中的參數拼寫正確

### 錯誤：PROJECT_ID 為空

**解決方法：**
1. 確認已設定 `GCP_PROJECT_ID` secret
2. 檢查 workflow 中的環境變數設定
3. 使用明確的 `--project` 參數

### 錯誤：Permission denied

**解決方法：**
1. 確認 Service Account 有正確的 IAM 角色
2. 檢查 Secret Manager 權限
3. 確認所有必要的 API 已啟用

### 錯誤：Workload Identity Pool not found

**解決方法：**
1. 確認 Pool 和 Provider 已正確建立
2. 檢查 `WORKLOAD_IDENTITY_PROVIDER` secret 的值
3. 確認 attribute-condition 設定正確

## 安全最佳實踐

1. **使用 Workload Identity Federation**
   - 避免長期憑證外洩風險
   - 自動輪換權杖
   - 更細緻的存取控制

2. **最小權限原則**
   - 只授予必要的 IAM 角色
   - 避免使用 Project Editor 等高權限角色
   - 定期審查權限

3. **定期輪換金鑰**（如使用 JSON key）
   - 每 90 天輪換一次
   - 刪除舊的未使用金鑰
   - 監控金鑰使用情況

4. **啟用稽核日誌**
   ```bash
   # 確認稽核日誌已啟用
   gcloud logging read "protoPayload.serviceName=iam.googleapis.com" \
     --project="${PROJECT_ID}" \
     --limit 10
   ```

5. **使用 Secret Manager**
   - 不要在代碼中硬編碼密鑰
   - 使用 Secret Manager 管理敏感資訊
   - 設定適當的存取控制

## 參考資料

- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [google-github-actions/auth](https://github.com/google-github-actions/auth)
- [Cloud Run IAM](https://cloud.google.com/run/docs/securing/managing-access)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)

## 需要協助？

如果遇到問題：
1. 檢查 GitHub Actions 執行日誌
2. 查看 Cloud Logging 中的稽核日誌
3. 在 GitHub Issues 中提問
4. 聯繫 GCP 支援團隊
