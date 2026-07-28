import User from '#models/user'
import { Secret } from '@adonisjs/core/helpers'
import logger from '@adonisjs/core/services/logger'
import type { Server as HttpServer } from 'node:http'
import type { Server as HttpsServer } from 'node:https'
import type { IncomingMessage } from 'node:http'
import { WebSocketServer, type WebSocket } from 'ws'

export type RealtimeChatSummary = {
  id: string
  name: string | null
  isGroup: boolean
  unreadCount: number
  timestamp: number
  lastMessage: {
    id: string
    body: string
    type: string
    timestamp: number
    fromMe: boolean
    hasMedia: boolean
  } | null
}

export type RealtimeMessagePayload = {
  type: 'message:new'
  chatId: string
  message: RealtimeChatSummary['lastMessage'] & {
    from: string
    to: string
    author: string | null
    hasQuotedMsg: boolean
    quotedMessage?: {
      id: string
      body: string
      type: string
      fromMe: boolean
      hasMedia: boolean
    } | null
    ack: number
  }
  chat: RealtimeChatSummary
}

export type RealtimeReactionPayload = {
  type: 'message:reaction'
  chatId: string
  messageId: string
  reactions: Array<{
    emoji: string
    count: number
    fromMe: boolean
  }>
}

export type RealtimeSessionPayload = {
  type: 'session:update'
  session: {
    status: string
    qr: string | null
    pairingCode: string | null
    lastError: string | null
    loadingPercent: number | null
  }
}

export type RealtimePayload =
  | RealtimeMessagePayload
  | RealtimeReactionPayload
  | RealtimeSessionPayload

const WS_PATH = '/ws'

const clientsByUser = new Map<number, Set<WebSocket>>()
let wss: WebSocketServer | null = null
let attached = false

async function verifyAccessToken(token: string | null | undefined): Promise<number | null> {
  if (!token?.trim()) return null

  try {
    const accessToken = await User.accessTokens.verify(new Secret(token.trim()))
    if (!accessToken || accessToken.isExpired()) return null
    return Number(accessToken.tokenableId)
  } catch {
    return null
  }
}

function sendJson(ws: WebSocket, payload: unknown) {
  if (ws.readyState !== ws.OPEN) return
  ws.send(JSON.stringify(payload))
}

function removeClient(userId: number, ws: WebSocket) {
  const set = clientsByUser.get(userId)
  if (!set) return
  set.delete(ws)
  if (set.size === 0) clientsByUser.delete(userId)
}

export default class WhatsAppRealtimeHub {
  static attach(nodeServer: HttpServer | HttpsServer) {
    if (attached) return
    attached = true

    wss = new WebSocketServer({ noServer: true })

    nodeServer.on('upgrade', (request, socket, head) => {
      const host = request.headers.host ?? 'localhost'
      const url = new URL(request.url ?? '/', `http://${host}`)

      if (url.pathname !== WS_PATH) return

      void (async () => {
        const userId = await verifyAccessToken(url.searchParams.get('token'))
        if (!userId) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
          socket.destroy()
          return
        }

        wss!.handleUpgrade(request, socket, head, (ws) => {
          wss!.emit('connection', ws, request, userId)
        })
      })().catch((error) => {
        logger.error({ err: error }, 'WebSocket upgrade failed')
        socket.destroy()
      })
    })

    wss.on('connection', (ws: WebSocket, _request: IncomingMessage, userId: number) => {
      let set = clientsByUser.get(userId)
      if (!set) {
        set = new Set()
        clientsByUser.set(userId, set)
      }
      set.add(ws)

      sendJson(ws, { type: 'connected' })

      ws.on('close', () => removeClient(userId, ws))
      ws.on('error', () => removeClient(userId, ws))
    })

    logger.info('WhatsApp realtime WebSocket listening on %s', WS_PATH)
  }

  static broadcast(userId: number, payload: RealtimePayload) {
    const set = clientsByUser.get(userId)
    if (!set?.size) return

    const body = JSON.stringify(payload)
    for (const ws of set) {
      if (ws.readyState === ws.OPEN) ws.send(body)
    }
  }

  static close() {
    for (const set of clientsByUser.values()) {
      for (const ws of set) ws.close()
    }
    clientsByUser.clear()
    wss?.close()
    wss = null
    attached = false
  }
}
