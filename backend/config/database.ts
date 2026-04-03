import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const databaseUrl = env.get('DATABASE_URL')
const usePostgres = Boolean(databaseUrl)

/**
 * Neon / PgBouncer: drop channel_binding (can break some `pg` + pooler combos).
 * Serverless poolers close idle TCP quickly — short idle timeout + min:0 avoids
 * reusing dead clients ("Connection terminated unexpectedly").
 */
function postgresConnectionString(url: string) {
  try {
    const parsed = new URL(url)
    parsed.searchParams.delete('channel_binding')
    return parsed.toString()
  } catch {
    return url
  }
}

const dbConfig = defineConfig({
  /**
   * Default connection used for all queries.
   */
  connection: usePostgres ? 'pg' : 'sqlite',

  connections: {
    /**
     * SQLite connection (default).
     */
    sqlite: {
      client: 'better-sqlite3',

      connection: {
        filename: app.tmpPath('db.sqlite3'),
      },

      /**
       * Required by Knex for SQLite defaults.
       */
      useNullAsDefault: true,

      migrations: {
        /**
         * Sort migration files naturally by filename.
         */
        naturalSort: true,

        /**
         * Paths containing migration files.
         */
        paths: ['database/migrations'],
      },

      schemaGeneration: {
        /**
         * Enable schema generation from Lucid models.
         */
        enabled: true,

        /**
         * Custom schema rules file paths.
         */
        rulesPaths: ['./database/schema_rules.js'],
      },
    },

    /**
     * PostgreSQL (e.g. Neon) via DATABASE_URL.
     */
    ...(databaseUrl
      ? {
          pg: {
            client: 'pg' as const,
            connection: {
              connectionString: postgresConnectionString(databaseUrl),
              ...(databaseUrl.includes('neon.tech')
                ? { ssl: { rejectUnauthorized: true as const } }
                : {}),
            },
            pool: {
              min: 0,
              max: 10,
              idleTimeoutMillis: 10_000,
              reapIntervalMillis: 500,
              propagateCreateError: true,
            },
            migrations: {
              naturalSort: true,
              paths: ['database/migrations'],
            },
            debug: app.inDev,
          },
        }
      : {}),

    /**
     * MySQL / MariaDB connection.
     * Install package to switch: npm install mysql2
     */
    // mysql: {
    //   client: 'mysql2',
    //   connection: {
    //     host: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * Microsoft SQL Server connection.
     * Install package to switch: npm install tedious
     */
    // mssql: {
    //   client: 'mssql',
    //   connection: {
    //     server: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * libSQL (Turso) connection.
     * Install package to switch: npm install @libsql/client
     */
    // libsql: {
    //   client: 'libsql',
    //   connection: {
    //     url: env.get('LIBSQL_URL'),
    //     authToken: env.get('LIBSQL_AUTH_TOKEN'),
    //   },
    //   useNullAsDefault: true,
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },
  },
})

export default dbConfig
