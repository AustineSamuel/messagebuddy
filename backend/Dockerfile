FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y chromium fonts-liberation --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ENV WHATSAPP_CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["node", "bin/server.js"]
