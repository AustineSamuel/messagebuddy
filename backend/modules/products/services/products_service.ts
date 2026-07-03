import env from '#start/env'
import Product, { type ProductStock } from '#models/product'

export type ProductPayload = {
  id: number
  name: string
  slug: string
  description: string | null
  price: string
  currency: string
  emoji: string | null
  stock: ProductStock
  images: string[]
  totalSold: number
  active: boolean
  checkoutUrl: string
  createdAt: string
  updatedAt: string | null
}

export type ProductInput = {
  name: string
  description?: string | null
  price: number | string
  currency?: string
  emoji?: string | null
  stock?: ProductStock
  images?: string[]
  totalSold?: number
  active?: boolean
}

export type AiProduct = {
  name: string
  slug: string
  description: string | null
  price: string
  stock: string
  emoji?: string
  checkoutUrl: string
}

function frontendBaseUrl() {
  return (env.get('FRONTEND_URL') ?? env.get('APP_URL')).replace(/\/$/, '')
}

export function buildProductCheckoutUrl(
  userId: number,
  slug: string,
  businessSlug?: string | null
) {
  if (businessSlug) {
    return `${frontendBaseUrl()}/${businessSlug}/${slug}`
  }
  return `${frontendBaseUrl()}/shop/${userId}/${slug}`
}

function serializeRow(row: Product, businessSlug?: string | null): ProductPayload {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: String(row.price),
    currency: row.currency,
    emoji: row.emoji,
    stock: row.stock,
    images: row.images ?? [],
    totalSold: row.totalSold,
    active: row.active,
    checkoutUrl: buildProductCheckoutUrl(row.userId, row.slug, businessSlug),
    createdAt: row.createdAt.toISO()!,
    updatedAt: row.updatedAt?.toISO() ?? null,
  }
}

function toAiProduct(row: Product, businessSlug?: string | null): AiProduct {
  return {
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: formatPrice(row.price, row.currency),
    stock: row.stock,
    emoji: row.emoji ?? undefined,
    checkoutUrl: buildProductCheckoutUrl(row.userId, row.slug, businessSlug),
  }
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `product-${Date.now()}`
}

async function uniqueSlug(userId: number, base: string, excludeId?: number) {
  let slug = base
  let n = 1
  while (true) {
    const q = Product.query().where('user_id', userId).where('slug', slug)
    if (excludeId) q.whereNot('id', excludeId)
    const exists = await q.first()
    if (!exists) return slug
    slug = `${base}-${n++}`
  }
}

async function businessSlugForUser(userId: number) {
  const BusinessSetting = (await import('#models/business_setting')).default
  const row = await BusinessSetting.query().where('user_id', userId).first()
  return row?.slug && row.publicStoreEnabled ? row.slug : null
}

export function formatPrice(price: string | number, currency: string) {
  const amount = Number(price)
  if (currency === 'NGN') return `₦${amount.toLocaleString('en-NG')}`
  return `${currency} ${amount.toLocaleString()}`
}

export default class ProductsService {
  static async listForUser(userId: number) {
    const businessSlug = await businessSlugForUser(userId)
    const rows = await Product.query()
      .where('user_id', userId)
      .orderBy('updated_at', 'desc')
    return rows.map((row) => serializeRow(row, businessSlug))
  }

  static async listPublicForUser(userId: number, businessSlug?: string | null) {
    const rows = await Product.query()
      .where('user_id', userId)
      .where('active', true)
      .orderBy('updated_at', 'desc')
    return rows.map((row) => serializeRow(row, businessSlug))
  }

  static async getActiveForAi(userId: number): Promise<AiProduct[]> {
    const businessSlug = await businessSlugForUser(userId)
    const rows = await Product.query()
      .where('user_id', userId)
      .where('active', true)
      .orderBy('total_sold', 'desc')
    return rows.map((row) => toAiProduct(row, businessSlug))
  }

  static async getForUser(userId: number, id: number) {
    const businessSlug = await businessSlugForUser(userId)
    const row = await Product.query().where('user_id', userId).where('id', id).first()
    if (!row) throw new Error('Product not found.')
    return serializeRow(row, businessSlug)
  }

  static async getPublicProduct(userId: number, slug: string, businessSlug?: string | null) {
    const row = await Product.query()
      .where('user_id', userId)
      .where('slug', slug)
      .where('active', true)
      .first()
    if (!row) throw new Error('Product not found.')
    return serializeRow(row, businessSlug ?? (await businessSlugForUser(userId)))
  }

  static async create(userId: number, data: ProductInput) {
    const baseSlug = slugify(data.name)
    const slug = await uniqueSlug(userId, baseSlug)
    const row = await Product.create({
      userId,
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      price: String(data.price),
      currency: data.currency ?? 'NGN',
      emoji: data.emoji ?? null,
      stock: data.stock ?? 'in',
      images: data.images ?? [],
      totalSold: data.totalSold ?? 0,
      active: data.active ?? true,
    })
    const businessSlug = await businessSlugForUser(userId)
    return serializeRow(row, businessSlug)
  }

  static async update(userId: number, id: number, data: Partial<ProductInput>) {
    const row = await Product.query().where('user_id', userId).where('id', id).first()
    if (!row) throw new Error('Product not found.')

    if (data.name !== undefined) {
      row.name = data.name.trim()
      if (data.name.trim()) {
        row.slug = await uniqueSlug(userId, slugify(data.name), row.id)
      }
    }
    if (data.description !== undefined) row.description = data.description?.trim() || null
    if (data.price !== undefined) row.price = String(data.price)
    if (data.currency !== undefined) row.currency = data.currency
    if (data.emoji !== undefined) row.emoji = data.emoji
    if (data.stock !== undefined) row.stock = data.stock
    if (data.images !== undefined) row.images = data.images
    if (data.totalSold !== undefined) row.totalSold = data.totalSold
    if (data.active !== undefined) row.active = data.active

    await row.save()
    const businessSlug = await businessSlugForUser(userId)
    return serializeRow(row, businessSlug)
  }

  static async delete(userId: number, id: number) {
    const row = await Product.query().where('user_id', userId).where('id', id).first()
    if (!row) throw new Error('Product not found.')
    await row.delete()
    return { deleted: true }
  }

  /** Keyword search for AI — matches customer message against catalog. */
  static searchForMessage(message: string, catalog: AiProduct[]): AiProduct[] {
    const text = message.toLowerCase().trim()
    if (!text || !catalog.length) return []

    const words = text.split(/[^a-z0-9]+/i).filter((w) => w.length > 2)
    const hasShoppingIntent = this.isShoppingIntent(text)

    const scored = catalog.map((product) => {
      const hay = `${product.name} ${product.description ?? ''} ${product.slug}`.toLowerCase()
      let score = 0

      for (const word of words) {
        if (hay.includes(word)) score += 2
      }

      if (text.length > 3 && hay.includes(text)) score += 8

      const nameWords = product.name.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
      for (const nameWord of nameWords) {
        if (text.includes(nameWord)) score += 4
      }

      if (product.slug && text.includes(product.slug.replace(/-/g, ' '))) score += 5

      if (hasShoppingIntent && score > 0) score += 2

      return { product, score }
    })

    const minScore = hasShoppingIntent ? 2 : 3

    return scored
      .filter((item) => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.product)
  }

  static isShoppingIntent(message: string): boolean {
    return /\b(buy|purchase|order|price|prices|cost|how much|available|in stock|out of stock|do you (have|sell)|looking for|interested in|want to get|need|checkout|catalog|product|products|item|items|sell|selling|ship|delivery)\b/i.test(
      message
    )
  }

  /** Load active catalog from DB and match against a customer message. */
  static async searchActiveForCustomerMessage(
    userId: number,
    message: string
  ): Promise<AiProduct[]> {
    const catalog = await this.getActiveForAi(userId)
    return this.searchForMessage(message, catalog)
  }

  static async recordCheckoutIntent(userId: number, slug: string, businessSlug?: string | null) {
    const row = await Product.query()
      .where('user_id', userId)
      .where('slug', slug)
      .where('active', true)
      .first()
    if (!row) throw new Error('Product not found.')
    row.totalSold += 1
    await row.save()
    return serializeRow(row, businessSlug ?? (await businessSlugForUser(userId)))
  }
}
