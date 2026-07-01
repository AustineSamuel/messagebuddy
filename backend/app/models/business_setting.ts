import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type BusinessTone = 'professional' | 'casual' | 'formal' | 'energetic'

export type BusinessProduct = {
  id: number
  emoji: string
  name: string
  price: string
  stock: 'in' | 'low' | 'out'
}

export default class BusinessSetting extends BaseModel {
  static table = 'business_settings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare website: string | null

  @column()
  declare address: string | null

  @column()
  declare aiRules: string | null

  @column()
  declare responseLanguage: string

  @column()
  declare escalationRules: string | null

  @column()
  declare tone: BusinessTone

  @column({
    prepare: (value: BusinessProduct[]) => JSON.stringify(value),
    consume: (value: string | BusinessProduct[]) =>
      typeof value === 'string' ? (JSON.parse(value) as BusinessProduct[]) : value,
  })
  declare products: BusinessProduct[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
