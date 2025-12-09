# 設定指南 - 前後端連線問題解決方案

## 問題說明

前後端無法連線的主要原因：

1. **API 回應格式不匹配**：
   - 後端返回 `{ reply: "...", usage: {...} }`
   - 前端期待 `{ text: "...", usage: {...} }`
   - **已修復**：將 server.js 中的 `reply` 改為 `text`

2. **缺少環境變數**：
   - 需要設定 GOOGLE_API_KEY

3. **前端未建置**：
   - 需要執行 `npm run build` 生成 dist 資料夾

## 快速啟動步驟

### 步驟 1：安裝依賴
```bash
cd integrated-final
npm install
```

### 步驟 2：設定環境變數
建立 `.env` 檔案：
```bash
cp .env.example .env
```

編輯 `.env` 檔案，填入你的 Google API Key：
```
GOOGLE_API_KEY=your_actual_api_key_here
PORT=8080
NODE_ENV=development
```

### 步驟 3：開發模式啟動

#### 方法 A：同時啟動前後端（推薦）
開啟兩個終端視窗：

終端 1 - 後端伺服器：
```bash
npm run dev:server
```

終端 2 - 前端開發伺服器：
```bash
npm run dev
```

然後在瀏覽器開啟：http://localhost:5173

#### 方法 B：生產模式
```bash
# 建置前端
npm run build

# 啟動後端（會同時提供前端靜態檔案）
node server.js
```

然後在瀏覽器開啟：http://localhost:8080

## 修復內容

### server.js 修改
```javascript
// 修改前
res.json({ reply: text, usage });

// 修改後
res.json({ text: text, usage });
```

這個修改確保後端回應格式與前端期待一致。

## 驗證連線

1. 開啟瀏覽器開發者工具（F12）
2. 切換到 Network 頁籤
3. 發送一條訊息
4. 檢查 `/api/chat` 請求：
   - Status 應該是 200
   - Response 應該包含 `{ text: "...", usage: {...} }`

## 常見問題

### Q: 顯示 "API key not configured"
A: 檢查 `.env` 檔案是否存在且包含正確的 GOOGLE_API_KEY

### Q: 顯示 "連線錯誤"
A: 
1. 確認後端伺服器已啟動（檢查 terminal 是否顯示 "Server running on http://localhost:8080"）
2. 確認前端 Vite 開發伺服器已啟動
3. 檢查瀏覽器 Console 是否有錯誤訊息

### Q: Vite 代理設定
開發模式下，Vite 會自動將 `/api/*` 的請求代理到 `http://localhost:8080`。
這在 `vite.config.ts` 中設定：
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      ws: true
    }
  }
}
```

## 技術細節

### API 流程
```
前端 (port 5173) → Vite Proxy → 後端 (port 8080) → Gemini API
                                     ↓
                    回應 { text, usage }
                                     ↓
                              前端顯示訊息
```

### 檔案結構
- `src/services/geminiService.ts`: 前端 API 服務
- `server.js`: 後端 Express 伺服器
- `vite.config.ts`: Vite 設定（包含代理）
- `.env`: 環境變數（需自行建立）
