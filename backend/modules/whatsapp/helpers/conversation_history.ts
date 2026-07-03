import type { Chat } from 'whatsapp-web.js'
import type { ConversationTurn } from '#services/ai_reply_shared'
import { serializeId } from './serialization.js'

export function messageBodyFromWweb(message: {
  body?: string
  type?: string
  hasMedia?: boolean
}) {
  if (message.body?.trim()) return message.body.trim()
  if (message.hasMedia) return `[${message.type || 'media'} message]`
  return ''
}

export async function buildConversationHistory(
  chat: Chat,
  options?: { limit?: number; excludeMessageId?: string }
): Promise<ConversationTurn[]> {
  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100)
  const recent = await chat.fetchMessages({ limit })
  const chronological = [...recent].reverse()

  const turns: ConversationTurn[] = []
  for (const item of chronological) {
    if (options?.excludeMessageId && serializeId(item.id) === options.excludeMessageId) {
      continue
    }
    const content = messageBodyFromWweb(item)
    if (!content) continue
    turns.push({
      role: item.fromMe ? 'assistant' : 'user',
      content,
    })
  }

  return turns.slice(-limit)
}
