import app from '@adonisjs/core/services/app'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { Client as WWebClient, LocalAuth, WAState } from '../lib/wwebjs.js'
import type { Client, WAState as WAStateType } from 'whatsapp-web.js'

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

const sessions = new Map<number, WhatsAppSession>()
const initPromises = new Map<number, Promise<void>>()
const readyWaiters = new Map<number, Array<(client: Client) => void>>()

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

function hasPersistedSession(userId: number) {
  return existsSync(sessionDir(userId))
}

function buildPuppeteerOptions() {
  const options: {
    headless: boolean
    args: string[]
    executablePath?: string
  } = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  }

  if (CHROME_EXECUTABLE && existsSync(CHROME_EXECUTABLE)) {
    options.executablePath = CHROME_EXECUTABLE
  }

  return options
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

function attachClientEvents(userId: number, session: WhatsAppSession, client: Client) {
  client.on('qr', (qr) => {
    session.qr = qr
    session.pairingCode = null
    session.status = 'qr'
  })

  client.on('code', (code) => {
    session.pairingCode = code
    session.qr = null
    session.status = 'qr'
  })

  client.on('authenticated', () => {
    session.status = 'authenticated'
    session.qr = null
  })

  client.on('ready', () => {
    session.status = 'ready'
    session.qr = null
    session.pairingCode = null
    session.loadingPercent = null
    session.lastError = null
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
    if (session.status !== 'ready' && session.status !== 'qr') {
      session.status = 'initializing'
    }
  })

  client.on('change_state', (state: WAStateType) => {
    if (state === WAState.CONNECTED && session.status !== 'ready') {
      session.status = 'authenticated'
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

class WhatsAppClientManager {
  getSession(userId: number): WhatsAppSession {
    if (!sessions.has(userId)) {
      sessions.set(userId, createSession())
    }
    return sessions.get(userId)!
  }

  restoreIfPersisted(userId: number) {
    const session = this.getSession(userId)

    if (
      hasPersistedSession(userId) &&
      session.status === 'disconnected' &&
      !session.client &&
      !initPromises.has(userId)
    ) {
      void this.initialize(userId)
    }
  }

  async initialize(userId: number): Promise<WhatsAppSession> {
    const session = this.getSession(userId)

    if (session.client && session.status === 'ready') {
      return session
    }

    if (initPromises.has(userId)) {
      await initPromises.get(userId)!.catch(() => undefined)
      return this.getSession(userId)
    }

    if (session.status === 'initializing' && session.client) {
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

    const initPromise = client
      .initialize()
      .catch(async (error: Error) => {
        session.status = 'disconnected'
        session.lastError = error.message
        if (session.client === client) {
          await client.destroy().catch(() => undefined)
          session.client = null
        }
        rejectReadyWaiters(userId)
        throw error
      })
      .finally(() => {
        initPromises.delete(userId)
      })

    initPromises.set(userId, initPromise)
    return session
  }

  async getReadyClient(userId: number, timeoutMs = 120_000): Promise<Client> {
    const session = this.getSession(userId)

    if (session.client && session.status === 'ready') {
      return session.client
    }

    if (session.client || hasPersistedSession(userId)) {
      if (!session.client) {
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
    initPromises.delete(userId)

    if (session.client) {
      await session.client.destroy().catch(() => undefined)
    }

    sessions.set(userId, createSession())
  }

  async logout(userId: number) {
    const session = this.getSession(userId)
    rejectReadyWaiters(userId)
    initPromises.delete(userId)

    if (session.client) {
      await session.client.logout().catch(() => undefined)
      await session.client.destroy().catch(() => undefined)
    }

    sessions.set(userId, createSession())
  }

  async requestPairingCode(userId: number, phoneNumber: string, showNotification = true) {
    if (!phoneNumber) {
      throw new Error('phoneNumber is required for pairing code authentication.')
    }

    await this.initialize(userId)

    const initPromise = initPromises.get(userId)
    if (initPromise) {
      await initPromise.catch(() => undefined)
    }

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
}

const whatsAppClientManager = new WhatsAppClientManager()
export default whatsAppClientManager
