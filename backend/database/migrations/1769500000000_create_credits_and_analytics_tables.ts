import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.decimal('credits_balance', 12, 2).notNullable().defaultTo(5000)
    })

    this.schema.createTable('credit_transactions', (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.decimal('amount', 12, 2).notNullable()
      table.decimal('balance_after', 12, 2).notNullable()
      table.string('type', 32).notNullable()
      table.string('chat_id', 255).nullable()
      table.text('description').nullable()
      table.jsonb('metadata').nullable()
      table.timestamp('created_at').notNullable()

      table.index(['user_id', 'created_at'])
      table.index(['user_id', 'type'])
    })

    this.schema.createTable('credit_usage_daily', (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.date('usage_date').notNullable()
      table.decimal('credits_used', 12, 2).notNullable().defaultTo(0)
      table.integer('messages_sent').unsigned().notNullable().defaultTo(0)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id', 'usage_date'])
    })

    this.schema.createTable('message_logs', (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('chat_id', 255).notNullable()
      table.string('chat_label', 255).nullable()
      table.string('source', 32).notNullable()
      table.text('body_preview').nullable()
      table.decimal('credits_charged', 12, 2).notNullable()
      table.boolean('is_ai').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable()

      table.index(['user_id', 'created_at'])
      table.index(['user_id', 'chat_id'])
    })
  }

  async down() {
    this.schema.dropTable('message_logs')
    this.schema.dropTable('credit_usage_daily')
    this.schema.dropTable('credit_transactions')
    this.schema.alterTable('users', (table) => {
      table.dropColumn('credits_balance')
    })
  }
}
