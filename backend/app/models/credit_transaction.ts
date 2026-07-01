import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type CreditTransactionType = 'signup_bonus' | 'purchase' | 'message_sent'

export default class CreditTransaction extends BaseModel {
  static table = 'credit_transactions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare amount: number

  @column()
  declare balanceAfter: number

  @column()
  declare type: CreditTransactionType

  @column()
  declare chatId: string | null

  @column()
  declare description: string | null

  @column({
    prepare: (value: Record<string, unknown> | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | Record<string, unknown> | null) =>
      typeof value === 'string' ? (JSON.parse(value) as Record<string, unknown>) : value,
  })
  declare metadata: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
