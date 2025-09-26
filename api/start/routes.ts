/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import { createClient } from '@supabase/supabase-js'
import env from '#start/env'
import PassController from '#controllers/pass_controller';
import { middleware } from './kernel.js';
import RegistrationsController from '#controllers/registrations_controller';
import UnregistrationsController from '#controllers/unregistrations_controller';

export const supabase = createClient(env.get('SUPABASE_URL'), env.get('SUPABASE_SECRET_KEY'));

router.group(() => {
  router.post('pass/generate', [PassController, 'generate'])
}).use(middleware.auth())


router.post('/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber', [RegistrationsController, 'register'])
router.delete('/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber', [UnregistrationsController, 'unregister'])
router.get('/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier', [RegistrationsController, 'getAll'])
router.get('/v1/passes/:passTypeIdentifier/:serialNumber', [RegistrationsController, 'getOne'])

router.get('/', async ({ response }: HttpContext) => {
  return response.ok({
    supapass: 'me'
  })
})
