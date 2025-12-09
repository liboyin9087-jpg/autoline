# autoline

## 🚀 快速開始

這個專案已經配置了完整的自動化 CI/CD 流程，可以自動將應用程式部署到 Google Cloud Run。

### 主要功能

- ✅ 自動檢查並更新依賴套件
- ✅ 自動建置和測試
- ✅ 自動部署到 Cloud Run
- ✅ 支援手動觸發快速部署

### 快速部署最新內容

前往 [Actions](../../actions) → **Auto Deploy Updates** → 點擊 **Run workflow** 即可立即部署最新內容到 Cloud Run。

### 詳細文件

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
