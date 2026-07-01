import MessageLog from '#models/message_log'
import CreditUsageDaily from '#models/credit_usage_daily'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export type AnalyticsPeriod = 'today' | '7d' | '30d'

function periodToDays(period: AnalyticsPeriod) {
  switch (period) {
    case 'today':
      return 1
    case '30d':
      return 30
    default:
      return 7
  }
}

function periodStart(period: AnalyticsPeriod) {
  const days = periodToDays(period)
  return DateTime.now()
    .minus({ days: days - 1 })
    .startOf('day')
}

export default class AnalyticsService {
  static async getSummary(userId: number, period: AnalyticsPeriod = '7d') {
    const start = periodStart(period)

    const totals = await db
      .from('message_logs')
      .where('user_id', userId)
      .where('created_at', '>=', start.toSQL()!)
      .select(
        db.raw('COUNT(*)::int as messages_sent'),
        db.raw('COALESCE(SUM(credits_charged), 0) as credits_used'),
        db.raw('COUNT(DISTINCT chat_id)::int as active_chats'),
        db.raw('COUNT(*) FILTER (WHERE is_ai = true)::int as ai_messages')
      )
      .first()

    const prevStart = start.minus({ days: periodToDays(period) })
    const prevTotals = await db
      .from('message_logs')
      .where('user_id', userId)
      .where('created_at', '>=', prevStart.toSQL()!)
      .where('created_at', '<', start.toSQL()!)
      .select(db.raw('COUNT(*)::int as messages_sent'))
      .first()

    const messagesSent = Number(totals?.messages_sent ?? 0)
    const prevMessages = Number(prevTotals?.messages_sent ?? 0)
    const trendPct =
      prevMessages > 0
        ? Math.round(((messagesSent - prevMessages) / prevMessages) * 100)
        : messagesSent > 0
          ? 100
          : 0

    return {
      period,
      messagesSent,
      creditsUsed: Number(totals?.credits_used ?? 0),
      activeChats: Number(totals?.active_chats ?? 0),
      aiMessages: Number(totals?.ai_messages ?? 0),
      messagesTrendPct: trendPct,
    }
  }

  static async getHourlyVolumeToday(userId: number) {
    const start = DateTime.now().startOf('day')
    const rows = await db
      .from('message_logs')
      .where('user_id', userId)
      .where('created_at', '>=', start.toSQL()!)
      .select(db.raw('EXTRACT(HOUR FROM created_at)::int as hour'))
      .count('* as count')
      .groupBy('hour')
      .orderBy('hour', 'asc')

    const counts = Array.from({ length: 24 }, () => 0)
    for (const row of rows) {
      const hour = Number(row.hour)
      if (hour >= 0 && hour < 24) counts[hour] = Number(row.count)
    }
    return counts
  }

  static async getTopContacts(userId: number, period: AnalyticsPeriod = '7d', limit = 5) {
    const start = periodStart(period)

    const rows = await MessageLog.query()
      .where('user_id', userId)
      .where('created_at', '>=', start.toSQL()!)
      .orderBy('created_at', 'desc')

    const counts = new Map<string, { chatLabel: string; messages: number }>()
    for (const row of rows) {
      const existing = counts.get(row.chatId)
      if (existing) {
        existing.messages += 1
      } else {
        counts.set(row.chatId, {
          chatLabel: row.chatLabel ?? row.chatId.replace(/@c\.us$/, ''),
          messages: 1,
        })
      }
    }

    return [...counts.entries()]
      .map(([chatId, data]) => ({ chatId, ...data }))
      .sort((a, b) => b.messages - a.messages)
      .slice(0, limit)
  }

  static async getRecentMessages(userId: number, limit = 8) {
    const rows = await MessageLog.query()
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)

    return rows.map((row) => ({
      id: row.id,
      chatId: row.chatId,
      chatLabel: row.chatLabel ?? row.chatId.replace(/@c\.us$/, ''),
      preview: row.bodyPreview ?? '',
      source: row.source,
      isAi: row.isAi,
      creditsCharged: Number(row.creditsCharged),
      createdAt: row.createdAt.toISO()!,
    }))
  }

  static async getCreditsUsedInPeriod(userId: number, period: AnalyticsPeriod) {
    const start = periodStart(period)
    const row = await CreditUsageDaily.query()
      .where('user_id', userId)
      .where('usage_date', '>=', start.toISODate()!)
      .sum('credits_used as total')
      .sum('messages_sent as messages')
      .first()

    return {
      creditsUsed: Number(row?.$extras.total ?? 0),
      messagesSent: Number(row?.$extras.messages ?? 0),
    }
  }
}
