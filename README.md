# autoline

## 🚀 快速部署到 Google Cloud Run

最快速的部署方式：

```bash
./deploy.sh YOUR_PROJECT_ID
```

詳細說明請參閱：
- [快速啟動指南](./DEPLOY_QUICKSTART.md) - 2 分鐘快速部署
- [完整部署文件](./CLOUD_RUN_DEPLOYMENT.md) - 詳細配置和進階功能

## 📦 專案結構

- `integrated-final/` - 完整應用程式（LINE AI Assistant）
- `cloudbuild.yaml` - Cloud Build 自動化配置
- `deploy.sh` - 快速部署腳本
- `.github/workflows/` - GitHub Actions CI/CD

## 🔧 本地開發

請參閱 `integrated-final/DEPLOYMENT.md` 了解本地開發環境設定。