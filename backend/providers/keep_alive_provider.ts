import type { ApplicationService } from '@adonisjs/core/types'
import { startKeepAliveScheduler, stopKeepAliveScheduler } from '#start/keep_alive_scheduler'

export default class KeepAliveProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    if (this.app.getEnvironment() === 'web') {
      startKeepAliveScheduler()
    }
  }

  async shutdown() {
    stopKeepAliveScheduler()
  }
}
