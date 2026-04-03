import app from '@adonisjs/core/services/app'
import env from '#start/env'
import admin from 'firebase-admin'
import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute } from 'node:path'

let initialized = false

function resolveCredentialsPath(): string | null {
  const fromEnv = env.get('FIREBASE_CREDENTIALS_PATH')
  if (fromEnv) {
    return isAbsolute(fromEnv) ? fromEnv : app.makePath(fromEnv)
  }
  const fallback = app.makePath('firebase.admin.json')
  if (app.inDev && existsSync(fallback)) {
    return fallback
  }
  return null
}

/**
 * Returns the firebase-admin namespace after lazy init, or throws if credentials are missing.
 */
export function getFirebaseAdmin(): typeof admin {
  if (initialized) {
    return admin
  }
  const path = resolveCredentialsPath()
  if (!path || !existsSync(path)) {
    throw new Error(
      'Firebase Admin not configured. Set FIREBASE_CREDENTIALS_PATH or add firebase.admin.json in the backend root.'
    )
  }
  const json = JSON.parse(readFileSync(path, 'utf-8')) as admin.ServiceAccount
  admin.initializeApp({
    credential: admin.credential.cert(json),
  })
  initialized = true
  return admin
}
