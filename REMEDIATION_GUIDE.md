# 🔒 API 金鑰洩漏 - 立即行動指南

## ⚠️ 重要提醒

您的 Google API 金鑰 `AIzaSyD3r0aKpNacGnDDRizTynQjoPMOTdhmLWg` 已被 GitHub 檢測到在公開儲存庫中洩漏。

**請立即按照以下步驟操作，以保護您的 Google Cloud 資源。**

---

## 📋 立即執行步驟

### 步驟 1: 撤銷洩漏的 API 金鑰 ⚡ **最高優先**

1. 前往 [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
2. 登入您的 Google Cloud 帳號
3. 找到金鑰 `AIzaSyD3r0aKpNacGnDDRizTynQjoPMOTdhmLWg`
4. 點擊金鑰旁的「刪除」或「停用」按鈕
5. 確認刪除操作

**為什麼這很重要？**
- 防止未經授權的人使用您的 API 配額
- 避免潛在的資料外洩
- 防止產生未預期的 API 費用

### 步驟 2: 檢查 API 使用日誌 🔍

1. 前往 [Google Cloud Console - Logs Explorer](https://console.cloud.google.com/logs)
2. 選擇您的專案
3. 查看近期的 API 請求日誌
4. 尋找異常的活動模式：
   - 未知的 IP 位址
   - 異常的請求量
   - 在非正常時間的活動
   - 未授權的 API 呼叫

**如果發現可疑活動：**
- 記錄可疑請求的詳細資訊
- 考慮聯絡 Google Cloud 支援
- 檢查您的帳單以確認是否有未預期的費用

### 步驟 3: 產生新的 API 金鑰 🔑

1. 在 [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
2. 點擊「+ CREATE CREDENTIALS」
3. 選擇「API key」
4. 複製新產生的 API 金鑰並儲存在安全的地方

**設定 API 金鑰限制（強烈建議）：**
1. 點擊新建立的金鑰以編輯設定
2. 在「Application restrictions」下：
   - 選擇「HTTP referrers (websites)」或「IP addresses」
   - 新增您的應用程式網域或伺服器 IP
3. 在「API restrictions」下：
   - 選擇「Restrict key」
   - 只選擇您需要的 API（例如 Gemini API）
4. 點擊「Save」

### 步驟 4: 更新應用程式配置 🔧

#### 選項 A: 使用 Google Cloud Secret Manager（推薦）

1. 前往 [Secret Manager](https://console.cloud.google.com/security/secret-manager)
2. 找到 `GOOGLE_API_KEY` secret
3. 點擊「+ NEW VERSION」
4. 貼上新的 API 金鑰
5. 點擊「ADD NEW VERSION」
6. 重新部署您的 Cloud Run 服務

```bash
# 使用 gcloud 命令重新部署
gcloud run services update line-ai-assistant \
  --region=asia-east1 \
  --update-secrets=GOOGLE_API_KEY=GOOGLE_API_KEY:latest
```

#### 選項 B: 本地開發環境

1. 在專案根目錄建立 `.env` 檔案（如果尚未存在）
2. 新增新的 API 金鑰：
   ```
   GOOGLE_API_KEY=你的新金鑰
   ```
3. 確認 `.env` 檔案已被 `.gitignore` 排除（已經設定好）
4. **永遠不要**將 `.env` 檔案提交到 Git

### 步驟 5: 關閉 GitHub 安全警報 ✅

1. 前往您的儲存庫：https://github.com/liboyin9087-jpg/autoline
2. 點擊「Security」標籤
3. 選擇「Secret scanning」
4. 找到關於 `AIzaSyD3r0aKpNacGnDDRizTynQjoPMOTdhmLWg` 的警報
5. 點擊警報以開啟詳細資訊
6. 選擇「Close as」→「Revoked」
7. 新增註解說明金鑰已被撤銷和更換
8. 點擊「Close alert」

---

## ✅ 已完成的技術防護措施

此 PR 已經實施以下防護措施：

### 1. 增強的 `.gitignore`
- ✅ 排除所有 `.env*` 檔案
- ✅ 排除所有 tar 壓縮檔
- ✅ 明確排除 `.env.backup` 和 `.env.backu`
- ✅ 排除包含專案名稱的壓縮檔

### 2. 儲存庫驗證
- ✅ 確認洩漏的金鑰不在當前程式碼中
- ✅ 確認 Git 歷史記錄中沒有金鑰
- ✅ 確認沒有敏感檔案被追蹤

### 3. 文件
- ✅ 建立詳細的安全事件報告（`SECURITY_INCIDENT.md`）
- ✅ 建立立即行動指南（本檔案）

---

## 📚 未來預防措施

### 開發流程

1. **使用環境變數**
   ```javascript
   // ✅ 正確
   const apiKey = process.env.GOOGLE_API_KEY;
   
   // ❌ 錯誤
   const apiKey = 'AIzaSy...';
   ```

2. **使用 `.env.example` 作為範本**
   ```bash
   # 建立範本
   cp .env.example .env
   # 編輯 .env 並填入真實金鑰（此檔案不會被提交）
   ```

3. **提交前檢查**
   ```bash
   # 檢查暫存的檔案
   git diff --cached
   
   # 確保沒有敏感資料
   git diff --cached | grep -i "api"
   git diff --cached | grep -i "key"
   git diff --cached | grep -i "secret"
   ```

### 生產環境

1. **使用 Secret Manager**
   - 在 Google Cloud Secret Manager 中儲存所有 API 金鑰
   - 設定適當的存取權限
   - 啟用金鑰版本控制

2. **設定 API 限制**
   - 限制 API 金鑰的使用範圍
   - 設定每日配額限制
   - 啟用使用監控和警報

3. **定期審查**
   - 每月審查 API 金鑰使用情況
   - 檢查是否有異常活動
   - 考慮定期輪換金鑰

---

## 🆘 需要協助？

如果您：
- 在撤銷金鑰時遇到問題
- 發現可疑的 API 使用
- 需要關於安全最佳實踐的建議

請參考：
- [Google Cloud 安全最佳實踐](https://cloud.google.com/security/best-practices)
- [GitHub Secret Scanning 文件](https://docs.github.com/en/code-security/secret-scanning)
- [Google API 金鑰管理](https://cloud.google.com/docs/authentication/api-keys)

---

## 📞 聯絡支援

**Google Cloud 支援**: https://cloud.google.com/support  
**GitHub 支援**: https://support.github.com/

---

**重要提醒**: 請在完成上述所有步驟後，才能將此警報標記為已解決。您的 Google Cloud 資源安全是最重要的。

**建立日期**: 2025-12-09  
**優先等級**: 🔴 緊急
