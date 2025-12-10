FROM node:20-slim
WORKDIR /app
# Copy package files (package-lock.json is optional but preferred)
COPY package*.json ./
# Use npm ci if package-lock.json exists, otherwise use npm install
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi
COPY dist ./dist
COPY public ./public
COPY server.js ./
COPY prompts.js ./
ENV NODE_ENV=production
# NOTE: Do NOT hard-set PORT in production image. Cloud Run injects PORT at runtime.
EXPOSE 8080
CMD ["node", "server.js"]
