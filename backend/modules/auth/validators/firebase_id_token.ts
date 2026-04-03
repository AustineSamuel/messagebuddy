import vine from '@vinejs/vine'

export const firebaseIdTokenValidator = vine.create({
  idToken: vine.string().trim().minLength(20),
})
