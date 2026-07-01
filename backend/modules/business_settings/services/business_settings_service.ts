import BusinessSetting, {
  type BusinessProduct,
  type BusinessTone,
} from '#models/business_setting'

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
}

export type BusinessAiContext = BusinessSettingsPayload

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
  }
}

export default class BusinessSettingsService {
  static async getForUser(userId: number): Promise<BusinessSettingsPayload> {
    const row = await BusinessSetting.query().where('user_id', userId).first()
    return row ? serializeRow(row) : { ...DEFAULT_SETTINGS }
  }

  static async getAiContext(userId: number): Promise<BusinessAiContext> {
    return this.getForUser(userId)
  }

  static async upsert(userId: number, data: Partial<BusinessSettingsPayload>) {
    const existing = await BusinessSetting.query().where('user_id', userId).first()

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
    }

    if (existing) {
      existing.merge(values)
      await existing.save()
      return serializeRow(existing)
    }

    const created = await BusinessSetting.create({ userId, ...values })
    return serializeRow(created)
  }
}
