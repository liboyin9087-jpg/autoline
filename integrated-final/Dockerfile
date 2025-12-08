FROM node:20-slim
WORKDIR /app
COPY package.json ./
# 確保安裝 dependencies
RUN npm install --production
COPY dist ./dist
COPY public ./public
COPY server.js ./
COPY prompts.js ./
ENV NODE_ENV=production
ENV PORT=8080 
EXPOSE 8080
CMD ["node", "server.js"]
