FROM node:20-alpine

# Root directory
WORKDIR /app

# Copy only the bot folder package files
COPY emaktab-telegram-bot/package*.json ./emaktab-telegram-bot/

WORKDIR /app/emaktab-telegram-bot

# Install dependencies
RUN npm ci --omit=dev || npm install --only=production

# Copy source code
COPY emaktab-telegram-bot .

# Environment
ENV NODE_ENV=production

# Start command
CMD ["npm", "start"]

