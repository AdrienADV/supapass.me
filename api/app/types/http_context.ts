import type { User } from '@supabase/supabase-js'
import type { HttpContext } from '@adonisjs/core/http'

declare module '@adonisjs/core/http' {
    interface HttpContext {
        user: User
    }
} 