/**
 * Ensures a Chrome/Chromium binary exists for WhatsApp (Puppeteer).
 *
 * - Docker: uses system Chromium at WHATSAPP_CHROME_PATH — skips download.
 * - Render native (no Docker): downloads Chrome into Puppeteer cache during build.
 */
import { existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import puppeteer from 'puppeteer'

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

function log(msg) {
  console.log(`[ensure-chrome] ${msg}`)
}

for (const candidate of SYSTEM_CANDIDATES) {
  if (existsSync(candidate)) {
    log(`Using system browser at ${candidate} — skip Puppeteer download`)
    process.exit(0)
  }
}

try {
  const cached = puppeteer.executablePath()
  if (cached && existsSync(cached)) {
    log(`Puppeteer Chrome already present at ${cached}`)
    process.exit(0)
  }
} catch {
  // fall through to install
}

log('No system Chromium found — installing Chrome for Puppeteer (Render / native deploy)…')
execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' })

const installed = puppeteer.executablePath()
if (!installed || !existsSync(installed)) {
  console.error('[ensure-chrome] Install finished but Chrome binary is still missing.')
  process.exit(1)
}

log(`Chrome ready at ${installed}`)
