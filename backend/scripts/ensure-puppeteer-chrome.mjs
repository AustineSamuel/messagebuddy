/**
 * Ensures Chrome exists for WhatsApp and records the path for production runtime.
 *
 * Build installs to backend/.puppeteer-cache (inside the project, not /opt/render/.cache).
 * copy-puppeteer-cache.mjs copies that folder into build/ so Render runtime can find it.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolvePuppeteerChromePath } from './puppeteer-chrome-path.mjs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const CACHE_DIR = path.join(ROOT, '.puppeteer-cache')
const STORAGE_DIR = path.join(ROOT, 'storage')
const CHROME_PATH_FILE = path.join(STORAGE_DIR, 'chrome-executable-path.txt')

const SYSTEM_CANDIDATES = [
  process.env.WHATSAPP_CHROME_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_BIN,
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome-stable',
  process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : null,
  process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : null,
].filter(Boolean)

const forceBundled =
  process.env.RENDER === 'true' ||
  process.env.CI === 'true' ||
  process.env.FORCE_PUPPETEER_BUNDLE === 'true'

function log(msg) {
  console.log(`[ensure-chrome] ${msg}`)
}

function persistChromePath(chromePath) {
  mkdirSync(STORAGE_DIR, { recursive: true })
  mkdirSync(CACHE_DIR, { recursive: true })
  writeFileSync(CHROME_PATH_FILE, chromePath, 'utf8')
  writeFileSync(path.join(CACHE_DIR, 'chrome-path.txt'), chromePath, 'utf8')
  log(`Saved Chrome path to ${CHROME_PATH_FILE}`)
}

for (const candidate of SYSTEM_CANDIDATES) {
  if (!forceBundled && existsSync(candidate)) {
    log(`Using system browser at ${candidate}`)
    persistChromePath(candidate)
    process.exit(0)
  }
}

const existing = await resolvePuppeteerChromePath(CACHE_DIR)
if (existing) {
  log(`Puppeteer Chrome already present at ${existing}`)
  persistChromePath(existing)
  process.exit(0)
}

mkdirSync(CACHE_DIR, { recursive: true })

log(`Installing Chrome into ${CACHE_DIR} (bundled with deploy artifact)…`)
execSync('npx puppeteer browsers install chrome', {
  stdio: 'inherit',
  cwd: ROOT,
  env: { ...process.env, PUPPETEER_CACHE_DIR: CACHE_DIR },
})

const installed = await resolvePuppeteerChromePath(CACHE_DIR)
if (!installed) {
  console.error('[ensure-chrome] Install finished but Chrome binary is still missing.')
  process.exit(1)
}

persistChromePath(installed)
log(`Chrome ready at ${installed}`)
