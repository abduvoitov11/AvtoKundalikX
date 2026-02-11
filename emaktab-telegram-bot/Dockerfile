FROM mcr.microsoft.com/playwright:v1.50.0-jammy

# 2. Ishchi papka
WORKDIR /app

# 3. Faqat packagelarni nusxalash
COPY package*.json ./

# 4. Kutubxonalarni o'rnatish
RUN npm install --omit=dev

# 5. Qolgan hamma fayllarni nusxalash
COPY . .

# 6. Botni ishga tushirish
CMD ["node", "index.js"]

FROM mcr.microsoft.com/playwright/python:v1.58.2-jammy

# 2. Set work directory
WORKDIR /app

# 3. Prevent Python from buffering stdout/stderr
ENV PYTHONUNBUFFERED=1
ENV PLAYWRIGHT_BROWSERS_PATH=0

# 4. Copy ONLY requirements first
COPY requirements.txt .

# 5. Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. Install Chromium (even if it's in the image, this ensures it's linked)
RUN playwright install chromium

# 7. Copy the rest of the code
COPY . .

# 8. Set start command
CMD ["python", "main.py"]

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

