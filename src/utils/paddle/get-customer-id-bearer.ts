import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Gets customer ID from Supabase using a provided client (Bearer-compatible)
 * Used in extension API routes where cookie-based auth isn't available
 *
 * @param supabase - Supabase client (can be from Bearer or cookies)
 * @returns Customer ID or empty string if not found
 */
export async function getCustomerIdFromSupabase(supabase: SupabaseClient): Promise<string> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const email = user?.email;

    if (!email) {
      console.log('No email found for user');
      return '';
    }

    const { data, error } = await supabase.from('customers').select('customer_id').eq('email', email).single();

    if (error) {
      console.log('Error fetching customer ID:', error.message);
      return '';
    }

    return data?.customer_id ?? '';
  } catch (error) {
    console.error('Failed to get customer ID:', error);
    return '';
  }
}
