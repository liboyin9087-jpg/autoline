# 修復摘要：Google Cloud 認證問題

## 🎯 問題診斷

根據您提供的問題描述，workflow 失敗的原因：

1. **認證參數錯誤**：`google-github-actions/auth` 步驟沒有收到 exactly one of `workload_identity_provider` 或 `credentials_json`
2. **PROJECT_ID 為空**：日誌顯示 PROJECT_ID 是空的，表示 workflow 沒有正確注入必要的 secret/變數
3. **Service Account**：您提到使用的 SA email 是 `970949752172-compute@developer.gserviceaccount.com`（Compute Engine 預設 SA）

## ✅ 已完成的修復

### 1. 更新 Workflow 檔案（`.github/workflows/deploy-cloudrun.yml`）

#### 變更內容：

- **新增 API_URL 環境變數支援**
  ```yaml
  env:
    PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
    REGION: asia-east1
    SERVICE_NAME: line-ai-assistant
    API_URL: ${{ secrets.API_URL }}  # 新增
  ```

- **增強認證步驟文檔**
  - 新增詳細的註解說明兩種認證方式
  - 明確指出當前使用的是 Service Account JSON Key 方式
  - 提供切換到 Workload Identity Federation 的說明

- **修正所有 gcloud 命令**
  - 在所有 gcloud 命令中明確指定 `--project="${PROJECT_ID}"`
  - 新增 echo 語句來驗證 PROJECT_ID 是否正確設定
  - 使用 `${PROJECT_ID}` 變數語法（使用大括號）以確保正確展開

- **改善 Cloud SDK 設定**
  ```yaml
  - name: Set up Cloud SDK
    uses: google-github-actions/setup-gcloud@v3
    with:
      project_id: ${{ secrets.GCP_PROJECT_ID }}  # 新增
  ```

### 2. 建立完整的認證設定指南（`.github/GCP_AUTH_SETUP.md`）

新建立的文檔包含：

- **方案 A：Workload Identity Federation（推薦）**
  - 完整的步驟說明（建立 Pool、Provider、授權等）
  - 所需的 GitHub Secrets 清單
  - 如何切換 workflow 設定

- **方案 B：Service Account JSON Key**
  - 快速設定步驟
  - 如何建立和下載 JSON 金鑰
  - 安全最佳實踐

- **關於 Compute Engine 預設 SA 的說明**
  - 為什麼不建議使用預設 SA
  - 如果必須使用的設定方法
  - 安全性考量

- **疑難排解指南**
  - 常見錯誤及解決方法
  - 驗證設定的方法

- **安全最佳實踐**
  - 最小權限原則
  - 金鑰輪換
  - 稽核日誌

### 3. 更新 ACTIONS_SETUP.md

在原有的設定指南中：
- 新增指向詳細認證設定指南的連結
- 增加兩種認證方案的快速摘要
- 保持原有內容的完整性

## 🔧 您需要採取的行動

### 立即行動（必須）

#### 選項 1：使用 Service Account JSON Key（快速設定）

1. **確認已設定 GitHub Secrets**
   
   前往：`https://github.com/liboyin9087-jpg/autoline/settings/secrets/actions`
   
   確認以下 Secrets 存在且正確：
   
   - ✅ `GCP_SA_KEY`：完整的 JSON 金鑰內容
   - ✅ `GCP_PROJECT_ID`：您的 GCP 專案 ID（不是專案編號）
   - ✅ `API_URL`：您的 API URL（如果應用程式需要）

2. **如果 Secrets 不存在或錯誤**
   
   請參考 `.github/GCP_AUTH_SETUP.md` 的「方案 B」章節：
   ```bash
   # 建立 Service Account（如果還沒有）
   gcloud iam service-accounts create github-actions-deployer \
     --project="YOUR_PROJECT_ID" \
     --display-name="GitHub Actions Deployer"
   
   # 建立金鑰
   gcloud iam service-accounts keys create key.json \
     --iam-account="github-actions-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com"
   
   # 將 key.json 的內容複製到 GitHub Secret: GCP_SA_KEY
   ```

3. **確認 Service Account 權限**
   
   您的 SA 需要以下角色：
   - `roles/run.admin`
   - `roles/storage.admin`
   - `roles/iam.serviceAccountUser`
   - `roles/secretmanager.secretAccessor`

#### 選項 2：使用 Workload Identity Federation（推薦，生產環境）

1. **完整設定步驟**
   
   請遵循 `.github/GCP_AUTH_SETUP.md` 的「方案 A」章節的詳細步驟。

2. **需要設定的 GitHub Secrets**
   - `WORKLOAD_IDENTITY_PROVIDER`
   - `SERVICE_ACCOUNT_EMAIL`
   - `GCP_PROJECT_ID`
   - `API_URL`

3. **修改 workflow 檔案**
   
   編輯 `.github/workflows/deploy-cloudrun.yml` 的認證步驟：
   ```yaml
   - name: Authenticate to Google Cloud
     uses: google-github-actions/auth@v3
     with:
       # 註解掉這一行
       # credentials_json: ${{ secrets.GCP_SA_KEY }}
       
       # 啟用這兩行
       workload_identity_provider: ${{ secrets.WORKLOAD_IDENTITY_PROVIDER }}
       service_account: ${{ secrets.SERVICE_ACCOUNT_EMAIL }}
   ```

### 關於您的 Service Account Email

您提到的 `970949752172-compute@developer.gserviceaccount.com` 是 **Compute Engine 預設 Service Account**。

⚠️ **重要建議**：

1. **不建議用於 CI/CD**
   - 預設 SA 通常具有過大的權限（Project Editor）
   - 不符合最小權限原則
   - 難以追蹤和稽核

2. **建議做法**
   - 建立專用的 Service Account（例如：`github-actions-deployer@PROJECT_ID.iam.gserviceaccount.com`）
   - 只授予必要的權限
   - 更容易管理和輪換憑證

3. **如果必須使用預設 SA**
   - 請參考 `.github/GCP_AUTH_SETUP.md` 中的「關於使用 Compute Engine 預設 Service Account」章節
   - 確保該 SA 有正確的 IAM 權限
   - 如果使用 WIF，需要授予 workloadIdentityUser 角色

### API_URL 變數說明

您提到「已更新變數 api 在資料裡了」，我已在 workflow 中新增 `API_URL` 環境變數：

```yaml
env:
  API_URL: ${{ secrets.API_URL }}
```

**如果您的 secret 名稱不是 `API_URL`**，請：
1. 告訴我正確的名稱
2. 或自行修改 workflow 中的對應行

**如果應用程式不需要這個變數**，可以直接刪除這一行。

## 📋 驗證步驟

設定完成後，請依序驗證：

### 1. 檢查 GitHub Secrets

```bash
# 無法直接查看 secret 值，但可以確認是否存在
# 前往：https://github.com/liboyin9087-jpg/autoline/settings/secrets/actions
```

### 2. 手動觸發 Workflow 測試

1. 前往：`https://github.com/liboyin9087-jpg/autoline/actions/workflows/deploy-cloudrun.yml`
2. 點擊「Run workflow」
3. 選擇 `copilot/fix-authentication-credentials` 分支
4. 點擊「Run workflow」

### 3. 檢查執行日誌

在 Actions 執行時，檢查：

- ✅ 認證步驟是否成功
- ✅ 是否能看到 `PROJECT_ID=your-project-id` 的輸出
- ✅ Docker 建置是否成功
- ✅ 部署到 Cloud Run 是否成功

### 4. 常見錯誤處理

| 錯誤訊息 | 原因 | 解決方法 |
|---------|------|---------|
| "exactly one of workload_identity_provider or credentials_json required" | 同時設定或都沒設定認證參數 | 確保只使用一種認證方式 |
| "PROJECT_ID is empty" | Secret 未設定或名稱錯誤 | 檢查 GitHub Secret 名稱是否為 `GCP_PROJECT_ID` |
| "Permission denied" | Service Account 權限不足 | 確認 SA 有必要的 IAM 角色 |
| "Service account does not exist" | Service Account 不存在 | 建立 Service Account 或確認 email 正確 |

## 📚 相關文件

- [GCP_AUTH_SETUP.md](.github/GCP_AUTH_SETUP.md) - 完整的認證設定指南
- [ACTIONS_SETUP.md](.github/ACTIONS_SETUP.md) - GitHub Actions 設定指南
- [deploy-cloudrun.yml](.github/workflows/deploy-cloudrun.yml) - 更新後的 workflow 檔案

## 🎯 下一步

1. **選擇認證方案**（方案 A 或方案 B）
2. **設定 GitHub Secrets**
3. **測試 workflow**（手動觸發或推送代碼）
4. **確認部署成功**
5. **（選擇性）切換到 Workload Identity Federation**（如果目前使用方案 B）

## ❓ 需要協助？

如果您在設定過程中遇到任何問題：

1. **查看詳細文檔**：`.github/GCP_AUTH_SETUP.md`
2. **檢查 Actions 日誌**：查看具體的錯誤訊息
3. **確認 GCP 設定**：使用 `gcloud` 命令驗證
4. **提出 Issue**：在 GitHub 上提供錯誤日誌

## 🔐 安全提醒

- ✅ 不要將 JSON 金鑰提交到 Git 倉庫
- ✅ 定期輪換 Service Account 金鑰（每 90 天）
- ✅ 使用最小權限原則
- ✅ 啟用 GCP 稽核日誌
- ✅ 優先選擇 Workload Identity Federation

---

**修復完成日期**：2025-12-09  
**修復版本**：v2.0  
**狀態**：✅ Workflow 已更新，等待使用者設定 Secrets
