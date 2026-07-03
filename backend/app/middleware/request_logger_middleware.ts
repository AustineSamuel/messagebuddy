import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import logger from '@adonisjs/core/services/logger'

function headerValue(value: string | number | string[] | undefined): string | undefined {
  if (value === undefined) return undefined
  if (Array.isArray(value)) return value[0]
  return String(value)
}

function responseType(ctx: HttpContext): string {
  const fromAdonis = headerValue(ctx.response.getHeader('content-type'))
  if (fromAdonis) return fromAdonis.split(';')[0]?.trim() || '-'

  const fromNode = headerValue(ctx.response.response.getHeader('content-type') as string | undefined)
  if (fromNode) return fromNode.split(';')[0]?.trim() || '-'

  return '-'
}

function responseLength(ctx: HttpContext): number {
  const fromAdonis = headerValue(ctx.response.getHeader('content-length'))
  if (fromAdonis) return Number(fromAdonis) || 0

  const fromNode = headerValue(
    ctx.response.response.getHeader('content-length') as string | undefined
  )
  if (fromNode) return Number(fromNode) || 0

  const body = ctx.response.getBody()
  if (body === undefined || body === null) return 0
  if (typeof body === 'string') return Buffer.byteLength(body, 'utf8')
  if (Buffer.isBuffer(body)) return body.length
  try {
    return Buffer.byteLength(JSON.stringify(body), 'utf8')
  } catch {
    return 0
  }
}

/** Logs method, URL, status, response content-type, body length, and client IP. */
export default class RequestLoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await next()

    try {
      const method = ctx.request.method()
      const url = ctx.request.url()
      const status = ctx.response.getStatus()
      const type = responseType(ctx)
      const length = responseLength(ctx)
      const ip = ctx.request.ip()

      logger.info(`${method} ${url} status=${status} type=${type} length=${length} ip=${ip}`)
    } catch (error) {
      logger.debug({ err: error }, 'Request log skipped')
    }
  }
}
