import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { supabase } from '#start/routes'
import { User } from '@supabase/supabase-js'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const apiKey = ctx.request.header('Authorization')
    if (!apiKey?.startsWith('Bearer')) {
      return ctx.response.unauthorized({ error: 'Unauthorized' })
    }
    const token = apiKey.split(' ')[1];

    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) {
        return ctx.response.unauthorized({ error: 'Unauthorized' });
      }
      ctx.user = data.user as User
      const output = await next()
      return output

    } catch (err) {
      return ctx.response.unauthorized({ error: 'Unauthorized' });
    }
  }
}