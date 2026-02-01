import { NextRequest, NextResponse } from 'next/server';
import { createClientFromBearer } from '@/utils/supabase/from-bearer';

/**
 * OPTIMIZED Extension Subscription Validation API
 *
 * Key changes from original:
 * 1. Uses database as source of truth (updated via webhooks)
 * 2. NO Paddle API calls (saves time and rate limits)
 * 3. Relies on FCM push + webhooks to keep data fresh
 *
 * Why this works:
 * - Webhooks update subscriptions table in real-time
 * - FCM sends push when subscription changes
 * - Extension gets instant notification via FCM
 * - This endpoint just reads from database (fast!)
 *
 * Fallback: If somehow data is stale (shouldn't happen with FCM),
 * daily validation at 4 AM will force refresh.
 */
export async function GET(request: NextRequest) {
  console.log('🔍 Extension validation request (optimized)');

  try {
    // Check authentication via Bearer token (extension doesn't have cookies)
    const supabase = createClientFromBearer(request.headers.get('authorization'));
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('❌ User not authenticated');
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

    // Get customer from database (linked via email)
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('email', user.email)
      .single();

    if (customerError || !customer) {
      console.log('❌ No customer record found in database');
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

    console.log('💳 Customer ID:', customer.customer_id);

    // Get subscription from database (updated via webhooks)
    // NO PADDLE API CALL - much faster!
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('subscription_id, subscription_status, scheduled_change')
      .eq('customer_id', customer.customer_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError || !subscription) {
      console.log('ℹ️ No subscription found in database');
      return NextResponse.json(
        {
          isActive: false,
          reason: 'no_subscription',
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

    console.log('📊 Subscription status:', subscription.subscription_status);

    // Check if subscription is active (including trial and past_due for grace period)
    const activeStatuses = ['active', 'trialing', 'past_due'];
    const isActive = activeStatuses.includes(subscription.subscription_status);

    if (isActive) {
      console.log('✅ Subscription is active');

      return NextResponse.json(
        {
          isActive: true,
          status: subscription.subscription_status,
          subscriptionId: subscription.subscription_id,
          customerId: customer.customer_id,
          message: subscription.subscription_status === 'trialing' ? 'Free trial active' : 'Subscription active',
          dataSource: 'database', // Indicates we used database, not Paddle API
        },
        {
          headers: {
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Credentials': 'true',
          },
        },
      );
    }

    // Subscription is not active
    console.log('❌ Subscription not active:', subscription.subscription_status);
    return NextResponse.json(
      {
        isActive: false,
        reason: 'subscription_inactive',
        status: subscription.subscription_status,
        wasPreviouslySubscribed: true, // User has customer record - they subscribed before!
        message:
          subscription.subscription_status === 'canceled'
            ? 'Subscription cancelled. Renew to continue.'
            : 'Subscription inactive. Please update your payment method.',
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
