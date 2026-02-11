# eMaktab.uz Telegram Bot

Bot for automating eMaktab.uz logins and sending screenshots to the admin via Telegram.

## Setup

1. **Install dependencies** (already done if you ran `npm install`):
   ```bash
   npm install
   ```
2. **Install Playwright browsers** (first time only):
   ```bash
   npx playwright install chromium
   ```
3. **Create a bot** with [@BotFather](https://t.me/BotFather) and copy the token.
4. **Set the token**:
   - Windows (PowerShell): `$env:TELEGRAM_BOT_TOKEN="YOUR_TOKEN"`
   - Or create a `.env` file and use a package like `dotenv` if you add it.

## Run

```bash
npm start
```

Or:

```bash
node index.js
```

Admin (ID: `6291811673`) can:

- **Add Account** → enter login → enter password (stored in `accounts.json`).
- **Run screenshots now** → log in to https://login.emaktab.uz/ for each account and send a screenshot to the admin.
- **List accounts** → show stored logins.

A **cron job** runs every day at **07:45 Tashkent time** (Asia/Tashkent), logs in for all accounts, and sends screenshots to the admin.

## Files

- `index.js` – Telegraf bot, admin UI, cron.
- `database.js` – Read/write `accounts.json`.
- `automation.js` – Playwright login and screenshot.
- `accounts.json` – Created automatically; stores `[{ "login", "password" }, ...]`.
