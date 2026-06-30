import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'chat_rules'

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
      table.string('chat_id', 255).notNullable()
      table.string('rule', 32).notNullable().defaultTo('default')
      table.text('notes').nullable()
      table.boolean('ai_auto_reply').notNullable().defaultTo(true)
      table.boolean('send_catalog').notNullable().defaultTo(false)
      table.boolean('notify_on_reply').notNullable().defaultTo(true)
      table.text('custom_instructions').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id', 'chat_id'])
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
