import type { PublicUser } from '../../users/types/public.js'

export type AuthSuccessPayload = {
  user: PublicUser
  token: string
}
