import User from '#models/user'
import CreditsService from '#services/credits_service'
import { getFirebaseAdmin } from '#services/firebase_admin_service'
import { firebaseIdTokenValidator } from '../../modules/auth/validators/firebase_id_token.js'
import UserTransformer from '../../modules/users/transformers/user_transformer.js'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'
import { randomBytes } from 'node:crypto'

export default class FirebaseAuthsController {
  async store({ request, response, serialize }: HttpContext) {
    const { idToken } = await request.validateUsing(firebaseIdTokenValidator)

    let adminApp: ReturnType<typeof getFirebaseAdmin>
    try {
      adminApp = getFirebaseAdmin()
    } catch {
      return response.serviceUnavailable({
        error: 'Firebase Admin is not configured on the server.',
      })
    }

    let decoded: { email?: string; name?: string }
    try {
      decoded = await adminApp.auth().verifyIdToken(idToken)
    } catch {
      return response.unauthorized({ error: 'Invalid or expired Firebase token.' })
    }

    const email = decoded.email?.toLowerCase()
    if (!email) {
      return response.badRequest({
        error: 'Your Google account must have an email address.',
      })
    }

    const fullName = decoded.name?.trim() || email.split('@')[0] || 'User'

    let isNewUser = false
    let user = await User.findBy('email', email)
    if (!user) {
      isNewUser = true
      const randomPassword = randomBytes(48).toString('hex')
      user = await User.create({
        fullName,
        email,
        password: await hash.make(randomPassword),
      })
    } else if (!user.fullName) {
      user.fullName = fullName
      await user.save()
    }

    if (isNewUser) {
      await CreditsService.initializeNewUser(user.id)
    }

    const token = await User.accessTokens.create(user)

    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }
}
