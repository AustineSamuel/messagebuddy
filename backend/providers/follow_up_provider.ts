import type { ApplicationService } from '@adonisjs/core/types'
import { startFollowUpScheduler, stopFollowUpScheduler } from '#start/follow_up_scheduler'

export default class FollowUpProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    if (this.app.getEnvironment() === 'web') {
      startFollowUpScheduler()
    }
  }

  async shutdown() {
    stopFollowUpScheduler()
  }
}
