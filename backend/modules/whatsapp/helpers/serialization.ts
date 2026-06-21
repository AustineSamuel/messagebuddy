import type { Chat, Contact, Message } from 'whatsapp-web.js'

export function serializeId(id: unknown): string {
  if (typeof id === 'string') return id
  if (id && typeof id === 'object' && '_serialized' in id) {
    return String((id as { _serialized: string })._serialized)
  }
  return String(id)
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

export function serializeMessage(message: Message) {
  return {
    id: serializeId(message.id),
    body: message.body,
    type: message.type,
    timestamp: message.timestamp,
    from: message.from,
    to: message.to,
    fromMe: message.fromMe,
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
}

export function serializeChat(chat: Chat) {
  return {
    id: serializeId(chat.id),
    name: chat.name,
    isGroup: chat.isGroup,
    isReadOnly: chat.isReadOnly,
    unreadCount: chat.unreadCount,
    timestamp: chat.timestamp,
    archived: chat.archived,
    pinned: chat.pinned,
    isMuted: chat.isMuted,
    muteExpiration: chat.muteExpiration,
    lastMessage: chat.lastMessage ? serializeMessage(chat.lastMessage) : null,
  }
}

export async function serializeGroupChat(group: Chat) {
  const base = serializeChat(group)
  const g = group as Chat & {
    description?: string
    owner?: unknown
    participants?: Array<{ id: unknown; isAdmin?: boolean; isSuperAdmin?: boolean }>
    createdAt?: unknown
  }

  return {
    ...base,
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
