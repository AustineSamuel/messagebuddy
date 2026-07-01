import ChatRule, {
  DEFAULT_CHAT_RULE_ID,
  type ChatRuleType,
} from '#models/chat_rule'

export type ChatRulePayload = {
  chatId: string
  rule: ChatRuleType
  notes: string | null
  aiAutoReply: boolean
  sendCatalog: boolean
  notifyOnReply: boolean
  customInstructions: string | null
}

const DEFAULT_PAYLOAD: Omit<ChatRulePayload, 'chatId'> = {
  rule: 'default',
  notes: null,
  aiAutoReply: true,
  sendCatalog: false,
  notifyOnReply: true,
  customInstructions: null,
}

function serializeRow(row: ChatRule): ChatRulePayload {
  return {
    chatId: row.chatId,
    rule: row.rule,
    notes: row.notes,
    aiAutoReply: row.aiAutoReply,
    sendCatalog: row.sendCatalog,
    notifyOnReply: row.notifyOnReply,
    customInstructions: row.customInstructions,
  }
}

function emptyPayload(chatId: string): ChatRulePayload {
  return { chatId, ...DEFAULT_PAYLOAD }
}

export default class ChatRulesService {
  static async listForUser(userId: number) {
    const rows = await ChatRule.query().where('user_id', userId)
    const byChatId: Record<string, ChatRulePayload> = {}
    let defaultSettings = emptyPayload(DEFAULT_CHAT_RULE_ID)

    for (const row of rows) {
      const payload = serializeRow(row)
      if (row.chatId === DEFAULT_CHAT_RULE_ID) {
        defaultSettings = payload
      } else {
        byChatId[row.chatId] = payload
      }
    }

    return { default: defaultSettings, rules: byChatId }
  }

  static async getForChat(userId: number, chatId: string) {
    const [specific, defaultRow] = await Promise.all([
      ChatRule.query().where('user_id', userId).where('chat_id', chatId).first(),
      ChatRule.query()
        .where('user_id', userId)
        .where('chat_id', DEFAULT_CHAT_RULE_ID)
        .first(),
    ])

    const defaultPayload = defaultRow
      ? serializeRow(defaultRow)
      : emptyPayload(DEFAULT_CHAT_RULE_ID)

    if (!specific) {
      return {
        chatId,
        settings: emptyPayload(chatId),
        default: defaultPayload,
        isUsingDefault: true,
      }
    }

    return {
      chatId,
      settings: serializeRow(specific),
      default: defaultPayload,
      isUsingDefault: false,
    }
  }

  static async getDefault(userId: number) {
    const row = await ChatRule.query()
      .where('user_id', userId)
      .where('chat_id', DEFAULT_CHAT_RULE_ID)
      .first()

    return row ? serializeRow(row) : emptyPayload(DEFAULT_CHAT_RULE_ID)
  }

  static async upsert(
    userId: number,
    chatId: string,
    data: Partial<Omit<ChatRulePayload, 'chatId'>>
  ) {
    const existing = await ChatRule.query()
      .where('user_id', userId)
      .where('chat_id', chatId)
      .first()

    const values = {
      rule: (data.rule ?? existing?.rule ?? DEFAULT_PAYLOAD.rule) as ChatRuleType,
      notes: data.notes !== undefined ? data.notes : (existing?.notes ?? null),
      aiAutoReply:
        data.aiAutoReply !== undefined ? data.aiAutoReply : (existing?.aiAutoReply ?? true),
      sendCatalog:
        data.sendCatalog !== undefined ? data.sendCatalog : (existing?.sendCatalog ?? false),
      notifyOnReply:
        data.notifyOnReply !== undefined ? data.notifyOnReply : (existing?.notifyOnReply ?? true),
      customInstructions:
        data.customInstructions !== undefined
          ? data.customInstructions
          : (existing?.customInstructions ?? null),
    }

    if (existing) {
      existing.merge(values)
      await existing.save()
      return serializeRow(existing)
    }

    const created = await ChatRule.create({
      userId,
      chatId,
      ...values,
    })

    return serializeRow(created)
  }

  /**
   * Returns saved per-chat rules only. Does not fall back to __default__.
   * Used by server-side auto-reply — no row means no reply.
   */
  static async getSavedRuleForChat(
    userId: number,
    chatId: string
  ): Promise<ChatRulePayload | null> {
    if (chatId === DEFAULT_CHAT_RULE_ID) return null

    const row = await ChatRule.query().where('user_id', userId).where('chat_id', chatId).first()

    return row ? serializeRow(row) : null
  }
}
