import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';

/**
 * Extension Subscription Validation API
 * Checks if the current user has an active subscription
 * Used by Chrome extension to validate access
 *
 * Includes fallback logic to query Paddle API if customer not in database
 */
export async function GET(request: NextRequest) {
  console.log('🔍 Extension validation request received');
  console.log('Origin:', request.headers.get('origin'));
  console.log('Referer:', request.headers.get('referer'));
  console.log('User-Agent:', request.headers.get('user-agent'));

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

    // Try to get customer ID from database
    let customerId = await getCustomerId();

    // FALLBACK: If no customer ID in database, try Paddle API by email
    if (!customerId) {
      console.log('⚠️ No customer ID in database, trying Paddle API fallback...');
      customerId = await getCustomerIdFromPaddleByEmail(user.email!);

      if (customerId) {
        console.log('✅ Found customer via Paddle API:', customerId);
        // Save to database for next time
        await saveCustomerToDatabase(customerId, user.email!);
      } else {
        console.log('❌ No customer found in Paddle for email:', user.email);
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
    }

    console.log('💳 Customer ID:', customerId);

    // Check Paddle for active subscription
    const paddle = getPaddleInstance();
    const subscriptionCollection = paddle.subscriptions.list({
      customerId: [customerId],
      perPage: 5,
    });

    const subscriptions = await subscriptionCollection.next();

    console.log('📊 Found subscriptions:', subscriptions.length);

    if (subscriptions.length === 0) {
      console.log('ℹ️ No subscriptions found for customer');
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

    // Find active subscription (including trial and past_due for grace period)
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due',
    );

    if (activeSubscription) {
      console.log('✅ Active subscription found:', activeSubscription.id, activeSubscription.status);
      console.log('   Subscription details:', {
        id: activeSubscription.id,
        status: activeSubscription.status,
        currentPeriodEnd: activeSubscription.currentBillingPeriod?.endsAt,
      });

      return NextResponse.json(
        {
          isActive: true,
          status: activeSubscription.status,
          subscriptionId: activeSubscription.id,
          customerId: customerId,
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
    console.log(
      '   Found subscriptions with statuses:',
      subscriptions.map((s) => s.status),
    );
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
    console.error('   Error stack:', error instanceof Error ? error.stack : 'N/A');
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
 * Fallback: Find customer in Paddle by email
 */
async function getCustomerIdFromPaddleByEmail(email: string): Promise<string> {
  try {
    console.log('[extension/validate] Searching Paddle for customer with email:', email);
    const paddle = getPaddleInstance();
    const customerCollection = paddle.customers.list({ email: [email], perPage: 1 });
    const customers = await customerCollection.next();

    if (customers.length > 0) {
      return customers[0].id;
    }

    return '';
  } catch (error) {
    console.error('[extension/validate] Error searching Paddle:', error);
    return '';
  }
}

/**
 * Save customer to database (helper function)
 */
async function saveCustomerToDatabase(customerId: string, email: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('customers').upsert({
      customer_id: customerId,
      email: email,
    });

    if (error) {
      console.error('[extension/validate] Failed to save customer to database:', error);
    } else {
      console.log('[extension/validate] Customer saved to database for future lookups');
    }
  } catch (error) {
    console.error('[extension/validate] Error saving customer:', error);
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
