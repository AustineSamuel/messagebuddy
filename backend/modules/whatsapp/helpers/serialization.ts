import type { Chat, Contact, Message } from 'whatsapp-web.js'
import type { ReactionList } from 'whatsapp-web.js'

export type SerializedQuotedMessage = {
  id: string
  body: string
  type: string
  fromMe: boolean
  hasMedia: boolean
}

export type SerializedReaction = {
  emoji: string
  count: number
  fromMe: boolean
}

export function serializeId(id: unknown): string {
  if (typeof id === 'string') return id
  if (id && typeof id === 'object' && '_serialized' in id) {
    return String((id as { _serialized: string })._serialized)
  }
  return String(id)
}

function idToDisplayName(chatId: string) {
  const local = chatId.split('@')[0] ?? chatId
  return local.replace(/\D/g, '').length >= 6 ? local.replace(/\D/g, '') : local
}

type SerializedMessage = {
  id: string
  body: string
  type: string
  timestamp: number
  from: string
  to: string
  fromMe: boolean
  author: string | null
  hasMedia: boolean
  hasQuotedMsg: boolean
  quotedMessage?: SerializedQuotedMessage | null
  isForwarded: boolean
  isStarred: boolean
  isStatus: boolean
  ack: number
  deviceType: string
  mentionedIds?: string[]
  links?: unknown
  location?: unknown
  vCards?: unknown
}

function messagePreviewBody(message: { body?: string; type?: string; hasMedia?: boolean }) {
  if (message.body?.trim()) return message.body.trim()
  if (message.hasMedia && isAudioMessageType(message.type)) return ''
  if (message.hasMedia) return `[${message.type || 'media'}]`
  return `[${message.type || 'message'}]`
}

export function isAudioMessageType(type?: string) {
  const normalized = (type || '').toLowerCase()
  return normalized === 'ptt' || normalized === 'audio' || normalized === 'voice'
}

/** Resolve display title per wwebjs Chat + Contact APIs (formattedTitle is often empty for DMs). */
export async function resolveChatDisplayName(chat: Chat, chatId: string, resolvedContact?: Contact | null) {
  const title = chat.name?.trim()
  if (title) return title

  if (!chat.isGroup) {
    try {
      const contact = resolvedContact ?? (await chat.getContact())
      const fromContact =
        contact.name?.trim() ||
        contact.pushname?.trim() ||
        contact.shortName?.trim() ||
        contact.number?.trim() ||
        ''
      if (fromContact) return fromContact
    } catch {
      // contact lookup is best-effort
    }
  }

  if (chat.isGroup) return 'Group chat'
  return idToDisplayName(chatId) || chatId
}

export function serializeContact(
  contact: Contact,
  enrichment?: { number?: string | null; profilePicUrl?: string | null }
) {
  return {
    id: serializeId(contact.id),
    number: enrichment?.number ?? contact.number,
    profilePicUrl: enrichment?.profilePicUrl ?? null,
    name: contact.name,
    pushname: contact.pushname,
    shortName: contact.shortName,
    isMe: contact.isMe,
    isUser: contact.isUser,
    isGroup: contact.isGroup,
    isWAContact: contact.isWAContact,
    isMyContact: contact.isMyContact,
    isBlocked: contact.isBlocked,
    isBusiness: contact.isBusiness,
    isEnterprise: contact.isEnterprise,
  }
}

export function serializeReactions(reactionLists: ReactionList[]): SerializedReaction[] {
  return reactionLists
    .filter((entry) => entry.aggregateEmoji)
    .map((entry) => ({
      emoji: entry.aggregateEmoji,
      count: entry.senders?.length ?? 0,
      fromMe: entry.hasReactionByMe,
    }))
}

export async function serializeMessageForApi(message: Message): Promise<SerializedMessage> {
  const base = serializeMessage(message)

  if (!message.hasQuotedMsg) return base

  try {
    const quoted = await message.getQuotedMessage()
    return {
      ...base,
      quotedMessage: {
        id: serializeId(quoted.id),
        body: messagePreviewBody({
          body: quoted.body,
          type: quoted.type,
          hasMedia: quoted.hasMedia,
        }),
        type: quoted.type,
        fromMe: quoted.fromMe,
        hasMedia: quoted.hasMedia,
      },
    }
  } catch {
    return base
  }
}

export function serializeMessage(message: Message): SerializedMessage {
  const serialized = {
    id: serializeId(message.id),
    body: message.body,
    type: message.type,
    timestamp: message.timestamp,
    from: message.from,
    to: message.to,
    fromMe: message.fromMe,
    author: message.author ?? null,
    hasMedia: message.hasMedia,
    hasQuotedMsg: message.hasQuotedMsg,
    isForwarded: message.isForwarded,
    isStarred: message.isStarred,
    isStatus: message.isStatus,
    ack: message.ack,
    deviceType: message.deviceType,
    mentionedIds: message.mentionedIds?.map(serializeId),
    links: message.links,
    location: message.location,
    vCards: message.vCards,
  }

  return {
    ...serialized,
    body: messagePreviewBody(serialized),
  }
}

export function serializeChat(chat: Chat) {
  const chatId = serializeId(chat.id)
  const lastMessage = chat.lastMessage ? serializeMessage(chat.lastMessage) : null

  return {
    id: chatId,
    name: chat.name ?? null,
    isGroup: chat.isGroup,
    isReadOnly: chat.isReadOnly,
    unreadCount: chat.unreadCount,
    timestamp: chat.timestamp,
    archived: chat.archived,
    pinned: chat.pinned,
    isMuted: chat.isMuted,
    muteExpiration: chat.muteExpiration,
    lastMessage,
  }
}

export async function serializeChatForApi(
  chat: Chat,
  enrichment?: { contact?: Contact | null; phone?: string | null; profilePicUrl?: string | null }
) {
  const base = serializeChat(chat)
  const name = await resolveChatDisplayName(chat, base.id, enrichment?.contact)
  return {
    ...base,
    name,
    phone: enrichment?.phone ?? null,
    profilePicUrl: enrichment?.profilePicUrl ?? null,
  }
}

export async function serializeGroupChat(
  group: Chat,
  enrichment?: { profilePicUrl?: string | null }
) {
  const base = await serializeChatForApi(group, enrichment)
  const g = group as Chat & {
    description?: string
    owner?: unknown
    participants?: Array<{ id: unknown; isAdmin?: boolean; isSuperAdmin?: boolean }>
    createdAt?: unknown
  }

  return {
    ...base,
    name: base.name || 'Group chat',
    description: g.description ?? null,
    owner: g.owner ? serializeId(g.owner) : null,
    createdAt: g.createdAt ?? null,
    participants:
      g.participants?.map((p) => ({
        id: serializeId(p.id),
        isAdmin: p.isAdmin,
        isSuperAdmin: p.isSuperAdmin,
      })) ?? [],
  }
}
