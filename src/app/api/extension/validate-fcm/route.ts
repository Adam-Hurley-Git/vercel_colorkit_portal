import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Extension FCM Token Validation API
 * Checks if an FCM token is registered and valid in the database
 * Used by Chrome extension to avoid unnecessary re-registration
 */
export async function POST(request: NextRequest) {
  console.log('🔍 FCM token validation request received');

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
    const { fcm_token } = body;

    if (!fcm_token) {
      console.log('❌ Missing fcm_token in request body');
      return NextResponse.json(
        {
          valid: false,
          message: 'fcm_token is required',
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

    console.log('🔎 Checking if FCM token exists for user:', user.id);

    // Check if token exists in database for this user
    const { data: tokenRecord, error } = await supabase
      .from('fcm_tokens')
      .select('fcm_token, user_id, customer_id, created_at')
      .eq('fcm_token', fcm_token)
      .eq('user_id', user.id)
      .single();

    if (error || !tokenRecord) {
      console.log('❌ Token not found in database or error:', error?.message);
      return NextResponse.json(
        {
          valid: false,
          message: 'Token not registered',
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

    console.log('✅ FCM token is valid and registered');
    console.log('   Token created:', tokenRecord.created_at);
    console.log('   Customer ID:', tokenRecord.customer_id || 'Not yet linked');

    return NextResponse.json(
      {
        valid: true,
        message: 'Token is valid',
        token: {
          created_at: tokenRecord.created_at,
          customer_id: tokenRecord.customer_id,
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
    console.error('❌ FCM validation error:', error);
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
