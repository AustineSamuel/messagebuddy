import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import CreditTransaction from '#models/credit_transaction'
import CreditUsageDaily from '#models/credit_usage_daily'
import MessageLog, { type MessageLogSource } from '#models/message_log'
import {
  CREDITS_PER_MESSAGE,
  PURCHASE_CREDITS_UNIT,
  PURCHASE_NGN_PER_UNIT,
  PURCHASE_PACKAGES,
  SIGNUP_CREDITS,
} from '#config/credits'
import { DateTime } from 'luxon'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export class InsufficientCreditsError extends Error {
  readonly status = 402

  constructor(
    public balance: number,
    public required: number = CREDITS_PER_MESSAGE
  ) {
    super(`Insufficient credits. Balance: ${balance}, required: ${required}`)
    this.name = 'InsufficientCreditsError'
  }
}

export type ChargeMessageInput = {
  chatId: string
  source: MessageLogSource
  preview?: string | null
  chatLabel?: string | null
}

export default class CreditsService {
  static async getAccount(userId: number) {
    const user = await User.findOrFail(userId)
    const today = DateTime.now().toISODate()!
    const todayRow = await CreditUsageDaily.query()
      .where('user_id', userId)
      .where('usage_date', today)
      .first()

    return {
      balance: Number(user.creditsBalance),
      signupGrant: SIGNUP_CREDITS,
      creditsPerMessage: CREDITS_PER_MESSAGE,
      usedToday: todayRow ? Number(todayRow.creditsUsed) : 0,
      messagesToday: todayRow?.messagesSent ?? 0,
      purchaseRate: {
        credits: PURCHASE_CREDITS_UNIT,
        priceNgn: PURCHASE_NGN_PER_UNIT,
      },
      packages: PURCHASE_PACKAGES,
    }
  }

  /** Record welcome bonus ledger entry for a newly registered user. */
  static async initializeNewUser(userId: number) {
    const user = await User.findOrFail(userId)
    await CreditTransaction.create({
      userId,
      amount: SIGNUP_CREDITS,
      balanceAfter: Number(user.creditsBalance),
      type: 'signup_bonus',
      description: 'Welcome bonus — 5,000 credits',
    })
  }

  static async hasSufficientCredits(userId: number, amount = CREDITS_PER_MESSAGE) {
    const user = await User.find(userId)
    if (!user) return false
    return Number(user.creditsBalance) >= amount
  }

  /**
   * Deduct credits for an outbound WhatsApp message and write analytics rows.
   * @throws InsufficientCreditsError when balance is too low
   */
  static async chargeMessageSent(userId: number, input: ChargeMessageInput) {
    return db.transaction(async (trx) => {
      const user = await User.query({ client: trx }).where('id', userId).forUpdate().firstOrFail()

      const balance = Number(user.creditsBalance)
      if (balance < CREDITS_PER_MESSAGE) {
        throw new InsufficientCreditsError(balance)
      }

      const newBalance = balance - CREDITS_PER_MESSAGE
      user.creditsBalance = String(newBalance)
      await user.useTransaction(trx).save()

      const preview = input.preview?.trim().slice(0, 280) ?? null
      const isAi = input.source !== 'manual'

      await CreditTransaction.create(
        {
          userId,
          amount: -CREDITS_PER_MESSAGE,
          balanceAfter: newBalance,
          type: 'message_sent',
          chatId: input.chatId,
          description: `${input.source} message`,
          metadata: { source: input.source },
        },
        { client: trx }
      )

      await this.bumpDailyUsage(trx, userId, CREDITS_PER_MESSAGE)

      await MessageLog.create(
        {
          userId,
          chatId: input.chatId,
          chatLabel: input.chatLabel ?? null,
          source: input.source,
          bodyPreview: preview,
          creditsCharged: CREDITS_PER_MESSAGE,
          isAi,
        },
        { client: trx }
      )

      return { balance: newBalance, charged: CREDITS_PER_MESSAGE }
    })
  }

  /**
   * Add purchased credits (MVP — no payment gateway; integrate Paystack/Flutterwave later).
   */
  static async purchaseCredits(userId: number, credits: number) {
    if (credits < PURCHASE_CREDITS_UNIT || credits % PURCHASE_CREDITS_UNIT !== 0) {
      throw new Error(`Credits must be purchased in multiples of ${PURCHASE_CREDITS_UNIT}.`)
    }

    const priceNgn = (credits / PURCHASE_CREDITS_UNIT) * PURCHASE_NGN_PER_UNIT

    return db.transaction(async (trx) => {
      const user = await User.query({ client: trx }).where('id', userId).forUpdate().firstOrFail()
      const balance = Number(user.creditsBalance)
      const newBalance = balance + credits
      user.creditsBalance = String(newBalance)
      await user.useTransaction(trx).save()

      await CreditTransaction.create(
        {
          userId,
          amount: credits,
          balanceAfter: newBalance,
          type: 'purchase',
          description: `Purchased ${credits} credits`,
          metadata: { priceNgn, credits },
        },
        { client: trx }
      )

      return { balance: newBalance, creditsAdded: credits, priceNgn }
    })
  }

  static async getDailyUsage(userId: number, days = 7) {
    const start = DateTime.now().minus({ days: days - 1 }).startOf('day')
    const rows = await CreditUsageDaily.query()
      .where('user_id', userId)
      .where('usage_date', '>=', start.toISODate()!)
      .orderBy('usage_date', 'asc')

    const byDate = new Map(
      rows.map((row) => [
        row.usageDate.toISODate()!,
        { creditsUsed: Number(row.creditsUsed), messagesSent: row.messagesSent },
      ])
    )

    const result: Array<{
      day: string
      date: string
      used: number
      messages: number
    }> = []

    for (let i = 0; i < days; i++) {
      const date = start.plus({ days: i })
      const iso = date.toISODate()!
      const entry = byDate.get(iso)
      result.push({
        day: date.toFormat('ccc'),
        date: date.toFormat('MMM d'),
        used: entry?.creditsUsed ?? 0,
        messages: entry?.messagesSent ?? 0,
      })
    }

    return result
  }

  private static async bumpDailyUsage(
    trx: TransactionClientContract,
    userId: number,
    credits: number
  ) {
    const today = DateTime.now().toISODate()!
    const existing = await CreditUsageDaily.query({ client: trx })
      .where('user_id', userId)
      .where('usage_date', today)
      .forUpdate()
      .first()

    if (existing) {
      existing.creditsUsed = Number(existing.creditsUsed) + credits
      existing.messagesSent += 1
      await existing.useTransaction(trx).save()
      return
    }

    await CreditUsageDaily.create(
      {
        userId,
        usageDate: DateTime.fromISO(today),
        creditsUsed: credits,
        messagesSent: 1,
      },
      { client: trx }
    )
  }
}
