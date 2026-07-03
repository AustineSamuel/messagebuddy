import WhatsAppRealtimeHub from '../modules/whatsapp/services/whatsapp_realtime_hub.js'
import type { ApplicationService } from '@adonisjs/core/types'

export default class WebSocketProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    if (this.app.getEnvironment() !== 'web') return

    this.app.booted(async () => {
      const emitter = await this.app.container.make('emitter')
      const server = await this.app.container.make('server')

      emitter.on('http:server_ready', () => {
        const nodeServer = server.getNodeServer()
        if (!nodeServer) return
        WhatsAppRealtimeHub.attach(nodeServer)
      })
    })
  }

  async shutdown() {
    WhatsAppRealtimeHub.close()
  }
}
