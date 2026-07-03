import type { HttpContext } from '@adonisjs/core/http'
import ProductsService, { type ProductInput } from '../services/products_service.js'
import BusinessSettingsService from '../../business_settings/services/business_settings_service.js'

function getUserId(ctx: HttpContext) {
  return ctx.auth.getUserOrFail().id
}

export default class ProductsController {
  /** GET /api/v1/products */
  async index(ctx: HttpContext) {
    return ctx.serialize(await ProductsService.listForUser(getUserId(ctx)))
  }

  /** GET /api/v1/products/:id */
  async show(ctx: HttpContext) {
    const id = Number(ctx.params.id)
    if (!Number.isFinite(id)) {
      return ctx.response.badRequest({ message: 'Invalid product id.' })
    }
    try {
      return ctx.serialize(await ProductsService.getForUser(getUserId(ctx), id))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Not found'
      return ctx.response.notFound({ message })
    }
  }

  /** POST /api/v1/products */
  async store(ctx: HttpContext) {
    const body = ctx.request.body() as ProductInput
    if (!body.name?.trim()) {
      return ctx.response.badRequest({ message: 'Product name is required.' })
    }
    try {
      const product = await ProductsService.create(getUserId(ctx), body)
      return ctx.response.created(product)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create product.'
      return ctx.response.badRequest({ message })
    }
  }

  /** PUT /api/v1/products/:id */
  async update(ctx: HttpContext) {
    const id = Number(ctx.params.id)
    if (!Number.isFinite(id)) {
      return ctx.response.badRequest({ message: 'Invalid product id.' })
    }
    try {
      return ctx.serialize(await ProductsService.update(getUserId(ctx), id, ctx.request.body()))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update product.'
      return ctx.response.notFound({ message })
    }
  }

  /** DELETE /api/v1/products/:id */
  async destroy(ctx: HttpContext) {
    const id = Number(ctx.params.id)
    if (!Number.isFinite(id)) {
      return ctx.response.badRequest({ message: 'Invalid product id.' })
    }
    try {
      return ctx.serialize(await ProductsService.delete(getUserId(ctx), id))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete product.'
      return ctx.response.notFound({ message })
    }
  }

  /** GET /api/v1/store/:userId/products/:slug — public storefront */
  async publicShow(ctx: HttpContext) {
    const userId = Number(ctx.params.userId)
    const slug = String(ctx.params.slug ?? '')
    if (!Number.isFinite(userId) || !slug) {
      return ctx.response.badRequest({ message: 'Invalid store link.' })
    }
    try {
      const product = await ProductsService.getPublicProduct(userId, slug)
      const business = await BusinessSettingsService.getForUser(userId)
      return ctx.serialize({
        product,
        seller: {
          name: business.name,
          website: business.website,
          phone: business.phone,
          slug: business.slug,
          storeUrl: business.storeUrl,
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Product not found.'
      return ctx.response.notFound({ message })
    }
  }

  /** POST /api/v1/store/:userId/products/:slug/checkout — public checkout intent */
  async checkoutIntent(ctx: HttpContext) {
    const userId = Number(ctx.params.userId)
    const slug = String(ctx.params.slug ?? '')
    if (!Number.isFinite(userId) || !slug) {
      return ctx.response.badRequest({ message: 'Invalid store link.' })
    }
    try {
      const product = await ProductsService.recordCheckoutIntent(userId, slug)
      return ctx.serialize({ ok: true, product })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed.'
      return ctx.response.notFound({ message })
    }
  }
}
