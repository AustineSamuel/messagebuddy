/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Composes module route registrations. Each module owns its routes,
| controllers, validators, and types under `modules/<name>/`.
|
*/

import { registerApiV1Routes } from '#start/api_routes'
import { registerCoreRoutes } from '#start/core_routes'

registerCoreRoutes()
registerApiV1Routes()
