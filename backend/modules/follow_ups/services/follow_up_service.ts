import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import FollowUpSchedule, { type FollowUpInterval } from '#models/follow_up_schedule'
import AiReplyProvider from '#services/ai_reply_provider'
import ContactSummaryService from '#services/contact_summary_service'
import ChatRulesService from '../../chat_rules/services/chat_rules_service.js'
import AiBusinessContextService from '#services/ai_business_context'
import CreditsService from '#services/credits_service'
import whatsAppClientManager from '../../whatsapp/services/whatsapp_client_manager.js'
import { buildConversationHistory } from '../../whatsapp/helpers/conversation_history.js'
import { resolveChatDisplayName } from '../../whatsapp/helpers/serialization.js'

export type FollowUpSchedulePayload = {
  id: number
  chatId: string
  interval: FollowUpInterval
  enabled: boolean
  lastSentAt: string | null
  nextRunAt: string | null
}

const INTERVAL_DAYS: Record<FollowUpInterval, number> = {
  daily: 1,
  every_3_days: 3,
  weekly: 7,
}

/** Keep small — Neon pool is max 3 connections. */
const DUE_BATCH_SIZE = 3

let processingDue = false

function serializeRow(row: FollowUpSchedule): FollowUpSchedulePayload {
  return {
    id: row.id,
    chatId: row.chatId,
    interval: row.interval,
    enabled: row.enabled,
    lastSentAt: row.lastSentAt?.toISO() ?? null,
    nextRunAt: row.nextRunAt?.toISO() ?? null,
  }
}

export function computeNextRunAt(interval: FollowUpInterval, from: DateTime = DateTime.now()) {
  return from.plus({ days: INTERVAL_DAYS[interval] })
}

export default class FollowUpService {
  static async listForUser(userId: number) {
    const rows = await FollowUpSchedule.query()
      .where('user_id', userId)
      .orderBy('updated_at', 'desc')

    return rows.map(serializeRow)
  }

  static async syncForUser(
    userId: number,
    data: {
      interval?: FollowUpInterval
      chatIds?: string[]
      contacts?: Array<{ chatId: string; interval: FollowUpInterval }>
      enabled?: boolean
    }
  ) {
    const enabled = data.enabled ?? true
    const contactList =
      data.contacts ??
      (data.chatIds ?? []).map((chatId) => ({
        chatId,
        interval: data.interval ?? 'every_3_days',
      }))
    const chatIdSet = new Set(contactList.map((item) => item.chatId))
    const existing = await FollowUpSchedule.query().where('user_id', userId)

    for (const { chatId, interval } of contactList) {
      const row = existing.find((item) => item.chatId === chatId)
      if (row) {
        row.interval = interval
        row.enabled = enabled
        if (!row.nextRunAt) {
          row.nextRunAt = computeNextRunAt(interval)
        }
        await row.save()
      } else {
        await FollowUpSchedule.create({
          userId,
          chatId,
          interval,
          enabled,
          nextRunAt: computeNextRunAt(interval),
        })
      }
    }

    for (const row of existing) {
      if (!chatIdSet.has(row.chatId) && row.enabled) {
        row.enabled = false
        await row.save()
      }
    }

    return this.listForUser(userId)
  }

  static async updateForChat(
    userId: number,
    chatId: string,
    data: { enabled?: boolean; interval?: FollowUpInterval }
  ) {
    const row = await FollowUpSchedule.query()
      .where('user_id', userId)
      .where('chat_id', chatId)
      .first()

    if (!row) {
      throw new Error('Follow-up schedule not found for this chat.')
    }

    if (data.interval) {
      row.interval = data.interval
      if (!row.nextRunAt) {
        row.nextRunAt = computeNextRunAt(data.interval)
      }
    }

    if (typeof data.enabled === 'boolean') {
      row.enabled = data.enabled
      if (data.enabled && !row.nextRunAt) {
        row.nextRunAt = computeNextRunAt(row.interval)
      }
    }

    await row.save()
    return serializeRow(row)
  }

  static async setEnabled(userId: number, chatId: string, enabled: boolean) {
    return this.updateForChat(userId, chatId, { enabled })
  }

  static async processDueFollowUps() {
    if (processingDue) return
    if (!AiReplyProvider.isConfigured()) return

    processingDue = true
    try {
      const now = DateTime.now()
      const due = await FollowUpSchedule.query()
        .where('enabled', true)
        .whereNotNull('next_run_at')
        .where('next_run_at', '<=', now.toSQL()!)
        .orderBy('next_run_at', 'asc')
        .limit(DUE_BATCH_SIZE)

      for (const schedule of due) {
        await this.sendFollowUp(schedule).catch((error) => {
          logger.error({ err: error, scheduleId: schedule.id }, 'Follow-up send failed')
        })
      }
    } catch (error) {
      logger.error({ err: error }, 'Follow-up scheduler tick failed')
    } finally {
      processingDue = false
    }
  }

  private static async bumpNextRun(schedule: FollowUpSchedule, from: DateTime = DateTime.now()) {
    schedule.nextRunAt = computeNextRunAt(schedule.interval, from)
    await schedule.save()
  }

  private static async deferNextRun(schedule: FollowUpSchedule, minutes: number) {
    schedule.nextRunAt = DateTime.now().plus({ minutes })
    await schedule.save()
  }

  private static async sendFollowUp(schedule: FollowUpSchedule) {
    const userId = schedule.userId
    const chatId = schedule.chatId

    // Load DB context first, then release connections before slow WhatsApp / AI work.
    const [{ settings: rules, default: defaultRules }, business] = await Promise.all([
      ChatRulesService.getForChat(userId, chatId),
      AiBusinessContextService.forUser(userId),
    ])

    if (rules.rule === 'never') {
      await this.bumpNextRun(schedule)
      return
    }

    let client
    try {
      client = await whatsAppClientManager.getReadyClient(userId, 15_000)
    } catch {
      await this.deferNextRun(schedule, 15)
      return
    }

    const chat = await client.getChatById(chatId)
    if (!chat) {
      schedule.enabled = false
      await schedule.save()
      return
    }

    const history = await buildConversationHistory(chat, { limit: 30 })
    if (history.length === 0) {
      await this.bumpNextRun(schedule)
      return
    }

    const contactLabel = await resolveChatDisplayName(chat, chatId).catch(() => chatId)
    const contactSummary = await ContactSummaryService.getSummaryText(userId, chatId)
    const message = await AiReplyProvider.generateFollowUpMessage({
      history,
      customInstructions: rules.customInstructions,
      notes: rules.notes,
      defaultCustomInstructions: defaultRules.customInstructions,
      defaultNotes: defaultRules.notes,
      contactLabel,
      contactSummary,
      interval: schedule.interval,
      business,
    })

    if (!message) {
      await this.deferNextRun(schedule, 30)
      return
    }

    if (!(await CreditsService.hasSufficientCredits(userId))) {
      await this.deferNextRun(schedule, 60)
      return
    }

    await chat.sendMessage(message)
    await CreditsService.chargeMessageSent(userId, {
      chatId,
      source: 'follow_up',
      preview: message,
      chatLabel: contactLabel,
    })

    const sentAt = DateTime.now()
    schedule.lastSentAt = sentAt
    schedule.nextRunAt = computeNextRunAt(schedule.interval, sentAt)
    await schedule.save()

    logger.info({ userId, chatId, scheduleId: schedule.id }, 'AI follow-up sent')
  }
}
