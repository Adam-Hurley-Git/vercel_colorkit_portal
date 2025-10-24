import { createServerClient } from '@supabase/ssr';

/**
 * Creates a Supabase server client that authenticates via Bearer token
 * instead of cookies. Used for extension API routes where cookies aren't available.
 *
 * @param authHeader - The Authorization header value (e.g., "Bearer xxx")
 * @returns Supabase client configured to use the Bearer token
 */
export function createClientFromBearer(authHeader?: string | null) {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    cookies: {
      // Disable cookie coupling for this client
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}
