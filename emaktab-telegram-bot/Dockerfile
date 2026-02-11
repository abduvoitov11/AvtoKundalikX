FROM mcr.microsoft.com/playwright:v1.58.2-jammy

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

