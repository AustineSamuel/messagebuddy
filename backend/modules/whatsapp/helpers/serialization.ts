import type { Chat, Contact, Message } from 'whatsapp-web.js'

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
  if (message.hasMedia) return `[${message.type || 'media'}]`
  return `[${message.type || 'message'}]`
}

/** Resolve display title per wwebjs Chat + Contact APIs (formattedTitle is often empty for DMs). */
export async function resolveChatDisplayName(chat: Chat, chatId: string) {
  const title = chat.name?.trim()
  if (title) return title

  if (!chat.isGroup) {
    try {
      const contact = await chat.getContact()
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

export function serializeContact(contact: Contact) {
  return {
    id: serializeId(contact.id),
    number: contact.number,
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

export async function serializeChatForApi(chat: Chat) {
  const base = serializeChat(chat)
  const name = await resolveChatDisplayName(chat, base.id)
  return { ...base, name }
}

export async function serializeGroupChat(group: Chat) {
  const base = await serializeChatForApi(group)
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
