# 已知問題與限制

## 📅 更新日期：2025-12-08

本文件記錄當前版本的已知問題、限制和建議的改進方向。

---

## 🔴 安全性問題（開發環境）

### 1. esbuild 安全漏洞

**影響：** 僅開發環境  
**嚴重性：** 中等（Moderate）  
**CVE：** GHSA-67mh-4wv8-2f99

**問題描述：**
- esbuild <=0.24.2 允許任何網站向開發伺服器發送請求並讀取回應
- 這是一個開發環境的安全問題，不影響生產部署

**影響範圍：**
- 僅在執行 `npm run dev` 時有風險
- 生產環境（`npm run build` + `node server.js`）不受影響

**建議處理：**
- **短期**：僅在信任的網路環境下運行開發伺服器
- **中期**：升級 Vite 到 7.x（需要測試 breaking changes）
- **長期**：持續關注安全更新

**參考：**
- https://github.com/advisories/GHSA-67mh-4wv8-2f99

### 2. multer 版本過舊

**當前版本：** 1.4.5-lts.2  
**最新版本：** 2.0.2  
**影響：** 檔案上傳功能

**問題描述：**
- Multer 1.x 有多個已知安全漏洞
- 已在 2.x 版本修補

**建議處理：**
- **優先級：** 中等
- **時間表：** 1-2 週內升級
- **風險：** 需要測試檔案上傳功能

---

## 🟡 過時的套件版本

### 主要框架

| 套件 | 當前版本 | 最新版本 | 差異 | 優先級 |
|------|---------|---------|------|--------|
| React | 18.2.0/18.3.1 | 19.2.1 | Major | 中 |
| Vite | 4.5.14 | 7.2.7 | Major | 高 |
| Express | 4.22.1 | 5.2.1 | Major | 中 |
| Tailwind CSS | 3.3.3 | 4.1.17 | Major | 低 |

### 支援套件

| 套件 | 當前版本 | 最新版本 | 差異 | 優先級 |
|------|---------|---------|------|--------|
| lucide-react | 0.263.1 | 0.556.0 | Minor | 低 |
| react-markdown | 8.0.7 | 10.1.0 | Major | 低 |
| file-type | 16.5.4 | 21.1.1 | Major | 低 |
| @vitejs/plugin-react | 4.0.3 | 5.1.2 | Major | 中 |

### 升級注意事項

#### React 18 → 19
- ✅ **優點**：效能改進、新功能
- ⚠️ **風險**：API 變更、需要測試所有組件
- 📝 **建議**：等待生態系統穩定後再升級

#### Vite 4 → 7
- ✅ **優點**：建置速度提升、開發體驗改善
- ⚠️ **風險**：配置格式變更、plugin 相容性
- 📝 **建議**：優先升級（修復安全漏洞）

#### Express 4 → 5
- ✅ **優點**：效能改進、更好的錯誤處理
- ⚠️ **風險**：中間件 API 變更
- 📝 **建議**：中期升級

#### Tailwind CSS 3 → 4
- ✅ **優點**：新的 utility classes、效能改進
- ⚠️ **風險**：部分 class 名稱變更
- 📝 **建議**：低優先級（目前功能正常）

---

## 🟢 功能限制

### 1. 檔案上傳限制

**當前限制：**
- 最多上傳 10 個檔案
- 無檔案大小限制（需在後端實作）
- 無檔案類型白名單驗證

**建議改進：**
```javascript
// 在 server.js 中新增
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// 驗證邏輯
if (file.size > MAX_FILE_SIZE) {
  return res.status(400).json({ error: '檔案太大' });
}
```

### 2. API 速率限制

**當前狀態：** 無速率限制

**風險：**
- 可能被濫用
- API 配額快速消耗

**建議改進：**
```bash
npm install express-rate-limit

# 在 server.js 中
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100 // 限制 100 次請求
});

app.use('/api/', limiter);
```

### 3. CORS 設定

**當前設定：** 允許所有來源（`origin: '*'`）

**風險：**
- 生產環境安全風險
- 可能被跨站請求

**建議改進：**
```javascript
// .env
CORS_ORIGIN=https://yourdomain.com

// server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));
```

### 4. 錯誤處理

**當前狀態：** 基本錯誤處理

**建議改進：**
- 新增結構化日誌（winston, pino）
- 新增錯誤追蹤（Sentry）
- 新增詳細的錯誤代碼

### 5. 彩蛋系統使用 Mock 資料

**當前狀態：**
- FairyGroupChat 使用預設的 mock 回應
- 未實際呼叫 Gemini API

**影響：**
- 群聊功能回應是固定的
- 不會消耗 API 配額

**改進方式：**
```typescript
// 取消註解 FairyGroupChat.tsx 中的實際 API 呼叫
const response = await sendMessageToGemini(
  [...], 
  AppMode.LIFESTYLE, 
  null, 
  { persona: fairy.persona }
);
```

---

## 📊 效能考量

### 1. Token 使用優化

**當前狀態：** ✅ 已實作  
- 根據不同角色自動調整 Token 限制
- 閃電娘娘：512 tokens
- 智慧仙姑：2048 tokens
- 天機星君：4096 tokens

### 2. 圖片處理

**建議改進：**
- 客戶端圖片壓縮（browser-image-compression）
- 圖片格式轉換（WebP）
- 圖片快取策略

### 3. 對話歷史管理

**當前狀態：** 使用 localStorage

**限制：**
- 5-10MB 容量限制
- 無法跨裝置同步
- 無備份機制

**建議改進：**
- 實作雲端同步（Firebase, Supabase）
- 定期清理舊對話
- 匯出/匯入功能

---

## 🔄 建議的升級路徑

### 第一階段（1-2 週內）- 安全性修復

- [ ] 升級 multer 到 2.x
- [ ] 新增檔案大小限制
- [ ] 新增檔案類型驗證
- [ ] 測試檔案上傳功能

**預期影響：** 低  
**測試重點：** 檔案上傳

### 第二階段（1 個月內）- 開發環境優化

- [ ] 升級 Vite 到 7.x
- [ ] 升級 @vitejs/plugin-react
- [ ] 測試開發伺服器
- [ ] 測試建置流程

**預期影響：** 中  
**測試重點：** 建置、熱更新

### 第三階段（2-3 個月內）- 框架升級

- [ ] 升級 React 到 19
- [ ] 升級 react-dom 到 19
- [ ] 更新 TypeScript 類型
- [ ] 測試所有組件

**預期影響：** 高  
**測試重點：** 所有功能

### 第四階段（3-6 個月內）- 後端現代化

- [ ] 升級 Express 到 5.x
- [ ] 新增速率限制
- [ ] 新增結構化日誌
- [ ] 新增健康檢查增強

**預期影響：** 中  
**測試重點：** API 端點

### 第五階段（選擇性）- UI 框架升級

- [ ] 升級 Tailwind CSS 到 4.x
- [ ] 更新 class 名稱
- [ ] 測試所有頁面

**預期影響：** 低  
**測試重點：** 視覺呈現

---

## 📝 測試建議

### 必要測試

1. **功能測試**
   - [ ] 發送訊息
   - [ ] 切換角色
   - [ ] 上傳檔案
   - [ ] 神籤系統
   - [ ] 群聊功能

2. **瀏覽器相容性**
   - [ ] Chrome/Edge
   - [ ] Firefox
   - [ ] Safari
   - [ ] Mobile browsers

3. **效能測試**
   - [ ] 建置時間
   - [ ] 首次載入時間
   - [ ] API 回應時間

### 升級後測試清單

每次升級套件後，請執行：

```bash
# 1. 清理並重新安裝
rm -rf node_modules package-lock.json
npm install

# 2. 建置測試
npm run build

# 3. 啟動測試
npm run dev:server &
npm run dev

# 4. 功能測試
# 手動測試所有主要功能

# 5. 檢查錯誤
# 查看 Console 是否有錯誤訊息
```

---

## 🆘 回報問題

如果您發現新的問題或有改進建議：

1. 在 GitHub 上建立 Issue
2. 提供詳細的重現步驟
3. 附上錯誤訊息和截圖
4. 標註嚴重性等級

---

## 📚 參考資源

- [React 19 升級指南](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Vite 遷移指南](https://vitejs.dev/guide/migration.html)
- [Express 5.x 遷移指南](https://expressjs.com/en/guide/migrating-5.html)
- [Tailwind CSS v4 文件](https://tailwindcss.com/docs/upgrade-guide)

---

**最後更新：** 2025-12-08  
**狀態：** 當前版本穩定，建議漸進式升級  
**負責人：** 開發團隊

---

## ✅ 已修復的問題

### 2025-12-08
- ✅ API 回應格式不匹配（reply → text）
- ✅ 專案結構混亂（統一到 src/ 目錄）
- ✅ 類型定義不完整（更新 types.ts）
- ✅ 建置失敗（複製缺失的組件）
- ✅ 程式碼品質問題（魔術數字、格式化）
