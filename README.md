# autoline - LINE AI Assistant

## 🚀 快速部署到 Google Cloud Run

### 一鍵部署（推薦）

```bash
./deploy.sh YOUR_PROJECT_ID
```

就這麼簡單！腳本會自動處理所有設定。

### 📖 詳細文件

- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - 📋 完整總結（從這裡開始）
- **[DEPLOY_QUICKSTART.md](./DEPLOY_QUICKSTART.md)** - ⚡ 2 分鐘快速開始
- **[CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md)** - 📚 完整部署指南
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - ✅ 部署檢查清單

### 🎯 前置需求

1. 安裝 [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. 登入：`gcloud auth login`
3. 取得 [Gemini API 金鑰](https://makersuite.google.com/app/apikey)

## 📦 專案結構

- `integrated-final/` - 完整應用程式（LINE AI Assistant）
- `cloudbuild.yaml` - Cloud Build 自動化配置
- `deploy.sh` - 快速部署腳本
- `.github/workflows/` - GitHub Actions CI/CD

## 🔧 本地開發

請參閱 `integrated-final/DEPLOYMENT.md` 了解本地開發環境設定。

## ✅ 已通過

- ✅ Code Review（所有建議已修正）
- ✅ Security Scan（無安全問題）

---

**準備好了嗎？** 執行 `./deploy.sh YOUR_PROJECT_ID` 開始部署！🎉
