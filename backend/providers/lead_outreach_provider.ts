import type { ApplicationService } from '@adonisjs/core/types'
import {
  startLeadOutreachScheduler,
  stopLeadOutreachScheduler,
} from '#start/lead_outreach_scheduler'

export default class LeadOutreachProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    if (this.app.getEnvironment() === 'web') startLeadOutreachScheduler()
  }

  async shutdown() {
    stopLeadOutreachScheduler()
  }
}
