FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json vite.config.ts tailwind.config.js ./
RUN npm ci --legacy-peer-deps

COPY src ./src
COPY public ./public
COPY index.html ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY server.js ./
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["node", "server.js"]
