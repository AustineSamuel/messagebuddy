import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

/**
 * WhatsApp Web.js API routes — mirrors wwebjs Client features.
 * All routes require authentication.
 */
export function registerWhatsappRoutes() {
  router
    .group(() => {
      // Session / client lifecycle
      router
        .group(() => {
          router.post('initialize', [controllers.WhatsappSession, 'initialize'])
          router.get('/', [controllers.WhatsappSession, 'show'])
          router.get('state', [controllers.WhatsappSession, 'state'])
          router.get('qr', [controllers.WhatsappSession, 'qr'])
          router.post('pairing-code', [controllers.WhatsappSession, 'pairingCode'])
          router.get('info', [controllers.WhatsappSession, 'info'])
          router.get('wweb-version', [controllers.WhatsappSession, 'wwebVersion'])
          router.delete('/', [controllers.WhatsappSession, 'destroy'])
          router.post('logout', [controllers.WhatsappSession, 'logout'])
        })
        .prefix('session')

      // Chats
      router.get('chats', [controllers.WhatsappChats, 'index'])
      router.get('chats/:chatId', [controllers.WhatsappChats, 'show'])
      router.post('chats/:chatId/archive', [controllers.WhatsappChats, 'archive'])
      router.post('chats/:chatId/unarchive', [controllers.WhatsappChats, 'unarchive'])
      router.post('chats/:chatId/mute', [controllers.WhatsappChats, 'mute'])
      router.post('chats/:chatId/unmute', [controllers.WhatsappChats, 'unmute'])
      router.post('chats/:chatId/pin', [controllers.WhatsappChats, 'pin'])
      router.post('chats/:chatId/unpin', [controllers.WhatsappChats, 'unpin'])
      router.post('chats/:chatId/mark-unread', [controllers.WhatsappChats, 'markUnread'])
      router.post('chats/:chatId/clear-messages', [controllers.WhatsappChats, 'clearMessages'])
      router.delete('chats/:chatId', [controllers.WhatsappChats, 'destroy'])
      router.get('chats/:chatId/messages', [controllers.WhatsappChats, 'messages'])
      router.get('chats/:chatId/pinned-messages', [controllers.WhatsappChats, 'pinnedMessages'])
      router.post('chats/:chatId/ai-suggest-reply', [controllers.WhatsappChats, 'suggestAiReply'])
      router.post('chats/:chatId/messages', [controllers.WhatsappChats, 'sendMessage'])
      router.post('chats/:chatId/seen', [controllers.WhatsappChats, 'sendSeen'])
      router.post('chats/:chatId/typing', [controllers.WhatsappChats, 'sendTyping'])
      router.post('chats/:chatId/recording', [controllers.WhatsappChats, 'sendRecording'])
      router.post('chats/:chatId/sync-history', [controllers.WhatsappChats, 'syncHistory'])
      router.get('chats/:chatId/labels', [controllers.WhatsappChats, 'labels'])
      router.put('chats/:chatId/labels', [controllers.WhatsappChats, 'setLabels'])
      router.get('chats/:chatId/customer-note', [controllers.WhatsappChats, 'customerNote'])
      router.put('chats/:chatId/customer-note', [controllers.WhatsappChats, 'setCustomerNote'])

      // Messages
      router.get('messages/search', [controllers.WhatsappMessages, 'search'])
      router.post('messages', [controllers.WhatsappMessages, 'store'])
      router.get('messages/:messageId', [controllers.WhatsappMessages, 'show'])
      router.patch('messages/:messageId', [controllers.WhatsappMessages, 'update'])
      router.delete('messages/:messageId', [controllers.WhatsappMessages, 'destroy'])
      router.post('messages/:messageId/react', [controllers.WhatsappMessages, 'react'])
      router.post('messages/:messageId/reply', [controllers.WhatsappMessages, 'reply'])
      router.post('messages/:messageId/forward', [controllers.WhatsappMessages, 'forward'])
      router.get('messages/:messageId/media', [controllers.WhatsappMessages, 'media'])
      router.get('messages/:messageId/reactions', [controllers.WhatsappMessages, 'reactions'])
      router.get('messages/:messageId/poll-votes', [controllers.WhatsappMessages, 'pollVotes'])
      router.post('messages/:messageId/star', [controllers.WhatsappMessages, 'star'])
      router.post('messages/:messageId/unstar', [controllers.WhatsappMessages, 'unstar'])
      router.post('messages/:messageId/pin', [controllers.WhatsappMessages, 'pin'])
      router.post('messages/:messageId/unpin', [controllers.WhatsappMessages, 'unpin'])
      router.post('messages/:messageId/vote', [controllers.WhatsappMessages, 'vote'])

      // Contacts
      router.get('contacts', [controllers.WhatsappContacts, 'index'])
      router.get('contacts/blocked', [controllers.WhatsappContacts, 'blocked'])
      router.post('contacts/lookup-number', [controllers.WhatsappContacts, 'lookupNumber'])
      router.post('contacts/is-registered', [controllers.WhatsappContacts, 'isRegistered'])
      router.post('contacts/formatted-number', [controllers.WhatsappContacts, 'formattedNumber'])
      router.post('contacts/country-code', [controllers.WhatsappContacts, 'countryCode'])
      router.post('contacts/addressbook', [controllers.WhatsappContacts, 'saveAddressbook'])
      router.delete('contacts/addressbook', [controllers.WhatsappContacts, 'deleteAddressbook'])
      router.get('contacts/:contactId', [controllers.WhatsappContacts, 'show'])
      router.post('contacts/:contactId/block', [controllers.WhatsappContacts, 'block'])
      router.post('contacts/:contactId/unblock', [controllers.WhatsappContacts, 'unblock'])
      router.get('contacts/:contactId/profile-pic', [controllers.WhatsappContacts, 'profilePic'])
      router.get('contacts/:contactId/common-groups', [controllers.WhatsappContacts, 'commonGroups'])
      router.get('contacts/:contactId/about', [controllers.WhatsappContacts, 'about'])

      // Groups
      router.post('groups', [controllers.WhatsappGroups, 'store'])
      router.get('groups/invite/:inviteCode', [controllers.WhatsappGroups, 'inviteInfo'])
      router.post('groups/join', [controllers.WhatsappGroups, 'join'])
      router.post('groups/join-v4', [controllers.WhatsappGroups, 'joinV4'])
      router.get('groups/:groupId/invite-code', [controllers.WhatsappGroups, 'inviteCode'])
      router.post('groups/:groupId/revoke-invite', [controllers.WhatsappGroups, 'revokeInvite'])
      router.post('groups/:groupId/leave', [controllers.WhatsappGroups, 'leave'])
      router.post('groups/:groupId/participants/add', [controllers.WhatsappGroups, 'addParticipants'])
      router.post('groups/:groupId/participants/remove', [controllers.WhatsappGroups, 'removeParticipants'])
      router.post('groups/:groupId/participants/promote', [controllers.WhatsappGroups, 'promoteParticipants'])
      router.post('groups/:groupId/participants/demote', [controllers.WhatsappGroups, 'demoteParticipants'])
      router.patch('groups/:groupId/subject', [controllers.WhatsappGroups, 'setSubject'])
      router.patch('groups/:groupId/description', [controllers.WhatsappGroups, 'setDescription'])
      router.post('groups/:groupId/picture', [controllers.WhatsappGroups, 'setPicture'])
      router.delete('groups/:groupId/picture', [controllers.WhatsappGroups, 'deletePicture'])
      router.get('groups/:groupId/membership-requests', [controllers.WhatsappGroups, 'membershipRequests'])
      router.post('groups/:groupId/membership-requests/approve', [
        controllers.WhatsappGroups,
        'approveMembershipRequests',
      ])
      router.post('groups/:groupId/membership-requests/reject', [
        controllers.WhatsappGroups,
        'rejectMembershipRequests',
      ])
      router.patch('groups/:groupId/settings/info-admins-only', [
        controllers.WhatsappGroups,
        'setInfoAdminsOnly',
      ])
      router.patch('groups/:groupId/settings/messages-admins-only', [
        controllers.WhatsappGroups,
        'setMessagesAdminsOnly',
      ])
      router.patch('groups/:groupId/settings/add-members-admins-only', [
        controllers.WhatsappGroups,
        'setAddMembersAdminsOnly',
      ])

      // Channels
      router.get('channels', [controllers.WhatsappChannels, 'index'])
      router.post('channels', [controllers.WhatsappChannels, 'store'])
      router.post('channels/search', [controllers.WhatsappChannels, 'search'])
      router.get('channels/invite/:inviteCode', [controllers.WhatsappChannels, 'byInvite'])
      router.delete('channels/:channelId', [controllers.WhatsappChannels, 'destroy'])
      router.post('channels/:channelId/subscribe', [controllers.WhatsappChannels, 'subscribe'])
      router.post('channels/:channelId/unsubscribe', [controllers.WhatsappChannels, 'unsubscribe'])
      router.post('channels/:channelId/transfer-ownership', [
        controllers.WhatsappChannels,
        'transferOwnership',
      ])
      router.post('channels/:channelId/admin-invite', [controllers.WhatsappChannels, 'sendAdminInvite'])
      router.post('channels/:channelId/accept-admin-invite', [
        controllers.WhatsappChannels,
        'acceptAdminInvite',
      ])
      router.post('channels/:channelId/revoke-admin-invite', [
        controllers.WhatsappChannels,
        'revokeAdminInvite',
      ])
      router.post('channels/:channelId/demote-admin', [controllers.WhatsappChannels, 'demoteAdmin'])

      // Labels
      router.get('labels', [controllers.WhatsappLabels, 'index'])
      router.post('labels/assign', [controllers.WhatsappLabels, 'assign'])
      router.get('labels/:labelId', [controllers.WhatsappLabels, 'show'])
      router.get('labels/:labelId/chats', [controllers.WhatsappLabels, 'chats'])

      // Broadcasts
      router.get('broadcasts', [controllers.WhatsappBroadcasts, 'index'])
      router.get('broadcasts/:contactId', [controllers.WhatsappBroadcasts, 'show'])

      // Profile & presence
      router.patch('profile/display-name', [controllers.WhatsappProfile, 'setDisplayName'])
      router.patch('profile/status', [controllers.WhatsappProfile, 'setStatus'])
      router.post('profile/picture', [controllers.WhatsappProfile, 'setPicture'])
      router.delete('profile/picture', [controllers.WhatsappProfile, 'deletePicture'])
      router.post('presence/available', [controllers.WhatsappProfile, 'presenceAvailable'])
      router.post('presence/unavailable', [controllers.WhatsappProfile, 'presenceUnavailable'])
      router.post('status/:messageId/revoke', [controllers.WhatsappProfile, 'revokeStatus'])

      // Client settings
      router.patch('settings/auto-download/audio', [controllers.WhatsappSettings, 'autoDownloadAudio'])
      router.patch('settings/auto-download/documents', [
        controllers.WhatsappSettings,
        'autoDownloadDocuments',
      ])
      router.patch('settings/auto-download/photos', [controllers.WhatsappSettings, 'autoDownloadPhotos'])
      router.patch('settings/auto-download/videos', [controllers.WhatsappSettings, 'autoDownloadVideos'])
      router.patch('settings/background-sync', [controllers.WhatsappSettings, 'backgroundSync'])
    })
    .prefix('whatsapp')
    .as('whatsapp')
    .use(middleware.auth())
}
