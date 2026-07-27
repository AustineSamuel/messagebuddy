import { defineConfig } from '@adonisjs/cors'
import env from '#start/env'

const configuredFrontendOrigin = env.get('FRONTEND_URL')?.replace(/\/$/, '')
const frontendOrigins = [
  'https://chatbusiness-teal.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(configuredFrontendOrigin ? [configuredFrontendOrigin] : []),
]

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  /**
   * Enable or disable CORS handling globally.
   */
  enabled: true,

  /**
   * Keep browser access restricted to the deployed frontend and local
   * Next.js development origins.
   */
  origin: frontendOrigins,

  /**
   * HTTP methods accepted for cross-origin requests.
   */
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],

  /**
   * Reflect request headers by default. Use a string array to restrict
   * allowed headers.
   */
  headers: true,

  /**
   * Response headers exposed to the browser.
   */
  exposeHeaders: [],

  /**
   * Allow cookies/authorization headers on cross-origin requests.
   */
  credentials: true,

  /**
   * Cache CORS preflight response for N seconds.
   */
  maxAge: 90,
})

export default corsConfig
