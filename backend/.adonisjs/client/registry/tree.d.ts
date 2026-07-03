/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessToken: {
      store: typeof routes['auth.access_token.store']
      destroy: typeof routes['auth.access_token.destroy']
    }
    firebaseAuths: {
      store: typeof routes['auth.firebase_auths.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
  }
  whatsapp: {
    whatsappSession: {
      initialize: typeof routes['whatsapp.whatsapp_session.initialize']
      show: typeof routes['whatsapp.whatsapp_session.show']
      state: typeof routes['whatsapp.whatsapp_session.state']
      qr: typeof routes['whatsapp.whatsapp_session.qr']
      pairingCode: typeof routes['whatsapp.whatsapp_session.pairing_code']
      info: typeof routes['whatsapp.whatsapp_session.info']
      wwebVersion: typeof routes['whatsapp.whatsapp_session.wweb_version']
      destroy: typeof routes['whatsapp.whatsapp_session.destroy']
      logout: typeof routes['whatsapp.whatsapp_session.logout']
    }
    whatsappChats: {
      listContactSummaries: typeof routes['whatsapp.whatsapp_chats.list_contact_summaries']
      index: typeof routes['whatsapp.whatsapp_chats.index']
      show: typeof routes['whatsapp.whatsapp_chats.show']
      archive: typeof routes['whatsapp.whatsapp_chats.archive']
      unarchive: typeof routes['whatsapp.whatsapp_chats.unarchive']
      mute: typeof routes['whatsapp.whatsapp_chats.mute']
      unmute: typeof routes['whatsapp.whatsapp_chats.unmute']
      pin: typeof routes['whatsapp.whatsapp_chats.pin']
      unpin: typeof routes['whatsapp.whatsapp_chats.unpin']
      markUnread: typeof routes['whatsapp.whatsapp_chats.mark_unread']
      clearMessages: typeof routes['whatsapp.whatsapp_chats.clear_messages']
      destroy: typeof routes['whatsapp.whatsapp_chats.destroy']
      messages: typeof routes['whatsapp.whatsapp_chats.messages']
      pinnedMessages: typeof routes['whatsapp.whatsapp_chats.pinned_messages']
      suggestAiReply: typeof routes['whatsapp.whatsapp_chats.suggest_ai_reply']
      sendMessage: typeof routes['whatsapp.whatsapp_chats.send_message']
      sendSeen: typeof routes['whatsapp.whatsapp_chats.send_seen']
      sendTyping: typeof routes['whatsapp.whatsapp_chats.send_typing']
      sendRecording: typeof routes['whatsapp.whatsapp_chats.send_recording']
      syncHistory: typeof routes['whatsapp.whatsapp_chats.sync_history']
      labels: typeof routes['whatsapp.whatsapp_chats.labels']
      setLabels: typeof routes['whatsapp.whatsapp_chats.set_labels']
      customerNote: typeof routes['whatsapp.whatsapp_chats.customer_note']
      setCustomerNote: typeof routes['whatsapp.whatsapp_chats.set_customer_note']
      contactSummary: typeof routes['whatsapp.whatsapp_chats.contact_summary']
      refreshContactSummary: typeof routes['whatsapp.whatsapp_chats.refresh_contact_summary']
    }
    whatsappMessages: {
      search: typeof routes['whatsapp.whatsapp_messages.search']
      store: typeof routes['whatsapp.whatsapp_messages.store']
      show: typeof routes['whatsapp.whatsapp_messages.show']
      update: typeof routes['whatsapp.whatsapp_messages.update']
      destroy: typeof routes['whatsapp.whatsapp_messages.destroy']
      react: typeof routes['whatsapp.whatsapp_messages.react']
      reply: typeof routes['whatsapp.whatsapp_messages.reply']
      forward: typeof routes['whatsapp.whatsapp_messages.forward']
      media: typeof routes['whatsapp.whatsapp_messages.media']
      transcribe: typeof routes['whatsapp.whatsapp_messages.transcribe']
      reactions: typeof routes['whatsapp.whatsapp_messages.reactions']
      pollVotes: typeof routes['whatsapp.whatsapp_messages.poll_votes']
      star: typeof routes['whatsapp.whatsapp_messages.star']
      unstar: typeof routes['whatsapp.whatsapp_messages.unstar']
      pin: typeof routes['whatsapp.whatsapp_messages.pin']
      unpin: typeof routes['whatsapp.whatsapp_messages.unpin']
      vote: typeof routes['whatsapp.whatsapp_messages.vote']
    }
    whatsappContacts: {
      index: typeof routes['whatsapp.whatsapp_contacts.index']
      blocked: typeof routes['whatsapp.whatsapp_contacts.blocked']
      lookupNumber: typeof routes['whatsapp.whatsapp_contacts.lookup_number']
      isRegistered: typeof routes['whatsapp.whatsapp_contacts.is_registered']
      formattedNumber: typeof routes['whatsapp.whatsapp_contacts.formatted_number']
      countryCode: typeof routes['whatsapp.whatsapp_contacts.country_code']
      saveAddressbook: typeof routes['whatsapp.whatsapp_contacts.save_addressbook']
      deleteAddressbook: typeof routes['whatsapp.whatsapp_contacts.delete_addressbook']
      show: typeof routes['whatsapp.whatsapp_contacts.show']
      block: typeof routes['whatsapp.whatsapp_contacts.block']
      unblock: typeof routes['whatsapp.whatsapp_contacts.unblock']
      profilePic: typeof routes['whatsapp.whatsapp_contacts.profile_pic']
      commonGroups: typeof routes['whatsapp.whatsapp_contacts.common_groups']
      about: typeof routes['whatsapp.whatsapp_contacts.about']
    }
    whatsappGroups: {
      store: typeof routes['whatsapp.whatsapp_groups.store']
      inviteInfo: typeof routes['whatsapp.whatsapp_groups.invite_info']
      join: typeof routes['whatsapp.whatsapp_groups.join']
      joinV4: typeof routes['whatsapp.whatsapp_groups.join_v_4']
      inviteCode: typeof routes['whatsapp.whatsapp_groups.invite_code']
      revokeInvite: typeof routes['whatsapp.whatsapp_groups.revoke_invite']
      leave: typeof routes['whatsapp.whatsapp_groups.leave']
      addParticipants: typeof routes['whatsapp.whatsapp_groups.add_participants']
      removeParticipants: typeof routes['whatsapp.whatsapp_groups.remove_participants']
      promoteParticipants: typeof routes['whatsapp.whatsapp_groups.promote_participants']
      demoteParticipants: typeof routes['whatsapp.whatsapp_groups.demote_participants']
      setSubject: typeof routes['whatsapp.whatsapp_groups.set_subject']
      setDescription: typeof routes['whatsapp.whatsapp_groups.set_description']
      setPicture: typeof routes['whatsapp.whatsapp_groups.set_picture']
      deletePicture: typeof routes['whatsapp.whatsapp_groups.delete_picture']
      membershipRequests: typeof routes['whatsapp.whatsapp_groups.membership_requests']
      approveMembershipRequests: typeof routes['whatsapp.whatsapp_groups.approve_membership_requests']
      rejectMembershipRequests: typeof routes['whatsapp.whatsapp_groups.reject_membership_requests']
      setInfoAdminsOnly: typeof routes['whatsapp.whatsapp_groups.set_info_admins_only']
      setMessagesAdminsOnly: typeof routes['whatsapp.whatsapp_groups.set_messages_admins_only']
      setAddMembersAdminsOnly: typeof routes['whatsapp.whatsapp_groups.set_add_members_admins_only']
    }
    whatsappChannels: {
      index: typeof routes['whatsapp.whatsapp_channels.index']
      store: typeof routes['whatsapp.whatsapp_channels.store']
      search: typeof routes['whatsapp.whatsapp_channels.search']
      byInvite: typeof routes['whatsapp.whatsapp_channels.by_invite']
      destroy: typeof routes['whatsapp.whatsapp_channels.destroy']
      subscribe: typeof routes['whatsapp.whatsapp_channels.subscribe']
      unsubscribe: typeof routes['whatsapp.whatsapp_channels.unsubscribe']
      transferOwnership: typeof routes['whatsapp.whatsapp_channels.transfer_ownership']
      sendAdminInvite: typeof routes['whatsapp.whatsapp_channels.send_admin_invite']
      acceptAdminInvite: typeof routes['whatsapp.whatsapp_channels.accept_admin_invite']
      revokeAdminInvite: typeof routes['whatsapp.whatsapp_channels.revoke_admin_invite']
      demoteAdmin: typeof routes['whatsapp.whatsapp_channels.demote_admin']
    }
    whatsappLabels: {
      index: typeof routes['whatsapp.whatsapp_labels.index']
      assign: typeof routes['whatsapp.whatsapp_labels.assign']
      show: typeof routes['whatsapp.whatsapp_labels.show']
      chats: typeof routes['whatsapp.whatsapp_labels.chats']
    }
    whatsappBroadcasts: {
      index: typeof routes['whatsapp.whatsapp_broadcasts.index']
      show: typeof routes['whatsapp.whatsapp_broadcasts.show']
    }
    whatsappProfile: {
      setDisplayName: typeof routes['whatsapp.whatsapp_profile.set_display_name']
      setStatus: typeof routes['whatsapp.whatsapp_profile.set_status']
      setPicture: typeof routes['whatsapp.whatsapp_profile.set_picture']
      deletePicture: typeof routes['whatsapp.whatsapp_profile.delete_picture']
      presenceAvailable: typeof routes['whatsapp.whatsapp_profile.presence_available']
      presenceUnavailable: typeof routes['whatsapp.whatsapp_profile.presence_unavailable']
      revokeStatus: typeof routes['whatsapp.whatsapp_profile.revoke_status']
    }
    whatsappSettings: {
      autoDownloadAudio: typeof routes['whatsapp.whatsapp_settings.auto_download_audio']
      autoDownloadDocuments: typeof routes['whatsapp.whatsapp_settings.auto_download_documents']
      autoDownloadPhotos: typeof routes['whatsapp.whatsapp_settings.auto_download_photos']
      autoDownloadVideos: typeof routes['whatsapp.whatsapp_settings.auto_download_videos']
      backgroundSync: typeof routes['whatsapp.whatsapp_settings.background_sync']
    }
  }
  chatRules: {
    chatRules: {
      index: typeof routes['chatRules.chat_rules.index']
      showDefault: typeof routes['chatRules.chat_rules.show_default']
      updateDefault: typeof routes['chatRules.chat_rules.update_default']
      show: typeof routes['chatRules.chat_rules.show']
      update: typeof routes['chatRules.chat_rules.update']
    }
  }
  followUps: {
    followUps: {
      index: typeof routes['followUps.follow_ups.index']
      sync: typeof routes['followUps.follow_ups.sync']
      update: typeof routes['followUps.follow_ups.update']
    }
  }
  businessSettings: {
    businessSettings: {
      show: typeof routes['businessSettings.business_settings.show']
      update: typeof routes['businessSettings.business_settings.update']
    }
  }
  credits: {
    credits: {
      show: typeof routes['credits.credits.show']
      usage: typeof routes['credits.credits.usage']
      purchase: typeof routes['credits.credits.purchase']
    }
  }
  analytics: {
    analytics: {
      summary: typeof routes['analytics.analytics.summary']
      hourly: typeof routes['analytics.analytics.hourly']
      topContacts: typeof routes['analytics.analytics.top_contacts']
      recentMessages: typeof routes['analytics.analytics.recent_messages']
    }
  }
  products: {
    products: {
      index: typeof routes['products.products.index']
      show: typeof routes['products.products.show']
      store: typeof routes['products.products.store']
      update: typeof routes['products.products.update']
      destroy: typeof routes['products.products.destroy']
    }
  }
  store: {
    products: {
      publicShow: typeof routes['store.products.public_show']
      checkoutIntent: typeof routes['store.products.checkout_intent']
    }
  }
  storefront: {
    storefront: {
      showBusiness: typeof routes['storefront.storefront.show_business']
      showProduct: typeof routes['storefront.storefront.show_product']
      checkout: typeof routes['storefront.storefront.checkout']
    }
  }
  websiteServices: {
    websiteServices: {
      packages: typeof routes['websiteServices.website_services.packages']
      adminIndex: typeof routes['websiteServices.website_services.admin_index']
      myOrders: typeof routes['websiteServices.website_services.my_orders']
      store: typeof routes['websiteServices.website_services.store']
    }
  }
}
