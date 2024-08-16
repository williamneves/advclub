import { SupabaseClient } from '@supabase/supabase-js'

import { env } from '@/env'

export const supabaseAdmin = new SupabaseClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
    },
  },
)
