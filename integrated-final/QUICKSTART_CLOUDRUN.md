# 快速部署到 Cloud Run

## 最快速的部署方式

如果您想要最快速地將應用程式部署到 Cloud Run，請依照以下步驟：

### 前置準備（5分鐘）

1. **確認您有 Google Cloud 帳號**
   - 前往 https://console.cloud.google.com/
   - 建立新專案或選擇現有專案

2. **啟用必要的 API**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **取得 Gemini API Key**
   - 前往 https://makersuite.google.com/app/apikey
   - 建立並複製 API Key

### 部署步驟（10分鐘）

#### 在本地電腦部署

```bash
# 1. 進入專案目錄
cd integrated-final

# 2. 執行自動部署腳本
./deploy.sh

# 3. 按照提示輸入資訊：
#    - GCP Project ID
#    - 區域（建議：asia-east1）
#    - 服務名稱（預設：line-ai-assistant）
#    - Gemini API Key

# 4. 等待部署完成（約5-8分鐘）
```

部署完成後，您會看到服務的 URL，類似：
```
Service URL: https://line-ai-assistant-970949752172.asia-east1.run.app
```

#### 在 Cloud Shell 部署

如果您沒有安裝本地工具，可以直接在 Cloud Shell 部署：

```bash
# 1. 在 Cloud Console 開啟 Cloud Shell（右上角圖示）

# 2. 克隆或上傳您的代碼
git clone https://github.com/liboyin9087-jpg/autoline.git
cd autoline/integrated-final

# 3. 執行部署
./deploy.sh
```

### 驗證部署

1. **開啟服務 URL**
   - 在瀏覽器開啟部署完成時顯示的 URL
   - 您應該看到 LINE AI Assistant 的介面

2. **測試功能**
   - 選擇一個 AI 角色
   - 發送測試訊息
   - 確認收到回應

3. **檢查日誌**（如果有問題）
   ```bash
   gcloud run services logs read line-ai-assistant \
     --region asia-east1 \
     --limit 50
   ```

### 常見問題快速解決

#### 問題：部署失敗
```bash
# 檢查最近的建置日誌
gcloud builds list --limit 5
gcloud builds log [BUILD_ID]
```

#### 問題：API Key 錯誤
```bash
# 更新環境變數
gcloud run services update line-ai-assistant \
  --update-env-vars GOOGLE_API_KEY=your_new_api_key \
  --region asia-east1
```

#### 問題：記憶體不足
```bash
# 增加記憶體配置
gcloud run services update line-ai-assistant \
  --memory 1Gi \
  --region asia-east1
```

### 更新應用程式

當您修改代碼後，只需重新執行：
```bash
./deploy.sh
```

腳本會自動：
1. 重新建置前端
2. 建立新的 Docker image
3. 部署到 Cloud Run
4. 自動切換流量到新版本

### 監控與管理

#### 查看即時日誌
```bash
gcloud run services logs tail line-ai-assistant --region asia-east1
```

#### 查看服務狀態
```bash
gcloud run services describe line-ai-assistant --region asia-east1
```

#### 查看流量統計
前往 Cloud Console：
https://console.cloud.google.com/run

選擇您的服務查看詳細指標。

### 成本預估

對於小型應用：
- 前 200 萬次請求：免費
- 每月預估成本：約 $5-20 USD（取決於流量）

Cloud Run 按使用量計費，沒有流量時不收費。

### 進階：使用 GitHub Actions 自動部署

如果您想要在推送代碼時自動部署，請參考 `CLOUD_RUN_DEPLOYMENT.md` 中的 CI/CD 設定。

### 需要幫助？

- 完整部署文件：`CLOUD_RUN_DEPLOYMENT.md`
- Cloud Run 文件：https://cloud.google.com/run/docs
- 開 Issue：https://github.com/liboyin9087-jpg/autoline/issues

---

**就是這麼簡單！** 🚀

執行 `./deploy.sh`，按照提示操作，您的應用程式就會在 Cloud Run 上運行了。
