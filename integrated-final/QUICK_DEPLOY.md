# 🚀 快速部署指南

## 如何立即部署最新內容到 Cloud Run

### 方法 1: 使用 GitHub Actions (推薦) ⭐

這是最簡單快速的方式！

1. 前往你的 GitHub 儲存庫頁面
2. 點擊頂部的 **「Actions」** 標籤
3. 在左側選擇 **「Auto Deploy Updates」** 工作流程
4. 點擊右側的 **「Run workflow」** 按鈕
5. 確認分支為 `main`
6. 確保「立即部署最新內容到 Cloud Run」選項已勾選（預設為 true）
7. 點擊綠色的 **「Run workflow」** 按鈕

等待約 5-10 分鐘，部署就會完成！你可以在 Actions 執行頁面查看進度。

### 方法 2: 使用 Deploy to Cloud Run 工作流程

如果你想要更多控制選項：

1. 前往 **Actions** → **Deploy to Cloud Run**
2. 點擊 **Run workflow**
3. 選擇分支（通常是 `main`）
4. 選擇是否「強制部署」
5. 點擊 **Run workflow**

### 方法 3: 推送代碼自動觸發

如果你修改了 `integrated-final/` 目錄中的任何文件：

```bash
cd integrated-final
# 修改你的文件...
git add .
git commit -m "Update application"
git push origin main
```

系統會自動檢測到變更並觸發部署。

## 查看部署結果

部署完成後，你可以在 Actions 執行頁面的 Summary 中看到：

- ✅ 部署狀態
- 🌐 服務 URL
- 📝 提交 SHA
- 📊 詳細日誌

點擊服務 URL 即可訪問你部署的應用程式！

## 自動化部署流程

### 完整的工作流程

```
每週一自動檢查更新
    ↓
發現可用更新
    ↓
建立 PR (帶 automated 標籤)
    ↓
人工審查 PR
    ↓
合併 PR 到 main
    ↓
自動觸發部署
    ↓
部署到 Cloud Run
    ↓
完成！✅
```

### 工作流程說明

1. **自動更新檢查** - 每週一早上 9:00 (UTC)
   - 檢查 `integrated-final/` 中的套件更新
   - 如有更新，執行建置測試
   - 測試通過後建立 PR

2. **PR 審查與合併**
   - PR 標題：🤖 自動更新依賴套件
   - 包含詳細的更新清單
   - 審查通過後合併

3. **自動部署** - PR 合併後立即觸發
   - 安裝依賴
   - 建置前端
   - 建置 Docker 映像
   - 推送到 GCR
   - 部署到 Cloud Run

## 需要的設定

確保在 GitHub 儲存庫的 Settings → Secrets and variables → Actions 中已設定：

- `GCP_SA_KEY` - Google Cloud 服務帳號金鑰 (JSON)
- `GCP_PROJECT_ID` - GCP 專案 ID

詳細設定步驟請參考 [ACTIONS_SETUP.md](/.github/ACTIONS_SETUP.md)

## 常見問題

### Q: 部署失敗怎麼辦？

1. 檢查 Actions 執行日誌查看錯誤訊息
2. 確認 GCP 密鑰和權限設定正確
3. 確認 Cloud Run API 已啟用
4. 檢查建置過程是否有錯誤

### Q: 如何查看當前部署的版本？

前往 Cloud Run 控制台，查看服務的「修訂版本」標籤，可以看到部署的 commit SHA。

### Q: 可以回滾到之前的版本嗎？

可以！在 Cloud Run 控制台的「修訂版本」頁面，找到之前的版本並設定為接收流量。

### Q: 部署需要多長時間？

通常需要 5-10 分鐘，包括：
- 安裝依賴：1-2 分鐘
- 建置前端：1-2 分鐘
- 建置 Docker：2-3 分鐘
- 推送映像：1-2 分鐘
- 部署到 Cloud Run：1-2 分鐘

## 進階功能

### 設定自動部署通知

你可以在 GitHub 儲存庫設定中配置通知，當部署完成時收到郵件或 Slack 通知。

### 監控部署狀態

使用 GitHub Status API 或第三方服務（如 StatusPage）來監控部署狀態。

### 多環境部署

可以修改工作流程支援多個環境（開發、測試、生產），使用不同的 GCP 專案和服務名稱。

## 相關資源

- [GitHub Actions 文件](https://docs.github.com/actions)
- [Cloud Run 文件](https://cloud.google.com/run/docs)
- [完整設定指南](../.github/ACTIONS_SETUP.md)
- [應用程式 README](README.md)

---

💡 **提示**: 使用「Auto Deploy Updates」工作流程是部署最新內容最快速的方式！
