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
# autoline

[![Deploy to Cloud Run](https://github.com/liboyin9087-jpg/autoline/actions/workflows/deploy-cloudrun.yml/badge.svg)](https://github.com/liboyin9087-jpg/autoline/actions/workflows/deploy-cloudrun.yml)
[![Auto Update](https://github.com/liboyin9087-jpg/autoline/actions/workflows/auto-update.yml/badge.svg)](https://github.com/liboyin9087-jpg/autoline/actions/workflows/auto-update.yml)
[![CI](https://github.com/liboyin9087-jpg/autoline/actions/workflows/ci.yml/badge.svg)](https://github.com/liboyin9087-jpg/autoline/actions/workflows/ci.yml)

## 🚀 快速開始

這個專案已經配置了完整的自動化 CI/CD 流程，可以自動將應用程式部署到 Google Cloud Run。

### 主要功能

- ✅ 自動檢查並更新依賴套件
- ✅ 自動建置和測試
- ✅ 自動部署到 Cloud Run
- ✅ 支援手動觸發快速部署

### 快速部署最新內容

前往 [Actions](../../actions) → **Auto Deploy Updates** → 點擊 **Run workflow** 即可立即部署最新內容到 Cloud Run。

### 部署方式

#### 使用 GitHub Actions（推薦）
前往 [Actions](../../actions) 頁面，選擇相應的工作流程即可自動部署。

#### 使用 Google Cloud Build
專案根目錄提供 `cloudbuild.yaml` 配置文件，可直接使用 Google Cloud Build 進行部署：

```bash
gcloud builds submit --config=cloudbuild.yaml
```

### 詳細文件

- [🚀 快速部署指南](integrated-final/QUICK_DEPLOY.md) - 如何立即部署最新內容 ⭐
- [☁️ Cloud Build 部署指南](CLOUDBUILD_GUIDE.md) - Google Cloud Build 完整說明
- [GitHub Actions 設定指南](.github/ACTIONS_SETUP.md) - 完整的 CI/CD 設定說明
- [應用程式文件](integrated-final/README.md) - LINE AI 助理功能說明
- [Cloud Run 部署指南](integrated-final/CLOUD_RUN_DEPLOYMENT.md) - GCP 部署詳細步驟

### 專案結構

```
autoline/
├── .github/
│   ├── workflows/          # GitHub Actions 工作流程
│   │   ├── deploy-cloudrun.yml      # 主要部署流程
│   │   ├── auto-deploy.yml          # 自動化部署 ⭐ 新增
│   │   ├── auto-update.yml          # 依賴更新
│   │   └── ci.yml                   # CI 測試
│   └── ACTIONS_SETUP.md    # Actions 設定文件
├── cloudbuild.yaml         # Google Cloud Build 配置
└── integrated-final/       # LINE AI 助理應用程式
    ├── src/                # 前端源碼
    ├── server.js           # 後端服務
    ├── Dockerfile          # Docker 配置
    └── package.json        # 依賴管理
```

### 自動化部署流程

1. **每週自動更新**：系統每週一自動檢查依賴套件更新
2. **建立 PR**：如有更新，自動建立 PR 供審查
3. **合併觸發部署**：當 PR 合併後，自動部署到 Cloud Run
4. **手動部署**：隨時可以手動觸發部署最新內容

### 需要幫助？

- 查看 [Actions 設定指南](.github/ACTIONS_SETUP.md)
- 查看 [應用程式文件](integrated-final/README.md)
- 在 [Issues](../../issues) 中提問
