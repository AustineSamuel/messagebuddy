/**
 * Copy Puppeteer Chrome cache into Adonis build/ and write the runtime Chrome path.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolvePuppeteerChromePath } from './puppeteer-chrome-path.mjs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const BUILD_DIR = path.join(ROOT, 'build')
const CACHE_SRC = path.join(ROOT, '.puppeteer-cache')
const CACHE_DEST = path.join(BUILD_DIR, '.puppeteer-cache')
const CHROME_PATH_DEST = path.join(BUILD_DIR, 'storage', 'chrome-executable-path.txt')

function log(msg) {
  console.log(`[copy-puppeteer-cache] ${msg}`)
}

if (!existsSync(BUILD_DIR)) {
  console.error('[copy-puppeteer-cache] build/ not found — run ace build first')
  process.exit(1)
}

if (existsSync(CACHE_SRC)) {
  cpSync(CACHE_SRC, CACHE_DEST, { recursive: true })
  log(`Copied cache → ${CACHE_DEST}`)
}

let chromePath

const srcPathFile = path.join(ROOT, 'storage', 'chrome-executable-path.txt')
if (existsSync(srcPathFile)) {
  chromePath = readFileSync(srcPathFile, 'utf8').trim()
}

if (existsSync(CACHE_DEST)) {
  const cached = await resolvePuppeteerChromePath(CACHE_DEST)
  if (cached) {
    chromePath = cached
  }
}

if (chromePath && existsSync(chromePath)) {
  mkdirSync(path.dirname(CHROME_PATH_DEST), { recursive: true })
  writeFileSync(CHROME_PATH_DEST, chromePath, 'utf8')
  log(`Runtime Chrome path: ${chromePath}`)
} else if (!existsSync(CACHE_SRC)) {
  log('No Puppeteer cache to copy (system Chrome will be used if available)')
} else {
  console.error('[copy-puppeteer-cache] Chrome binary not found after copy')
  process.exit(1)
}
