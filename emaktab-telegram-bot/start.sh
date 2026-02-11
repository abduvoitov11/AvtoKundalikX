#!/bin/sh
set -e

echo "Starting eMaktab Telegram bot via start.sh..."

# If Node app is in current directory
if [ -f "package.json" ] && [ -f "index.js" ]; then
  echo "Detected Node app in root."
  npm install
  npm start
  exit 0
fi

# If Node app is inside emaktab-telegram-bot/ subdirectory
if [ -d "emaktab-telegram-bot" ] && [ -f "emaktab-telegram-bot/package.json" ]; then
  echo "Detected Node app in emaktab-telegram-bot/ directory."
  cd emaktab-telegram-bot
  npm install
  npm start
  exit 0
fi

echo "start.sh: could not find a Node app (no package.json / index.js)."
exit 1

