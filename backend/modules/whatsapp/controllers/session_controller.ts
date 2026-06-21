import type { HttpContext } from '@adonisjs/core/http'
import { getAuthUserId, requireReadyClient, requireSession } from '../helpers/whatsapp_context.js'
import WhatsAppService from '../services/whatsapp_service.js'

function handleError(error: unknown, response: HttpContext['response']) {
  const message = error instanceof Error ? error.message : 'WhatsApp request failed.'
  const status = message.includes('not connected') ? 503 : 400
  return response.status(status).json({ error: message })
}

export default class WhatsappSessionController {
  async initialize({ auth, serialize, response }: HttpContext) {
    try {
      const userId = getAuthUserId({ auth } as HttpContext)
      const session = await WhatsAppService.initialize(userId)
      return serialize(WhatsAppService.getSession(userId))
    } catch (error) {
      return handleError(error, response)
    }
  }

  async show({ auth, serialize }: HttpContext) {
    const userId = getAuthUserId({ auth } as HttpContext)
    return serialize(WhatsAppService.getSession(userId))
  }

  async state({ auth, serialize, response }: HttpContext) {
    try {
      const userId = getAuthUserId({ auth } as HttpContext)
      const state = await WhatsAppService.getState(userId)
      return serialize({ state })
    } catch (error) {
      return handleError(error, response)
    }
  }

  async qr({ auth, serialize }: HttpContext) {
    const { session } = requireSession({ auth } as HttpContext)
    return serialize({ qr: session.qr, status: session.status })
  }

  async destroy({ auth, serialize, response }: HttpContext) {
    try {
      const userId = getAuthUserId({ auth } as HttpContext)
      await WhatsAppService.destroy(userId)
      return serialize({ destroyed: true })
    } catch (error) {
      return handleError(error, response)
    }
  }

  async logout({ auth, serialize, response }: HttpContext) {
    try {
      const userId = getAuthUserId({ auth } as HttpContext)
      await WhatsAppService.logout(userId)
      return serialize({ loggedOut: true })
    } catch (error) {
      return handleError(error, response)
    }
  }

  async pairingCode({ auth, request, serialize, response }: HttpContext) {
    try {
      const userId = getAuthUserId({ auth } as HttpContext)
      const { phoneNumber, showNotification } = request.only(['phoneNumber', 'showNotification'])
      const code = await WhatsAppService.requestPairingCode(
        userId,
        phoneNumber,
        showNotification ?? true
      )
      return serialize({ pairingCode: code })
    } catch (error) {
      return handleError(error, response)
    }
  }

  async info({ auth, serialize, response }: HttpContext) {
    try {
      const userId = getAuthUserId({ auth } as HttpContext)
      return serialize(await WhatsAppService.getClientInfo(userId))
    } catch (error) {
      return handleError(error, response)
    }
  }

  async wwebVersion({ auth, serialize, response }: HttpContext) {
    try {
      const userId = getAuthUserId({ auth } as HttpContext)
      const version = await WhatsAppService.getWWebVersion(userId)
      return serialize({ version })
    } catch (error) {
      return handleError(error, response)
    }
  }
}
