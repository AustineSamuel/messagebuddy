/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
    }
  }
  'auth.access_token.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['store']>>>
    }
  }
  'auth.firebase_auths.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/firebase'
    types: {
      body: ExtractBody<InferInput<(typeof import('modules/auth/validators/firebase_id_token.js').firebaseIdTokenValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('modules/auth/validators/firebase_id_token.js').firebaseIdTokenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/firebase_auths_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/firebase_auths_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_token.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['destroy']>>>
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'whatsapp.whatsapp_session.initialize': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/session/initialize'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['initialize']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['initialize']>>>
    }
  }
  'whatsapp.whatsapp_session.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/session'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['show']>>>
    }
  }
  'whatsapp.whatsapp_session.state': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/session/state'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['state']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['state']>>>
    }
  }
  'whatsapp.whatsapp_session.qr': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/session/qr'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['qr']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['qr']>>>
    }
  }
  'whatsapp.whatsapp_session.pairing_code': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/session/pairing-code'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['pairingCode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['pairingCode']>>>
    }
  }
  'whatsapp.whatsapp_session.info': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/session/info'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['info']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['info']>>>
    }
  }
  'whatsapp.whatsapp_session.wweb_version': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/session/wweb-version'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['wwebVersion']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['wwebVersion']>>>
    }
  }
  'whatsapp.whatsapp_session.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/whatsapp/session'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['destroy']>>>
    }
  }
  'whatsapp.whatsapp_session.logout': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/session/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_session_controller').default['logout']>>>
    }
  }
  'whatsapp.whatsapp_chats.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/chats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['index']>>>
    }
  }
  'whatsapp.whatsapp_chats.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/chats/:chatId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['show']>>>
    }
  }
  'whatsapp.whatsapp_chats.archive': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/archive'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['archive']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['archive']>>>
    }
  }
  'whatsapp.whatsapp_chats.unarchive': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/unarchive'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['unarchive']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['unarchive']>>>
    }
  }
  'whatsapp.whatsapp_chats.mute': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/mute'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['mute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['mute']>>>
    }
  }
  'whatsapp.whatsapp_chats.unmute': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/unmute'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['unmute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['unmute']>>>
    }
  }
  'whatsapp.whatsapp_chats.pin': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/pin'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['pin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['pin']>>>
    }
  }
  'whatsapp.whatsapp_chats.unpin': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/unpin'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['unpin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['unpin']>>>
    }
  }
  'whatsapp.whatsapp_chats.mark_unread': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/mark-unread'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['markUnread']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['markUnread']>>>
    }
  }
  'whatsapp.whatsapp_chats.clear_messages': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/clear-messages'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['clearMessages']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['clearMessages']>>>
    }
  }
  'whatsapp.whatsapp_chats.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/whatsapp/chats/:chatId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['destroy']>>>
    }
  }
  'whatsapp.whatsapp_chats.messages': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/chats/:chatId/messages'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['messages']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['messages']>>>
    }
  }
  'whatsapp.whatsapp_chats.pinned_messages': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/chats/:chatId/pinned-messages'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['pinnedMessages']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['pinnedMessages']>>>
    }
  }
  'whatsapp.whatsapp_chats.suggest_ai_reply': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/ai-suggest-reply'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['suggestAiReply']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['suggestAiReply']>>>
    }
  }
  'whatsapp.whatsapp_chats.send_message': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/messages'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['sendMessage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['sendMessage']>>>
    }
  }
  'whatsapp.whatsapp_chats.send_seen': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/seen'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['sendSeen']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['sendSeen']>>>
    }
  }
  'whatsapp.whatsapp_chats.send_typing': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/typing'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['sendTyping']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['sendTyping']>>>
    }
  }
  'whatsapp.whatsapp_chats.send_recording': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/recording'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['sendRecording']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['sendRecording']>>>
    }
  }
  'whatsapp.whatsapp_chats.sync_history': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/chats/:chatId/sync-history'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['syncHistory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['syncHistory']>>>
    }
  }
  'whatsapp.whatsapp_chats.labels': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/chats/:chatId/labels'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['labels']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['labels']>>>
    }
  }
  'whatsapp.whatsapp_chats.set_labels': {
    methods: ["PUT"]
    pattern: '/api/v1/whatsapp/chats/:chatId/labels'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['setLabels']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['setLabels']>>>
    }
  }
  'whatsapp.whatsapp_chats.customer_note': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/chats/:chatId/customer-note'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['customerNote']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['customerNote']>>>
    }
  }
  'whatsapp.whatsapp_chats.set_customer_note': {
    methods: ["PUT"]
    pattern: '/api/v1/whatsapp/chats/:chatId/customer-note'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['setCustomerNote']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_chats_controller').default['setCustomerNote']>>>
    }
  }
  'whatsapp.whatsapp_messages.search': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/messages/search'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['search']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['search']>>>
    }
  }
  'whatsapp.whatsapp_messages.store': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/messages'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['store']>>>
    }
  }
  'whatsapp.whatsapp_messages.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/messages/:messageId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['show']>>>
    }
  }
  'whatsapp.whatsapp_messages.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/messages/:messageId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['update']>>>
    }
  }
  'whatsapp.whatsapp_messages.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/whatsapp/messages/:messageId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['destroy']>>>
    }
  }
  'whatsapp.whatsapp_messages.react': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/messages/:messageId/react'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['react']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['react']>>>
    }
  }
  'whatsapp.whatsapp_messages.reply': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/messages/:messageId/reply'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['reply']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['reply']>>>
    }
  }
  'whatsapp.whatsapp_messages.forward': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/messages/:messageId/forward'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['forward']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['forward']>>>
    }
  }
  'whatsapp.whatsapp_messages.media': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/messages/:messageId/media'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['media']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['media']>>>
    }
  }
  'whatsapp.whatsapp_messages.reactions': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/messages/:messageId/reactions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['reactions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['reactions']>>>
    }
  }
  'whatsapp.whatsapp_messages.poll_votes': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/messages/:messageId/poll-votes'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['pollVotes']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['pollVotes']>>>
    }
  }
  'whatsapp.whatsapp_messages.star': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/messages/:messageId/star'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['star']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['star']>>>
    }
  }
  'whatsapp.whatsapp_messages.unstar': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/messages/:messageId/unstar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['unstar']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['unstar']>>>
    }
  }
  'whatsapp.whatsapp_messages.pin': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/messages/:messageId/pin'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['pin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['pin']>>>
    }
  }
  'whatsapp.whatsapp_messages.unpin': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/messages/:messageId/unpin'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['unpin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['unpin']>>>
    }
  }
  'whatsapp.whatsapp_messages.vote': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/messages/:messageId/vote'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['vote']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_messages_controller').default['vote']>>>
    }
  }
  'whatsapp.whatsapp_contacts.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/contacts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['index']>>>
    }
  }
  'whatsapp.whatsapp_contacts.blocked': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/contacts/blocked'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['blocked']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['blocked']>>>
    }
  }
  'whatsapp.whatsapp_contacts.lookup_number': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/contacts/lookup-number'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['lookupNumber']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['lookupNumber']>>>
    }
  }
  'whatsapp.whatsapp_contacts.is_registered': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/contacts/is-registered'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['isRegistered']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['isRegistered']>>>
    }
  }
  'whatsapp.whatsapp_contacts.formatted_number': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/contacts/formatted-number'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['formattedNumber']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['formattedNumber']>>>
    }
  }
  'whatsapp.whatsapp_contacts.country_code': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/contacts/country-code'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['countryCode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['countryCode']>>>
    }
  }
  'whatsapp.whatsapp_contacts.save_addressbook': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/contacts/addressbook'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['saveAddressbook']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['saveAddressbook']>>>
    }
  }
  'whatsapp.whatsapp_contacts.delete_addressbook': {
    methods: ["DELETE"]
    pattern: '/api/v1/whatsapp/contacts/addressbook'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['deleteAddressbook']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['deleteAddressbook']>>>
    }
  }
  'whatsapp.whatsapp_contacts.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/contacts/:contactId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contactId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['show']>>>
    }
  }
  'whatsapp.whatsapp_contacts.block': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/contacts/:contactId/block'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contactId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['block']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['block']>>>
    }
  }
  'whatsapp.whatsapp_contacts.unblock': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/contacts/:contactId/unblock'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contactId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['unblock']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['unblock']>>>
    }
  }
  'whatsapp.whatsapp_contacts.profile_pic': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/contacts/:contactId/profile-pic'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contactId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['profilePic']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['profilePic']>>>
    }
  }
  'whatsapp.whatsapp_contacts.common_groups': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/contacts/:contactId/common-groups'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contactId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['commonGroups']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['commonGroups']>>>
    }
  }
  'whatsapp.whatsapp_contacts.about': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/contacts/:contactId/about'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contactId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['about']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_contacts_controller').default['about']>>>
    }
  }
  'whatsapp.whatsapp_groups.store': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/groups'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['store']>>>
    }
  }
  'whatsapp.whatsapp_groups.invite_info': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/groups/invite/:inviteCode'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { inviteCode: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['inviteInfo']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['inviteInfo']>>>
    }
  }
  'whatsapp.whatsapp_groups.join': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/groups/join'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['join']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['join']>>>
    }
  }
  'whatsapp.whatsapp_groups.join_v_4': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/groups/join-v4'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['joinV4']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['joinV4']>>>
    }
  }
  'whatsapp.whatsapp_groups.invite_code': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/groups/:groupId/invite-code'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['inviteCode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['inviteCode']>>>
    }
  }
  'whatsapp.whatsapp_groups.revoke_invite': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/groups/:groupId/revoke-invite'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['revokeInvite']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['revokeInvite']>>>
    }
  }
  'whatsapp.whatsapp_groups.leave': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/groups/:groupId/leave'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['leave']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['leave']>>>
    }
  }
  'whatsapp.whatsapp_groups.add_participants': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/groups/:groupId/participants/add'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['addParticipants']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['addParticipants']>>>
    }
  }
  'whatsapp.whatsapp_groups.remove_participants': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/groups/:groupId/participants/remove'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['removeParticipants']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['removeParticipants']>>>
    }
  }
  'whatsapp.whatsapp_groups.promote_participants': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/groups/:groupId/participants/promote'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['promoteParticipants']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['promoteParticipants']>>>
    }
  }
  'whatsapp.whatsapp_groups.demote_participants': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/groups/:groupId/participants/demote'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['demoteParticipants']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['demoteParticipants']>>>
    }
  }
  'whatsapp.whatsapp_groups.set_subject': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/groups/:groupId/subject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['setSubject']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['setSubject']>>>
    }
  }
  'whatsapp.whatsapp_groups.set_description': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/groups/:groupId/description'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['setDescription']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['setDescription']>>>
    }
  }
  'whatsapp.whatsapp_groups.set_picture': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/groups/:groupId/picture'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['setPicture']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['setPicture']>>>
    }
  }
  'whatsapp.whatsapp_groups.delete_picture': {
    methods: ["DELETE"]
    pattern: '/api/v1/whatsapp/groups/:groupId/picture'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['deletePicture']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['deletePicture']>>>
    }
  }
  'whatsapp.whatsapp_groups.membership_requests': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/groups/:groupId/membership-requests'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['membershipRequests']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['membershipRequests']>>>
    }
  }
  'whatsapp.whatsapp_groups.approve_membership_requests': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/groups/:groupId/membership-requests/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['approveMembershipRequests']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['approveMembershipRequests']>>>
    }
  }
  'whatsapp.whatsapp_groups.reject_membership_requests': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/groups/:groupId/membership-requests/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['rejectMembershipRequests']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['rejectMembershipRequests']>>>
    }
  }
  'whatsapp.whatsapp_groups.set_info_admins_only': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/groups/:groupId/settings/info-admins-only'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['setInfoAdminsOnly']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['setInfoAdminsOnly']>>>
    }
  }
  'whatsapp.whatsapp_groups.set_messages_admins_only': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/groups/:groupId/settings/messages-admins-only'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['setMessagesAdminsOnly']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['setMessagesAdminsOnly']>>>
    }
  }
  'whatsapp.whatsapp_groups.set_add_members_admins_only': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/groups/:groupId/settings/add-members-admins-only'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['setAddMembersAdminsOnly']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_groups_controller').default['setAddMembersAdminsOnly']>>>
    }
  }
  'whatsapp.whatsapp_channels.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/channels'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['index']>>>
    }
  }
  'whatsapp.whatsapp_channels.store': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/channels'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['store']>>>
    }
  }
  'whatsapp.whatsapp_channels.search': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/channels/search'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['search']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['search']>>>
    }
  }
  'whatsapp.whatsapp_channels.by_invite': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/channels/invite/:inviteCode'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { inviteCode: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['byInvite']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['byInvite']>>>
    }
  }
  'whatsapp.whatsapp_channels.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/whatsapp/channels/:channelId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { channelId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['destroy']>>>
    }
  }
  'whatsapp.whatsapp_channels.subscribe': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/channels/:channelId/subscribe'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { channelId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['subscribe']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['subscribe']>>>
    }
  }
  'whatsapp.whatsapp_channels.unsubscribe': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/channels/:channelId/unsubscribe'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { channelId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['unsubscribe']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['unsubscribe']>>>
    }
  }
  'whatsapp.whatsapp_channels.transfer_ownership': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/channels/:channelId/transfer-ownership'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { channelId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['transferOwnership']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['transferOwnership']>>>
    }
  }
  'whatsapp.whatsapp_channels.send_admin_invite': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/channels/:channelId/admin-invite'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { channelId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['sendAdminInvite']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['sendAdminInvite']>>>
    }
  }
  'whatsapp.whatsapp_channels.accept_admin_invite': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/channels/:channelId/accept-admin-invite'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { channelId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['acceptAdminInvite']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['acceptAdminInvite']>>>
    }
  }
  'whatsapp.whatsapp_channels.revoke_admin_invite': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/channels/:channelId/revoke-admin-invite'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { channelId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['revokeAdminInvite']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['revokeAdminInvite']>>>
    }
  }
  'whatsapp.whatsapp_channels.demote_admin': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/channels/:channelId/demote-admin'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { channelId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['demoteAdmin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_channels_controller').default['demoteAdmin']>>>
    }
  }
  'whatsapp.whatsapp_labels.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/labels'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_labels_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_labels_controller').default['index']>>>
    }
  }
  'whatsapp.whatsapp_labels.assign': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/labels/assign'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_labels_controller').default['assign']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_labels_controller').default['assign']>>>
    }
  }
  'whatsapp.whatsapp_labels.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/labels/:labelId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { labelId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_labels_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_labels_controller').default['show']>>>
    }
  }
  'whatsapp.whatsapp_labels.chats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/labels/:labelId/chats'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { labelId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_labels_controller').default['chats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_labels_controller').default['chats']>>>
    }
  }
  'whatsapp.whatsapp_broadcasts.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/broadcasts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_broadcasts_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_broadcasts_controller').default['index']>>>
    }
  }
  'whatsapp.whatsapp_broadcasts.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/whatsapp/broadcasts/:contactId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contactId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_broadcasts_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_broadcasts_controller').default['show']>>>
    }
  }
  'whatsapp.whatsapp_profile.set_display_name': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/profile/display-name'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['setDisplayName']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['setDisplayName']>>>
    }
  }
  'whatsapp.whatsapp_profile.set_status': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/profile/status'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['setStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['setStatus']>>>
    }
  }
  'whatsapp.whatsapp_profile.set_picture': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/profile/picture'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['setPicture']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['setPicture']>>>
    }
  }
  'whatsapp.whatsapp_profile.delete_picture': {
    methods: ["DELETE"]
    pattern: '/api/v1/whatsapp/profile/picture'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['deletePicture']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['deletePicture']>>>
    }
  }
  'whatsapp.whatsapp_profile.presence_available': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/presence/available'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['presenceAvailable']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['presenceAvailable']>>>
    }
  }
  'whatsapp.whatsapp_profile.presence_unavailable': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/presence/unavailable'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['presenceUnavailable']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['presenceUnavailable']>>>
    }
  }
  'whatsapp.whatsapp_profile.revoke_status': {
    methods: ["POST"]
    pattern: '/api/v1/whatsapp/status/:messageId/revoke'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { messageId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['revokeStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_profile_controller').default['revokeStatus']>>>
    }
  }
  'whatsapp.whatsapp_settings.auto_download_audio': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/settings/auto-download/audio'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_settings_controller').default['autoDownloadAudio']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_settings_controller').default['autoDownloadAudio']>>>
    }
  }
  'whatsapp.whatsapp_settings.auto_download_documents': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/settings/auto-download/documents'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_settings_controller').default['autoDownloadDocuments']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_settings_controller').default['autoDownloadDocuments']>>>
    }
  }
  'whatsapp.whatsapp_settings.auto_download_photos': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/settings/auto-download/photos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_settings_controller').default['autoDownloadPhotos']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_settings_controller').default['autoDownloadPhotos']>>>
    }
  }
  'whatsapp.whatsapp_settings.auto_download_videos': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/settings/auto-download/videos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_settings_controller').default['autoDownloadVideos']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_settings_controller').default['autoDownloadVideos']>>>
    }
  }
  'whatsapp.whatsapp_settings.background_sync': {
    methods: ["PATCH"]
    pattern: '/api/v1/whatsapp/settings/background-sync'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/whatsapp_settings_controller').default['backgroundSync']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/whatsapp_settings_controller').default['backgroundSync']>>>
    }
  }
  'chatRules.chat_rules.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/chat-rules'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_rules_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_rules_controller').default['index']>>>
    }
  }
  'chatRules.chat_rules.show_default': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/chat-rules/default'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_rules_controller').default['showDefault']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_rules_controller').default['showDefault']>>>
    }
  }
  'chatRules.chat_rules.update_default': {
    methods: ["PUT"]
    pattern: '/api/v1/chat-rules/default'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_rules_controller').default['updateDefault']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_rules_controller').default['updateDefault']>>>
    }
  }
  'chatRules.chat_rules.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/chat-rules/:chatId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_rules_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_rules_controller').default['show']>>>
    }
  }
  'chatRules.chat_rules.update': {
    methods: ["PUT"]
    pattern: '/api/v1/chat-rules/:chatId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_rules_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_rules_controller').default['update']>>>
    }
  }
  'followUps.follow_ups.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/follow-ups'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/follow_ups_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/follow_ups_controller').default['index']>>>
    }
  }
  'followUps.follow_ups.sync': {
    methods: ["PUT"]
    pattern: '/api/v1/follow-ups/sync'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/follow_ups_controller').default['sync']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/follow_ups_controller').default['sync']>>>
    }
  }
  'followUps.follow_ups.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/follow-ups/:chatId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { chatId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/follow_ups_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/follow_ups_controller').default['update']>>>
    }
  }
  'businessSettings.business_settings.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/business-settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/business_settings_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/business_settings_controller').default['show']>>>
    }
  }
  'businessSettings.business_settings.update': {
    methods: ["PUT"]
    pattern: '/api/v1/business-settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/business_settings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/business_settings_controller').default['update']>>>
    }
  }
}
