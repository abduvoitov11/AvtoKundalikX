const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load .env from project directory (no extra dependency)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}

// Ensure Playwright browsers are installed and use the default cache path.
// This mirrors the "force install on startup" pattern.
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = '0';
}

try {
  console.log('Checking Playwright browsers (startup)...');
  execSync('npx playwright install --with-deps chromium', {
    stdio: 'inherit',
    env: process.env,
  });
} catch (e) {
  console.error('Playwright browser install at startup failed:', e.message || e);
}

const { Telegraf, session, Scenes } = require('telegraf');
const cron = require('node-cron');
// Local storage only (accounts.json via database.js – no external DB/API)
const { getAllAccounts, addAccount, ensureAccountsFile, removeAccount } = require('./database');
const { runAllScreenshotsAndNotify } = require('./automation');

const ADMIN_ID = 6291811673;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('Set TELEGRAM_BOT_TOKEN or BOT_TOKEN environment variable.');
  process.exit(1);
}

ensureAccountsFile();

// ----- Add Account wizard (step: idle -> login -> password -> done) -----
const addAccountWizard = new Scenes.WizardScene(
  'add_account',
  async (ctx) => {
    await ctx.reply('Enter eMaktab login (username/email):');
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.login = ctx.message?.text?.trim();
    if (!ctx.wizard.state.login) {
      await ctx.reply('Please send a valid login.');
      return;
    }
    await ctx.reply('Enter password:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const password = ctx.message?.text;
    if (password === undefined || password === null) {
      await ctx.reply('Please send the password as text.');
      return;
    }
    addAccount(ctx.wizard.state.login, password);
    await ctx.reply(`Account "${ctx.wizard.state.login}" added.`);
    return ctx.scene.leave();
  }
);

// ----- Delete Account wizard: show list, then ask number or login -----
const deleteAccountWizard = new Scenes.WizardScene(
  'delete_account',
  async (ctx) => {
    const accounts = getAllAccounts();
    if (accounts.length === 0) {
      await ctx.reply('Hisoblar ro\'yxati bo\'sh. O\'chirish uchun hech narsa yo\'q.');
      return ctx.scene.leave();
    }
    const list = accounts.map((a, i) => `${i + 1}. ${a.login}`).join('\n');
    await ctx.reply('O\'chirmoqchi hisobingiz raqamini yoki loginini yuboring:\n\n' + list);
    return ctx.wizard.next();
  },
  async (ctx) => {
    const input = ctx.message?.text?.trim();
    if (!input) {
      await ctx.reply('Raqam yoki login yuboring.');
      return;
    }
    const result = removeAccount(input);
    if (result.error) {
      await ctx.reply(result.error);
      return ctx.scene.leave();
    }
    await ctx.reply(`"${result.login}" hisobi o\'chirildi.`);
    return ctx.scene.leave();
  }
);

const stage = new Scenes.Stage([addAccountWizard, deleteAccountWizard]);

const bot = new Telegraf(BOT_TOKEN);
bot.use(session());
bot.use(stage.middleware());

function isAdmin(ctx) {
  return ctx.from?.id === ADMIN_ID;
}

bot.command('start', (ctx) => {
  if (!isAdmin(ctx)) {
    return ctx.reply('You are not authorized to use this bot.');
  }
  return ctx.reply('eMaktab bot. Use the keyboard below.', {
    reply_markup: {
      keyboard: [
        [{ text: '➕ Add Account' }, { text: '🗑 Delete account' }],
        [{ text: '📸 Run screenshots now' }],
        [{ text: '📋 List accounts' }],
      ],
      resize_keyboard: true,
    },
  });
});

bot.hears('➕ Add Account', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('Access denied.');
  return ctx.scene.enter('add_account');
});

bot.hears('📸 Run screenshots now', async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('Access denied.');
  await ctx.reply('Running eMaktab logins and taking screenshots…');
  try {
    await runAllScreenshotsAndNotify(ctx, ctx.chat.id);
    await ctx.reply('Done.');
  } catch (e) {
    await ctx.reply('Error: ' + e.message);
  }
});

bot.hears('🗑 Delete account', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('Access denied.');
  return ctx.scene.enter('delete_account');
});

bot.hears('📋 List accounts', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('Access denied.');
  const accounts = getAllAccounts();
  if (accounts.length === 0) {
    return ctx.reply('No accounts. Add one with "Add Account".');
  }
  const list = accounts.map((a, i) => `${i + 1}. ${a.login}`).join('\n');
  return ctx.reply('Accounts:\n' + list);
});

// Cron: 07:45 Tashkent time (Asia/Tashkent)
cron.schedule(
  '45 7 * * *',
  async () => {
    try {
      const accounts = getAllAccounts();
      if (accounts.length === 0) return;
      const fakeCtx = { telegram: bot.telegram };
      await runAllScreenshotsAndNotify(fakeCtx, ADMIN_ID);
    } catch (e) {
      try {
        await bot.telegram.sendMessage(ADMIN_ID, 'Cron eMaktab error: ' + e.message);
      } catch (_) {}
    }
  },
  { timezone: 'Asia/Tashkent' }
);

bot.launch().then(() => console.log('eMaktab Telegram bot running. Cron: 07:45 Tashkent.'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
