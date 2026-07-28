import type { Chat, Client } from 'whatsapp-web.js'
import logger from '@adonisjs/core/services/logger'
import { MessageMedia } from '../lib/wwebjs.js'
import type WAWebJS from 'whatsapp-web.js'
import whatsAppClientManager from './whatsapp_client_manager.js'
import CreditsService, { InsufficientCreditsError } from '#services/credits_service'
import ChatRulesService from '../../chat_rules/services/chat_rules_service.js'
import AudioTranscriptionService from '#services/audio_transcription_service'
import { isAudioMessageType } from '../helpers/serialization.js'
import ProductReplyEnricher from '#services/product_reply_enricher'
import AiBusinessContextService from '#services/ai_business_context'
import AiReplyProvider from '#services/ai_reply_provider'
import ContactSummaryService, {
  type RefreshContactSummaryOptions,
} from '#services/contact_summary_service'
import { buildConversationHistory } from '../helpers/conversation_history.js'
import {
  serializeChatForApi,
  serializeContact,
  serializeGroupChat,
  serializeId,
  serializeMessage,
  serializeMessageForApi,
  serializeReactions,
  resolveChatDisplayName,
} from '../helpers/serialization.js'
import { WhatsAppUnavailableError } from '../helpers/errors.js'

export default class WhatsAppService {
  // ── Session ──────────────────────────────────────────────────────────────

  static initialize(userId: number) {
    return whatsAppClientManager.initialize(userId)
  }

  static getSession(userId: number) {
    whatsAppClientManager.restoreIfPersisted(userId)
    whatsAppClientManager.recoverStaleSession(userId)
    const session = whatsAppClientManager.getSession(userId)
    return {
      status: session.status,
      qr: session.qr,
      pairingCode: session.pairingCode,
      lastError: session.lastError,
      loadingPercent: session.loadingPercent,
    }
  }

  static async getState(userId: number) {
    return whatsAppClientManager.getState(userId)
  }

  static destroy(userId: number) {
    return whatsAppClientManager.destroy(userId)
  }

  static logout(userId: number) {
    return whatsAppClientManager.logout(userId)
  }

  static requestPairingCode(userId: number, phoneNumber: string, showNotification?: boolean) {
    return whatsAppClientManager.requestPairingCode(userId, phoneNumber, showNotification)
  }

  static async getClientInfo(userId: number) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const info = client.info
    return {
      pushname: info.pushname,
      wid: serializeId(info.wid),
      platform: info.platform,
      phone: info.phone,
      me: info.me ? serializeId(info.me) : null,
    }
  }

  static async getWWebVersion(userId: number) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.getWWebVersion()
  }

  // ── Chats ────────────────────────────────────────────────────────────────

  static async getChats(userId: number) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const chats = await this.getChatsWithRetry(client)
    const directChatIds = chats.filter((chat) => !chat.isGroup).map((chat) => serializeId(chat.id))
    const phoneByChatId = await this.resolvePhoneIds(client, directChatIds)

    const serialized = await this.mapWithConcurrency(chats, 24, async (chat) => {
      try {
        const chatId = serializeId(chat.id)
        const [contact, profilePicUrl] = await Promise.all([
          chat.isGroup
            ? Promise.resolve(null)
            : this.bestEffort(
                typeof chat.getContact === 'function'
                  ? chat.getContact()
                  : client.getContactById(chatId),
                2_500
              ),
          this.bestEffort(client.getProfilePicUrl(chatId), 2_500),
        ])

        if (chat.isGroup) return serializeGroupChat(chat, { profilePicUrl })

        const phone =
          phoneByChatId.get(chatId) ??
          (contact && contact.id.server !== 'lid' ? contact.number?.trim() : null) ??
          (chatId.endsWith('@c.us') ? chatId.split('@')[0] : null)

        return serializeChatForApi(chat, { contact, phone, profilePicUrl })
      } catch {
        return null
      }
    })

    return serialized.filter((chat) => chat !== null)
  }

  private static async getChatsWithRetry(client: Client): Promise<Chat[]> {
    try {
      return await client.getChats()
    } catch (officialError) {
      /*
       * wwebjs serializes every cached chat with Promise.all(). A single stale chat
       * (commonly while group metadata is updating) rejects the entire collection.
       * Run the same serializers independently so one bad model cannot hide all chats.
       */
      try {
        const page = client.pupPage
        if (!page) throw officialError

        const recovered = await page.evaluate(async () => {
          const web = globalThis as unknown as {
            WWebJS: {
              getChats(): Promise<unknown[]>
              getChatModel(chat: unknown): Promise<unknown>
            }
            require(name: string): {
              Chat: { getModelsArray(): unknown[] }
            }
          }

          const chats = web.require('WAWebCollections').Chat.getModelsArray()
          const results = await Promise.allSettled(
            chats.map((chat) => web.WWebJS.getChatModel(chat))
          )

          return results.flatMap((result) =>
            result.status === 'fulfilled' && result.value ? [result.value] : []
          )
        })

        if (recovered.length > 0) {
          logger.debug(
            { recovered: recovered.length },
            'Recovered WhatsApp chats after bulk serialization failed'
          )
          return recovered as Chat[]
        }
      } catch {
        // Continue to the contacts-based fallback below.
      }

      try {
        const contacts = await client.getContacts()
        const chatContacts = contacts.filter((contact) => {
          const id = serializeId(contact.id)
          return (
            !contact.isMe &&
            (contact.isUser || contact.isGroup) &&
            !id.includes('@broadcast') &&
            !id.includes('status@')
          )
        })
        const resolved = await this.mapWithConcurrency(chatContacts, 24, (contact) =>
          this.bestEffort(contact.getChat(), 3_000)
        )
        const chatsById = new Map<string, Chat>()
        for (const chat of resolved) {
          if (chat) chatsById.set(serializeId(chat.id), chat)
        }
        if (chatsById.size === 0 && chatContacts.length > 0) throw officialError
        logger.debug(
          { recovered: chatsById.size },
          'Rebuilt WhatsApp chats from contacts after serialization failed'
        )
        return [...chatsById.values()]
      } catch (fallbackError) {
        logger.warn(
          { err: officialError, fallbackErr: fallbackError },
          'Unable to recover WhatsApp chats after wwebjs bulk serialization failed'
        )
        throw new WhatsAppUnavailableError(
          'We could not load your WhatsApp chats right now. Please wait a moment and try again.',
          { cause: fallbackError ?? officialError }
        )
      }
    }
  }

  private static async getListWithRetry<T>(
    operation: () => Promise<T[]>,
    publicMessage: string
  ): Promise<T[]> {
    let lastError: unknown
    for (const delayMs of [0, 500, 1_000]) {
      if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs))
      try {
        return await operation()
      } catch (error) {
        lastError = error
      }
    }
    throw new WhatsAppUnavailableError(publicMessage, { cause: lastError })
  }

  private static async resolvePhoneIds(client: Client, chatIds: string[]) {
    const phoneByChatId = new Map<string, string>()
    if (chatIds.length === 0) return phoneByChatId

    const resolved = await client.getContactLidAndPhone(chatIds).catch(() => [])
    for (const item of resolved) {
      if (!item.lid || !item.pn) continue
      const phone = item.pn.split('@')[0]?.trim()
      if (phone) {
        phoneByChatId.set(item.lid, phone)
        phoneByChatId.set(item.pn, phone)
      }
    }
    return phoneByChatId
  }

  private static async bestEffort<T>(operation: Promise<T>, timeoutMs: number): Promise<T | null> {
    let timeout: ReturnType<typeof setTimeout> | undefined
    try {
      return await Promise.race([
        operation,
        new Promise<null>((resolve) => {
          timeout = setTimeout(() => resolve(null), timeoutMs)
        }),
      ])
    } catch {
      return null
    } finally {
      if (timeout) clearTimeout(timeout)
    }
  }

  private static async mapWithConcurrency<T, R>(
    values: T[],
    concurrency: number,
    mapper: (value: T) => Promise<R>
  ): Promise<R[]> {
    const results = new Array<R>(values.length)
    let nextIndex = 0

    async function worker() {
      while (nextIndex < values.length) {
        const index = nextIndex++
        results[index] = await mapper(values[index]!)
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, values.length) }, () => worker())
    )
    return results
  }

  static async getChatById(userId: number, chatId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const chat = await client.getChatById(chatId)
    return chat.isGroup ? serializeGroupChat(chat) : serializeChatForApi(chat)
  }

  static async archiveChat(userId: number, chatId: string) {
    const chat = await this.getChatEntity(userId, chatId)
    await chat.archive()
    return { archived: true }
  }

  static async unarchiveChat(userId: number, chatId: string) {
    const chat = await this.getChatEntity(userId, chatId)
    await chat.unarchive()
    return { archived: false }
  }

  static async muteChat(userId: number, chatId: string, unmuteDate?: number) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    if (unmuteDate) {
      await client.muteChat(chatId, new Date(unmuteDate))
    } else {
      const chat = await client.getChatById(chatId)
      await chat.mute()
    }
    return { muted: true }
  }

  static async unmuteChat(userId: number, chatId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.unmuteChat(chatId)
    return { muted: false }
  }

  static async pinChat(userId: number, chatId: string) {
    const chat = await this.getChatEntity(userId, chatId)
    await chat.pin()
    return { pinned: true }
  }

  static async unpinChat(userId: number, chatId: string) {
    const chat = await this.getChatEntity(userId, chatId)
    await chat.unpin()
    return { pinned: false }
  }

  static async markChatUnread(userId: number, chatId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.markChatUnread(chatId)
    return { unread: true }
  }

  static async clearChatMessages(userId: number, chatId: string) {
    const chat = await this.getChatEntity(userId, chatId)
    await chat.clearMessages()
    return { cleared: true }
  }

  static async deleteChat(userId: number, chatId: string) {
    const chat = await this.getChatEntity(userId, chatId)
    await chat.delete()
    return { deleted: true }
  }

  static async fetchChatMessages(
    userId: number,
    chatId: string,
    options?: { limit?: number; fromMe?: boolean }
  ) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const normalizedId = decodeURIComponent(chatId)
    const requestedLimit = Math.min(Math.max(options?.limit ?? 30, 1), 100)
    const searchOptions: { limit: number; fromMe?: boolean } = { limit: requestedLimit }
    if (options?.fromMe !== undefined) {
      searchOptions.fromMe = options.fromMe
    }

    let chat: Chat | undefined
    try {
      chat = await client.getChatById(normalizedId)
    } catch (error) {
      logger.debug(
        { err: error, chatId: normalizedId },
        'Chat model serialization failed; fetching messages directly'
      )
      return this.fetchChatMessagesDirect(client, normalizedId, searchOptions)
    }

    if (!chat) {
      return this.fetchChatMessagesDirect(client, normalizedId, searchOptions)
    }

    try {
      const messages = await chat.fetchMessages(searchOptions)
      return Promise.all(messages.map((message) => serializeMessageForApi(message)))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const isTimeout =
        message.includes('timed out') ||
        message.includes('protocolTimeout') ||
        message.includes('Timeout')

      // Retry with fewer messages — pagination via loadEarlierMsgs is slow on large chats.
      if (isTimeout && requestedLimit > 15) {
        const fallback = await chat.fetchMessages({
          ...searchOptions,
          limit: 15,
        })
        return Promise.all(fallback.map((message) => serializeMessageForApi(message)))
      }

      throw error
    }
  }

  /**
   * Fetch message IDs from the raw chat collection, then use wwebjs's public
   * getMessageById API to construct Message instances. This avoids getChatModel,
   * whose unrelated group metadata refresh can reject otherwise valid chats.
   */
  private static async fetchChatMessagesDirect(
    client: Client,
    chatId: string,
    searchOptions: { limit: number; fromMe?: boolean }
  ) {
    const page = client.pupPage
    if (!page) throw new Error('WhatsApp Web page is not available.')

    const messageIds = await page.evaluate(
      async (targetChatId, options) => {
        type RawMessage = {
          id?: { fromMe?: boolean; _serialized?: string | null } | null
          isNotification?: boolean
          t: number
          type?: string
        }
        type RawChat = {
          msgs: { getModelsArray(): RawMessage[] }
        }
        const web = globalThis as unknown as {
          WWebJS: {
            getChat(id: string, options: { getAsModel: false }): Promise<RawChat | null>
          }
          require(name: string): {
            loadEarlierMsgs(args: { chat: RawChat }): Promise<RawMessage[] | null>
          }
        }

        const chat = await web.WWebJS.getChat(targetChatId, { getAsModel: false })
        if (!chat) return []

        const serializedId = (message: RawMessage) => {
          const id = message.id?._serialized
          if (typeof id !== 'string' || !id.trim()) return null
          const parts = id.split('_')
          return parts.length === 3 || parts.length === 4 ? id : null
        }

        const matches = (message: RawMessage) => {
          if (message.isNotification || !serializedId(message)) return false
          if (message.type === 'e2e_notification' || message.type === 'protocol') return false
          return options.fromMe === undefined || message.id?.fromMe === options.fromMe
        }

        let messages = chat.msgs.getModelsArray().filter(matches)
        while (messages.length < options.limit) {
          const earlier = await web.require('WAWebChatLoadMessages').loadEarlierMsgs({ chat })
          if (!earlier?.length) break
          messages = [...earlier.filter(matches), ...messages]
        }

        messages.sort((left, right) => left.t - right.t)
        return [
          ...new Set(
            messages
              .slice(-options.limit)
              .map(serializedId)
              .filter((id): id is string => Boolean(id))
          ),
        ]
      },
      chatId,
      searchOptions
    )

    const messages = await this.mapWithConcurrency(messageIds, 12, async (messageId) => {
      try {
        return await client.getMessageById(messageId)
      } catch (error) {
        logger.debug(
          { err: error, messageId, chatId },
          'Skipping malformed WhatsApp message cache entry'
        )
        return null
      }
    })
    const availableMessages = messages.flatMap((message) => (message ? [message] : []))
    return Promise.all(availableMessages.map((message) => serializeMessageForApi(message)))
  }

  static async getPinnedMessages(userId: number, chatId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const messages = await client.getPinnedMessages(chatId)
    return messages.map(serializeMessage)
  }

  static async suggestAiReply(userId: number, chatId: string, limit = 50) {
    if (!AiReplyProvider.isConfigured()) {
      throw new Error('AI is not configured. Set OPENAI_API_KEY or NVIDIA_API_KEY on the server.')
    }

    const client = await whatsAppClientManager.getReadyClient(userId)
    const normalizedId = decodeURIComponent(chatId)
    const chat = await client.getChatById(normalizedId)
    if (!chat) {
      throw new Error(`Chat not found: ${normalizedId}`)
    }

    const { settings: rules, default: defaultRules } = await ChatRulesService.getForChat(
      userId,
      normalizedId
    )
    if (rules.rule === 'never') {
      throw new Error('AI replies are disabled for this chat.')
    }

    const historyLimit = Math.min(Math.max(limit, 1), 100)
    const history = await buildConversationHistory(chat, { limit: historyLimit })
    const contactLabel = await resolveChatDisplayName(chat, normalizedId).catch(() => normalizedId)

    const business = await AiBusinessContextService.forUser(userId)

    const lastCustomerMessage =
      [...history].reverse().find((turn) => turn.role === 'user')?.content ?? ''
    const matchedProducts = await ProductReplyEnricher.findRelevantProducts(
      userId,
      lastCustomerMessage
    )
    const contactSummary = await ContactSummaryService.getSummaryText(userId, normalizedId)

    const suggestion = await AiReplyProvider.generateDraftReply({
      history,
      customInstructions: rules.customInstructions,
      notes: rules.notes,
      defaultCustomInstructions: defaultRules.customInstructions,
      defaultNotes: defaultRules.notes,
      contactLabel,
      contactSummary,
      business,
      incomingMessage: lastCustomerMessage,
      matchedProducts,
    })

    if (!suggestion) {
      throw new Error('Could not generate a reply suggestion. Try again.')
    }

    return {
      suggestion: ProductReplyEnricher.enrich(suggestion, matchedProducts),
      messageCount: history.length,
      matchedProducts: matchedProducts.map((p) => ({ name: p.name, checkoutUrl: p.checkoutUrl })),
    }
  }

  static async sendChatMessage(
    userId: number,
    chatId: string,
    content: string | Record<string, unknown>,
    options?: Record<string, unknown>
  ) {
    const normalizedId = decodeURIComponent(chatId)
    const textPreview = typeof content === 'string' ? content : String((content as { body?: string }).body ?? '')

    if (!(await CreditsService.hasSufficientCredits(userId))) {
      const account = await CreditsService.getAccount(userId)
      throw new InsufficientCreditsError(account.balance)
    }

    const chat = await this.getChatEntity(userId, normalizedId)
    const payload = typeof content === 'string' ? content : this.buildMessageContent(content)
    const message = await chat.sendMessage(payload as string, options)

    const contactLabel = await resolveChatDisplayName(chat, normalizedId).catch(() => normalizedId)
    await CreditsService.chargeMessageSent(userId, {
      chatId: normalizedId,
      source: 'manual',
      preview: textPreview,
      chatLabel: contactLabel,
    })

    return serializeMessage(message)
  }

  static async sendSeen(userId: number, chatId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.sendSeen(chatId)
    return { seen: true }
  }

  static async sendTyping(userId: number, chatId: string) {
    const chat = await this.getChatEntity(userId, chatId)
    await chat.sendStateTyping()
    return { typing: true }
  }

  static async sendRecording(userId: number, chatId: string) {
    const chat = await this.getChatEntity(userId, chatId)
    await chat.sendStateRecording()
    return { recording: true }
  }

  static async syncHistory(userId: number, chatId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.syncHistory(chatId)
    return { synced: true }
  }

  static async getChatLabels(userId: number, chatId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const labels = await client.getChatLabels(chatId)
    return labels.map((l) => ({ id: l.id, name: l.name, hexColor: l.hexColor }))
  }

  static async setChatLabels(userId: number, chatId: string, labelIds: string[]) {
    const chat = await this.getChatEntity(userId, chatId)
    await chat.changeLabels(labelIds)
    return { labelIds }
  }

  static async getCustomerNote(userId: number, userOrChatId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.getCustomerNote(userOrChatId)
  }

  static async setCustomerNote(userId: number, userOrChatId: string, note: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.addOrEditCustomerNote(userOrChatId, note)
    return { note }
  }

  static listContactSummaries(userId: number) {
    return ContactSummaryService.listForUser(userId)
  }

  static getContactSummary(userId: number, chatId: string) {
    return ContactSummaryService.getForChat(userId, chatId)
  }

  static refreshContactSummary(
    userId: number,
    chatId: string,
    options?: RefreshContactSummaryOptions
  ) {
    return ContactSummaryService.refreshForChat(userId, chatId, options)
  }

  // ── Messages ─────────────────────────────────────────────────────────────

  static async searchMessages(userId: number, query: string, options?: { page?: number; limit?: number; chatId?: string }) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const messages = await client.searchMessages(query, options)
    return messages.map(serializeMessage)
  }

  static async getMessageById(userId: number, messageId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const message = await client.getMessageById(messageId)
    return serializeMessage(message)
  }

  static async sendMessage(
    userId: number,
    chatId: string,
    content: string | Record<string, unknown>,
    options?: Record<string, unknown>
  ) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const payload = typeof content === 'string' ? content : this.buildMessageContent(content)
    const message = await client.sendMessage(chatId, payload as string, options)
    return serializeMessage(message)
  }

  static async reactToMessage(userId: number, messageId: string, reaction: string) {
    const message = await this.getMessageEntity(userId, messageId)
    await message.react(reaction)
    const reactionLists = await message.getReactions()
    return {
      messageId: serializeId(message.id),
      reaction,
      reactions: serializeReactions(reactionLists),
    }
  }

  static async replyToMessage(
    userId: number,
    messageId: string,
    content: string | Record<string, unknown>,
    options?: Record<string, unknown>
  ) {
    if (!(await CreditsService.hasSufficientCredits(userId))) {
      const account = await CreditsService.getAccount(userId)
      throw new InsufficientCreditsError(account.balance)
    }

    const message = await this.getMessageEntity(userId, messageId)
    const payload = typeof content === 'string' ? content : this.buildMessageContent(content)
    const textPreview = typeof content === 'string' ? content : String((content as { body?: string }).body ?? '')
    const reply = await message.reply(payload as string, undefined, options)
    const serialized = await serializeMessageForApi(reply)

    try {
      const chat = await message.getChat()
      const chatId = serializeId(chat.id)
      const contactLabel = await resolveChatDisplayName(chat, chatId).catch(() => chatId)
      await CreditsService.chargeMessageSent(userId, {
        chatId,
        source: 'manual',
        preview: textPreview,
        chatLabel: contactLabel,
      })
    } catch {
      // credit logging is best-effort for replies
    }

    return serialized
  }

  static async forwardMessage(userId: number, messageId: string, chatId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const message = await this.getMessageEntity(userId, messageId)
    const chat = await client.getChatById(chatId)
    await message.forward(chat)
    return { forwarded: true }
  }

  static async editMessage(userId: number, messageId: string, content: string, options?: Record<string, unknown>) {
    const message = await this.getMessageEntity(userId, messageId)
    const edited = await message.edit(content, options)
    return edited ? serializeMessage(edited) : null
  }

  static async deleteMessage(userId: number, messageId: string, everyone = false, clearMedia = true) {
    const message = await this.getMessageEntity(userId, messageId)
    await message.delete(everyone, clearMedia)
    return { deleted: true }
  }

  static async downloadMessageMedia(userId: number, messageId: string) {
    const message = await this.getMessageEntity(userId, messageId)
    const media = await message.downloadMedia()
    if (!media) return null
    return {
      mimetype: media.mimetype,
      data: media.data,
      filename: media.filename,
      filesize: media.filesize,
    }
  }

  static async transcribeMessage(userId: number, messageId: string) {
    const message = await this.getMessageEntity(userId, messageId)
    if (!isAudioMessageType(message.type) && !(message.hasMedia && message.type === 'ptt')) {
      throw new Error('This message is not a voice note.')
    }

    if (!AudioTranscriptionService.isConfigured()) {
      throw new Error('Transcription is not configured. Set OPENAI_API_KEY on the server.')
    }

    const media = await message.downloadMedia()
    if (!media?.data) {
      throw new Error('Could not download voice note audio.')
    }

    const text = await AudioTranscriptionService.transcribeBase64(
      media.data,
      media.mimetype || 'audio/ogg'
    )

    return {
      messageId: serializeId(message.id),
      text,
    }
  }

  static async getMessageReactions(userId: number, messageId: string) {
    const message = await this.getMessageEntity(userId, messageId)
    const reactionLists = await message.getReactions()
    return {
      messageId: serializeId(message.id),
      reactions: serializeReactions(reactionLists),
    }
  }

  static async getPollVotes(userId: number, messageId: string) {
    const message = await this.getMessageEntity(userId, messageId)
    return message.getPollVotes()
  }

  static async starMessage(userId: number, messageId: string) {
    const message = await this.getMessageEntity(userId, messageId)
    await message.star()
    return { starred: true }
  }

  static async unstarMessage(userId: number, messageId: string) {
    const message = await this.getMessageEntity(userId, messageId)
    await message.unstar()
    return { starred: false }
  }

  static async pinMessage(userId: number, messageId: string, duration: number) {
    const message = await this.getMessageEntity(userId, messageId)
    await message.pin(duration)
    return { pinned: true }
  }

  static async unpinMessage(userId: number, messageId: string) {
    const message = await this.getMessageEntity(userId, messageId)
    await message.unpin()
    return { pinned: false }
  }

  static async voteInPoll(userId: number, messageId: string, selectedOptions: string[]) {
    const message = await this.getMessageEntity(userId, messageId)
    await message.vote(selectedOptions)
    return { voted: true }
  }

  // ── Contacts ─────────────────────────────────────────────────────────────

  static async getContacts(userId: number) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const contacts = await this.getListWithRetry(
      () => client.getContacts(),
      'We could not load your WhatsApp contacts right now. Please wait a moment and try again.'
    )
    const userContacts = contacts.filter((contact) => {
      const id = serializeId(contact.id)
      return (
        contact.isUser &&
        !contact.isMe &&
        !contact.isGroup &&
        !id.includes('@broadcast') &&
        !id.includes('status@')
      )
    })
    const ids = userContacts.map((contact) => serializeId(contact.id))
    const phoneByContactId = await this.resolvePhoneIds(client, ids)
    const serialized = await this.mapWithConcurrency(userContacts, 24, async (contact) => {
      const id = serializeId(contact.id)
      const profilePicUrl = await this.bestEffort(contact.getProfilePicUrl(), 2_500)
      const number =
        phoneByContactId.get(id) ??
        (contact.id.server !== 'lid' ? contact.number?.trim() : null) ??
        (id.endsWith('@c.us') ? id.split('@')[0] : null)
      return serializeContact(contact, { number, profilePicUrl })
    })

    const deduplicated = new Map<string, (typeof serialized)[number]>()
    for (const contact of serialized) {
      const key = contact.number?.replace(/\D/g, '') || contact.id
      const existing = deduplicated.get(key)
      if (!existing || (!existing.name && contact.name)) deduplicated.set(key, contact)
    }
    return [...deduplicated.values()]
  }

  static async getBlockedContacts(userId: number) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const contacts = await client.getBlockedContacts()
    return contacts.map((contact) => serializeContact(contact))
  }

  static async getContactById(userId: number, contactId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const contact = await client.getContactById(contactId)
    return serializeContact(contact)
  }

  static async blockContact(userId: number, contactId: string) {
    const contact = await this.getContactEntity(userId, contactId)
    await contact.block()
    return { blocked: true }
  }

  static async unblockContact(userId: number, contactId: string) {
    const contact = await this.getContactEntity(userId, contactId)
    await contact.unblock()
    return { blocked: false }
  }

  static async getProfilePicUrl(userId: number, contactId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const url = await client.getProfilePicUrl(contactId)
    return { url }
  }

  static async getCommonGroups(userId: number, contactId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const groupIds = await client.getCommonGroups(contactId)
    const groups = await Promise.all(groupIds.map((id) => client.getChatById(serializeId(id))))
    return Promise.all(groups.map((group) => serializeGroupChat(group)))
  }

  static async getContactAbout(userId: number, contactId: string) {
    const contact = await this.getContactEntity(userId, contactId)
    const about = await contact.getAbout()
    return { about }
  }

  static async getNumberId(userId: number, number: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const id = await client.getNumberId(number)
    return id ? serializeId(id) : null
  }

  static async isRegisteredUser(userId: number, id: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.isRegisteredUser(id)
  }

  static async getFormattedNumber(userId: number, number: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.getFormattedNumber(number)
  }

  static async getCountryCode(userId: number, number: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.getCountryCode(number)
  }

  static async saveAddressbookContact(
    userId: number,
    phoneNumber: string,
    firstName: string,
    lastName: string,
    syncToAddressbook?: boolean
  ) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.saveOrEditAddressbookContact(phoneNumber, firstName, lastName, syncToAddressbook)
    return { saved: true }
  }

  static async deleteAddressbookContact(userId: number, phoneNumber: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.deleteAddressbookContact(phoneNumber)
    return { deleted: true }
  }

  // ── Groups ───────────────────────────────────────────────────────────────

  static async createGroup(userId: number, title: string, participants: string[], options?: Record<string, unknown>) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const result = await client.createGroup(title, participants, options as WAWebJS.CreateGroupOptions)
    if (typeof result === 'string') {
      return { chatId: result }
    }
    return {
      title: result.title,
      gid: serializeId(result.gid),
      participants: result.participants,
    }
  }

  static async getInviteInfo(userId: number, inviteCode: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.getInviteInfo(inviteCode)
  }

  static async acceptInvite(userId: number, inviteCode: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const chatId = await client.acceptInvite(inviteCode)
    return { chatId: serializeId(chatId) }
  }

  static async acceptGroupV4Invite(userId: number, inviteInfo: Record<string, unknown>) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.acceptGroupV4Invite(inviteInfo as never)
  }

  static async getGroupInviteCode(userId: number, groupId: string) {
    const group = await this.getGroupEntity(userId, groupId)
    const code = await group.getInviteCode()
    return { inviteCode: code }
  }

  static async revokeGroupInvite(userId: number, groupId: string) {
    const group = await this.getGroupEntity(userId, groupId)
    await group.revokeInvite()
    return { revoked: true }
  }

  static async leaveGroup(userId: number, groupId: string) {
    const group = await this.getGroupEntity(userId, groupId)
    await group.leave()
    return { left: true }
  }

  static async addGroupParticipants(userId: number, groupId: string, participantIds: string[], options?: Record<string, unknown>) {
    const group = await this.getGroupEntity(userId, groupId)
    return group.addParticipants(participantIds, options)
  }

  static async removeGroupParticipants(userId: number, groupId: string, participantIds: string[]) {
    const group = await this.getGroupEntity(userId, groupId)
    return group.removeParticipants(participantIds)
  }

  static async promoteGroupParticipants(userId: number, groupId: string, participantIds: string[]) {
    const group = await this.getGroupEntity(userId, groupId)
    return group.promoteParticipants(participantIds)
  }

  static async demoteGroupParticipants(userId: number, groupId: string, participantIds: string[]) {
    const group = await this.getGroupEntity(userId, groupId)
    return group.demoteParticipants(participantIds)
  }

  static async setGroupSubject(userId: number, groupId: string, subject: string) {
    const group = await this.getGroupEntity(userId, groupId)
    await group.setSubject(subject)
    return { subject }
  }

  static async setGroupDescription(userId: number, groupId: string, description: string) {
    const group = await this.getGroupEntity(userId, groupId)
    await group.setDescription(description)
    return { description }
  }

  static async setGroupPicture(userId: number, groupId: string, media: Record<string, unknown>) {
    const group = await this.getGroupEntity(userId, groupId)
    await group.setPicture(this.toMessageMedia(media))
    return { updated: true }
  }

  static async deleteGroupPicture(userId: number, groupId: string) {
    const group = await this.getGroupEntity(userId, groupId)
    await group.deletePicture()
    return { deleted: true }
  }

  static async getGroupMembershipRequests(userId: number, groupId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.getGroupMembershipRequests(groupId)
  }

  static async approveGroupMembershipRequests(userId: number, groupId: string, options?: WAWebJS.MembershipRequestActionOptions) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.approveGroupMembershipRequests(groupId, options ?? { requesterIds: null, sleep: null })
  }

  static async rejectGroupMembershipRequests(userId: number, groupId: string, options?: WAWebJS.MembershipRequestActionOptions) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.rejectGroupMembershipRequests(groupId, options ?? { requesterIds: null, sleep: null })
  }

  static async setGroupInfoAdminsOnly(userId: number, groupId: string, adminsOnly?: boolean) {
    const group = await this.getGroupEntity(userId, groupId)
    await group.setInfoAdminsOnly(adminsOnly)
    return { adminsOnly: adminsOnly ?? true }
  }

  static async setGroupMessagesAdminsOnly(userId: number, groupId: string, adminsOnly?: boolean) {
    const group = await this.getGroupEntity(userId, groupId)
    await group.setMessagesAdminsOnly(adminsOnly)
    return { adminsOnly: adminsOnly ?? true }
  }

  static async setGroupAddMembersAdminsOnly(userId: number, groupId: string, adminsOnly?: boolean) {
    const group = await this.getGroupEntity(userId, groupId)
    await group.setAddMembersAdminsOnly(adminsOnly)
    return { adminsOnly: adminsOnly ?? true }
  }

  // ── Channels ─────────────────────────────────────────────────────────────

  static async getChannels(userId: number) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const channels = await client.getChannels()
    return channels.map((c) => ({
      id: serializeId(c.id),
      name: c.name,
      description: c.description,
      isMuted: c.isMuted,
      unreadCount: c.unreadCount,
    }))
  }

  static async createChannel(userId: number, title: string, options?: Record<string, unknown>) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.createChannel(title, options)
  }

  static async searchChannels(userId: number, searchOptions: Record<string, unknown>) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.searchChannels(searchOptions as never)
  }

  static async getChannelByInviteCode(userId: number, inviteCode: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.getChannelByInviteCode(inviteCode)
  }

  static async deleteChannel(userId: number, channelId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.deleteChannel(channelId)
    return { deleted: true }
  }

  static async subscribeToChannel(userId: number, channelId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.subscribeToChannel(channelId)
    return { subscribed: true }
  }

  static async unsubscribeFromChannel(userId: number, channelId: string, options?: Record<string, unknown>) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.unsubscribeFromChannel(channelId, options)
    return { subscribed: false }
  }

  static async transferChannelOwnership(userId: number, channelId: string, newOwnerId: string, options?: Record<string, unknown>) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.transferChannelOwnership(channelId, newOwnerId, options)
    return { transferred: true }
  }

  static async sendChannelAdminInvite(userId: number, chatId: string, channelId: string, options?: Record<string, unknown>) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.sendChannelAdminInvite(chatId, channelId, options)
  }

  static async acceptChannelAdminInvite(userId: number, channelId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.acceptChannelAdminInvite(channelId)
  }

  static async revokeChannelAdminInvite(userId: number, channelId: string, userToRevoke: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.revokeChannelAdminInvite(channelId, userToRevoke)
    return { revoked: true }
  }

  static async demoteChannelAdmin(userId: number, channelId: string, userIdToDemote: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.demoteChannelAdmin(channelId, userIdToDemote)
    return { demoted: true }
  }

  // ── Labels ───────────────────────────────────────────────────────────────

  static async getLabels(userId: number) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const labels = await client.getLabels()
    return labels.map((l) => ({ id: l.id, name: l.name, hexColor: l.hexColor }))
  }

  static async getLabelById(userId: number, labelId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const label = await client.getLabelById(labelId)
    return { id: label.id, name: label.name, hexColor: label.hexColor }
  }

  static async getChatsByLabelId(userId: number, labelId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const chats = await client.getChatsByLabelId(labelId)
    return Promise.all(
      chats.map((c) => (c.isGroup ? serializeGroupChat(c) : serializeChatForApi(c)))
    )
  }

  static async addOrRemoveLabels(userId: number, labelIds: string[], chatIds: string[]) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.addOrRemoveLabels(labelIds, chatIds)
    return { labelIds, chatIds }
  }

  // ── Broadcasts ───────────────────────────────────────────────────────────

  static async getBroadcasts(userId: number) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const broadcasts = await client.getBroadcasts()
    return broadcasts.map((b) => ({
      id: serializeId(b.id),
      timestamp: b.timestamp,
      totalCount: b.totalCount,
      unreadCount: b.unreadCount,
    }))
  }

  static async getBroadcastById(userId: number, contactId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const broadcast = await client.getBroadcastById(contactId)
    return {
      id: serializeId(broadcast.id),
      timestamp: broadcast.timestamp,
      totalCount: broadcast.totalCount,
      unreadCount: broadcast.unreadCount,
    }
  }

  // ── Profile & presence ───────────────────────────────────────────────────

  static async setDisplayName(userId: number, displayName: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.setDisplayName(displayName)
    return { displayName }
  }

  static async setStatus(userId: number, status: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.setStatus(status)
    return { status }
  }

  static async setProfilePicture(userId: number, media: Record<string, unknown>) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.setProfilePicture(this.toMessageMedia(media))
    return { updated: true }
  }

  static async deleteProfilePicture(userId: number) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.deleteProfilePicture()
    return { deleted: true }
  }

  static async sendPresenceAvailable(userId: number) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.sendPresenceAvailable()
    return { available: true }
  }

  static async sendPresenceUnavailable(userId: number) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.sendPresenceUnavailable()
    return { available: false }
  }

  static async revokeStatusMessage(userId: number, messageId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.revokeStatusMessage(messageId)
    return { revoked: true }
  }

  // ── Settings ─────────────────────────────────────────────────────────────

  static async setAutoDownloadAudio(userId: number, flag: boolean) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.setAutoDownloadAudio(flag)
    return { enabled: flag }
  }

  static async setAutoDownloadDocuments(userId: number, flag: boolean) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.setAutoDownloadDocuments(flag)
    return { enabled: flag }
  }

  static async setAutoDownloadPhotos(userId: number, flag: boolean) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.setAutoDownloadPhotos(flag)
    return { enabled: flag }
  }

  static async setAutoDownloadVideos(userId: number, flag: boolean) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.setAutoDownloadVideos(flag)
    return { enabled: flag }
  }

  static async setBackgroundSync(userId: number, flag: boolean) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    await client.setBackgroundSync(flag)
    return { enabled: flag }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private static async getChatEntity(userId: number, chatId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    const normalizedId = decodeURIComponent(chatId)
    const chat = await client.getChatById(normalizedId)
    if (!chat) {
      throw new Error(`Chat not found: ${normalizedId}`)
    }
    return chat
  }

  private static async getGroupEntity(userId: number, groupId: string): Promise<WAWebJS.GroupChat> {
    const chat = await this.getChatEntity(userId, groupId)
    if (!chat.isGroup) {
      throw new Error('Chat is not a group.')
    }
    return chat as WAWebJS.GroupChat
  }

  private static async getContactEntity(userId: number, contactId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.getContactById(contactId)
  }

  private static async getMessageEntity(userId: number, messageId: string) {
    const client = await whatsAppClientManager.getReadyClient(userId)
    return client.getMessageById(messageId)
  }

  private static toMessageMedia(media: Record<string, unknown>) {
    return new MessageMedia(
      String(media.mimetype),
      String(media.data),
      media.filename ? String(media.filename) : undefined,
      media.filesize ? Number(media.filesize) : undefined
    )
  }

  private static buildMessageContent(content: Record<string, unknown>) {
    if (content.media && typeof content.media === 'object') {
      return this.toMessageMedia(content.media as Record<string, unknown>)
    }
    if (content.text) return String(content.text)
    if (content.body) return String(content.body)
    throw new Error('Message content must include text, body, or media.')
  }
}

export type { Client }
