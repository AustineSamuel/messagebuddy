import logger from '@adonisjs/core/services/logger'
import type { Client, Message } from 'whatsapp-web.js'
import type { Reaction } from 'whatsapp-web.js'
import {
  serializeId,
  serializeMessageForApi,
  serializeReactions,
} from '../helpers/serialization.js'
import WhatsAppRealtimeHub, {
  type RealtimeMessagePayload,
  type RealtimeReactionPayload,
} from './whatsapp_realtime_hub.js'

export default class WhatsAppRealtimeService {
  static attachListener(userId: number, client: Client) {
    const tagged = client as Client & { __realtimeListener?: boolean }
    if (tagged.__realtimeListener) return
    tagged.__realtimeListener = true

    client.on('message_create', (message) => {
      void this.publishMessage(userId, message)
    })

    client.on('message_reaction', (reaction) => {
      void this.publishReaction(userId, client, reaction)
    })

    logger.info({ userId }, 'WhatsApp realtime listener attached')
  }

  private static async publishMessage(userId: number, message: Message) {
    if (message.isStatus) return
    if (message.from.includes('@broadcast')) return

    try {
      const chat = await message.getChat()
      const chatId = serializeId(chat.id)
      const serialized = await serializeMessageForApi(message)

      const payload: RealtimeMessagePayload = {
        type: 'message:new',
        chatId,
        message: serialized,
        chat: {
          id: chatId,
          name: chat.name ?? null,
          isGroup: chat.isGroup,
          unreadCount: chat.unreadCount,
          timestamp: chat.timestamp,
          lastMessage: {
            id: serialized.id,
            body: serialized.body,
            type: serialized.type,
            timestamp: serialized.timestamp,
            fromMe: serialized.fromMe,
            hasMedia: serialized.hasMedia,
          },
        },
      }

      WhatsAppRealtimeHub.broadcast(userId, payload)
    } catch (error) {
      logger.warn({ err: error, userId }, 'Failed to publish WhatsApp realtime message')
    }
  }

  private static async publishReaction(userId: number, client: Client, reaction: Reaction) {
    try {
      const messageId = serializeId(reaction.msgId)
      const message = await client.getMessageById(messageId)
      if (!message) return

      const chat = await message.getChat()
      const chatId = serializeId(chat.id)
      const reactionLists = await message.getReactions()

      const payload: RealtimeReactionPayload = {
        type: 'message:reaction',
        chatId,
        messageId,
        reactions: serializeReactions(reactionLists),
      }

      WhatsAppRealtimeHub.broadcast(userId, payload)
    } catch (error) {
      logger.warn({ err: error, userId }, 'Failed to publish WhatsApp reaction update')
    }
  }
}
