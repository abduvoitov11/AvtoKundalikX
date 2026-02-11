FROM mcr.microsoft.com/playwright:v1.58.2-jammy

# Work inside app subfolder
WORKDIR /app/emaktab-telegram-bot

# Copy only package files from subdirectory
COPY emaktab-telegram-bot/package*.json ./

# Install dependencies (use lockfile if present)
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Ensure Chromium and deps are installed (defensive)
RUN playwright install --with-deps chromium

# Copy source code
COPY emaktab-telegram-bot/ .

# Environment
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/app/pw-browsers
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

CMD ["npm", "start"]


