import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. SERVER-ONLY — never import into a Client Component.
 * Bypasses RLS, so use it only inside authorization-checked server actions
 * (e.g. after confirming the caller is a manager). Requires SUPABASE_SERVICE_ROLE_KEY.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (Supabase dashboard → Settings → API → service_role key).'
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
