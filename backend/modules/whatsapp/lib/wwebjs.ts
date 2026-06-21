/**
 * whatsapp-web.js is CommonJS; under Node ESM only `default` carries named exports.
 */
import wwebjs from 'whatsapp-web.js'

export const Client = wwebjs.Client
export const LocalAuth = wwebjs.LocalAuth
export const MessageMedia = wwebjs.MessageMedia
export const WAState = wwebjs.WAState

export default wwebjs
