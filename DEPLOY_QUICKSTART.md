# Google Cloud Run 部署快速啟動

## 🚀 最快速的部署方式

只需要 2 個步驟：

### 1. 執行部署腳本

```bash
./deploy.sh YOUR_PROJECT_ID
```

腳本會自動：
- 設定 GCP 專案
- 啟用必要的 API
- 設定 API 金鑰密鑰（如果需要）
- 建置並部署應用程式

### 2. 訪問您的應用程式

部署完成後，您會看到服務 URL，例如：
```
https://autoline-xxxxx-xx.a.run.app
```

就這麼簡單！🎉

## 📋 前置需求

1. **安裝 Google Cloud SDK**
   - macOS: `brew install google-cloud-sdk`
   - Windows: [下載安裝程式](https://cloud.google.com/sdk/docs/install)
   - Linux: [安裝指令](https://cloud.google.com/sdk/docs/install#linux)

2. **登入 Google Cloud**
   ```bash
   gcloud auth login
   ```

3. **準備 Gemini API 金鑰**
   - 前往 https://makersuite.google.com/app/apikey
   - 建立或取得 API 金鑰

## 📁 專案檔案說明

- `cloudbuild.yaml` - Cloud Build 自動化配置
- `deploy.sh` - 快速部署腳本
- `.gcloudignore` - 指定不上傳的檔案
- `integrated-final/Dockerfile` - Docker 容器配置
- `integrated-final/.dockerignore` - Docker 建置時忽略的檔案

## 🔧 自訂設定

如果需要修改設定，編輯 `cloudbuild.yaml`：

```yaml
# 修改地區
--region=asia-east1  # 台灣
# 其他選項: us-central1, europe-west1 等

# 修改資源配置
--memory=1Gi  # 記憶體
--cpu=1       # CPU 數量

# 修改擴展設定
--max-instances=10  # 最大實例數
--min-instances=0   # 最小實例數（0 = 無流量時不收費）
```

## 🔄 更新部署

有新的程式碼變更時，只需要重新執行：

```bash
./deploy.sh YOUR_PROJECT_ID
```

或使用 gcloud 指令：

```bash
gcloud builds submit --config=cloudbuild.yaml
```

## 📊 監控和管理

### 查看即時日誌
```bash
gcloud run services logs tail autoline --region=asia-east1
```

### 查看服務狀態
```bash
gcloud run services describe autoline --region=asia-east1
```

### 訪問 Cloud Console
https://console.cloud.google.com/run

## 💰 成本估算

Cloud Run 提供慷慨的免費額度：
- 每月 200 萬次請求
- 360,000 GB-秒的記憶體
- 180,000 vCPU-秒的 CPU

對於小型專案，通常完全免費！

## 🐛 故障排除

### 建置失敗
```bash
# 查看建置日誌
gcloud builds log $(gcloud builds list --limit=1 --format="value(id)")
```

### 服務無法啟動
```bash
# 查看服務日誌
gcloud run services logs tail autoline --region=asia-east1
```

### 常見問題

**Q: 部署時出現權限錯誤**
A: 確認您的帳號有專案的編輯者權限

**Q: API 金鑰設定失敗**
A: 確認已啟用 Secret Manager API

**Q: 容器無法啟動**
A: 檢查 integrated-final/dist 目錄是否正確建置

## 📚 完整文件

需要更詳細的說明？請參閱：
- [CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md) - 完整部署指南
- [integrated-final/DEPLOYMENT_GUIDE.md](./integrated-final/DEPLOYMENT_GUIDE.md) - 應用程式部署說明

## 🎯 下一步

部署成功後，您可以：
1. 設定自訂網域
2. 啟用 CI/CD 自動部署
3. 設定監控和告警
4. 優化效能和成本

詳細步驟請參考 [CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md)

---

**需要協助？** 檢查完整文件或開啟 Issue。
