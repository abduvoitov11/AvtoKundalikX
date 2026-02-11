FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy the rest of the source code
COPY . .

# Install Chromium for this project and its system dependencies.
# This ensures the correct browser executable exists for the
# Playwright version declared in package.json.
RUN npx playwright install --with-deps chromium

ENV NODE_ENV=production
# Use default browser cache location so Playwright can always find it.
ENV PLAYWRIGHT_BROWSERS_PATH=0

CMD ["npm", "start"]

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


