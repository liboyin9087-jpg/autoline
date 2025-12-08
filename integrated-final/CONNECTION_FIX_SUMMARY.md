# 前後端連線問題修復總結

## 問題診斷

經過完整的檢查，發現以下三個主要問題導致前後端無法連線：

### 1. 🔴 API 回應格式不匹配（關鍵問題）

**問題描述：**
- 前端 `geminiService.ts` 發送請求後，期待收到 `{ text: "...", usage: {...} }` 格式
- 後端 `server.js` 回應的是 `{ reply: "...", usage: {...} }` 格式
- 導致前端無法正確解析回應，顯示「連線失敗」

**修復方式：**
```javascript
// server.js 第 91 行
// 修改前：
res.json({ reply: text, usage });

// 修改後：
res.json({ text: text, usage });
```

### 2. 🟡 專案結構問題

**問題描述：**
專案中存在兩套組件目錄結構：
- `/integrated-final/components/` - 包含完整的組件
- `/integrated-final/src/components/` - 只包含部分舊版組件

當執行 `npm run build` 時，Vite 從 `src/` 目錄建置，導致找不到許多組件。

**修復方式：**
- 將所有組件從 `components/` 複製到 `src/components/`
- 將 `services/geminiService.ts` 複製到 `src/services/`
- 將 `utils/parser.ts` 複製到 `src/utils/`
- 使用完整的 `types.ts` 覆蓋 `src/types.ts`

### 3. 🟢 環境配置問題

**問題描述：**
- 缺少 `.env` 檔案
- 缺少建置產物 `dist/` 資料夾

**修復方式：**
- 提供 `.env.example` 作為範本
- 執行 `npm run build` 產生 dist 資料夾
- 更新 `.gitignore` 排除 node_modules 和 dist

## 修復後的檔案結構

```
integrated-final/
├── .env                    # 環境變數（需自行建立）
├── .env.example            # 環境變數範本
├── server.js               # 後端伺服器（已修復 API 格式）
├── package.json            # 專案設定
├── vite.config.ts          # Vite 設定（含 API 代理）
├── dist/                   # 前端建置產物（gitignore）
├── node_modules/           # 依賴套件（gitignore）
└── src/
    ├── App.tsx             # 主程式
    ├── types.ts            # 完整類型定義
    ├── components/         # 所有 UI 組件
    │   ├── Toast.tsx
    │   ├── Header.tsx
    │   ├── MessageBubble.tsx
    │   ├── DivineFortune.tsx
    │   ├── FairyGroupChat.tsx
    │   └── ...
    ├── services/
    │   └── geminiService.ts  # API 服務
    └── utils/
        └── parser.ts         # 工具函數
```

## 快速啟動指南

### 步驟 1：安裝依賴
```bash
cd integrated-final
npm install
```

### 步驟 2：設定環境變數
```bash
# 複製範本
cp .env.example .env

# 編輯 .env，填入您的 Google API Key
# GOOGLE_API_KEY=your_actual_api_key_here
```

### 步驟 3：啟動服務

**開發模式（推薦）：**

開啟兩個終端視窗：

終端 1 - 啟動後端：
```bash
npm run dev:server
```

終端 2 - 啟動前端：
```bash
npm run dev
```

然後在瀏覽器開啟 http://localhost:5173

**生產模式：**

```bash
# 建置前端
npm run build

# 啟動服務（同時提供 API 和靜態檔案）
node server.js
```

然後在瀏覽器開啟 http://localhost:8080

## 驗證修復

### 1. 檢查服務狀態

**後端健康檢查：**
```bash
curl http://localhost:8080/api/health
```

預期回應：
```json
{
  "status": "ok",
  "timestamp": "2025-12-08T14:24:23.973Z"
}
```

### 2. 測試前後端連線

1. 開啟瀏覽器開發者工具（F12）
2. 切換到 Network 分頁
3. 在聊天介面輸入訊息並發送
4. 檢查 `/api/chat` 請求：
   - Status Code 應該是 `200`
   - Response 應該包含 `{ text: "...", usage: {...} }`

### 3. 功能測試

- [ ] 發送訊息收到回覆
- [ ] 切換不同 AI 角色（智慧仙姑、桃花仙子等）
- [ ] 上傳圖片附件
- [ ] 使用快速操作按鈕
- [ ] 開啟神籤系統
- [ ] 召喚仙女群聊

## 技術細節

### API 資料流

```
前端 (localhost:5173)
    ↓ 發送請求到 /api/chat
    ↓ { contents, systemInstruction, maxOutputTokens }
    ↓
Vite Proxy (開發模式)
    ↓ 轉發到 localhost:8080
    ↓
後端 Server (localhost:8080)
    ↓ 接收請求並驗證
    ↓ 呼叫 Gemini API
    ↓
Gemini API
    ↓ 返回 AI 回應
    ↓
後端 Server
    ↓ 格式化回應 { text, usage }
    ↓
前端
    ↓ 解析並顯示訊息
    ↓
使用者看到回覆 ✅
```

### Vite 代理設定

在開發模式下，Vite 自動將 `/api/*` 請求代理到後端：

```typescript
// vite.config.ts
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

這樣前端可以直接呼叫 `/api/chat`，Vite 會自動轉發到 `http://localhost:8080/api/chat`。

## 常見問題

### Q: 顯示 "API key not configured"
**A:** 檢查 `.env` 檔案是否存在且包含正確的 `GOOGLE_API_KEY`

### Q: 顯示 "連線錯誤" 或 "無法連線"
**A:** 
1. 確認後端伺服器已啟動（檢查終端是否顯示 "Server running"）
2. 確認前端開發伺服器已啟動
3. 檢查瀏覽器 Console 是否有錯誤訊息
4. 確認 API 回應格式已修復（應為 `text` 而非 `reply`）

### Q: npm run build 失敗
**A:** 
1. 確認所有組件都已複製到 `src/components/`
2. 確認 `src/types.ts` 使用完整的類型定義
3. 確認 `src/services/` 和 `src/utils/` 目錄存在

### Q: Port 8080 已被佔用
**A:** 在 `.env` 檔案中修改 `PORT=8080` 為其他端口號

## 安全性注意事項

1. **不要提交 .env 檔案** - 已加入 .gitignore
2. **不要在程式碼中寫死 API Key** - 使用環境變數
3. **生產環境建議配置 CORS 白名單** - 目前允許所有來源（開發用）

## 效能優化建議

1. **Token 管理**：系統已根據不同 AI 角色自動調整 Token 使用量
2. **圖片壓縮**：考慮在上傳前壓縮大型圖片
3. **快取策略**：可考慮快取常見問題的回應
4. **負載平衡**：高流量時可使用多個後端實例

## 相關文件

- `SETUP.md` - 詳細設定指南
- `FIXES_SUMMARY.md` - 完整修復報告
- `INTEGRATION_NOTES.md` - 專案整合說明
- `DEPLOYMENT.md` - 部署說明

## 修復完成時間

- **診斷日期**：2025-12-08
- **修復狀態**：✅ 已完成
- **測試狀態**：✅ 本地測試通過
- **建議**：需要真實 Google API Key 進行完整功能測試

## 致謝

感謝您的耐心！如有任何問題，請參考上述文件或在 GitHub 上提出 Issue。
