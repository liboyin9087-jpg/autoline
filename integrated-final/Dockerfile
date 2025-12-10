# multi-stage Dockerfile（建置階段與執行階段）
# 注意：不再額外複製 public，Vite build 已將 public 內容打包到 dist。

# --- build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# 先複製 package 檔與安裝依賴（利用 cache）
COPY integrated-final/package.json integrated-final/package-lock.json ./
RUN npm ci --production=false

# 複製整個專案於 integrated-final，執行 build
COPY integrated-final/ ./
RUN npm run build

# 在建置階段列出 dist 檔案，便於查錯（build log）
RUN echo "==== dist content start ====" && ls -la dist || true && echo "==== dist content end ===="

# --- production stage ---
FROM node:20-alpine AS runner
WORKDIR /app

# 只從 builder 複製 dist（不要再複製 public）
COPY --from=builder /app/dist ./dist

# 將 server 啟動檔複製進來（假設使用 integrated-final/server.js）
COPY integrated-final/server.js ./

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# 啟動 server（Cloud Run 會使用此 cmd）
CMD ["node", "server.js"]
