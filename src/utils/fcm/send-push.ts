/**
 * Web Push Notification Utility
 * Sends instant notifications to Chrome extension when subscription changes
 *
 * Uses standard Web Push API with VAPID authentication
 *
 * Setup Required:
 * 1. Generate VAPID keys: npx web-push generate-vapid-keys
 * 2. Add to environment variables (see .env.local.example):
 *    VAPID_PUBLIC_KEY=your-public-key
 *    VAPID_PRIVATE_KEY=your-private-key
 *    VAPID_SUBJECT=mailto:your@email.com
 *
 * Cost: FREE and UNLIMITED (Web Push is completely free)
 */

import webpush from 'web-push';

interface PushData {
  type: 'SUBSCRIPTION_CANCELLED' | 'SUBSCRIPTION_UPDATED';
  timestamp?: number;
}

interface PushResponse {
  success: boolean;
  error?: string;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Initialize web-push with VAPID keys
 */
function initializeWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:support@calendarextension.com';

  if (!publicKey || !privateKey) {
    throw new Error('Missing VAPID keys (VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY)');
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

/**
 * Send Web Push notification to a specific subscription
 */
export async function sendWebPush(subscription: PushSubscription, data: PushData): Promise<PushResponse> {
  console.log('📤 Sending Web Push notification:', data.type);

  try {
    // Initialize web-push with VAPID keys
    initializeWebPush();

    // Send push notification
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        type: data.type,
        timestamp: data.timestamp || Date.now(),
      }),
    );

    console.log('✅ Web Push sent successfully');

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Web Push error:', error);

    // Handle specific errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode;

      // 410 Gone means subscription is expired/invalid
      if (statusCode === 410 || statusCode === 404) {
        return {
          success: false,
          error: 'Subscription expired or invalid',
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send Web Push to all subscriptions for a customer
 * Returns number of successful sends
 */
export async function sendWebPushToCustomer(
  customerId: string,
  data: PushData,
): Promise<{ sent: number; failed: number }> {
  console.log('📤 Sending Web Push to all subscriptions for customer:', customerId);

  // Get all push subscriptions for this customer
  // IMPORTANT: Use server-internal (Service Role) to bypass RLS and read all subscriptions
  const { createClient } = await import('@/utils/supabase/server-internal');
  const supabase = await createClient();

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('subscription, endpoint, customer_id, user_id')
    .eq('customer_id', customerId);

  if (error) {
    console.error('❌ Failed to fetch push subscriptions:', error);
    console.error('   Error details:', error);
    return { sent: 0, failed: 0 };
  }

  console.log(`🔍 Query result: Found ${subscriptions?.length || 0} subscription(s) for customer ${customerId}`);

  if (!subscriptions || subscriptions.length === 0) {
    console.log('ℹ️ No push subscriptions found for customer');

    // Debug: Check if there are ANY push subscriptions at all
    const { data: allSubs } = await supabase.from('push_subscriptions').select('customer_id, endpoint').limit(10);
    console.log('🔍 Debug: Total push subscriptions in database:', allSubs?.length || 0);
    if (allSubs && allSubs.length > 0) {
      console.log(
        '🔍 Debug: Sample customer_ids in database:',
        allSubs.map((s) => s.customer_id),
      );
    }

    return { sent: 0, failed: 0 };
  }

  console.log(`📱 Found ${subscriptions.length} push subscription(s) for customer`);

  // Send to all subscriptions
  let sent = 0;
  let failed = 0;

  for (const subRecord of subscriptions) {
    const result = await sendWebPush(subRecord.subscription as PushSubscription, data);
    if (result.success) {
      sent++;
      // Update last_used_at timestamp
      await supabase
        .from('push_subscriptions')
        .update({ last_used_at: new Date().toISOString() })
        .eq('endpoint', subRecord.endpoint);
    } else {
      failed++;
      // If subscription is expired/invalid, remove it from database
      if (result.error?.includes('expired') || result.error?.includes('invalid')) {
        console.log('🗑️ Removing invalid push subscription:', subRecord.endpoint);
        await supabase.from('push_subscriptions').delete().eq('endpoint', subRecord.endpoint);
      }
    }
  }

  console.log(`✅ Web Push complete: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}
