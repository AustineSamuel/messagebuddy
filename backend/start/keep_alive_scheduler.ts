import logger from '@adonisjs/core/services/logger'

const KEEP_ALIVE_URLS = [
  'https://messagebuddy-1.onrender.com',
  'https://messagebuddy.onrender.com',
] as const

const TICK_MS = 3 * 60 * 1000
const REQUEST_TIMEOUT_MS = 30_000

let timer: ReturnType<typeof setInterval> | null = null
let tickInFlight = false

async function pingUrl(url: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'User-Agent': 'MessageBuddy-KeepAlive/1.0' },
    })
    logger.debug(`Keep-alive ping ${url} -> ${response.status}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn(`Keep-alive ping failed for ${url}: ${message}`)
  } finally {
    clearTimeout(timeout)
  }
}

async function runTick() {
  if (tickInFlight) {
    logger.debug('Keep-alive tick skipped — previous tick still running')
    return
  }

  tickInFlight = true
  try {
    await Promise.all(KEEP_ALIVE_URLS.map((url) => pingUrl(url)))
  } finally {
    tickInFlight = false
  }
}

export function startKeepAliveScheduler() {
  if (timer) return

  void runTick()
  timer = setInterval(() => {
    void runTick()
  }, TICK_MS)
}

export function stopKeepAliveScheduler() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  tickInFlight = false
}
