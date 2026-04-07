import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Service role client — bypasses RLS. Only use server-side.
// Lazily instantiated so build-time env checks don't throw.
let _admin: SupabaseClient | null = null

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_admin) {
      _admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
    }
    const value = (_admin as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === "function" ? value.bind(_admin) : value
  },
})
