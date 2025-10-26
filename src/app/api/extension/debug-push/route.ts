import { NextRequest, NextResponse } from 'next/server';
import { createClientFromBearer } from '@/utils/supabase/from-bearer';
import { getCustomerIdFromSupabase } from '@/utils/paddle/get-customer-id-bearer';
import { getVapidPublicKeyHash, sendWebPushToCustomer } from '@/utils/fcm/send-push';

/**
 * Debug Push Notification Endpoint
 *
 * This endpoint helps diagnose push notification issues by:
 * 1. Showing current VAPID key configuration
 * 2. Listing push subscriptions for the user
 * 3. Testing push notification sending
 * 4. Providing detailed diagnostic information
 *
 * Usage: GET /api/extension/debug-push?test=true (to send test push)
 */
export async function GET(request: NextRequest) {
  console.log('🔍 Debug Push endpoint called');

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
          success: false,
          error: 'Authentication required',
        },
        { status: 401 },
      );
    }

    console.log('✅ User authenticated:', user.email);

    // Collect diagnostic information
    const diagnostics: Record<string, unknown> = {
      user: {
        id: user.id,
        email: user.email,
      },
      vapid: {
        publicKeyConfigured: !!process.env.VAPID_PUBLIC_KEY,
        privateKeyConfigured: !!process.env.VAPID_PRIVATE_KEY,
        subjectConfigured: !!process.env.VAPID_SUBJECT,
        publicKeyHash: getVapidPublicKeyHash(),
        publicKeyPreview: process.env.VAPID_PUBLIC_KEY
          ? process.env.VAPID_PUBLIC_KEY.substring(0, 20) + '...'
          : 'NOT SET',
      },
      timestamp: new Date().toISOString(),
    };

    // Get customer_id
    let customerId: string | null = null;
    try {
      customerId = await getCustomerIdFromSupabase(supabase);
      diagnostics.customer = {
        customerId: customerId,
        hasCustomer: !!customerId,
      };
    } catch (error) {
      diagnostics.customer = {
        customerId: null,
        hasCustomer: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Get push subscriptions for this user
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, customer_id, vapid_pub_hash, created_at, updated_at, last_used_at')
      .eq('user_id', user.id);

    if (subsError) {
      diagnostics.subscriptions = {
        error: subsError.message,
        count: 0,
      };
    } else {
      diagnostics.subscriptions = {
        count: subscriptions?.length || 0,
        items: subscriptions?.map((sub) => ({
          id: sub.id,
          endpointPreview: sub.endpoint.substring(0, 50) + '...',
          customerId: sub.customer_id,
          vapidHashMatch: sub.vapid_pub_hash === diagnostics.vapid.publicKeyHash,
          vapidPubHash: sub.vapid_pub_hash,
          createdAt: sub.created_at,
          updatedAt: sub.updated_at,
          lastUsedAt: sub.last_used_at,
        })),
      };
    }

    // If customer_id is available, get subscriptions by customer_id too
    if (customerId) {
      const { data: customerSubs, error: customerSubsError } = await supabase
        .from('push_subscriptions')
        .select('id, endpoint, user_id, customer_id')
        .eq('customer_id', customerId);

      if (!customerSubsError) {
        diagnostics.subscriptionsByCustomer = {
          count: customerSubs?.length || 0,
          items: customerSubs?.map((sub) => ({
            id: sub.id,
            endpointPreview: sub.endpoint.substring(0, 50) + '...',
            userId: sub.user_id,
            customerId: sub.customer_id,
          })),
        };
      }
    }

    // Test push notification if requested
    const testPush = request.nextUrl.searchParams.get('test') === 'true';

    if (testPush) {
      console.log('🔔 Test push requested');

      if (!customerId) {
        diagnostics.testPush = {
          sent: false,
          error: 'No customer_id available. User needs to make a purchase first.',
        };
      } else {
        try {
          const result = await sendWebPushToCustomer(customerId, {
            type: 'SUBSCRIPTION_UPDATED',
            timestamp: Date.now(),
          });

          diagnostics.testPush = {
            sent: result.sent,
            failed: result.failed,
            success: result.sent > 0,
            message:
              result.sent > 0
                ? `Successfully sent ${result.sent} push notification(s)`
                : `Failed to send push. ${result.failed} failed.`,
          };
        } catch (error) {
          diagnostics.testPush = {
            sent: 0,
            failed: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }
    }

    // Analysis and recommendations
    const analysis: string[] = [];

    if (!diagnostics.vapid.publicKeyConfigured || !diagnostics.vapid.privateKeyConfigured) {
      analysis.push('❌ CRITICAL: VAPID keys not configured in environment variables');
      analysis.push('   → Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Vercel Dashboard');
    }

    if (diagnostics.subscriptions.count === 0) {
      analysis.push('⚠️ No push subscriptions found for this user');
      analysis.push('   → Extension needs to register push subscription');
      analysis.push('   → Check extension console for registration errors');
    }

    if (diagnostics.subscriptions.count > 0) {
      const items = diagnostics.subscriptions.items as Array<{ vapidHashMatch: boolean }> | undefined;
      const mismatchCount = items?.filter((s) => !s.vapidHashMatch).length || 0;
      if (mismatchCount > 0) {
        analysis.push(`❌ CRITICAL: ${mismatchCount} subscription(s) have VAPID key mismatch`);
        analysis.push('   → Extension was built with different VAPID_PUBLIC_KEY than backend');
        analysis.push('   → Update extension config and rebuild');
        analysis.push('   → Mismatched subscriptions will be auto-deleted on next push attempt');
      } else {
        analysis.push('✅ All push subscriptions have matching VAPID keys');
      }
    }

    if (!diagnostics.customer.hasCustomer) {
      analysis.push('⚠️ No customer_id found');
      analysis.push('   → User may not have made a purchase yet');
      analysis.push('   → Webhooks will not send push notifications without customer_id');
    }

    if (
      diagnostics.customer.hasCustomer &&
      diagnostics.subscriptions.count > 0 &&
      (diagnostics.subscriptions.items as Array<{ customerId: string | null }> | undefined)?.some((s) => !s.customerId)
    ) {
      analysis.push('⚠️ Some subscriptions missing customer_id');
      analysis.push('   → These subscriptions were registered before purchase');
      analysis.push('   → They will be linked automatically after next webhook');
    }

    diagnostics.analysis = analysis;

    return NextResponse.json({
      success: true,
      diagnostics,
      help: {
        verifyKeys: 'Run: node scripts/verify-vapid-keys.js',
        setupKeys: 'Run: node scripts/setup-vapid-keys.js',
        testPush: 'Add ?test=true to this endpoint URL to send a test push',
      },
    });
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
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
