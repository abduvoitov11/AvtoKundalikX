const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { getAllAccounts } = require('./database');

const LOGIN_URL = 'https://login.emaktab.uz/';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

/**
 * Log into eMaktab.uz for one account and save a screenshot.
 * @param {string} login
 * @param {string} password
 * @returns {Promise<{path: string, login: string} | {error: string, login: string}>}
 */
async function loginAndScreenshot(login, password) {
  let browser;
  try {
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    await page.goto(LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // eMaktab login formasi: "Login", "Parol", yashil "Tizimga kiring" tugmasi
    const loginInput = page.getByLabel('Login').or(page.locator('input[type="text"], input[name="login"], input[name="username"]').first());
    const passwordInput = page.getByLabel('Parol').or(page.locator('input[type="password"]').first());
    // Aniq yashil "Tizimga kiring" tugmasi (forma ichidagi, headerdagi "Kirish" emas)
    const submitBtn = page.getByRole('button', { name: 'Tizimga kiring' }).or(
      page.locator('form').locator('button:has-text("Tizimga kiring"), input[type="submit"]').first()
    ).first();

    await loginInput.first().waitFor({ state: 'visible', timeout: 10000 });
    await loginInput.first().fill(login);
    await passwordInput.first().fill(password);

    // "Tizimga kiring" tugmasini bosing, keyin navigatsiya tugashini kuting
    await submitBtn.first().click({ force: true });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
    // O'quvchi sahifasiga kirguncha kuting: URL o'zgarishi YOKI login formasi yo'qolishi (SPA)
    const loginUrlNorm = LOGIN_URL.replace(/\/$/, '');
    await Promise.race([
      page.waitForURL((url) => url.replace(/\/$/, '') !== loginUrlNorm, { timeout: 15000 }),
      page.locator('button[type="submit"], input[type="submit"], button:has-text("Kirish"), button:has-text("Tizimga kiring")').first().waitFor({ state: 'hidden', timeout: 15000 }),
    ]).catch(() => {});
    // O'quvchi paneli (Chiqish, O'quvchi, BUGUN) ko'rinmaguncha kuting — rasmdagi oyna ochilguncha
    await Promise.race([
      page.getByText('Chiqish').first().waitFor({ state: 'visible', timeout: 20000 }),
      page.getByText("O'quvchi").first().waitFor({ state: 'visible', timeout: 20000 }),
      page.getByText('BUGUN').first().waitFor({ state: 'visible', timeout: 20000 }),
    ]).catch(() => {});
    // Panel to'liq yuklanishi uchun qisqa kutish
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);

    const safeName = login.replace(/[^a-zA-Z0-9_-]/g, '_');
    const screenshotPath = path.join(SCREENSHOTS_DIR, `emaktab_${safeName}_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    await browser.close();
    return { path: screenshotPath, login };
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    return { error: err.message, login };
  }
}

/**
 * Loop through all accounts, login and return screenshot paths or errors.
 * @returns {Promise<Array<{path?: string, login: string, error?: string}>>}
 */
async function runAllScreenshots() {
  const accounts = getAllAccounts();
  const results = [];

  for (const { login, password } of accounts) {
    const result = await loginAndScreenshot(login, password);
    results.push(result);
  }

  return results;
}

/**
 * Run all accounts and send screenshots to a Telegram bot context.
 * @param {object} ctx - Telegraf context (for ctx.telegram.sendPhoto)
 * @param {number} adminChatId - Chat ID to send photos to
 */
async function runAllScreenshotsAndNotify(ctx, adminChatId) {
  const results = await runAllScreenshots();

  for (const r of results) {
    if (r.path) {
      try {
        await ctx.telegram.sendPhoto(adminChatId, { source: r.path }, { caption: `eMaktab: ${r.login}` });
      } catch (e) {
        await ctx.telegram.sendMessage(adminChatId, `Screenshot failed for ${r.login}: ${e.message}`);
      }
    } else {
      await ctx.telegram.sendMessage(adminChatId, `Login failed for ${r.login}: ${r.error || 'Unknown error'}`);
    }
  }

  if (results.length === 0) {
    await ctx.telegram.sendMessage(adminChatId, 'No accounts in accounts.json. Add accounts first.');
  }
}

module.exports = {
  loginAndScreenshot,
  runAllScreenshots,
  runAllScreenshotsAndNotify,
};
