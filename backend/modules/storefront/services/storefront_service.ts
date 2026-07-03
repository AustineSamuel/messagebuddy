import BusinessSetting from '#models/business_setting'
import env from '#start/env'
import ProductsService, {
  formatPrice,
  type ProductPayload,
} from '../../products/services/products_service.js'

export const RESERVED_BUSINESS_SLUGS = new Set([
  'login',
  'register',
  'dashboard',
  'shop',
  'api',
  'admin',
  'settings',
  'products',
  'store',
  'manifest',
  'sw',
  'icon',
  'favicon',
  '_next',
])

export type PublicBusinessProfile = {
  slug: string
  name: string
  tagline: string | null
  description: string | null
  address: string | null
  phone: string | null
  website: string | null
  logoUrl: string | null
  accentColor: string
  seoTitle: string | null
  seoDescription: string | null
  storeUrl: string
}

export type PublicStorefront = {
  business: PublicBusinessProfile
  products: ProductPayload[]
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function isReservedBusinessSlug(slug: string) {
  return RESERVED_BUSINESS_SLUGS.has(slug.toLowerCase())
}

export async function uniqueBusinessSlug(_userId: number, base: string, excludeUserId?: number) {
  let slug = base
  let n = 1

  while (true) {
    if (isReservedBusinessSlug(slug)) {
      slug = `${base}-${n++}`
      continue
    }

    const q = BusinessSetting.query().where('slug', slug)
    if (excludeUserId) q.whereNot('user_id', excludeUserId)
    const exists = await q.first()
    if (!exists) return slug
    slug = `${base}-${n++}`
  }
}

export function suggestBusinessSlug(name: string) {
  const base = slugify(name) || `store-${Date.now()}`
  return isReservedBusinessSlug(base) ? `${base}-shop` : base
}

function serializePublicBusiness(row: BusinessSetting): PublicBusinessProfile {
  const frontendBase = (env.get('FRONTEND_URL') ?? env.get('APP_URL')).replace(/\/$/, '')
  const slug = row.slug ?? ''

  return {
    slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    address: row.address,
    phone: row.phone,
    website: row.website,
    logoUrl: row.logoUrl,
    accentColor: row.accentColor ?? '#25D366',
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    storeUrl: slug && frontendBase ? `${frontendBase}/${slug}` : '',
  }
}

export default class StorefrontService {
  static async resolveBusinessBySlug(businessSlug: string) {
    const slug = decodeURIComponent(businessSlug).trim().toLowerCase()
    if (!slug || isReservedBusinessSlug(slug)) {
      throw new Error('Store not found.')
    }

    const row = await BusinessSetting.query().where('slug', slug).first()
    if (!row || !row.publicStoreEnabled) {
      throw new Error('Store not found.')
    }

    return row
  }

  static async getPublicStorefront(businessSlug: string): Promise<PublicStorefront> {
    const row = await this.resolveBusinessBySlug(businessSlug)
    const products = await ProductsService.listPublicForUser(row.userId, row.slug)

    return {
      business: serializePublicBusiness(row),
      products,
    }
  }

  static async getPublicProduct(businessSlug: string, productSlug: string) {
    const row = await this.resolveBusinessBySlug(businessSlug)
    const product = await ProductsService.getPublicProduct(row.userId, productSlug, row.slug)

    return {
      business: serializePublicBusiness(row),
      product,
    }
  }

  static async recordCheckoutIntent(businessSlug: string, productSlug: string) {
    const row = await this.resolveBusinessBySlug(businessSlug)
    const product = await ProductsService.recordCheckoutIntent(row.userId, productSlug, row.slug)

    return {
      business: serializePublicBusiness(row),
      product,
    }
  }

  static whatsAppContactUrl(phone: string | null, message?: string) {
    if (!phone?.trim()) return null
    const digits = phone.replace(/\D/g, '')
    if (!digits) return null
    const text = message ? `?text=${encodeURIComponent(message)}` : ''
    return `https://wa.me/${digits}${text}`
  }

  static formatWhatsAppMessage(businessName: string, productName: string, price: string) {
    return `Hi ${businessName}, I'm interested in ${productName} (${price}).`
  }

  static formatProductPrice = formatPrice
}
