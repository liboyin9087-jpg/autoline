#!/bin/bash

# 本地測試建置腳本
# 用於在部署前驗證建置流程

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "================================================"
echo "  本地建置測試"
echo "================================================"
echo -e "${NC}"

# 進入專案目錄
cd integrated-final

# 檢查必要檔案
echo -e "${BLUE}► 檢查必要檔案...${NC}"
required_files=("package.json" "server.js" "prompts.js" "Dockerfile" ".dockerignore")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗${NC} 缺少檔案: $file"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} $file"
done

# 檢查目錄
echo ""
echo -e "${BLUE}► 檢查目錄結構...${NC}"
required_dirs=("public" "src" "components" "services")
for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo -e "${YELLOW}⚠${NC} 目錄不存在: $dir (可能正常)"
    else
        echo -e "${GREEN}✓${NC} $dir"
    fi
done

# 安裝依賴
echo ""
echo -e "${BLUE}► 安裝依賴套件...${NC}"
if npm install --legacy-peer-deps; then
    echo -e "${GREEN}✓${NC} 依賴安裝成功"
else
    echo -e "${RED}✗${NC} 依賴安裝失敗"
    exit 1
fi

# 建置前端
echo ""
echo -e "${BLUE}► 建置前端...${NC}"
if npm run build; then
    echo -e "${GREEN}✓${NC} 前端建置成功"
else
    echo -e "${RED}✗${NC} 前端建置失敗"
    exit 1
fi

# 檢查建置結果
echo ""
echo -e "${BLUE}► 檢查建置結果...${NC}"
if [ ! -d "dist" ]; then
    echo -e "${RED}✗${NC} dist 目錄不存在"
    exit 1
fi

echo -e "${GREEN}✓${NC} dist 目錄已建立"
echo -e "內容："
ls -lh dist/

# 檢查關鍵檔案
critical_files=("dist/index.html" "public/fairy_consultant.png" "server.js" "prompts.js")
echo ""
echo -e "${BLUE}► 檢查關鍵檔案...${NC}"
for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗${NC} 缺少: $file"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} $file"
done

# Docker 測試（如果有安裝 Docker）
echo ""
echo -e "${BLUE}► Docker 測試...${NC}"
if command -v docker &> /dev/null; then
    echo "嘗試建置 Docker 映像..."
    if docker build -t autoline-test:local .; then
        echo -e "${GREEN}✓${NC} Docker 映像建置成功"
        
        # 詢問是否要執行容器測試
        read -p "是否要啟動容器進行測試？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}注意：需要有效的 GOOGLE_API_KEY 才能正常使用 API 功能${NC}"
            read -p "請輸入您的 Gemini API 金鑰（或按 Enter 使用測試金鑰）: " USER_API_KEY
            API_KEY=${USER_API_KEY:-"PLACEHOLDER_KEY_FOR_TESTING"}
            
            echo "啟動容器（按 Ctrl+C 停止）..."
            docker run --rm -p 8080:8080 \
                -e NODE_ENV=production \
                -e GOOGLE_API_KEY="$API_KEY" \
                autoline-test:local
        fi
    else
        echo -e "${RED}✗${NC} Docker 映像建置失敗"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠${NC} Docker 未安裝，跳過 Docker 測試"
fi

echo ""
echo -e "${GREEN}"
echo "================================================"
echo "  ✓ 所有測試通過！"
echo "================================================"
echo -e "${NC}"
echo "準備好部署到 Cloud Run 了！"
echo "使用以下指令部署："
echo "  cd .."
echo "  ./deploy.sh YOUR_PROJECT_ID"
