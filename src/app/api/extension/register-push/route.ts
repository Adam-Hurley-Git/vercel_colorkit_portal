import { NextRequest, NextResponse } from 'next/server';
import { createClientFromBearer } from '@/utils/supabase/from-bearer';
import { getCustomerIdFromSupabase } from '@/utils/paddle/get-customer-id-bearer';
import { getVapidPublicKeyHash } from '@/utils/fcm/send-push';

/**
 * Extension Push Subscription Registration API
 * Stores Web Push subscription for instant notifications
 * Used by Chrome extension to receive instant updates when subscription changes
 */
export async function POST(request: NextRequest) {
  console.log('📱 Push subscription registration request received');

  try {
    // Check authentication via Bearer token (extension doesn't have cookies)
    const supabase = createClientFromBearer(request.headers.get('authorization'));
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
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      console.log('❌ Missing subscription or endpoint in request body');
      return NextResponse.json(
        {
          success: false,
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

    console.log('💾 Storing push subscription for user:', user.id);
    console.log('   User email:', user.email);
    console.log('   Endpoint:', subscription.endpoint);

    // Get customer_id if available (for future webhook notifications)
    let customerId: string | null = null;
    try {
      customerId = await getCustomerIdFromSupabase(supabase);
      console.log('💳 Customer ID for user:', customerId || 'Not found (will be linked later)');
    } catch (error) {
      console.log('⚠️ Could not get customer ID (user may not have purchased yet)');
      console.log('   Error:', error);
    }

    // Compute VAPID public key hash to track which key this subscription was created with
    const vapidPubHash = getVapidPublicKeyHash();
    console.log('🔑 VAPID_PUBLIC_KEY hash:', vapidPubHash);

    // Store push subscription in database
    // Use upsert to update if subscription already exists
    const { data: insertedData, error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          customer_id: customerId,
          subscription: subscription,
          endpoint: subscription.endpoint,
          vapid_pub_hash: vapidPubHash, // Store key hash for validation
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'endpoint', // Update existing subscription if endpoint matches
        },
      )
      .select();

    if (error) {
      console.error('❌ Failed to store push subscription:', error);
      console.error('   Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to store push subscription',
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

    console.log('✅ Push subscription stored successfully');
    console.log('   Data:', JSON.stringify(insertedData, null, 2));

    return NextResponse.json(
      {
        success: true,
        message: 'Push subscription registered successfully',
      },
      {
        headers: {
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    );
  } catch (error) {
    console.error('❌ Push subscription registration error:', error);
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
