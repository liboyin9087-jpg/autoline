# 部署檢查清單

在部署到 Google Cloud Run 之前，請確認以下項目：

## 📋 前置準備

- [ ] 已安裝 Google Cloud SDK (`gcloud --version`)
- [ ] 已登入 Google Cloud (`gcloud auth list`)
- [ ] 已建立或選擇 GCP 專案
- [ ] 已取得 Gemini API 金鑰 (https://makersuite.google.com/app/apikey)
- [ ] 已啟用計費（Cloud Run 需要）

## 🔑 API 金鑰準備

- [ ] API 金鑰已複製並妥善保存
- [ ] 已測試 API 金鑰可以正常使用

## 🏗️ 本地測試（建議但非必須）

- [ ] 執行 `./test-build.sh` 測試建置流程
- [ ] 確認建置成功無錯誤
- [ ] 檢查 dist 目錄已正確產生

## 🚀 部署步驟

### 方法一：使用快速部署腳本（推薦）

```bash
./deploy.sh YOUR_PROJECT_ID
```

部署時會：
- [ ] 自動設定專案
- [ ] 啟用必要的 API
- [ ] 設定 API 金鑰密鑰
- [ ] 建置並部署應用程式

### 方法二：手動部署

1. 設定專案
```bash
gcloud config set project YOUR_PROJECT_ID
```

2. 啟用 API
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

3. 建立密鑰
```bash
echo -n "YOUR_API_KEY" | gcloud secrets create GOOGLE_API_KEY \
  --data-file=- --replication-policy="automatic"
```

4. 設定權限
```bash
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

5. 執行部署
```bash
gcloud builds submit --config=cloudbuild.yaml
```

## ✅ 部署後驗證

部署完成後，請檢查：

- [ ] 服務 URL 已顯示（例如：https://autoline-xxxxx.a.run.app）
- [ ] 訪問健康檢查端點：`curl YOUR_URL/api/health`
  - 應該返回：`{"status":"ok"}`
- [ ] 訪問主頁面：在瀏覽器開啟 YOUR_URL
  - 應該看到應用程式介面
- [ ] 測試 API 功能：
  - [ ] 選擇一個角色
  - [ ] 發送測試訊息
  - [ ] 確認收到 AI 回覆

## 📊 監控設定

部署後建議：

- [ ] 訪問 Cloud Run 控制台查看服務狀態
- [ ] 設定告警通知（選用）
- [ ] 查看日誌確認無錯誤

```bash
# 查看即時日誌
gcloud run services logs tail autoline --region=asia-east1
```

## 🔄 持續部署（選用）

如果要設定 GitHub Actions 自動部署：

- [ ] 建立服務帳號
- [ ] 產生金鑰並加入 GitHub Secrets
- [ ] 推送程式碼時會自動部署

詳細步驟請參閱 [CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md)

## 🐛 常見問題

### 權限錯誤
- 確認您的帳號有專案的編輯者權限
- 確認已啟用必要的 API

### 建置失敗
- 檢查 integrated-final 目錄結構
- 確認 package.json 正確
- 查看建置日誌：`gcloud builds log BUILD_ID`

### 容器無法啟動
- 檢查環境變數設定
- 查看服務日誌：`gcloud run services logs tail autoline`
- 確認 API 金鑰正確

### API 呼叫失敗
- 確認 Secret Manager 中的金鑰正確
- 檢查金鑰權限設定
- 查看應用程式日誌

## 📚 相關文件

- [DEPLOY_QUICKSTART.md](./DEPLOY_QUICKSTART.md) - 快速開始
- [CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md) - 完整指南
- [integrated-final/DEPLOYMENT_GUIDE.md](./integrated-final/DEPLOYMENT_GUIDE.md) - 應用程式說明

## ✨ 完成！

當所有檢查項目都完成後，您的應用程式就成功部署到 Google Cloud Run 了！

享受您的 LINE AI Assistant！🎉
