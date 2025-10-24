import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Extension Push Subscription Validation API
 * Checks if a push subscription is registered and valid in the database
 * Used by Chrome extension to avoid unnecessary re-subscription
 */
export async function POST(request: NextRequest) {
  console.log('🔍 Push subscription validation request received');

  try {
    // Check authentication via Supabase cookies
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('❌ User not authenticated:', authError?.message);
      return NextResponse.json(
        {
          valid: false,
          message: 'Authentication required',
        },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Credentials': 'true',
          },
        },
      );
    }

    console.log('✅ User authenticated:', user.email);

    // Parse request body
    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      console.log('❌ Missing subscription or endpoint in request body');
      return NextResponse.json(
        {
          valid: false,
          message: 'subscription with endpoint is required',
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Credentials': 'true',
          },
        },
      );
    }

    console.log('🔎 Checking if push subscription exists for user:', user.id);
    console.log('   Endpoint:', subscription.endpoint);

    // Check if subscription exists in database for this user
    const { data: subRecord, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, user_id, customer_id, created_at')
      .eq('endpoint', subscription.endpoint)
      .eq('user_id', user.id)
      .single();

    if (error || !subRecord) {
      console.log('❌ Subscription not found in database or error:', error?.message);
      return NextResponse.json(
        {
          valid: false,
          message: 'Subscription not registered',
          needsRegistration: true,
        },
        {
          headers: {
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Credentials': 'true',
          },
        },
      );
    }

    console.log('✅ Push subscription is valid and registered');
    console.log('   Subscription created:', subRecord.created_at);
    console.log('   Customer ID:', subRecord.customer_id || 'Not yet linked');

    return NextResponse.json(
      {
        valid: true,
        message: 'Subscription is valid',
        subscription: {
          created_at: subRecord.created_at,
          customer_id: subRecord.customer_id,
        },
      },
      {
        headers: {
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    );
  } catch (error) {
    console.error('❌ Push subscription validation error:', error);
    return NextResponse.json(
      {
        valid: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    );
  }
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
