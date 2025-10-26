import { NextRequest, NextResponse } from 'next/server';
import { createClientFromBearer } from '@/utils/supabase/from-bearer';
import { getCustomerIdFromSupabase } from '@/utils/paddle/get-customer-id-bearer';

/**
 * Push Subscription Status Endpoint
 *
 * Simple endpoint to check if push subscription is properly registered.
 * Used by extension to verify backend registration.
 *
 * Usage: GET /api/extension/subscription-status
 */
export async function GET(request: NextRequest) {
  console.log('📊 Subscription status check');

  try {
    // Check authentication
    const supabase = createClientFromBearer(request.headers.get('authorization'));
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          registered: false,
          reason: 'not_authenticated',
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

    // Get customer_id if available
    let customerId: string | null = null;
    try {
      customerId = await getCustomerIdFromSupabase(supabase);
    } catch {
      // Customer ID not found is okay, user may not have purchased yet
    }

    // Check for push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, customer_id, updated_at')
      .eq('user_id', user.id);

    if (subsError) {
      console.error('Error fetching push subscriptions:', subsError);
      return NextResponse.json(
        {
          registered: false,
          reason: 'database_error',
          error: subsError.message,
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

    const hasSubscriptions = subscriptions && subscriptions.length > 0;
    const hasCustomerLinked = hasSubscriptions && subscriptions.some((s) => s.customer_id);

    // Determine status
    let status: 'fully_registered' | 'pending_customer' | 'not_registered';
    let message: string;

    if (!hasSubscriptions) {
      status = 'not_registered';
      message = 'No push subscription found. Extension needs to register.';
    } else if (!customerId) {
      status = 'pending_customer';
      message = 'Push subscription registered but no customer_id. Make a purchase to complete setup.';
    } else if (!hasCustomerLinked) {
      status = 'pending_customer';
      message = 'Push subscription registered but not linked to customer. Will link automatically on next webhook.';
    } else {
      status = 'fully_registered';
      message = 'Push subscription fully registered and ready to receive notifications.';
    }

    console.log(`✅ Status check complete: ${status}`);

    return NextResponse.json(
      {
        registered: hasSubscriptions,
        status,
        message,
        details: {
          userId: user.id,
          email: user.email,
          customerId: customerId,
          subscriptionCount: subscriptions?.length || 0,
          hasCustomerLinked,
          lastUpdated: subscriptions?.[0]?.updated_at,
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
    console.error('❌ Subscription status error:', error);
    return NextResponse.json(
      {
        registered: false,
        reason: 'internal_error',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
