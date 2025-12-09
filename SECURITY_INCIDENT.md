# 安全事件報告 - API 金鑰洩漏處理

## 事件摘要

**日期**: 2025-12-09  
**嚴重性**: 高  
**狀態**: 已處理

## 洩漏的秘密

- **類型**: Google API 金鑰
- **金鑰**: `AIzaSyD3r0aKpNacGnDDRizTynQjoPMOTdhmLWg`
- **檢測位置**: 
  1. `line-ai-integrated-final.tar`
  2. `integrated-final/.env.backup`
  3. `integrated-final/.env.backu`

## 補救措施

### ✅ 已完成的步驟

1. **檢查當前儲存庫狀態**
   - 確認洩漏的 API 金鑰不在當前工作目錄中
   - 確認 Git 歷史記錄中不包含該金鑰
   - 所有敏感檔案已被 `.gitignore` 正確排除

2. **更新 `.gitignore`**
   - 新增明確的規則以防止 `.env.backup` 和 `.env.backu` 檔案被追蹤
   - 新增規則以排除所有包含敏感資料的 tar 壓縮檔
   - 新增更全面的環境變數檔案排除模式

3. **驗證檔案狀態**
   - ✅ `line-ai-integrated-final.tar` - 不存在於儲存庫中
   - ✅ `integrated-final/.env.backup` - 不存在於儲存庫中
   - ✅ `integrated-final/.env.backu` - 不存在於儲存庫中
   - ✅ `.env.example` - 僅包含佔位符，無真實金鑰

### ⚠️ 需要由儲存庫擁有者完成的步驟

1. **撤銷洩漏的 API 金鑰**
   - 請前往 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - 刪除或撤銷金鑰 `AIzaSyD3r0aKpNacGnDDRizTynQjoPMOTdhmLWg`
   - 這是最重要的步驟，以防止未經授權的使用

2. **產生新的 API 金鑰**
   - 在 Google Cloud Console 中建立新的 API 金鑰
   - 設定適當的 API 限制和使用配額
   - 將新金鑰儲存在安全的地方（不要提交到 Git）

3. **更新部署配置**
   - 在 Google Cloud Run 的 Secret Manager 中更新 `GOOGLE_API_KEY`
   - 或在您的本地 `.env` 檔案中更新（確保此檔案已被 `.gitignore` 排除）
   - 重新部署應用程式以使用新金鑰

4. **檢查安全日誌**
   - 檢查 [Google Cloud Console 日誌](https://console.cloud.google.com/logs)
   - 查看是否有未經授權的 API 使用
   - 檢查是否有異常的流量或請求模式

5. **關閉 GitHub 安全警報**
   - 前往儲存庫的 Security > Secret scanning alerts
   - 確認金鑰已被撤銷
   - 將警報標記為 "Revoked"

## 預防措施

### 已實施

1. **增強的 `.gitignore` 規則**
   - 排除所有 `.env*` 檔案
   - 排除所有 tar 壓縮檔
   - 明確排除已知的敏感檔案模式

2. **檔案命名最佳實踐**
   - 避免在檔案名稱中使用 `.backup` 或類似後綴
   - 使用 `.env.example` 作為環境變數範本
   - 永遠不要將實際的環境變數檔案提交到版本控制

### 建議的額外措施

1. **使用 Secret Manager**
   - 在 Google Cloud Run 中使用 Secret Manager 管理 API 金鑰
   - 不要在程式碼或配置檔中硬編碼金鑰

2. **設定 API 金鑰限制**
   - 限制 API 金鑰只能從特定的 IP 或網域使用
   - 設定每日 API 使用配額
   - 啟用 API 金鑰輪換政策

3. **啟用監控和警報**
   - 設定 API 使用監控
   - 設定異常使用警報
   - 定期審查 API 金鑰使用情況

4. **團隊培訓**
   - 教育團隊成員關於秘密管理的最佳實踐
   - 建立程式碼審查檢查清單，包括敏感資料檢查
   - 使用 pre-commit hooks 防止提交敏感檔案

## 相關資源

- [Google API 金鑰管理最佳實踐](https://cloud.google.com/docs/authentication/api-keys)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [如何撤銷 Google API 金鑰](https://support.google.com/googleapi/answer/6310037)

## 聯絡資訊

如有任何安全相關問題，請聯絡儲存庫維護者。

---

**最後更新**: 2025-12-09  
**文件版本**: 1.0
