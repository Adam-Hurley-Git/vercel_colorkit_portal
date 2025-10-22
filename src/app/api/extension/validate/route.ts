import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';

/**
 * Extension Subscription Validation API
 * Checks if the current user has an active subscription
 * Used by Chrome extension to validate access
 */
export async function GET(request: NextRequest) {
  console.log('🔍 Extension validation request received');
  console.log('Origin:', request.headers.get('origin'));
  console.log('Referer:', request.headers.get('referer'));

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
          isActive: false,
          reason: 'not_authenticated',
          message: 'Please sign in to continue',
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

    // Get customer ID from Supabase
    const customerId = await getCustomerId();

    if (!customerId) {
      console.log('ℹ️ No customer ID found for user');
      return NextResponse.json(
        {
          isActive: false,
          reason: 'no_customer',
          message: 'No subscription found. Start your free trial!',
        },
        {
          headers: {
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Credentials': 'true',
          },
        },
      );
    }

    console.log('💳 Customer ID found:', customerId);

    // Check Paddle for active subscription
    const paddle = getPaddleInstance();
    const subscriptionCollection = paddle.subscriptions.list({
      customerId: [customerId],
      perPage: 5,
    });

    const subscriptions = await subscriptionCollection.next();

    console.log('📊 Found subscriptions:', subscriptions.length);

    // Find active subscription (including trial and past_due for grace period)
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due',
    );

    if (activeSubscription) {
      console.log('✅ Active subscription found:', activeSubscription.id, activeSubscription.status);

      return NextResponse.json(
        {
          isActive: true,
          status: activeSubscription.status,
          trialEnding:
            activeSubscription.status === 'trialing' ? activeSubscription.currentBillingPeriod?.endsAt : null,
          message: activeSubscription.status === 'trialing' ? 'Free trial active' : 'Subscription active',
        },
        {
          headers: {
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Credentials': 'true',
          },
        },
      );
    }

    // No active subscription found
    console.log('❌ No active subscription found');
    return NextResponse.json(
      {
        isActive: false,
        reason: 'no_active_subscription',
        message: 'Subscription expired. Renew to continue using ColorKit.',
      },
      {
        headers: {
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    );
  } catch (error) {
    console.error('❌ Extension validation error:', error);
    return NextResponse.json(
      {
        isActive: false,
        reason: 'error',
        message: 'Unable to verify subscription. Please try again.',
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
