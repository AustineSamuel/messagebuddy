import type { InferData } from '@adonisjs/core/types/transformers'
import type UserTransformer from '../transformers/user_transformer.js'

export type PublicUser = InferData<UserTransformer>
