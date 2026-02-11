FROM node:20-alpine

# Work inside app subfolder
WORKDIR /app/emaktab-telegram-bot

# Copy only package files from subdirectory
COPY emaktab-telegram-bot/package*.json ./

# Install dependencies (use lockfile if present)
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy source code
COPY emaktab-telegram-bot/ .

ENV NODE_ENV=production

CMD ["npm", "start"]

