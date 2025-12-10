FROM node:20-alpine AS builder
WORKDIR /app

# 複製建置所需檔案
COPY package*.json ./
COPY tsconfig.json vite.config.ts tailwind.config.js ./

# 安裝所有依賴（包括 devDependencies）
RUN npm ci --legacy-peer-deps

# 複製源碼
COPY src ./src
COPY public ./public
COPY index.html ./

# 建置前端
RUN npm run build

# 驗證建置結果
RUN echo "=== Build verification ===" && \
    ls -la dist/ && \
    ls -la dist/assets/ && \
    echo "Build completed successfully"

# ===== Production Stage =====
FROM node:20-alpine
WORKDIR /app

# 複製 package 檔案
COPY package*.json ./

# 只安裝生產依賴
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# 從 builder 階段複製建置結果
COPY --from=builder /app/dist ./dist

# 複製伺服器檔案
COPY server.js ./
COPY prompts.js ./

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=8080

# 驗證檔案
RUN echo "=== Production verification ===" && \
    ls -la && \
    ls -la dist/ && \
    ls -la dist/assets/

EXPOSE 8080

CMD ["node", "server.js"]
