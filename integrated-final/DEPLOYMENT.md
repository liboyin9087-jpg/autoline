# 快速部署指南

## 本地開發環境啟動

### 步驟一：環境準備

首先確認系統已安裝 Node.js 16.0 或更高版本。在專案根目錄建立 .env 檔案並設定您的 Google Gemini API 金鑰。

### 步驟二：安裝依賴

執行以下指令安裝所有必要套件：

```bash
npm install
```

### 步驟三：啟動服務

開啟兩個終端視窗，分別執行以下指令：

終端一（後端伺服器）：
```bash
npm run dev:server
```

終端二（前端開發伺服器）：
```bash
npm run dev
```

前端服務會在 http://localhost:5173 啟動，後端 API 服務則在 port 8080 運行。

## Google Cloud Shell 部署

### 快速啟動方式

在 Cloud Shell 中執行以下指令序列：

```bash
# 進入專案目錄
cd line-ai-assistant

# 安裝依賴
npm install

# 建立環境變數檔案
echo "GOOGLE_API_KEY=your_api_key_here" > .env

# 啟動後端伺服器（背景執行）
nohup npm run dev:server > server.log 2>&1 &

# 啟動前端開發伺服器
npm run dev
```

### 使用網路預覽功能

Cloud Shell 啟動後，點擊介面上方的「網路預覽」圖示，選擇「在連接埠 5173 上預覽」即可在瀏覽器中開啟應用程式。

## 生產環境部署

### 建置步驟

執行以下指令建置生產版本：

```bash
npm run build
```

建置完成後，所有靜態檔案會產生在 dist 目錄中。

### 啟動生產伺服器

建置完成後執行：

```bash
node server.js
```

生產伺服器會在 port 8080 啟動，同時提供 API 服務和靜態檔案託管。

## GitHub Actions 自動部署（選用）

如需設定 CI/CD 自動部署，可在 GitHub 儲存庫中建立 .github/workflows/deploy.yml 檔案，配置自動建置和部署流程。記得在儲存庫設定中加入 GOOGLE_API_KEY 作為 Secret。

## 常見問題處理

如果遇到 port 佔用問題，可以在 .env 檔案中修改 PORT 環境變數。CORS 錯誤通常表示前端無法連接到後端，請檢查兩個服務是否都已正確啟動。API 金鑰錯誤會在伺服器日誌中顯示，請確認 .env 檔案中的金鑰正確無誤。

## 效能優化建議

生產環境建議使用 PM2 或類似的程序管理工具來運行 server.js，確保服務的穩定性和自動重啟能力。如有高流量需求，可以考慮在前端使用 CDN 加速靜態資源載入，後端則可以配置負載平衡器分散請求壓力。
