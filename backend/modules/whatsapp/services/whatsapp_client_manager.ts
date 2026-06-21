import app from '@adonisjs/core/services/app'
import { Client, LocalAuth, type WAState } from 'whatsapp-web.js'

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
  client: Client | null
}

const sessions = new Map<number, WhatsAppSession>()

function createSession(): WhatsAppSession {
  return {
    status: 'disconnected',
    qr: null,
    pairingCode: null,
    lastError: null,
    client: null,
  }
}

function authPath(userId: number) {
  return app.makePath('storage', 'whatsapp_auth', String(userId))
}

class WhatsAppClientManager {
  getSession(userId: number): WhatsAppSession {
    if (!sessions.has(userId)) {
      sessions.set(userId, createSession())
    }
    return sessions.get(userId)!
  }

  async initialize(userId: number): Promise<WhatsAppSession> {
    const session = this.getSession(userId)

    if (session.client && session.status === 'ready') {
      return session
    }

    if (session.status === 'initializing') {
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

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: String(userId),
        dataPath: authPath(userId),
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    })

    session.client = client

    client.on('qr', (qr) => {
      session.qr = qr
      session.status = 'qr'
    })

    client.on('authenticated', () => {
      session.status = 'authenticated'
      session.qr = null
    })

    client.on('ready', () => {
      session.status = 'ready'
      session.qr = null
    })

    client.on('auth_failure', (message) => {
      session.status = 'auth_failure'
      session.lastError = message
    })

    client.on('disconnected', (reason) => {
      session.status = 'disconnected'
      session.lastError = String(reason)
      session.client = null
    })

    void client.initialize().catch((error: Error) => {
      session.status = 'disconnected'
      session.lastError = error.message
      session.client = null
    })

    return session
  }

  async getReadyClient(userId: number): Promise<Client> {
    const session = this.getSession(userId)
    if (!session.client || session.status !== 'ready') {
      throw new Error('WhatsApp is not connected. Initialize the session and scan the QR code.')
    }
    return session.client
  }

  async getState(userId: number): Promise<WAState | null> {
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
    if (session.client) {
      await session.client.destroy().catch(() => undefined)
    }
    sessions.set(userId, createSession())
  }

  async logout(userId: number) {
    const session = this.getSession(userId)
    if (session.client) {
      await session.client.logout().catch(() => undefined)
      await session.client.destroy().catch(() => undefined)
    }
    sessions.set(userId, createSession())
  }

  async requestPairingCode(userId: number, phoneNumber: string, showNotification = true) {
    const session = await this.initialize(userId)
    const client = session.client
    if (!client) {
      throw new Error('Failed to start WhatsApp client for pairing.')
    }

    const code = await client.requestPairingCode(phoneNumber, showNotification)
    session.pairingCode = code
    return code
  }
}

const whatsAppClientManager = new WhatsAppClientManager()
export default whatsAppClientManager
