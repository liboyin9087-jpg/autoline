# Google Cloud Run 更新與整合摘要

## 更新日期
2024年12月

## 主要變更

### 1. 更新 Google Cloud GitHub Actions 到最新版本

所有部署工作流程已更新到最新的 Google Cloud GitHub Actions 版本：

- ✅ `google-github-actions/auth` 從 v2 升級到 **v3**
- ✅ `google-github-actions/setup-gcloud` 從 v2 升級到 **v3**

#### 更新的工作流程檔案：
- `.github/workflows/deploy-cloudrun.yml`
- `.github/workflows/auto-deploy.yml`

#### v3 版本的優勢：
- 運行在 Node.js 24 上，性能更好
- 更好的安全性支持
- 改進的錯誤處理
- 支援最新的 Google Cloud 功能

### 2. 整合成單一連線方式

#### 移除的工作流程：
- ❌ `.github/workflows/deploy-cloud-run.yml` (已移除)

#### 保留的統一部署工作流程：
1. **主要部署流程：** `deploy-cloudrun.yml`
   - 完整的 Docker 建置和部署流程
   - 推送變更到 main 分支時自動觸發
   - 支援手動觸發部署

2. **自動化部署：** `auto-deploy.yml`
   - 當依賴更新 PR 合併時自動部署
   - 支援手動快速部署最新內容

#### 為什麼移除 deploy-cloud-run.yml？
- 它使用簡化的 `--source` 部署方法
- `deploy-cloudrun.yml` 提供更完整的 Docker 建置流程
- 避免有兩個類似的部署工作流程造成混淆
- 統一使用 Docker 方式更適合生產環境

## 統一的部署架構

### 現在的工作流程結構：

```
.github/workflows/
├── deploy-cloudrun.yml    # 主要部署流程（Docker 方式）
├── auto-deploy.yml        # 自動化和手動快速部署
├── auto-update.yml        # 依賴套件自動更新
└── ci.yml                 # 持續整合測試
```

### 部署方式選擇：

#### 方式 1：推送代碼自動部署
```bash
git push origin main
```
→ 觸發 `deploy-cloudrun.yml`

#### 方式 2：依賴更新自動部署
1. 每週一自動檢查更新
2. 審查並合併自動建立的 PR
3. 自動觸發 `auto-deploy.yml` 部署

#### 方式 3：手動快速部署（推薦）⭐
1. 前往 Actions → Auto Deploy Updates
2. 點擊 Run workflow
3. 立即部署最新內容

## 部署流程優勢

### ✅ 統一標準
- 所有部署都使用相同的 Docker 建置流程
- 確保開發、測試、生產環境一致性

### ✅ 最新技術
- 使用最新版本的 Google Cloud Actions
- 支援最新的 Cloud Run 功能

### ✅ 簡化管理
- 移除重複的工作流程
- 更容易維護和理解

### ✅ 完整追蹤
- 每次部署都有詳細日誌
- 清楚的部署摘要和狀態

## 技術細節

### 部署配置（統一）

所有部署工作流程使用相同的配置：

```yaml
env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: asia-east1
  SERVICE_NAME: line-ai-assistant
```

### Docker 建置流程（統一）

```yaml
1. 建置前端：npm run build
2. 建置 Docker Image
3. 推送到 GCR (Google Container Registry)
4. 部署到 Cloud Run
5. 輸出服務 URL
```

### Cloud Run 資源配置（統一）

```yaml
Memory: 512Mi
CPU: 1
Max Instances: 10
Min Instances: 0
Timeout: 300s
Port: 8080
```

## 安全性改進

### 使用最新的認證方式
```yaml
- uses: google-github-actions/auth@v3
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}
```

### Secret 管理
- API Keys 存儲在 GCP Secret Manager
- GitHub Secrets 用於服務帳號認證
- 環境變數透過 Cloud Run 安全注入

## 如何使用

### 查看目前部署狀態
```bash
gcloud run services describe line-ai-assistant --region asia-east1
```

### 查看服務 URL
```bash
gcloud run services describe line-ai-assistant \
  --region asia-east1 \
  --format 'value(status.url)'
```

### 查看部署歷史
前往 GitHub Actions 分頁查看所有部署執行記錄

## 遷移完成檢查清單

- [x] 更新所有工作流程到 Google Cloud Actions v3
- [x] 移除重複的部署工作流程
- [x] 確認 YAML 語法正確
- [x] 測試工作流程配置
- [x] 更新文件記錄

## 後續步驟

### 建議的優化（可選）
1. 考慮使用 Workload Identity Federation 替代服務帳號金鑰
2. 設定 Cloud CDN 加速靜態資源
3. 配置自定義網域
4. 啟用 Cloud Monitoring 和 Alerting

## 需要幫助？

如果遇到問題：
1. 查看 [ACTIONS_SETUP.md](./ACTIONS_SETUP.md) 獲取詳細設定指南
2. 檢查 Actions 執行日誌
3. 查看 [Google Cloud Run 官方文件](https://cloud.google.com/run/docs)
4. 在 GitHub 上開 Issue

## 相關資源

- [Google Cloud Actions v3 Release Notes](https://github.com/google-github-actions/auth/releases)
- [Cloud Run Best Practices](https://cloud.google.com/run/docs/tips)
- [GitHub Actions 文件](https://docs.github.com/en/actions)
