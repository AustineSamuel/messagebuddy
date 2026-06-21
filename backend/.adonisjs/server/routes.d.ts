import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.firebase_auths.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.initialize': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.show': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.state': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.qr': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.pairing_code': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.info': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.wweb_version': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.destroy': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.logout': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_chats.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_chats.show': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.archive': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.unarchive': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.mute': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.unmute': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.pin': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.unpin': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.mark_unread': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.clear_messages': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.destroy': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.messages': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.pinned_messages': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.send_message': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.send_seen': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.send_typing': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.send_recording': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.sync_history': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.labels': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.set_labels': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.customer_note': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.set_customer_note': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_messages.search': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_messages.store': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_messages.show': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.update': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.destroy': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.react': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.reply': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.forward': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.media': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.reactions': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.poll_votes': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.star': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.unstar': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.pin': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.unpin': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.vote': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_contacts.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.blocked': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.lookup_number': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.is_registered': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.formatted_number': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.country_code': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.save_addressbook': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.delete_addressbook': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.show': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_contacts.block': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_contacts.unblock': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_contacts.profile_pic': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_contacts.common_groups': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_contacts.about': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_groups.store': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_groups.invite_info': { paramsTuple: [ParamValue]; params: {'inviteCode': ParamValue} }
    'whatsapp.whatsapp_groups.join': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_groups.join_v_4': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_groups.invite_code': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.revoke_invite': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.leave': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.add_participants': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.remove_participants': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.promote_participants': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.demote_participants': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.set_subject': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.set_description': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.set_picture': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.delete_picture': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.membership_requests': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.approve_membership_requests': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.reject_membership_requests': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.set_info_admins_only': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.set_messages_admins_only': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.set_add_members_admins_only': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_channels.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_channels.store': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_channels.search': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_channels.by_invite': { paramsTuple: [ParamValue]; params: {'inviteCode': ParamValue} }
    'whatsapp.whatsapp_channels.destroy': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.subscribe': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.unsubscribe': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.transfer_ownership': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.send_admin_invite': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.accept_admin_invite': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.revoke_admin_invite': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.demote_admin': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_labels.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_labels.assign': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_labels.show': { paramsTuple: [ParamValue]; params: {'labelId': ParamValue} }
    'whatsapp.whatsapp_labels.chats': { paramsTuple: [ParamValue]; params: {'labelId': ParamValue} }
    'whatsapp.whatsapp_broadcasts.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_broadcasts.show': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_profile.set_display_name': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_profile.set_status': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_profile.set_picture': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_profile.delete_picture': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_profile.presence_available': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_profile.presence_unavailable': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_profile.revoke_status': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_settings.auto_download_audio': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_settings.auto_download_documents': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_settings.auto_download_photos': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_settings.auto_download_videos': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_settings.background_sync': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.show': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.state': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.qr': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.info': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.wweb_version': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_chats.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_chats.show': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.messages': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.pinned_messages': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.labels': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.customer_note': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_messages.search': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_messages.show': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.media': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.reactions': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.poll_votes': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_contacts.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.blocked': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.show': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_contacts.profile_pic': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_contacts.common_groups': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_contacts.about': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_groups.invite_info': { paramsTuple: [ParamValue]; params: {'inviteCode': ParamValue} }
    'whatsapp.whatsapp_groups.invite_code': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.membership_requests': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_channels.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_channels.by_invite': { paramsTuple: [ParamValue]; params: {'inviteCode': ParamValue} }
    'whatsapp.whatsapp_labels.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_labels.show': { paramsTuple: [ParamValue]; params: {'labelId': ParamValue} }
    'whatsapp.whatsapp_labels.chats': { paramsTuple: [ParamValue]; params: {'labelId': ParamValue} }
    'whatsapp.whatsapp_broadcasts.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_broadcasts.show': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.show': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.state': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.qr': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.info': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.wweb_version': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_chats.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_chats.show': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.messages': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.pinned_messages': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.labels': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.customer_note': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_messages.search': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_messages.show': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.media': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.reactions': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.poll_votes': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_contacts.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.blocked': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.show': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_contacts.profile_pic': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_contacts.common_groups': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_contacts.about': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_groups.invite_info': { paramsTuple: [ParamValue]; params: {'inviteCode': ParamValue} }
    'whatsapp.whatsapp_groups.invite_code': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.membership_requests': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_channels.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_channels.by_invite': { paramsTuple: [ParamValue]; params: {'inviteCode': ParamValue} }
    'whatsapp.whatsapp_labels.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_labels.show': { paramsTuple: [ParamValue]; params: {'labelId': ParamValue} }
    'whatsapp.whatsapp_labels.chats': { paramsTuple: [ParamValue]; params: {'labelId': ParamValue} }
    'whatsapp.whatsapp_broadcasts.index': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_broadcasts.show': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.firebase_auths.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.initialize': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.pairing_code': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_session.logout': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_chats.archive': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.unarchive': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.mute': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.unmute': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.pin': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.unpin': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.mark_unread': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.clear_messages': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.send_message': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.send_seen': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.send_typing': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.send_recording': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.sync_history': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_messages.store': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_messages.react': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.reply': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.forward': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.star': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.unstar': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.pin': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.unpin': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_messages.vote': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_contacts.lookup_number': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.is_registered': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.formatted_number': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.country_code': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.save_addressbook': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_contacts.block': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_contacts.unblock': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'whatsapp.whatsapp_groups.store': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_groups.join': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_groups.join_v_4': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_groups.revoke_invite': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.leave': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.add_participants': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.remove_participants': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.promote_participants': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.demote_participants': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.set_picture': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.approve_membership_requests': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.reject_membership_requests': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_channels.store': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_channels.search': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_channels.subscribe': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.unsubscribe': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.transfer_ownership': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.send_admin_invite': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.accept_admin_invite': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.revoke_admin_invite': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_channels.demote_admin': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_labels.assign': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_profile.set_picture': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_profile.presence_available': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_profile.presence_unavailable': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_profile.revoke_status': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
  }
  DELETE: {
    'whatsapp.whatsapp_session.destroy': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_chats.destroy': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_messages.destroy': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_contacts.delete_addressbook': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_groups.delete_picture': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_channels.destroy': { paramsTuple: [ParamValue]; params: {'channelId': ParamValue} }
    'whatsapp.whatsapp_profile.delete_picture': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'whatsapp.whatsapp_chats.set_labels': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
    'whatsapp.whatsapp_chats.set_customer_note': { paramsTuple: [ParamValue]; params: {'chatId': ParamValue} }
  }
  PATCH: {
    'whatsapp.whatsapp_messages.update': { paramsTuple: [ParamValue]; params: {'messageId': ParamValue} }
    'whatsapp.whatsapp_groups.set_subject': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.set_description': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.set_info_admins_only': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.set_messages_admins_only': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_groups.set_add_members_admins_only': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'whatsapp.whatsapp_profile.set_display_name': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_profile.set_status': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_settings.auto_download_audio': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_settings.auto_download_documents': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_settings.auto_download_photos': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_settings.auto_download_videos': { paramsTuple?: []; params?: {} }
    'whatsapp.whatsapp_settings.background_sync': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}