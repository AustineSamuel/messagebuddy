import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import Database from 'better-sqlite3'
import puppeteer from 'puppeteer'
import whatsAppClientManager from '../../whatsapp/services/whatsapp_client_manager.js'
import ChatRulesService from '../../chat_rules/services/chat_rules_service.js'
import FollowUpService from '../../follow_ups/services/follow_up_service.js'
import AiReplyProvider from '#services/ai_reply_provider'

type Lead = {
  id: number
  business_name: string
  phone: string
  website: string | null
  category: string | null
  review_count: number
}

const DAILY_LIMIT = Math.min(100, Math.max(1, Number(process.env.LEAD_OUTREACH_DAILY_LIMIT ?? 100)))
const DB_PATH = process.env.BUSINESS_LIST_DB_PATH ?? app.makePath('database', 'BusinessList.db')

function openDb() {
  const db = new Database(DB_PATH)
  db.pragma('foreign_keys = ON')
  db.pragma('busy_timeout = 5000')
  return db
}

function digits(value: string) {
  return value.replace(/\D/g, '')
}

function initialMessage(lead: Lead) {
  const category = lead.category?.trim() || 'business'
  return `Hello ${lead.business_name}, I came across your ${category} and noticed the strong customer feedback you have built. We help businesses remove operational bottlenecks and win more customers with focused websites and custom software. Would you be open to a brief conversation about one or two processes we could improve for you?`
}

export default class LeadOutreachService {
  static isEnabled() {
    return (
      process.env.LEAD_OUTREACH_ENABLED === 'true' && Boolean(process.env.LEAD_OUTREACH_USER_ID)
    )
  }

  static async processDailySelection() {
    if (!this.isEnabled()) return
    const userId = Number(process.env.LEAD_OUTREACH_USER_ID)
    const db = openDb()
    try {
      db.prepare(
        `UPDATE lead_outreach
         SET status = 'not_responding', updated_at = CURRENT_TIMESTAMP
         WHERE status = 'messaged'
           AND last_response_at IS NULL
           AND first_messaged_at <= datetime('now', '-3 days')`
      ).run()

      const sentToday = (
        db
          .prepare(
            `SELECT COUNT(*) count FROM lead_outreach
             WHERE first_messaged_at >= datetime('now', 'start of day')`
          )
          .get() as { count: number }
      ).count
      const available = Math.max(0, DAILY_LIMIT - sentToday)
      if (!available) return

      const leads = db
        .prepare(
          `SELECT b.id, b.business_name, b.phone, b.website, b.category, b.review_count
           FROM businesses b
           LEFT JOIN lead_outreach o ON o.business_id = b.id
           WHERE b.review_count > 0
             AND b.phone IS NOT NULL AND TRIM(b.phone) <> ''
             AND o.id IS NULL
           ORDER BY b.review_count DESC, b.rating DESC, b.id ASC
           LIMIT ?`
        )
        .all(available) as Lead[]

      for (const lead of leads) {
        await this.sendInitial(userId, lead).catch((error) => {
          logger.error({ err: error, businessId: lead.id }, 'Lead outreach failed')
        })
      }
    } finally {
      db.close()
    }
  }

  private static async sendInitial(userId: number, lead: Lead) {
    const db = openDb()
    let outreachId: number
    try {
      const result = db
        .prepare(
          `INSERT INTO lead_outreach
           (business_id, whatsapp_user_id, status, auto_reply_enabled)
           VALUES (?, ?, 'selected', 1)`
        )
        .run(lead.id, userId)
      outreachId = Number(result.lastInsertRowid)
    } finally {
      db.close()
    }

    try {
      const client = await whatsAppClientManager.getReadyClient(userId, 15_000)
      const numberId = await client.getNumberId(digits(lead.phone))
      if (!numberId) throw new Error('Phone number is not registered on WhatsApp')
      const chatId = typeof numberId === 'string' ? numberId : numberId._serialized
      const text = initialMessage(lead)
      const message = await client.sendMessage(chatId, text)
      const messageId =
        typeof message.id === 'string'
          ? message.id
          : (message.id?._serialized ?? String(message.id))

      const sentDb = openDb()
      try {
        sentDb
          .prepare(
            `UPDATE lead_outreach SET chat_id = ?, status = 'messaged',
             first_messaged_at = CURRENT_TIMESTAMP, last_outbound_at = CURRENT_TIMESTAMP,
             next_follow_up_at = datetime('now', '+3 days'), updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`
          )
          .run(chatId, outreachId)
        sentDb
          .prepare(
            `INSERT OR IGNORE INTO lead_interactions
             (outreach_id, business_id, direction, kind, message_id, message_text)
             VALUES (?, ?, 'outbound', 'initial', ?, ?)`
          )
          .run(outreachId, lead.id, messageId, text)
      } finally {
        sentDb.close()
      }

      await ChatRulesService.upsert(userId, chatId, {
        rule: 'always',
        aiAutoReply: true,
        notifyOnReply: true,
        notes: `Qualified outbound lead: ${lead.business_name}. BusinessList ID ${lead.id}.`,
        customInstructions:
          'Understand this prospect’s business and pain points before selling. Recommend only one or two concrete software solutions with clear value. Be consultative, specific, honest, and concise. Never pressure, misrepresent research, or promise unsupported results.',
      })
      await FollowUpService.ensureForChat(userId, chatId, 'every_3_days')
    } catch (error) {
      const failedDb = openDb()
      try {
        failedDb
          .prepare(
            `UPDATE lead_outreach SET status = 'failed', last_error = ?,
             updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'selected'`
          )
          .run(error instanceof Error ? error.message : String(error), outreachId)
      } finally {
        failedDb.close()
      }
      throw error
    }
  }

  static async recordIncoming(chatId: string, messageId: string, text: string) {
    const db = openDb()
    let lead: (Lead & { outreach_id: number }) | undefined
    try {
      lead = db
        .prepare(
          `SELECT b.id, b.business_name, b.phone, b.website, b.category, b.review_count,
                  o.id outreach_id
           FROM lead_outreach o JOIN businesses b ON b.id = o.business_id
           WHERE o.chat_id = ? AND o.status NOT IN ('opted_out', 'converted')
           ORDER BY o.id DESC LIMIT 1`
        )
        .get(chatId) as typeof lead
      if (!lead) return
      db.prepare(
        `UPDATE lead_outreach SET status = 'responded', last_response_at = CURRENT_TIMESTAMP,
         next_follow_up_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).run(lead.outreach_id)
      db.prepare(
        `INSERT OR IGNORE INTO lead_interactions
         (outreach_id, business_id, direction, kind, message_id, message_text)
         VALUES (?, ?, 'inbound', 'reply', ?, ?)`
      ).run(lead.outreach_id, lead.id, messageId, text)
    } finally {
      db.close()
    }

    if (lead.website && Math.random() < Number(process.env.LEAD_RESEARCH_RESPONSE_RATE ?? 0.25)) {
      void this.researchAndRecommend(lead).catch((error) =>
        logger.warn({ err: error, businessId: lead!.id }, 'Lead website research failed')
      )
    }
  }

  private static async researchAndRecommend(lead: Lead & { outreach_id: number }) {
    const existingDb = openDb()
    try {
      const exists = existingDb
        .prepare('SELECT 1 FROM business_research WHERE business_id = ?')
        .get(lead.id)
      if (exists) return
    } finally {
      existingDb.close()
    }

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    let title = ''
    let pageText = ''
    try {
      const page = await browser.newPage()
      await page.goto(lead.website!, { waitUntil: 'domcontentloaded', timeout: 30_000 })
      title = await page.title()
      pageText = await page.evaluate(
        () =>
          (
            globalThis as typeof globalThis & {
              document?: { body?: { innerText?: string } }
            }
          ).document?.body?.innerText ?? ''
      )
      pageText = pageText.replace(/\s+/g, ' ').trim().slice(0, 12_000)
    } finally {
      await browser.close()
    }

    const strategy = await AiReplyProvider.generateLeadStrategy({
      businessName: lead.business_name,
      category: lead.category,
      website: lead.website!,
      pageTitle: title,
      pageText,
    })
    if (!strategy) return

    const db = openDb()
    try {
      const transaction = db.transaction(() => {
        db.prepare(
          `INSERT OR IGNORE INTO business_research
           (business_id, website_url, page_title, page_text, business_summary)
           VALUES (?, ?, ?, ?, ?)`
        ).run(lead.id, lead.website, title, pageText, strategy.summary)
        db.prepare(
          `INSERT INTO software_recommendations
           (business_id, outreach_id, title, problem_statement, proposed_solution,
            business_value, recommended_platform)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(
          lead.id,
          lead.outreach_id,
          strategy.title,
          strategy.problem,
          strategy.solution,
          strategy.value,
          strategy.platform
        )
      })
      transaction()
    } finally {
      db.close()
    }
  }
}
