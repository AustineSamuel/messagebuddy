import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'
console.log('connection url is:',env.get('DATABASE_URL'))
export default defineConfig({
  connection: 'pg',

  connections: {
    pg: {
      client: 'pg',
      connection: {
        connectionString: env.get('DATABASE_URL'),
        ssl: {
          rejectUnauthorized: false,
        },
      },

      pool: {
        min: 0,
        max: 3, // 🔥 VERY important for Neon
      },

      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },

      debug: false,
    },
  },
})