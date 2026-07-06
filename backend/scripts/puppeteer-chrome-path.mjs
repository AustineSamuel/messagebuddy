import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

const CHROME_BINARY_CANDIDATES = [
  ['chrome-linux64', 'chrome'],
  ['chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
  ['chrome-win64', 'chrome.exe'],
]

export function findChromeBinaryInCache(cacheDir) {
  const chromeRoot = path.join(cacheDir, 'chrome')
  if (!existsSync(chromeRoot)) return undefined

  for (const versionDir of readdirSync(chromeRoot)) {
    const versionPath = path.join(chromeRoot, versionDir)
    for (const segments of CHROME_BINARY_CANDIDATES) {
      const candidate = path.join(versionPath, ...segments)
      if (existsSync(candidate)) {
        return candidate
      }
    }
  }

  return undefined
}

export async function resolvePuppeteerChromePath(cacheDir) {
  process.env.PUPPETEER_CACHE_DIR = cacheDir

  const fromCache = findChromeBinaryInCache(cacheDir)
  if (fromCache) return fromCache

  try {
    const puppeteer = await import('puppeteer')
    const executablePath = puppeteer.default.executablePath()
    return executablePath && existsSync(executablePath) ? executablePath : undefined
  } catch {
    return undefined
  }
}
