/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

function withDefault<T>(fallback: string, validate: (key: string, value?: string) => T) {
  return (key: string, value?: string) => validate(key, value && value !== '' ? value : fallback)
}

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: withDefault('development', Env.schema.enum(['development', 'production', 'test'] as const)),
  PORT: Env.schema.number(),
  HOST: withDefault('127.0.0.1', Env.schema.string({ format: 'host' })),
  LOG_LEVEL: withDefault('info', Env.schema.string()),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),
  FRONTEND_URL: Env.schema.string.optional({ format: 'url', tld: false }),

  // Database (Lucid + `pg`; omit to use SQLite from config/database.ts)
  DATABASE_URL: Env.schema.string(),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Firebase Admin (verify ID tokens from the web client). Optional path to service account JSON.
  FIREBASE_CREDENTIALS_PATH: Env.schema.string.optional(),

  // AI auto-reply (OpenAI-compatible chat completions API)
  OPENAI_API_KEY: Env.schema.string.optional(),
  OPENAI_MODEL: Env.schema.string.optional(),
  OPENAI_WHISPER_MODEL: Env.schema.string.optional(),

  /** Secret for GET /api/v1/website-services/orders/admin (X-Website-Orders-Secret header) */
  WEBSITE_ORDERS_ADMIN_SECRET: Env.schema.string.optional(),
})
