FROM node:20-alpine

# App directory
WORKDIR /app

# Install dependencies (use lockfile if present)
COPY package*.json ./
RUN npm ci --omit=dev || npm install --only=production

# Copy source
COPY . .

ENV NODE_ENV=production

CMD ["npm", "start"]

