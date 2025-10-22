import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { agreements } = body;

    if (!agreements) {
      return Response.json({ error: 'Missing agreements data' }, { status: 400 });
    }

    // Prepare the data with timestamps
    const timestamp = new Date().toISOString();
    const agreementData = {
      user_id: user.id,
      email: user.email || '',
      terms_accepted: agreements.terms || false,
      terms_accepted_at: agreements.terms ? timestamp : null,
      refund_accepted: agreements.refund || false,
      refund_accepted_at: agreements.refund ? timestamp : null,
      privacy_accepted: agreements.privacy || false,
      privacy_accepted_at: agreements.privacy ? timestamp : null,
      recurring_accepted: agreements.recurring || false,
      recurring_accepted_at: agreements.recurring ? timestamp : null,
      withdrawal_accepted: agreements.withdrawal || false,
      withdrawal_accepted_at: agreements.withdrawal ? timestamp : null,
      updated_at: timestamp,
    };

    // Check if user already has an agreement record
    const { data: existingAgreement } = await supabase
      .from('user_agreements')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existingAgreement) {
      // Update existing record
      result = await supabase.from('user_agreements').update(agreementData).eq('user_id', user.id).select().single();
    } else {
      // Insert new record
      result = await supabase.from('user_agreements').insert(agreementData).select().single();
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return Response.json({ error: 'Failed to save agreements' }, { status: 500 });
    }

    return Response.json({ success: true, data: result.data }, { status: 200 });
  } catch (e) {
    console.error('Error saving user agreements:', e);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's agreements
    const { data, error } = await supabase.from('user_agreements').select('*').eq('user_id', user.id).single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - this is ok
      console.error('Database error:', error);
      return Response.json({ error: 'Failed to fetch agreements' }, { status: 500 });
    }

    return Response.json({ success: true, data: data || null }, { status: 200 });
  } catch (e) {
    console.error('Error fetching user agreements:', e);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
