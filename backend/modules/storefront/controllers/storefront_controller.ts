import type { HttpContext } from '@adonisjs/core/http'
import StorefrontService from '../services/storefront_service.js'

export default class StorefrontController {
  /** GET /api/v1/store/business/:businessSlug */
  async showBusiness(ctx: HttpContext) {
    try {
      return ctx.serialize(await StorefrontService.getPublicStorefront(ctx.params.businessSlug))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Store not found.'
      return ctx.response.notFound({ message })
    }
  }

  /** GET /api/v1/store/business/:businessSlug/products/:productSlug */
  async showProduct(ctx: HttpContext) {
    try {
      return ctx.serialize(
        await StorefrontService.getPublicProduct(
          ctx.params.businessSlug,
          ctx.params.productSlug
        )
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Product not found.'
      return ctx.response.notFound({ message })
    }
  }

  /** POST /api/v1/store/business/:businessSlug/products/:productSlug/checkout */
  async checkout(ctx: HttpContext) {
    try {
      const result = await StorefrontService.recordCheckoutIntent(
        ctx.params.businessSlug,
        ctx.params.productSlug
      )
      return ctx.serialize({ ok: true, ...result })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed.'
      return ctx.response.notFound({ message })
    }
  }
}
