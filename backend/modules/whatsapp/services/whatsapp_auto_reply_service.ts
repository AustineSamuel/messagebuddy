import logger from '@adonisjs/core/services/logger'
import type { Client, Message } from 'whatsapp-web.js'
import ChatRulesService from '../../chat_rules/services/chat_rules_service.js'
import AiBusinessContextService from '#services/ai_business_context'
import AiReplyProvider from '#services/ai_reply_provider'
import ContactSummaryService from '#services/contact_summary_service'
import ProductReplyEnricher from '#services/product_reply_enricher'
import CreditsService, { InsufficientCreditsError } from '#services/credits_service'
import { buildConversationHistory, messageBodyFromWweb } from '../helpers/conversation_history.js'
import { resolveChatDisplayName, serializeId } from '../helpers/serialization.js'

const HISTORY_LIMIT = 30
const PROCESSED_TTL_MS = 60 * 60 * 1000

/** Prevent duplicate replies to the same message id. */
const processedMessageIds = new Map<string, number>()
/** One in-flight auto-reply per user+chat. */
const inFlightChats = new Set<string>()
/** One in-flight handler per message id. */
const inFlightMessages = new Set<string>()

function chatLockKey(userId: number, chatId: string) {
  return `${userId}:${chatId}`
}

function pruneProcessedIds() {
  const cutoff = Date.now() - PROCESSED_TTL_MS
  for (const [id, ts] of processedMessageIds) {
    if (ts < cutoff) processedMessageIds.delete(id)
  }
}

function markProcessed(messageId: string) {
  processedMessageIds.set(messageId, Date.now())
  if (processedMessageIds.size > 5000) pruneProcessedIds()
}

function shouldSkipMessage(message: Message) {
  if (message.fromMe) return true
  if (message.isStatus) return true
  if (message.from.includes('@broadcast')) return true
  if (!messageBodyFromWweb(message)) return true
  return false
}

export default class WhatsAppAutoReplyService {
  static attachListener(userId: number, client: Client) {
    if ((client as Client & { __autoReplyListener?: boolean }).__autoReplyListener) return
    ;(client as Client & { __autoReplyListener?: boolean }).__autoReplyListener = true

    client.on('message', (message) => {
      void this.handleIncomingMessage(userId, message)
    })

    logger.info({ userId }, 'WhatsApp AI auto-reply listener attached')
  }

  static async handleIncomingMessage(userId: number, message: Message) {
    // console.log(message);
    if (shouldSkipMessage(message)) return

    const messageId = serializeId(message.id)
    if (processedMessageIds.has(messageId)) return
    if (inFlightMessages.has(messageId)) return

    inFlightMessages.add(messageId)

    try {
      const chat = await message.getChat()
      const chatId = serializeId(chat.id)
      const lockKey = chatLockKey(userId, chatId)

      if (inFlightChats.has(lockKey)) return
      inFlightChats.add(lockKey)

      try {
        const rules = await ChatRulesService.getSavedRuleForChat(userId, chatId)
        if (!rules) {
          logger.debug({ userId, chatId }, 'No saved chat rules — auto-reply skipped')
          return
        }

        if (!rules.aiAutoReply) {
          logger.debug({ userId, chatId }, 'aiAutoReply disabled — skipped')
          return
        }

        if (rules.rule === 'never') {
          logger.debug({ userId, chatId }, 'rule is never — skipped')
          return
        }

        if (!AiReplyProvider.isConfigured()) return

        if (!(await CreditsService.hasSufficientCredits(userId))) {
          logger.debug({ userId, chatId }, 'Insufficient credits — auto-reply skipped')
          return
        }

        const defaultRules = await ChatRulesService.getDefault(userId)
        const business = await AiBusinessContextService.forUser(userId)

        const history = await buildConversationHistory(chat, {
          limit: HISTORY_LIMIT,
          excludeMessageId: messageId,
        })
        const incoming = messageBodyFromWweb(message)
        const contactLabel = await resolveChatDisplayName(chat, chatId).catch(() => chatId)

        const matchedProducts = await ProductReplyEnricher.findRelevantProducts(userId, incoming)
        const contactSummary = await ContactSummaryService.getSummaryText(userId, chatId)

        const replyText = await AiReplyProvider.generateReply({
          incomingMessage: incoming,
          history,
          customInstructions: rules.customInstructions,
          notes: rules.notes,
          defaultCustomInstructions: defaultRules.customInstructions,
          defaultNotes: defaultRules.notes,
          contactLabel,
          contactSummary,
          business,
          matchedProducts,
        })

        if (!replyText) {
          logger.warn({ userId, chatId, messageId }, 'AI returned no reply text')
          return
        }

        const finalReply = ProductReplyEnricher.enrich(replyText, matchedProducts)

        await message.reply(finalReply)
        await CreditsService.chargeMessageSent(userId, {
          chatId,
          source: 'auto_reply',
          preview: finalReply,
          chatLabel: contactLabel,
        }).catch((err) => {
          if (err instanceof InsufficientCreditsError) {
            logger.warn({ userId, chatId }, 'Auto-reply sent but credit charge failed')
          } else {
            throw err
          }
        })
        markProcessed(messageId)
        logger.info({ userId, chatId, messageId }, 'AI auto-reply sent')
      } catch (error) {
        logger.error({ err: error, userId }, 'AI auto-reply handler failed')
      } finally {
        inFlightChats.delete(lockKey)
      }
    } finally {
      inFlightMessages.delete(messageId)
    }
  }
}
