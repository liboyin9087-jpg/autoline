#!/bin/bash

echo "📁 重新組織專案結構..."

# 創建備份
mkdir -p backup
cp -r src backup/

# 方案：把所有源碼移到 src 下
echo "複製所有組件..."
cp -r components src/ 2>/dev/null || true
cp -r services src/ 2>/dev/null || true  
cp -r utils src/ 2>/dev/null || true
cp types.ts src/ 2>/dev/null || true
cp design-system.ts src/ 2>/dev/null || true

# 同時複製到根目錄的 src 層級 (雙保險)
cp App.tsx src/ 2>/dev/null || true
cp App.css src/ 2>/dev/null || true

# 確認結構
echo ""
echo "✅ 新的 src 結構:"
ls -la src/

echo ""
echo "📦 開始構建..."
npm run build

