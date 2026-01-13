
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Note: SUPABASE_SERVICE_ROLE_KEY must be secured server-side.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)
