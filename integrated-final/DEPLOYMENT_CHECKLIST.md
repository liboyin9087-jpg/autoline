# Google Cloud Run 部署檢查清單

## ✅ 已完成的準備工作

### 1. 代碼問題修復
- [x] 修復 App.tsx 中的語法錯誤（truncated className）
- [x] 添加 `"type": "module"` 到 package.json
- [x] 本地構建測試通過 (`npm run build`)
- [x] 本地服務器測試通過 (`node server.js`)

### 2. 代碼清理
- [x] 刪除未使用的檔案和組件
- [x] 移除多餘的 scripts 從 package.json
- [x] 清理 public 資源檔案
- [x] 更新 Dockerfile 移除 prompts.js 引用

### 3. Docker 配置
- [x] Dockerfile 使用多階段構建（builder + production）
- [x] .dockerignore 正確配置
- [x] PORT 8080 已設定（Cloud Run 需求）
- [x] 健康檢查端點已實作 (`/api/health`)

### 4. Cloud Run 配置檔案
- [x] cloudbuild.yaml 已配置
- [x] deploy.sh 腳本已準備
- [x] 環境變數配置正確

---

## 📋 部署前需要確認的項目

### 環境變數設定
在 Google Cloud Console 或使用 Cloud Build 時需要設定：

1. **GOOGLE_API_KEY** (必須)
   - Gemini API 金鑰
   - 可使用 Secret Manager: `GOOGLE_API_KEY=GOOGLE_API_KEY:latest`

2. **NODE_ENV** (自動設定)
   - 值: `production`
   - 已在 Dockerfile 和 cloudbuild.yaml 中設定

3. **PORT** (自動設定)
   - 值: `8080`
   - Cloud Run 預設端口

### Google Cloud 權限與服務

確保以下服務已啟用：
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com  # 如使用 Secret Manager
```

### Secret Manager 設定（推薦）

建議將 API Key 存入 Secret Manager：
```bash
# 創建 secret
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create GOOGLE_API_KEY --data-file=-

# 授權 Cloud Run 訪問
gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🚀 部署方式

### 方式 1: 使用 Cloud Build (推薦)

```bash
cd integrated-final
gcloud builds submit --config cloudbuild.yaml
```

**優點：**
- 自動化構建和部署
- 使用 Secret Manager 管理敏感資訊
- 完整的構建日誌

### 方式 2: 使用 deploy.sh 腳本

```bash
cd integrated-final
chmod +x deploy.sh
./deploy.sh
```

**注意：** 此方法會要求手動輸入 API Key

### 方式 3: 手動部署

```bash
cd integrated-final

# 1. 構建應用
npm ci --legacy-peer-deps
npm run build

# 2. 構建並推送 Docker 映像
gcloud builds submit --tag gcr.io/PROJECT_ID/line-ai-assistant

# 3. 部署到 Cloud Run
gcloud run deploy line-ai-assistant \
  --image gcr.io/PROJECT_ID/line-ai-assistant \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --set-env-vars NODE_ENV=production \
  --update-secrets GOOGLE_API_KEY=GOOGLE_API_KEY:latest
```

---

## 🔍 部署後驗證

部署完成後，測試以下端點：

### 1. 健康檢查
```bash
curl https://YOUR-SERVICE-URL/api/health
```
預期回應：
```json
{
  "status": "ok",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ",
  "version": "2.0.0"
}
```

### 2. 狀態檢查
```bash
curl https://YOUR-SERVICE-URL/api/status
```
預期回應：
```json
{
  "server": "running",
  "apiKeyConfigured": true,
  "port": 8080,
  "environment": "production",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ",
  "version": "2.0.0"
}
```

### 3. 前端測試
直接在瀏覽器訪問：
```
https://YOUR-SERVICE-URL
```
應該能看到應用程式的介面

---

## 📊 資源配置建議

### Cloud Run 設定
- **記憶體**: 1Gi（建議最小值）
- **CPU**: 1（預設）
- **並發數**: 80（預設）
- **超時時間**: 300秒（預設）
- **最小實例數**: 0（冷啟動可接受）或 1（保持溫暖）
- **最大實例數**: 100（預設）

### 成本估算
- 免費額度：每月 200 萬次請求
- 冷啟動時間：約 3-5 秒
- 暖啟動時間：< 100ms

---

## 🛡️ 安全建議

1. **API Key 管理**
   - ✅ 使用 Secret Manager 存儲敏感資訊
   - ✅ 不要將 API Key 提交到版本控制
   - ✅ .env 檔案已在 .gitignore 中

2. **網路安全**
   - 考慮使用 Cloud Armor 防護
   - 啟用 HTTPS（Cloud Run 預設啟用）
   - 設定適當的 CORS 策略

3. **監控與日誌**
   - 啟用 Cloud Logging
   - 設定告警規則
   - 監控 API 配額使用

---

## 🐛 常見問題排查

### 問題 1: 構建失敗
```
Error: Cannot find module 'XXX'
```
**解決方案**: 確保所有依賴在 package.json 中正確列出

### 問題 2: 運行時錯誤
```
Error: GOOGLE_API_KEY is not defined
```
**解決方案**: 檢查 Secret Manager 設定和 IAM 權限

### 問題 3: 圖片載入失敗
```
404 on /fairy_consultant.png
```
**解決方案**: 確保圖片在 public/ 目錄，且構建時正確複製到 dist/

### 問題 4: 冷啟動慢
**解決方案**: 
- 設定最小實例數為 1
- 優化 Docker 映像大小
- 使用 alpine 基礎映像（已使用）

---

## 📝 部署清單總結

部署前請確認：

- [ ] 已設定 Google Cloud 專案
- [ ] 已啟用必要的 API 服務
- [ ] GOOGLE_API_KEY 已存入 Secret Manager
- [ ] 已授權 Cloud Run 存取 Secret
- [ ] 本地測試已通過
- [ ] Dockerfile 配置正確
- [ ] cloudbuild.yaml 配置正確
- [ ] .dockerignore 配置正確
- [ ] 已選擇部署方式

部署後請驗證：

- [ ] /api/health 端點正常
- [ ] /api/status 顯示 API Key 已配置
- [ ] 前端頁面正常載入
- [ ] 可以成功發送訊息並收到回覆
- [ ] 圖片資源正常載入
- [ ] 無 console 錯誤

---

## 🎉 完成！

所有準備工作已就緒，可以推送到 Google Cloud Run！

如有問題，請查閱：
- [Cloud Run 文件](https://cloud.google.com/run/docs)
- [Secret Manager 文件](https://cloud.google.com/secret-manager/docs)
- [Cloud Build 文件](https://cloud.google.com/build/docs)
