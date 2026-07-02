import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type ProductStock = 'in' | 'low' | 'out'

export default class Product extends BaseModel {
  static table = 'products'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare price: string

  @column()
  declare currency: string

  @column()
  declare emoji: string | null

  @column()
  declare stock: ProductStock

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string | string[]) =>
      typeof value === 'string' ? (JSON.parse(value) as string[]) : value,
  })
  declare images: string[]

  @column()
  declare totalSold: number

  @column()
  declare active: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
