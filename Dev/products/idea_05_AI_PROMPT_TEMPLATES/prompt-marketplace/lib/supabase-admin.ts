
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Note: SUPABASE_SERVICE_ROLE_KEY must be secured server-side.
// Initialize Supabase only if URL and service key are provided
// In dev mode with ?dev=true, this is bypassed anyway
export const supabaseAdmin =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : null
