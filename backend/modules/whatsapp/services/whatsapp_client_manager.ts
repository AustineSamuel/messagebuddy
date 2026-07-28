import app from '@adonisjs/core/services/app'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'
import { Client as WWebClient, LocalAuth, WAState } from '../lib/wwebjs.js'
import type { Client, WAState as WAStateType } from 'whatsapp-web.js'
import WhatsAppAutoReplyService from './whatsapp_auto_reply_service.js'
import WhatsAppRealtimeService from './whatsapp_realtime_service.js'
import WhatsAppRealtimeHub from './whatsapp_realtime_hub.js'

export type WhatsAppSessionStatus =
  | 'disconnected'
  | 'initializing'
  | 'qr'
  | 'authenticated'
  | 'ready'
  | 'auth_failure'

export type WhatsAppSession = {
  status: WhatsAppSessionStatus
  qr: string | null
  pairingCode: string | null
  lastError: string | null
  loadingPercent: number | null
  client: Client | null
}

const AUTH_DATA_PATH = app.makePath('storage', 'whatsapp_auth')
mkdirSync(AUTH_DATA_PATH, { recursive: true })

const DEFAULT_CHROME_PATH =
  process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : '/usr/bin/google-chrome-stable'

const CHROME_EXECUTABLE = process.env.WHATSAPP_CHROME_PATH ?? DEFAULT_CHROME_PATH

/** CDP protocol timeout for slow WhatsApp Web operations (fetchMessages, getChats, etc.). */
const PUPPETEER_PROTOCOL_TIMEOUT_MS = Number(
  process.env.WHATSAPP_PUPPETEER_PROTOCOL_TIMEOUT_MS ?? 300_000
)
const PUPPETEER_LAUNCH_TIMEOUT_MS = Number(
  process.env.WHATSAPP_PUPPETEER_LAUNCH_TIMEOUT_MS ?? 120_000
)
const INIT_TIMEOUT_MS = Number(process.env.WHATSAPP_INIT_TIMEOUT_MS ?? 180_000)

const sessions = new Map<number, WhatsAppSession>()
/** One in-flight initialize() per user. */
const initPromises = new Map<number, Promise<WhatsAppSession>>()
const readyWaiters = new Map<number, Array<(client: Client) => void>>()
/** Sync mutex — set before any await in initialize(). */
const launchingUsers = new Set<number>()
const initStartedAt = new Map<number, number>()
const readyCheckTimers = new Map<number, ReturnType<typeof setInterval>>()
const qrWaitTimers = new Map<number, ReturnType<typeof setTimeout>>()
const restoreBlockedUntil = new Map<number, number>()
const freshQrRetryUsers = new Set<number>()

const STALE_INIT_MS = Number(process.env.WHATSAPP_STALE_INIT_MS ?? 120_000)
const QR_WAIT_TIMEOUT_MS = app.inProduction ? STALE_INIT_MS : Math.min(STALE_INIT_MS, 45_000)
const READY_CHECK_INTERVAL_MS = 3_000

function createSession(): WhatsAppSession {
  return {
    status: 'disconnected',
    qr: null,
    pairingCode: null,
    lastError: null,
    loadingPercent: null,
    client: null,
  }
}

function broadcastSession(userId: number, session: WhatsAppSession) {
  WhatsAppRealtimeHub.broadcast(userId, {
    type: 'session:update',
    session: {
      status: session.status,
      qr: session.qr,
      pairingCode: session.pairingCode,
      lastError: session.lastError,
      loadingPercent: session.loadingPercent,
    },
  })
}

function sessionDir(userId: number) {
  return path.join(AUTH_DATA_PATH, `session-${userId}`)
}

/** LocalAuth stores each client's persistent browser profile directly under dataPath. */
function hasAuthenticatedPersistedSession(userId: number) {
  return existsSync(sessionDir(userId))
}

function clearPersistedAuth(userId: number) {
  const profileDir = sessionDir(userId)

  try {
    if (existsSync(profileDir)) rmSync(profileDir, { recursive: true, force: true })
  } catch {
    // best-effort
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Remove Chrome singleton files left after a crashed Node/Puppeteer process. */
function clearStaleBrowserProfileLocks(userId: number) {
  for (const file of ['SingletonLock', 'SingletonSocket', 'SingletonCookie']) {
    const lockPath = path.join(sessionDir(userId), file)
    try {
      if (existsSync(lockPath)) unlinkSync(lockPath)
    } catch {
      // ignore — file may be held by a live browser
    }
  }
}

/** Kill orphaned Chromium processes still holding this profile (e.g. after HMR restart). */
function killOrphanedBrowserForProfile(userId: number) {
  const dir = sessionDir(userId)
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /F /IM chrome.exe /FI "WINDOWTITLE eq *" 2>nul`, { stdio: 'ignore' })
    } else {
      execSync(`pkill -f "${dir}" 2>/dev/null || true`, { stdio: 'ignore' })
    }
    clearStaleBrowserProfileLocks(userId)
  } catch {
    // best-effort cleanup
  }
}

function isBrowserAlreadyRunningError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message.includes('browser is already running') || message.includes('userDataDir')
}

function readPersistedChromePath(): string | undefined {
  const appRoot = app.appRoot.toString()
  const candidates = [
    app.makePath('storage', 'chrome-executable-path.txt'),
    path.join(appRoot, '.puppeteer-cache', 'chrome-path.txt'),
    path.join(appRoot, 'storage', 'chrome-executable-path.txt'),
  ]

  for (const file of candidates) {
    if (!existsSync(file)) continue
    try {
      const chromePath = readFileSync(file, 'utf8').trim()
      if (chromePath && existsSync(chromePath)) {
        return chromePath
      }
    } catch {
      // try next
    }
  }

  return undefined
}

function ensurePuppeteerCacheEnv() {
  const appRoot = app.appRoot.toString()

  if (process.env.PUPPETEER_CACHE_DIR?.trim()) {
    const configured = process.env.PUPPETEER_CACHE_DIR.trim()
    if (!path.isAbsolute(configured)) {
      const resolved = path.join(appRoot, configured)
      if (existsSync(resolved)) {
        process.env.PUPPETEER_CACHE_DIR = resolved
      }
    }
    return
  }

  const cacheDirs = [
    path.join(appRoot, '.puppeteer-cache'),
    path.join(appRoot, '..', '.puppeteer-cache'),
  ]

  for (const dir of cacheDirs) {
    if (existsSync(dir)) {
      process.env.PUPPETEER_CACHE_DIR = dir
      return
    }
  }
}

function resolveChromeExecutable(): string | undefined {
  const persisted = readPersistedChromePath()
  if (persisted) {
    return persisted
  }

  ensurePuppeteerCacheEnv()

  const envPaths = [
    process.env.WHATSAPP_CHROME_PATH?.trim(),
    process.env.PUPPETEER_EXECUTABLE_PATH?.trim(),
    process.env.CHROME_BIN?.trim(),
  ].filter(Boolean) as string[]

  for (const candidate of envPaths) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  const candidates = [
    CHROME_EXECUTABLE,
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/opt/homebrew/bin/chromium',
    '/usr/local/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ]

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) {
      return candidate
    }
  }

  try {
    const bundled = puppeteer.executablePath()
    if (bundled && existsSync(bundled)) {
      return bundled
    }
  } catch {
    // ignore — fall through
  }

  return undefined
}

function chromeNotFoundMessage(): string {
  const cacheDir = process.env.PUPPETEER_CACHE_DIR ?? '(not set)'
  return (
    'Chrome/Chromium not found for WhatsApp. ' +
    `PUPPETEER_CACHE_DIR=${cacheDir}. ` +
    'On Render: Build Command must be `npm install && npm run build` (installs Chrome into build/.puppeteer-cache). ' +
    'Remove WHATSAPP_CHROME_PATH and PUPPETEER_SKIP_CHROMIUM_DOWNLOAD from env. ' +
    'Need at least 1GB RAM.'
  )
}

function buildPuppeteerOptions() {
  const singleProcess = process.env.WHATSAPP_PUPPETEER_SINGLE_PROCESS === 'true'
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-extensions',
    '--no-first-run',
  ]

  if (singleProcess) {
    args.push('--single-process', '--no-zygote')
  }

  const options: {
    headless: boolean
    args: string[]
    protocolTimeout: number
    timeout: number
    executablePath?: string
  } = {
    headless: true,
    args,
    protocolTimeout: PUPPETEER_PROTOCOL_TIMEOUT_MS,
    timeout: PUPPETEER_LAUNCH_TIMEOUT_MS,
  }

  const executablePath = resolveChromeExecutable()
  if (executablePath) {
    options.executablePath = executablePath
    console.info(`[whatsapp] Using Chrome at ${executablePath}`)
  } else {
    console.warn(`[whatsapp] ${chromeNotFoundMessage()}`)
  }

  return options
}

function requireChromeExecutable(): string {
  const executablePath = resolveChromeExecutable()
  if (!executablePath) {
    throw new Error(chromeNotFoundMessage())
  }
  return executablePath
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}

function waitFor<T>(getter: () => T | undefined | null, timeoutMs: number, intervalMs = 250) {
  return new Promise<T>((resolve, reject) => {
    const started = Date.now()

    const tick = () => {
      const value = getter()
      if (value) {
        resolve(value)
        return
      }

      if (Date.now() - started >= timeoutMs) {
        reject(new Error('Timed out waiting for WhatsApp client page.'))
        return
      }

      setTimeout(tick, intervalMs)
    }

    tick()
  })
}

function notifyReadyWaiters(userId: number, client: Client) {
  const waiters = readyWaiters.get(userId)
  if (!waiters?.length) return

  readyWaiters.delete(userId)
  for (const resolve of waiters) {
    resolve(client)
  }
}

function rejectReadyWaiters(userId: number) {
  readyWaiters.delete(userId)
}

function clearQrWait(userId: number) {
  const timer = qrWaitTimers.get(userId)
  if (timer) {
    clearTimeout(timer)
    qrWaitTimers.delete(userId)
  }
}

function scheduleQrWaitTimeout(userId: number) {
  clearQrWait(userId)

  const timer = setTimeout(() => {
    const session = sessions.get(userId)
    if (!session) return

    const waitingForQr =
      (session.status === 'initializing' || session.status === 'qr') &&
      !session.qr &&
      !session.pairingCode

    if (!waitingForQr) return

    void recoverMissingQr(userId)
  }, QR_WAIT_TIMEOUT_MS)

  qrWaitTimers.set(userId, timer)
}

async function recoverMissingQr(userId: number) {
  if (freshQrRetryUsers.has(userId)) {
    freshQrRetryUsers.delete(userId)
    await forceResetStuckSession(
      userId,
      'WhatsApp Web did not finish restoring the session after retrying.'
    )
    return
  }

  freshQrRetryUsers.add(userId)
  await forceResetStuckSession(
    userId,
    'WhatsApp Web did not finish restoring the session. Retrying without removing saved authentication.'
  )
  restoreBlockedUntil.delete(userId)
  await sleep(500)
  void whatsAppClientManager.initialize(userId)
}

function clearReadyCheck(userId: number) {
  const timer = readyCheckTimers.get(userId)
  if (timer) {
    clearInterval(timer)
    readyCheckTimers.delete(userId)
  }
}

async function promoteToReadyIfPossible(
  userId: number,
  session: WhatsAppSession,
  client: Client
): Promise<boolean> {
  if (session.status === 'ready') return true

  try {
    const state = await client.getState()
    if (state !== WAState.CONNECTED) return false

    const info = (client as Client & { info?: unknown }).info
    if (!info) return false

    session.status = 'ready'
    session.qr = null
    session.pairingCode = null
    session.loadingPercent = null
    session.lastError = null
    clearReadyCheck(userId)
    attachAutoReplyListener(userId, client)
    notifyReadyWaiters(userId, client)
    broadcastSession(userId, session)
    return true
  } catch {
    return false
  }
}

function scheduleReadyCheck(userId: number, session: WhatsAppSession, client: Client) {
  if (readyCheckTimers.has(userId) || session.status === 'ready') return

  const timer = setInterval(() => {
    if (session.status === 'ready') {
      clearReadyCheck(userId)
      return
    }
    void promoteToReadyIfPossible(userId, session, client)
  }, READY_CHECK_INTERVAL_MS)

  readyCheckTimers.set(userId, timer)

  setTimeout(() => {
    void forceResetStuckSession(
      userId,
      session.lastError ??
        'WhatsApp sync is taking longer than expected. Try Refresh status or reconnect.'
    )
  }, STALE_INIT_MS)
}

async function forceResetStuckSession(userId: number, message: string) {
  const session = sessions.get(userId)
  if (!session) return

  const isBooting =
    session.status === 'initializing' ||
    session.status === 'authenticated' ||
    (session.status === 'qr' && !session.qr && !session.pairingCode)

  if (!isBooting) return

  clearReadyCheck(userId)
  clearQrWait(userId)
  initPromises.delete(userId)
  launchingUsers.delete(userId)
  initStartedAt.delete(userId)
  restoreBlockedUntil.set(userId, Date.now() + 60_000)

  if (session.client) {
    await session.client.destroy().catch(() => undefined)
  }

  session.status = 'disconnected'
  session.lastError = message
  session.qr = null
  session.pairingCode = null
  session.loadingPercent = null
  session.client = null
  rejectReadyWaiters(userId)
  broadcastSession(userId, session)
}

function attachAutoReplyListener(userId: number, client: Client) {
  WhatsAppAutoReplyService.attachListener(userId, client)
  WhatsAppRealtimeService.attachListener(userId, client)
}

function attachClientEvents(userId: number, session: WhatsAppSession, client: Client) {
  client.on('qr', (qr) => {
    freshQrRetryUsers.delete(userId)
    session.qr = qr
    session.pairingCode = null
    session.status = 'qr'
    clearQrWait(userId)
    broadcastSession(userId, session)
  })

  client.on('code', (code) => {
    freshQrRetryUsers.delete(userId)
    session.pairingCode = code
    session.qr = null
    session.status = 'qr'
    clearQrWait(userId)
    broadcastSession(userId, session)
  })

  client.on('authenticated', () => {
    session.status = 'authenticated'
    session.qr = null
    scheduleReadyCheck(userId, session, client)
    broadcastSession(userId, session)
  })

  client.on('ready', () => {
    freshQrRetryUsers.delete(userId)
    session.status = 'ready'
    session.qr = null
    session.pairingCode = null
    session.loadingPercent = null
    session.lastError = null
    clearReadyCheck(userId)
    clearQrWait(userId)
    attachAutoReplyListener(userId, client)
    notifyReadyWaiters(userId, client)
    broadcastSession(userId, session)
  })

  client.on('auth_failure', (message) => {
    session.status = 'auth_failure'
    session.lastError = message
    rejectReadyWaiters(userId)
    broadcastSession(userId, session)
  })

  client.on('disconnected', (reason) => {
    session.status = 'disconnected'
    session.lastError = String(reason)
    session.qr = null
    session.pairingCode = null
    session.loadingPercent = null
    session.client = null
    rejectReadyWaiters(userId)
    broadcastSession(userId, session)
  })

  client.on('loading_screen', (percent) => {
    session.loadingPercent = Number(percent)
    if (
      session.status !== 'ready' &&
      session.status !== 'qr' &&
      session.status !== 'authenticated'
    ) {
      session.status = 'initializing'
    }
    if (Number(percent) >= 90) {
      scheduleReadyCheck(userId, session, client)
    }
    broadcastSession(userId, session)
  })

  client.on('change_state', (state: WAStateType) => {
    if (state === WAState.CONNECTED && session.status !== 'ready') {
      session.status = 'authenticated'
      void promoteToReadyIfPossible(userId, session, client)
      broadcastSession(userId, session)
    }

    if (
      state === WAState.PAIRING ||
      state === WAState.UNPAIRED ||
      state === WAState.UNPAIRED_IDLE
    ) {
      if (!session.qr && !session.pairingCode) {
        session.status = 'qr'
        broadcastSession(userId, session)
      }
    }
  })
}

async function launchClient(userId: number, session: WhatsAppSession, retryOnLock = true) {
  clearStaleBrowserProfileLocks(userId)

  const productionPuppeteerOptions = app.inProduction ? buildPuppeteerOptions() : undefined
  if (app.inProduction && !productionPuppeteerOptions?.executablePath) {
    requireChromeExecutable()
  }

  const client = new WWebClient({
    authStrategy: new LocalAuth({
      clientId: String(userId),
      dataPath: AUTH_DATA_PATH,
    }),
    ...(productionPuppeteerOptions ? { puppeteer: productionPuppeteerOptions } : {}),
    takeoverOnConflict: true,
  })

  session.client = client
  attachClientEvents(userId, session, client)

  try {
    await withTimeout(
      client.initialize(),
      INIT_TIMEOUT_MS,
      'WhatsApp client startup timed out. Install Chromium on the server (WHATSAPP_CHROME_PATH) and use at least 1GB RAM, then try again.'
    )
  } catch (error) {
    if (retryOnLock && isBrowserAlreadyRunningError(error)) {
      await client.destroy().catch(() => undefined)
      session.client = null
      killOrphanedBrowserForProfile(userId)
      await sleep(750)
      return launchClient(userId, session, false)
    }
    throw error
  }
}

class WhatsAppClientManager {
  getSession(userId: number): WhatsAppSession {
    if (!sessions.has(userId)) {
      sessions.set(userId, createSession())
    }
    return sessions.get(userId)!
  }

  /** Reset sessions stuck waiting for QR or finishing auth beyond STALE_INIT_MS. */
  recoverStaleSession(userId: number) {
    const session = this.getSession(userId)
    const started = initStartedAt.get(userId)
    if (!started) return

    const waitingForQr =
      (session.status === 'initializing' || session.status === 'qr') &&
      !session.qr &&
      !session.pairingCode

    const isBooting =
      session.status === 'authenticated' || waitingForQr

    if (!isBooting) return
    if (Date.now() - started < STALE_INIT_MS) return

    void forceResetStuckSession(
      userId,
      waitingForQr
        ? 'WhatsApp Web did not generate a QR code before initialization timed out.'
        : session.lastError ??
            'WhatsApp startup timed out. Install Chromium on the server and try again.'
    )
  }

  /**
   * Background restore for users who linked WhatsApp before.
   * Skips brand-new users whose browser profile exists but auth was never saved.
   */
  restoreIfPersisted(userId: number) {
    const session = this.getSession(userId)

    if (!hasAuthenticatedPersistedSession(userId)) return
    if ((restoreBlockedUntil.get(userId) ?? 0) > Date.now()) return
    if (session.client) return
    if (initPromises.has(userId)) return
    if (session.status !== 'disconnected' && session.status !== 'auth_failure') return

    void this.initialize(userId).catch((error) => {
      console.error('[whatsapp] restoreIfPersisted failed', { userId, error })
    })
  }

  async initialize(userId: number): Promise<WhatsAppSession> {
    const inFlight = initPromises.get(userId)
    if (inFlight) {
      return inFlight
    }

    const session = this.getSession(userId)
    if (session.client && session.status === 'ready') {
      return session
    }

    if (session.client && session.status === 'initializing') {
      const started = initStartedAt.get(userId) ?? 0
      if (Date.now() - started < STALE_INIT_MS) {
        return session
      }
      await session.client.destroy().catch(() => undefined)
      session.client = null
      clearReadyCheck(userId)
    }

    if (launchingUsers.has(userId)) {
      return waitFor(() => initPromises.get(userId), 30_000).then(
        (promise) => promise ?? this.getSession(userId)
      )
    }

    // Claim launch slot synchronously (before any await) to prevent poll races.
    launchingUsers.add(userId)

    let resolveWork!: (session: WhatsAppSession) => void
    const work = new Promise<WhatsAppSession>((resolve) => {
      resolveWork = resolve
    })
    initPromises.set(userId, work)

    void this.runInitialize(userId)
      .then(resolveWork)
      .catch(() => resolveWork(this.getSession(userId)))
      .finally(() => {
        launchingUsers.delete(userId)
        initPromises.delete(userId)
      })

    return work
  }

  private async runInitialize(userId: number): Promise<WhatsAppSession> {
    const session = this.getSession(userId)

    if (session.client && session.status === 'ready') {
      return session
    }

    if (session.client) {
      await session.client.destroy().catch(() => undefined)
      session.client = null
    }

    session.status = 'initializing'
    session.qr = null
    session.pairingCode = null
    session.lastError = null
    session.loadingPercent = null
    initStartedAt.set(userId, Date.now())
    scheduleQrWaitTimeout(userId)
    broadcastSession(userId, session)

    try {
      await launchClient(userId, session)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start WhatsApp client.'
      clearQrWait(userId)
      session.status = 'disconnected'
      session.lastError = message
      session.client = null
      restoreBlockedUntil.set(userId, Date.now() + 60_000)
      rejectReadyWaiters(userId)
      broadcastSession(userId, session)
    }

    return session
  }

  async getReadyClient(userId: number, timeoutMs = 120_000): Promise<Client> {
    const session = this.getSession(userId)

    if (session.client && session.status === 'ready') {
      return session.client
    }

    if (session.client || hasAuthenticatedPersistedSession(userId)) {
      if (!session.client || session.status === 'disconnected') {
        await this.initialize(userId)
      }

      const current = this.getSession(userId)
      if (current.status === 'ready' && current.client) {
        return current.client
      }

      if (!current.client) {
        throw new Error('WhatsApp is not connected. Initialize the session and scan the QR code.')
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          const waiters = readyWaiters.get(userId) ?? []
          readyWaiters.set(
            userId,
            waiters.filter((resolveReady) => resolveReady !== onReady)
          )
          reject(new Error('WhatsApp connection timed out. Scan the QR code or try again.'))
        }, timeoutMs)

        const onReady = (client: Client) => {
          clearTimeout(timeout)
          resolve(client)
        }

        if (!readyWaiters.has(userId)) {
          readyWaiters.set(userId, [])
        }
        readyWaiters.get(userId)!.push(onReady)
      })
    }

    throw new Error('WhatsApp is not connected. Initialize the session and scan the QR code.')
  }

  async getState(userId: number): Promise<WAStateType | null> {
    const session = this.getSession(userId)
    if (!session.client) return null

    try {
      return await session.client.getState()
    } catch {
      return null
    }
  }

  async destroy(userId: number) {
    const session = this.getSession(userId)
    rejectReadyWaiters(userId)
    clearReadyCheck(userId)
    clearQrWait(userId)
    initStartedAt.delete(userId)
    freshQrRetryUsers.delete(userId)
    initPromises.delete(userId)
    launchingUsers.delete(userId)

    if (session.client) {
      await session.client.destroy().catch(() => undefined)
    }

    clearPersistedAuth(userId)
    const disconnected = createSession()
    sessions.set(userId, disconnected)
    broadcastSession(userId, disconnected)
  }

  /**
   * Stop the in-memory client without deleting LocalAuth data.
   * Used during application shutdown so the next process can restore the session.
   */
  private async stop(userId: number) {
    const session = sessions.get(userId)
    if (!session) return

    rejectReadyWaiters(userId)
    clearReadyCheck(userId)
    clearQrWait(userId)
    initStartedAt.delete(userId)
    freshQrRetryUsers.delete(userId)
    initPromises.delete(userId)
    launchingUsers.delete(userId)

    if (session.client) {
      await session.client.destroy().catch(() => undefined)
    }

    sessions.set(userId, createSession())
  }

  async logout(userId: number) {
    const session = this.getSession(userId)
    rejectReadyWaiters(userId)
    clearReadyCheck(userId)
    clearQrWait(userId)
    initStartedAt.delete(userId)
    freshQrRetryUsers.delete(userId)
    restoreBlockedUntil.delete(userId)
    initPromises.delete(userId)
    launchingUsers.delete(userId)

    if (session.client) {
      await session.client.logout().catch(() => undefined)
      await session.client.destroy().catch(() => undefined)
    }

    clearPersistedAuth(userId)
    const disconnected = createSession()
    sessions.set(userId, disconnected)
    broadcastSession(userId, disconnected)
  }

  async requestPairingCode(userId: number, phoneNumber: string, showNotification = true) {
    if (!phoneNumber) {
      throw new Error('phoneNumber is required for pairing code authentication.')
    }

    await this.initialize(userId)

    const session = this.getSession(userId)
    const client = session.client

    if (!client) {
      throw new Error('Failed to start WhatsApp client for pairing.')
    }

    await waitFor(() => client.pupPage, 60_000)

    const code = await client.requestPairingCode(phoneNumber, showNotification)
    session.pairingCode = code
    session.status = 'qr'
    broadcastSession(userId, session)
    return code
  }

  /** Graceful shutdown — call on process exit to release Chrome profiles. */
  async shutdownAll() {
    const userIds = [...sessions.keys()]
    await Promise.all(userIds.map((userId) => this.stop(userId)))
  }
}

const whatsAppClientManager = new WhatsAppClientManager()
export default whatsAppClientManager

process.once('SIGINT', () => {
  void whatsAppClientManager.shutdownAll()
})
process.once('SIGTERM', () => {
  void whatsAppClientManager.shutdownAll()
})
