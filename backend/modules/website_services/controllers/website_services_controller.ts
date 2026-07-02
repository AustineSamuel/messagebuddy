import type { HttpContext } from '@adonisjs/core/http'
import WebsiteServicesService, {
  type CreateWebsiteOrderInput,
} from '../services/website_services_service.js'

function getUserId(ctx: HttpContext) {
  return ctx.auth.getUserOrFail().id
}

export default class WebsiteServicesController {
  /** GET /api/v1/website-services/packages */
  async packages(ctx: HttpContext) {
    return ctx.serialize(WebsiteServicesService.listPackages())
  }

  /** GET /api/v1/website-services/orders — current user's orders */
  async myOrders(ctx: HttpContext) {
    return ctx.serialize(await WebsiteServicesService.listOrdersForUser(getUserId(ctx)))
  }

  /** POST /api/v1/website-services/orders */
  async store(ctx: HttpContext) {
    const body = ctx.request.body() as CreateWebsiteOrderInput
    if (!body.packageId) {
      return ctx.response.badRequest({ message: 'Package is required.' })
    }
    if (!body.paymentMethod || !['pay_now', 'contact_me'].includes(body.paymentMethod)) {
      return ctx.response.badRequest({ message: 'Choose pay now or contact me.' })
    }

    try {
      const result = await WebsiteServicesService.createOrder(getUserId(ctx), body)
      return ctx.response.created(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not submit order.'
      return ctx.response.badRequest({ message })
    }
  }

  /**
   * GET /api/v1/website-services/orders/admin
   * Header: X-Website-Orders-Secret: <WEBSITE_ORDERS_ADMIN_SECRET>
   */
  async adminIndex(ctx: HttpContext) {
    const secret = ctx.request.header('x-website-orders-secret')
    if (!WebsiteServicesService.verifyAdminSecret(secret)) {
      return ctx.response.unauthorized({ message: 'Invalid or missing admin secret.' })
    }
    return ctx.serialize(await WebsiteServicesService.listAllOrdersAdmin())
  }
}
