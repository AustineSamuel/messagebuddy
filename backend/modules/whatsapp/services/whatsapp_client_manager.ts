import app from '@adonisjs/core/services/app'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'
import { Client as WWebClient, LocalAuth, WAState } from '../lib/wwebjs.js'
import type { Client, WAState as WAStateType } from 'whatsapp-web.js'
import WhatsAppAutoReplyService from './whatsapp_auto_reply_service.js'
import WhatsAppRealtimeService from './whatsapp_realtime_service.js'

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

const STALE_INIT_MS = Number(process.env.WHATSAPP_STALE_INIT_MS ?? 120_000)
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

function sessionDir(userId: number) {
  return path.join(AUTH_DATA_PATH, `session-${userId}`)
}

/** True only after a successful link — not on a failed first-time browser launch. */
function hasAuthenticatedPersistedSession(userId: number) {
  return existsSync(path.join(AUTH_DATA_PATH, '.wwebjs_auth', `session-${userId}`))
}

function clearPersistedAuth(userId: number) {
  const authDir = path.join(AUTH_DATA_PATH, '.wwebjs_auth', `session-${userId}`)
  const profileDir = sessionDir(userId)

  try {
    if (existsSync(authDir)) rmSync(authDir, { recursive: true, force: true })
  } catch {
    // best-effort
  }

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

function resolveChromeExecutable(): string | undefined {
  const fromEnv = process.env.WHATSAPP_CHROME_PATH?.trim()
  if (fromEnv && existsSync(fromEnv)) {
    return fromEnv
  }

  const candidates = [
    CHROME_EXECUTABLE,
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

function buildPuppeteerOptions() {
  const singleProcess = process.env.WHATSAPP_PUPPETEER_SINGLE_PROCESS !== 'false'
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
  } else {
    console.warn(
      '[whatsapp] No Chrome/Chromium executable found. Set WHATSAPP_CHROME_PATH on the server.'
    )
  }

  return options
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

    void forceResetStuckSession(
      userId,
      'QR code did not appear. The server may need Chromium and at least 1GB RAM. Tap Stop and try again.'
    )
  }, STALE_INIT_MS)

  qrWaitTimers.set(userId, timer)
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
}

function attachAutoReplyListener(userId: number, client: Client) {
  WhatsAppAutoReplyService.attachListener(userId, client)
  WhatsAppRealtimeService.attachListener(userId, client)
}

function attachClientEvents(userId: number, session: WhatsAppSession, client: Client) {
  client.on('qr', (qr) => {
    session.qr = qr
    session.pairingCode = null
    session.status = 'qr'
    clearQrWait(userId)
  })

  client.on('code', (code) => {
    session.pairingCode = code
    session.qr = null
    session.status = 'qr'
    clearQrWait(userId)
  })

  client.on('authenticated', () => {
    session.status = 'authenticated'
    session.qr = null
    scheduleReadyCheck(userId, session, client)
  })

  client.on('ready', () => {
    session.status = 'ready'
    session.qr = null
    session.pairingCode = null
    session.loadingPercent = null
    session.lastError = null
    clearReadyCheck(userId)
    clearQrWait(userId)
    attachAutoReplyListener(userId, client)
    notifyReadyWaiters(userId, client)
  })

  client.on('auth_failure', (message) => {
    session.status = 'auth_failure'
    session.lastError = message
    rejectReadyWaiters(userId)
  })

  client.on('disconnected', (reason) => {
    session.status = 'disconnected'
    session.lastError = String(reason)
    session.qr = null
    session.pairingCode = null
    session.loadingPercent = null
    session.client = null
    rejectReadyWaiters(userId)
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
  })

  client.on('change_state', (state: WAStateType) => {
    if (state === WAState.CONNECTED && session.status !== 'ready') {
      session.status = 'authenticated'
      void promoteToReadyIfPossible(userId, session, client)
    }

    if (
      state === WAState.PAIRING ||
      state === WAState.UNPAIRED ||
      state === WAState.UNPAIRED_IDLE
    ) {
      if (!session.qr && !session.pairingCode) {
        session.status = 'qr'
      }
    }
  })
}

async function launchClient(userId: number, session: WhatsAppSession, retryOnLock = true) {
  clearStaleBrowserProfileLocks(userId)

  const client = new WWebClient({
    authStrategy: new LocalAuth({
      clientId: String(userId),
      dataPath: AUTH_DATA_PATH,
    }),
    puppeteer: buildPuppeteerOptions(),
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
        ? 'QR code did not appear in time. Ensure Chromium is installed with at least 1GB RAM, then try again.'
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

    const inFlight = initPromises.get(userId)
    if (inFlight) {
      await inFlight.catch(() => undefined)
    }
    initPromises.delete(userId)

    if (session.client) {
      await session.client.destroy().catch(() => undefined)
    }

    clearPersistedAuth(userId)
    sessions.set(userId, createSession())
  }

  async logout(userId: number) {
    const session = this.getSession(userId)
    rejectReadyWaiters(userId)
    clearReadyCheck(userId)
    clearQrWait(userId)
    initStartedAt.delete(userId)
    restoreBlockedUntil.delete(userId)

    const inFlight = initPromises.get(userId)
    if (inFlight) {
      await inFlight.catch(() => undefined)
    }
    initPromises.delete(userId)

    if (session.client) {
      await session.client.logout().catch(() => undefined)
      await session.client.destroy().catch(() => undefined)
    }

    clearPersistedAuth(userId)
    sessions.set(userId, createSession())
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
    return code
  }

  /** Graceful shutdown — call on process exit to release Chrome profiles. */
  async shutdownAll() {
    const userIds = [...sessions.keys()]
    await Promise.all(userIds.map((userId) => this.destroy(userId)))
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
