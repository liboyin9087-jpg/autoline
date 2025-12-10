# 📱 手機管理介面使用指南

## 概述

手機管理介面是一個用於管理和監控連接到 LINE AI Assistant 的設備的網頁應用程式。透過這個介面，您可以新增、查看、更新和刪除設備資訊。

## 訪問方式

### 開發環境
當伺服器在本地運行時，您可以通過以下網址訪問管理介面：

```
http://localhost:8080/management
```

### 生產環境
當部署到 Cloud Run 後，使用以下網址訪問：

```
https://line-ai-assistant-970949752172-970949752172.asia-east1.run.app/management
```

或直接訪問靜態文件：

```
https://line-ai-assistant-970949752172-970949752172.asia-east1.run.app/public/management_interface.html
```

## 功能特色

### 1. 儀表板統計
介面頂部顯示三個關鍵指標：
- **總設備數**：系統中所有註冊的設備總數
- **在線設備**：當前在線的設備數量
- **離線設備**：當前離線的設備數量

### 2. 設備列表
以卡片形式展示所有設備，每個設備卡片包含：
- 設備名稱
- 設備型號
- 作業系統（iOS/Android/其他）
- 在線狀態（在線/離線）
- 最後上線時間
- 備註資訊

### 3. 設備管理操作

#### 新增設備
1. 點擊「➕ 新增設備」按鈕
2. 填寫設備資訊：
   - **設備名稱**（必填）：例如「我的 iPhone」
   - **設備型號**（必填）：例如「iPhone 13 Pro」
   - **作業系統**（必填）：選擇 iOS、Android 或其他
   - **備註**（選填）：額外的說明資訊
3. 點擊「新增」按鈕完成

#### 切換設備狀態
- 點擊設備卡片上的「設為離線」或「設為在線」按鈕
- 系統會自動更新設備的在線狀態和最後上線時間

#### 刪除設備
- 點擊設備卡片上的「刪除」按鈕
- 確認刪除操作
- 設備將從系統中移除

## API 端點

管理介面使用以下後端 API 端點：

### 獲取所有設備
```http
GET /api/devices
```

**回應範例：**
```json
{
  "success": true,
  "devices": [
    {
      "id": "1",
      "name": "我的 iPhone",
      "model": "iPhone 13 Pro",
      "os": "iOS",
      "status": "online",
      "lastSeen": "2025-12-10T16:00:00.000Z",
      "note": "主要設備"
    }
  ]
}
```

### 新增設備
```http
POST /api/devices
Content-Type: application/json

{
  "name": "測試手機",
  "model": "Samsung S23",
  "os": "Android",
  "note": "測試用"
}
```

**回應範例：**
```json
{
  "success": true,
  "device": {
    "id": "1765382556430",
    "name": "測試手機",
    "model": "Samsung S23",
    "os": "Android",
    "status": "online",
    "lastSeen": "2025-12-10T16:00:00.000Z",
    "note": "測試用"
  }
}
```

### 更新設備狀態
```http
PUT /api/devices/:id
Content-Type: application/json

{
  "status": "offline"
}
```

### 刪除設備
```http
DELETE /api/devices/:id
```

## CORS 配置

後端已配置 CORS 以允許來自以下來源的請求：
- `https://line-ai-assistant-970949752172-970949752172.asia-east1.run.app` - 生產環境前端
- `http://localhost:5173` - Vite 開發伺服器
- `http://localhost:8080` - Express 伺服器
- 其他來源（開發用）

## 資料存儲

目前版本使用瀏覽器的 `localStorage` 來儲存設備資料。這意味著：
- ✅ 資料在客戶端本地保存，不需要資料庫
- ✅ 快速響應，無需網路請求
- ⚠️ 資料僅存儲在當前瀏覽器中
- ⚠️ 清除瀏覽器資料會導致設備資訊遺失

### 未來改進
可以將資料存儲升級為：
- 使用資料庫（如 Cloud Firestore、PostgreSQL）
- 實現多用戶管理
- 添加用戶認證和授權

## 技術細節

### 前端技術
- 純 HTML5 + CSS3 + JavaScript（無需框架）
- 響應式設計，支援各種螢幕尺寸
- 漸變背景和現代 UI 設計
- 模態對話框用於新增設備

### 後端技術
- Node.js + Express.js
- CORS 中間件支援跨域請求
- RESTful API 設計
- JSON 資料格式

### 樣式特點
- LINE 風格的設計語言
- 卡片式佈局
- 平滑的過渡動畫
- 直觀的顏色編碼（綠色=在線，灰色=離線）

## 故障排除

### 無法訪問管理介面
1. 檢查伺服器是否正在運行
2. 確認端口 8080 沒有被其他程序佔用
3. 查看瀏覽器控制台的錯誤訊息

### CORS 錯誤
1. 確認 `server.js` 中的 CORS 配置正確
2. 檢查前端域名是否在 `allowedOrigins` 列表中
3. 確認請求標頭包含正確的 `Content-Type`

### API 請求失敗
1. 使用瀏覽器開發者工具的 Network 面板檢查請求
2. 確認 API 端點 URL 正確
3. 檢查伺服器日誌輸出

## 安全性考量

目前版本的安全性功能：
- ✅ CORS 配置限制允許的來源
- ✅ 輸入驗證（必填欄位）
- ⚠️ 尚未實現用戶認證
- ⚠️ 尚未實現 API 速率限制

### 建議的安全性改進
1. 添加 JWT 或 OAuth 認證
2. 實現 API 速率限制
3. 添加輸入清理和驗證
4. 使用 HTTPS 加密傳輸
5. 實現細粒度的權限控制

## 部署指南

### 本地部署
```bash
cd integrated-final
npm install
npm run dev:server
```

訪問：`http://localhost:8080/management`

### Cloud Run 部署
使用 Cloud Build 自動部署：
```bash
gcloud builds submit --config=cloudbuild.yaml
```

或使用 Docker 手動部署：
```bash
docker build -t gcr.io/PROJECT_ID/line-ai-assistant .
docker push gcr.io/PROJECT_ID/line-ai-assistant
gcloud run deploy line-ai-assistant --image gcr.io/PROJECT_ID/line-ai-assistant
```

## 更新日誌

### v1.0.0 (2025-12-10)
- ✅ 初始版本發布
- ✅ 基本設備管理功能
- ✅ localStorage 資料存儲
- ✅ RESTful API 端點
- ✅ CORS 配置
- ✅ 響應式設計

## 聯絡與支援

如有問題或建議，請透過 GitHub Issues 提出。

---

**注意：** 這是一個示範性的管理介面。在生產環境中使用前，請務必實現適當的認證和授權機制。
