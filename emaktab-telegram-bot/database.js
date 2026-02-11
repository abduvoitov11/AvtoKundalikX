/**
 * Local file-based storage only.
 * No Supabase, Firebase, or any external database or API.
 * All data is stored in accounts.json in this folder.
 */

const fs = require('fs');
const path = require('path');

const ACCOUNTS_FILE = path.join(__dirname, 'accounts.json');

function getAllAccounts() {
  try {
    const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

function addAccount(login, password) {
  const list = getAllAccounts();
  list.push({ login: String(login).trim(), password: String(password) });
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function ensureAccountsFile() {
  if (!fs.existsSync(ACCOUNTS_FILE)) {
    fs.writeFileSync(ACCOUNTS_FILE, '[]', 'utf8');
  }
}

/**
 * Remove account by login (exact match after trim) or by 1-based index.
 * @param {string|number} key - login string or number (e.g. 1, 2)
 * @returns {{ removed: boolean, login?: string } | { error: string }}
 */
function removeAccount(key) {
  const list = getAllAccounts();
  if (list.length === 0) return { error: 'Hisob yo\'q.' };
  const num = typeof key === 'number' ? key : parseInt(key, 10);
  let index = -1;
  if (!Number.isNaN(num) && num >= 1 && num <= list.length) {
    index = num - 1;
  } else {
    const loginStr = String(key).trim();
    index = list.findIndex((a) => a.login.trim() === loginStr);
  }
  if (index === -1) return { error: 'Bunday hisob topilmadi. Raqam yoki login yuboring.' };
  const removed = list.splice(index, 1)[0];
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(list, null, 2), 'utf8');
  return { removed: true, login: removed.login };
}

module.exports = {
  getAllAccounts,
  addAccount,
  ensureAccountsFile,
  removeAccount,
};
