import BusinessSetting, {
  type BusinessProduct,
  type BusinessTone,
} from '#models/business_setting'
import {
  isReservedBusinessSlug,
  suggestBusinessSlug,
  uniqueBusinessSlug,
} from '../../storefront/services/storefront_service.js'
import env from '#start/env'

export type BusinessSettingsPayload = {
  name: string
  description: string | null
  website: string | null
  address: string | null
  aiRules: string | null
  responseLanguage: string
  escalationRules: string | null
  tone: BusinessTone
  products: BusinessProduct[]
  slug: string | null
  phone: string | null
  logoUrl: string | null
  tagline: string | null
  seoTitle: string | null
  seoDescription: string | null
  accentColor: string
  publicStoreEnabled: boolean
  storeUrl: string | null
}

export type BusinessAiContext = Omit<BusinessSettingsPayload, 'storeUrl'>

const DEFAULT_SETTINGS: BusinessSettingsPayload = {
  name: '',
  description: null,
  website: null,
  address: null,
  aiRules: null,
  responseLanguage: 'auto',
  escalationRules: null,
  tone: 'professional',
  products: [],
  slug: null,
  phone: null,
  logoUrl: null,
  tagline: null,
  seoTitle: null,
  seoDescription: null,
  accentColor: '#25D366',
  publicStoreEnabled: true,
  storeUrl: null,
}

function frontendBaseUrl() {
  return (env.get('FRONTEND_URL') ?? env.get('APP_URL')).replace(/\/$/, '')
}

function buildStoreUrl(slug: string | null) {
  if (!slug) return null
  return `${frontendBaseUrl()}/${slug}`
}

function serializeRow(row: BusinessSetting): BusinessSettingsPayload {
  return {
    name: row.name,
    description: row.description,
    website: row.website,
    address: row.address,
    aiRules: row.aiRules,
    responseLanguage: row.responseLanguage,
    escalationRules: row.escalationRules,
    tone: row.tone,
    products: row.products ?? [],
    slug: row.slug,
    phone: row.phone,
    logoUrl: row.logoUrl,
    tagline: row.tagline,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    accentColor: row.accentColor ?? '#25D366',
    publicStoreEnabled: row.publicStoreEnabled ?? true,
    storeUrl: buildStoreUrl(row.slug),
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export default class BusinessSettingsService {
  static async getForUser(userId: number): Promise<BusinessSettingsPayload> {
    const row = await BusinessSetting.query().where('user_id', userId).first()
    return row ? serializeRow(row) : { ...DEFAULT_SETTINGS }
  }

  static async getAiContext(userId: number): Promise<BusinessAiContext> {
    const data = await this.getForUser(userId)
    const { storeUrl: _storeUrl, ...context } = data
    return context
  }

  static async upsert(userId: number, data: Partial<BusinessSettingsPayload>) {
    const existing = await BusinessSetting.query().where('user_id', userId).first()

    const slug = await this.resolveSlug(userId, existing, data)

    const values = {
      name: data.name ?? existing?.name ?? DEFAULT_SETTINGS.name,
      description:
        data.description !== undefined ? data.description : (existing?.description ?? null),
      website: data.website !== undefined ? data.website : (existing?.website ?? null),
      address: data.address !== undefined ? data.address : (existing?.address ?? null),
      aiRules: data.aiRules !== undefined ? data.aiRules : (existing?.aiRules ?? null),
      responseLanguage:
        data.responseLanguage ?? existing?.responseLanguage ?? DEFAULT_SETTINGS.responseLanguage,
      escalationRules:
        data.escalationRules !== undefined
          ? data.escalationRules
          : (existing?.escalationRules ?? null),
      tone: (data.tone ?? existing?.tone ?? DEFAULT_SETTINGS.tone) as BusinessTone,
      products: data.products ?? existing?.products ?? DEFAULT_SETTINGS.products,
      slug,
      phone: data.phone !== undefined ? data.phone : (existing?.phone ?? null),
      logoUrl: data.logoUrl !== undefined ? data.logoUrl : (existing?.logoUrl ?? null),
      tagline: data.tagline !== undefined ? data.tagline : (existing?.tagline ?? null),
      seoTitle: data.seoTitle !== undefined ? data.seoTitle : (existing?.seoTitle ?? null),
      seoDescription:
        data.seoDescription !== undefined
          ? data.seoDescription
          : (existing?.seoDescription ?? null),
      accentColor:
        data.accentColor !== undefined
          ? data.accentColor
          : (existing?.accentColor ?? DEFAULT_SETTINGS.accentColor),
      publicStoreEnabled:
        data.publicStoreEnabled !== undefined
          ? data.publicStoreEnabled
          : (existing?.publicStoreEnabled ?? true),
    }

    if (existing) {
      existing.merge(values)
      await existing.save()
      return serializeRow(existing)
    }

    const created = await BusinessSetting.create({ userId, ...values })
    return serializeRow(created)
  }

  /** Keep or auto-generate slug; empty slug in payload must not wipe an existing slug. */
  private static async resolveSlug(
    userId: number,
    existing: BusinessSetting | null,
    data: Partial<BusinessSettingsPayload>
  ) {
    const name = (data.name ?? existing?.name)?.trim()

    if (data.slug !== undefined) {
      const raw = (data.slug ?? '').trim().toLowerCase()
      if (raw) {
        const normalized = slugify(raw)
        if (!normalized || isReservedBusinessSlug(normalized)) {
          throw new Error('That store URL is not available. Choose a different name.')
        }
        return uniqueBusinessSlug(userId, normalized, userId)
      }

      if (existing?.slug) return existing.slug
      if (name) return uniqueBusinessSlug(userId, suggestBusinessSlug(name), userId)
      return null
    }

    if (existing?.slug) return existing.slug
    if (name) return uniqueBusinessSlug(userId, suggestBusinessSlug(name), userId)
    return null
  }
}
