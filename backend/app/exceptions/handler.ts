import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'

function isTransientNetworkReset(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const e = error as { code?: string; syscall?: string }
  return (
    e.code === 'ECONNRESET' ||
    e.code === 'EPIPE' ||
    e.code === 'ECONNABORTED' ||
    (e.code === 'ETIMEDOUT' && e.syscall === 'read')
  )
}

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (isTransientNetworkReset(error)) {
      return ctx.response.serviceUnavailable({
        error:
          'The database connection dropped momentarily. Please try your request again.',
        message:
          'The database connection dropped momentarily. Please try your request again.',
      })
    }
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
