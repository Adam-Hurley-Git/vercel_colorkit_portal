import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getCustomerId } from '@/utils/paddle/get-customer-id';

/**
 * Extension FCM Token Registration API
 * Stores Firebase Cloud Messaging token for push notifications
 * Used by Chrome extension to receive instant updates when subscription changes
 */
export async function POST(request: NextRequest) {
  console.log('📱 FCM token registration request received');

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
          success: false,
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
          success: false,
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

    console.log('💾 Storing FCM token for user:', user.id);

    // Get customer_id if available (for future webhook notifications)
    let customerId: string | null = null;
    try {
      customerId = await getCustomerId();
      console.log('💳 Customer ID:', customerId || 'Not found');
    } catch (error) {
      console.log('⚠️ Could not get customer ID (user may not have purchased yet)');
    }

    // Store FCM token in database
    // Use upsert to update if token already exists
    const { error } = await supabase
      .from('fcm_tokens')
      .upsert(
        {
          user_id: user.id,
          customer_id: customerId,
          fcm_token: fcm_token,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'fcm_token', // Update existing token if found
        },
      )
      .select();

    if (error) {
      console.error('❌ Failed to store FCM token:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to store FCM token',
          error: error.message,
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

    console.log('✅ FCM token stored successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'FCM token registered successfully',
      },
      {
        headers: {
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    );
  } catch (error) {
    console.error('❌ FCM registration error:', error);
    return NextResponse.json(
      {
        success: false,
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
