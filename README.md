# autoline - LINE AI Assistant

## 🚀 快速開始

### 一鍵部署到 Google Cloud Run

```bash
./deploy.sh YOUR_PROJECT_ID
```

就這麼簡單！腳本會自動處理所有設定。

### 🎯 前置需求

1. 安裝 [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. 登入 GCP：`gcloud auth login`
3. 取得 [Gemini API 金鑰](https://makersuite.google.com/app/apikey)

### 📖 文件

- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - 📋 完整部署指南
- **[CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md)** - ☁️ Cloud Run 詳細說明
- **[CLOUDBUILD_GUIDE.md](./CLOUDBUILD_GUIDE.md)** - 🔧 Cloud Build 配置
- **[integrated-final/QUICK_DEPLOY.md](./integrated-final/QUICK_DEPLOY.md)** - ⚡ GitHub Actions 快速部署

## 📦 專案結構

```
autoline/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── integrated-final/       # LINE AI Assistant 應用程式
│   ├── src/               # 前端源碼
│   ├── server.js          # 後端服務
│   └── Dockerfile         # Docker 配置
├── cloudbuild.yaml        # Google Cloud Build 配置
└── deploy.sh              # 快速部署腳本
```

## 🔧 本地開發

請參閱 `integrated-final/DEPLOYMENT.md` 了解本地開發環境設定。

---

**準備好了嗎？** 執行 `./deploy.sh YOUR_PROJECT_ID` 開始部署！🎉

---

## 🤖 自動化 CI/CD

[![Deploy to Cloud Run](https://github.com/liboyin9087-jpg/autoline/actions/workflows/deploy-cloudrun.yml/badge.svg)](https://github.com/liboyin9087-jpg/autoline/actions/workflows/deploy-cloudrun.yml)
[![Auto Update](https://github.com/liboyin9087-jpg/autoline/actions/workflows/auto-update.yml/badge.svg)](https://github.com/liboyin9087-jpg/autoline/actions/workflows/auto-update.yml)
[![CI](https://github.com/liboyin9087-jpg/autoline/actions/workflows/ci.yml/badge.svg)](https://github.com/liboyin9087-jpg/autoline/actions/workflows/ci.yml)

### GitHub Actions 快速部署

前往 [Actions](../../actions) → **Auto Deploy Updates** → 點擊 **Run workflow** 即可立即部署最新內容到 Cloud Run。

### Cloud Build 部署

使用 Google Cloud Build 進行部署：

```bash
gcloud builds submit --config=cloudbuild.yaml
```

### 自動化流程

1. **每週自動更新**：系統每週一自動檢查依賴套件更新
2. **建立 PR**：如有更新，自動建立 PR 供審查
3. **合併觸發部署**：當 PR 合併後，自動部署到 Cloud Run
4. **手動部署**：隨時可以手動觸發部署最新內容

### 詳細設定文件

- [GitHub Actions 設定指南](.github/ACTIONS_SETUP.md) - 完整的 CI/CD 設定說明
- [GCP 認證設定指南](.github/GCP_AUTH_SETUP.md) - Google Cloud 權限配置

---

## 📚 相關文件

- [應用程式說明](integrated-final/README.md) - LINE AI 助理功能文件
- [本地開發指南](integrated-final/DEPLOYMENT.md) - 本地環境設定

## 🆘 需要幫助？

- 在 [Issues](../../issues) 中提問
- 查看 [Actions 設定指南](.github/ACTIONS_SETUP.md)
