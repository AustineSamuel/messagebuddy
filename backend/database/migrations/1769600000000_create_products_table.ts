import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.string('slug', 255).notNullable()
      table.text('description').nullable()
      table.decimal('price', 14, 2).notNullable().defaultTo(0)
      table.string('currency', 8).notNullable().defaultTo('NGN')
      table.string('emoji', 16).nullable()
      table.string('stock', 16).notNullable().defaultTo('in')
      table.jsonb('images').notNullable().defaultTo('[]')
      table.integer('total_sold').unsigned().notNullable().defaultTo(0)
      table.boolean('active').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id', 'slug'])
      table.index(['user_id', 'active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
