FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y chromium fonts-liberation --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ENV WHATSAPP_CHROME_PATH=/usr/bin/chromium
ENV WHATSAPP_PUPPETEER_SINGLE_PROCESS=true
ENV WHATSAPP_STALE_INIT_MS=90000
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
RUN npm install
COPY . .
RUN npm run build
ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "bin/server.js"]
