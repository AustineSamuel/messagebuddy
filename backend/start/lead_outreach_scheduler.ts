import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import LeadOutreachService from '../modules/lead_outreach/services/lead_outreach_service.js'

const TICK_MS = 60 * 60 * 1000
let timer: ReturnType<typeof setInterval> | null = null
let running = false

function isLocalhost(host: string) {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

async function tick() {
  if (running) return
  running = true
  try {
    await LeadOutreachService.processDailySelection()
  } catch (error) {
    logger.error({ err: error }, 'Lead outreach scheduler failed')
  } finally {
    running = false
  }
}

export function startLeadOutreachScheduler() {
  if (timer) return
  if (env.get('LEAD_OUTREACH_ENABLED') !== true || !isLocalhost(env.get('HOST'))) return

  void tick()
  timer = setInterval(() => void tick(), TICK_MS)
}

export function stopLeadOutreachScheduler() {
  if (timer) clearInterval(timer)
  timer = null
}
