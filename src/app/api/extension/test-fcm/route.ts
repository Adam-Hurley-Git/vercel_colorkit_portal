import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendFCMPush } from '@/utils/fcm/send-push';

/**
 * Test FCM Push Notification Endpoint
 *
 * Use this to verify FCM is working correctly
 *
 * Usage:
 * GET /api/extension/test-fcm
 *   - Tests FCM for currently logged in user
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "FCM test sent successfully",
 *   "results": {
 *     "customerId": "ctm_...",
 *     "tokensFound": 2,
 *     "sent": 2,
 *     "failed": 0,
 *     "details": [...]
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[test-fcm] Testing FCM push notification...');

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      console.error('[test-fcm] No session found:', authError?.message);
      return NextResponse.json({ success: false, error: 'Unauthorized - please sign in' }, { status: 401 });
    }

    console.log('[test-fcm] Authenticated user:', session.user.email);

    // Get customer ID for this user
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('email', session.user.email)
      .single();

    if (customerError || !customer) {
      console.error('[test-fcm] No customer found for user:', session.user.email);
      return NextResponse.json(
        {
          success: false,
          error: 'No Paddle customer found for this user',
          hint: 'You may need to complete a payment first',
        },
        { status: 404 },
      );
    }

    console.log('[test-fcm] Customer ID:', customer.customer_id);

    // Get all FCM tokens for this customer
    const { data: tokens, error: tokensError } = await supabase
      .from('fcm_tokens')
      .select('fcm_token, created_at, last_used_at')
      .eq('customer_id', customer.customer_id);

    if (tokensError) {
      console.error('[test-fcm] Error fetching tokens:', tokensError);
      return NextResponse.json({ success: false, error: 'Failed to fetch FCM tokens' }, { status: 500 });
    }

    if (!tokens || tokens.length === 0) {
      console.log('[test-fcm] No FCM tokens found for customer');
      return NextResponse.json(
        {
          success: false,
          error: 'No FCM tokens registered',
          hint: 'Make sure the Chrome extension is installed and has registered an FCM token',
          customerId: customer.customer_id,
          tokensFound: 0,
        },
        { status: 404 },
      );
    }

    console.log(`[test-fcm] Found ${tokens.length} FCM token(s) for customer`);

    // Send test push to all tokens
    const results: Array<{
      token: string;
      success: boolean;
      messageId?: string;
      error?: string;
      created_at: string;
      last_used_at: string | null;
    }> = [];

    let sentCount = 0;
    let failedCount = 0;

    for (const tokenRecord of tokens) {
      console.log(`[test-fcm] Sending test push to token: ${tokenRecord.fcm_token.substring(0, 20)}...`);

      const result = await sendFCMPush(tokenRecord.fcm_token, {
        type: 'SUBSCRIPTION_CANCELLED',
        timestamp: Date.now(),
      });

      if (result.success) {
        sentCount++;
        // Update last_used_at timestamp
        await supabase
          .from('fcm_tokens')
          .update({ last_used_at: new Date().toISOString() })
          .eq('fcm_token', tokenRecord.fcm_token);
      } else {
        failedCount++;
        // If token is invalid, remove it
        if (result.error?.includes('NotRegistered') || result.error?.includes('InvalidRegistration')) {
          console.log('[test-fcm] Removing invalid token:', tokenRecord.fcm_token.substring(0, 20));
          await supabase.from('fcm_tokens').delete().eq('fcm_token', tokenRecord.fcm_token);
        }
      }

      results.push({
        token: `${tokenRecord.fcm_token.substring(0, 20)}...`,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        created_at: tokenRecord.created_at,
        last_used_at: tokenRecord.last_used_at,
      });
    }

    console.log(`[test-fcm] Test complete: ${sentCount} sent, ${failedCount} failed`);

    return NextResponse.json({
      success: true,
      message: `FCM test sent to ${sentCount}/${tokens.length} token(s)`,
      results: {
        customerId: customer.customer_id,
        userEmail: session.user.email,
        tokensFound: tokens.length,
        sent: sentCount,
        failed: failedCount,
        details: results,
      },
    });
  } catch (error) {
    console.error('[test-fcm] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
