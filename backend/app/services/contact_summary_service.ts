import logger from '@adonisjs/core/services/logger'
import type { Message } from 'whatsapp-web.js'
import ContactSummary from '#models/contact_summary'
import AiReplyProvider from '#services/ai_reply_provider'
import type { SpliterMessage } from '#services/ai_reply_shared'
import whatsAppClientManager from '../../modules/whatsapp/services/whatsapp_client_manager.js'
import { messageBodyFromWweb } from '../../modules/whatsapp/helpers/conversation_history.js'
import { resolveChatDisplayName, serializeReactions } from '../../modules/whatsapp/helpers/serialization.js'

export type { SpliterMessage } from '#services/ai_reply_shared'

export type ContactSummaryPayload = {
  chatId: string
  summaryText: string | null
  messageCount: number
  latestMessageAt: number | null
  updatedAt: string | null
  refreshing?: boolean
  skipped?: boolean
  reason?: string
}

const SPLITER_LIMIT = 50
const refreshInFlight = new Set<string>()

export type RefreshContactSummaryOptions = {
  force?: boolean
  spliter?: SpliterMessage[]
  contactLabel?: string
  isGroup?: boolean
}

function normalizeSpliter(input: unknown): SpliterMessage[] | null {
  if (!Array.isArray(input)) return null

  const rows: SpliterMessage[] = []
  for (const item of input.slice(-SPLITER_LIMIT)) {
    if (!item || typeof item !== 'object') continue
    const row = item as SpliterMessage
    const message = String(row.message ?? '').trim()
    if (!message) continue

    rows.push({
      message,
      sender: row.sender === 'business' ? 'business' : 'customer',
      sentAt: String(row.sentAt ?? new Date().toISOString()),
      reaction: row.reaction ? String(row.reaction) : null,
    })
  }

  return rows.length ? rows : null
}

function latestFromSpliter(spliter: SpliterMessage[]): number | null {
  const last = spliter[spliter.length - 1]
  if (!last?.sentAt) return null
  const ms = Date.parse(last.sentAt)
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null
}

function lockKey(userId: number, chatId: string) {
  return `${userId}:${chatId}`
}

async function reactionText(message: Message): Promise<string | null> {
  try {
    const lists = await message.getReactions()
    const emojis = serializeReactions(lists)
      .map((entry) => entry.emoji)
      .filter(Boolean)
    return emojis.length ? emojis.join(' ') : null
  } catch {
    return null
  }
}

export async function mapMessagesToSpliter(messages: Message[]): Promise<SpliterMessage[]> {
  const chronological = [...messages].reverse()
  const rows: SpliterMessage[] = []

  for (const item of chronological) {
    const message = messageBodyFromWweb(item)
    if (!message) continue

    rows.push({
      message,
      sender: item.fromMe ? 'business' : 'customer',
      sentAt: new Date(item.timestamp * 1000).toISOString(),
      reaction: await reactionText(item),
    })
  }

  return rows.slice(-SPLITER_LIMIT)
}

function latestTimestamp(messages: Message[]) {
  if (!messages.length) return null
  return Math.max(...messages.map((item) => item.timestamp))
}

function serializeRow(row: ContactSummary | null, chatId: string): ContactSummaryPayload {
  if (!row) {
    return {
      chatId,
      summaryText: null,
      messageCount: 0,
      latestMessageAt: null,
      updatedAt: null,
    }
  }

  return {
    chatId: row.chatId,
    summaryText: row.summaryText,
    messageCount: row.messageCount,
    latestMessageAt: row.latestMessageAt,
    updatedAt: row.updatedAt?.toISO() ?? null,
  }
}

function serializeRowEntity(row: ContactSummary): ContactSummaryPayload {
  return {
    chatId: row.chatId,
    summaryText: row.summaryText,
    messageCount: row.messageCount,
    latestMessageAt: row.latestMessageAt,
    updatedAt: row.updatedAt?.toISO() ?? null,
  }
}

export default class ContactSummaryService {
  static async listForUser(userId: number): Promise<ContactSummaryPayload[]> {
    const rows = await ContactSummary.query()
      .where('user_id', userId)
      .orderBy('updated_at', 'desc')

    return rows.map(serializeRowEntity)
  }

  static async getForChat(userId: number, chatId: string): Promise<ContactSummaryPayload> {
    const normalizedId = decodeURIComponent(chatId)
    const row = await ContactSummary.query()
      .where('user_id', userId)
      .where('chat_id', normalizedId)
      .first()

    return serializeRow(row, normalizedId)
  }

  static async getSummaryText(userId: number, chatId: string): Promise<string | null> {
    const normalizedId = decodeURIComponent(chatId)
    const row = await ContactSummary.query()
      .where('user_id', userId)
      .where('chat_id', normalizedId)
      .first()

    return row?.summaryText?.trim() || null
  }

  private static async saveSummary(
    userId: number,
    normalizedId: string,
    summaryText: string,
    messageCount: number,
    latestMessageAt: number | null
  ) {
    const existing = await ContactSummary.query()
      .where('user_id', userId)
      .where('chat_id', normalizedId)
      .first()

    if (existing) {
      existing.summaryText = summaryText
      existing.messageCount = messageCount
      existing.latestMessageAt = latestMessageAt
      await existing.save()
      return existing
    }

    return ContactSummary.create({
      userId,
      chatId: normalizedId,
      summaryText,
      messageCount,
      latestMessageAt,
    })
  }

  private static async generateAndSave(
    userId: number,
    normalizedId: string,
    input: {
      spliter: SpliterMessage[]
      latestMessageAt: number | null
      contactLabel: string
    }
  ) {
    const { spliter, latestMessageAt, contactLabel } = input
    const messageCount = spliter.length

    const summaryText = await AiReplyProvider.generateContactSummary({
      contactLabel,
      spliter,
    })

    if (!summaryText) {
      logger.warn({ userId, chatId: normalizedId }, 'Contact summary generation returned empty')
      return null
    }

    await this.saveSummary(userId, normalizedId, summaryText, messageCount, latestMessageAt)
    return summaryText
  }

  private static queueBackgroundRefresh(
    userId: number,
    normalizedId: string,
    input: {
      spliter: SpliterMessage[]
      latestMessageAt: number | null
      contactLabel: string
    }
  ) {
    const key = lockKey(userId, normalizedId)
    if (refreshInFlight.has(key)) return

    refreshInFlight.add(key)
    void this.generateAndSave(userId, normalizedId, input)
      .catch((error) => {
        logger.error({ err: error, userId, chatId: normalizedId }, 'Background contact summary failed')
      })
      .finally(() => {
        refreshInFlight.delete(key)
      })
  }

  static async refreshForChat(
    userId: number,
    chatId: string,
    options?: RefreshContactSummaryOptions
  ): Promise<ContactSummaryPayload> {
    const normalizedId = decodeURIComponent(chatId)
    const key = lockKey(userId, normalizedId)

    if (refreshInFlight.has(key)) {
      const existing = await this.getForChat(userId, normalizedId)
      return { ...existing, refreshing: true }
    }

    try {
      if (!AiReplyProvider.isConfigured()) {
        return {
          ...(await this.getForChat(userId, normalizedId)),
          skipped: true,
          reason: 'ai_not_configured',
        }
      }

      const clientSpliter = options?.spliter ? normalizeSpliter(options.spliter) : null

      if (options?.isGroup) {
        return {
          ...(await this.getForChat(userId, normalizedId)),
          skipped: true,
          reason: 'group_chat',
        }
      }

      let spliter: SpliterMessage[]
      let latestMessageAt: number | null
      let contactLabel: string

      if (clientSpliter) {
        spliter = clientSpliter
        latestMessageAt = latestFromSpliter(spliter)
        contactLabel = options?.contactLabel?.trim() || normalizedId
      } else {
        refreshInFlight.add(key)
        try {
          const client = await whatsAppClientManager.getReadyClient(userId)
          const chat = await client.getChatById(normalizedId)
          if (!chat) {
            throw new Error(`Chat not found: ${normalizedId}`)
          }

          if (chat.isGroup) {
            return {
              ...(await this.getForChat(userId, normalizedId)),
              skipped: true,
              reason: 'group_chat',
            }
          }

          const rawMessages = await chat.fetchMessages({ limit: SPLITER_LIMIT })
          spliter = await mapMessagesToSpliter(rawMessages)
          latestMessageAt = latestTimestamp(rawMessages)
          contactLabel = await resolveChatDisplayName(chat, normalizedId).catch(() => normalizedId)
        } finally {
          refreshInFlight.delete(key)
        }
      }

      if (spliter.length === 0) {
        return {
          ...(await this.getForChat(userId, normalizedId)),
          skipped: true,
          reason: 'no_messages',
        }
      }

      const messageCount = spliter.length
      const existing = await ContactSummary.query()
        .where('user_id', userId)
        .where('chat_id', normalizedId)
        .first()

      if (
        !options?.force &&
        existing &&
        existing.messageCount === messageCount &&
        existing.latestMessageAt === latestMessageAt
      ) {
        return serializeRow(existing, normalizedId)
      }

      // Client sent messages — run AI in the background so the HTTP request returns fast.
      if (clientSpliter) {
        this.queueBackgroundRefresh(userId, normalizedId, {
          spliter,
          latestMessageAt,
          contactLabel,
        })
        return {
          ...(await this.getForChat(userId, normalizedId)),
          refreshing: true,
        }
      }

      refreshInFlight.add(key)
      try {
        const summaryText = await this.generateAndSave(userId, normalizedId, {
          spliter,
          latestMessageAt,
          contactLabel,
        })

        if (!summaryText) {
          return {
            ...(await this.getForChat(userId, normalizedId)),
            skipped: true,
            reason: 'generation_failed',
          }
        }

        return this.getForChat(userId, normalizedId)
      } finally {
        refreshInFlight.delete(key)
      }
    } catch (error) {
      logger.error({ err: error, userId, chatId: normalizedId }, 'Contact summary refresh failed')
      throw error
    }
  }
}
