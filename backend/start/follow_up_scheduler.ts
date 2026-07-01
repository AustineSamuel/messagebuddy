import logger from '@adonisjs/core/services/logger'
import FollowUpService from '../modules/follow_ups/services/follow_up_service.js'

const TICK_MS = 60_000
/** Wait after boot so migrations / HTTP traffic can release pool connections first. */
const BOOT_DELAY_MS = 15_000

let timer: ReturnType<typeof setInterval> | null = null
let bootTimer: ReturnType<typeof setTimeout> | null = null
let tickInFlight = false

async function runTick() {
  if (tickInFlight) {
    logger.debug('Follow-up scheduler tick skipped — previous tick still running')
    return
  }

  tickInFlight = true
  try {
    await FollowUpService.processDueFollowUps()
  } finally {
    tickInFlight = false
  }
}

export function startFollowUpScheduler() {
  if (timer) return

  bootTimer = setTimeout(() => {
    bootTimer = null
    void runTick()
  }, BOOT_DELAY_MS)

  timer = setInterval(() => {
    void runTick()
  }, TICK_MS)
}

export function stopFollowUpScheduler() {
  if (bootTimer) {
    clearTimeout(bootTimer)
    bootTimer = null
  }
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  tickInFlight = false
}
