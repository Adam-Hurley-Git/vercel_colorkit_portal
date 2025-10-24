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

  // Validate VAPID subject is a valid URL
  if (!subject.startsWith('mailto:') && !subject.startsWith('http://') && !subject.startsWith('https://')) {
    console.error('❌ VAPID_SUBJECT must be a valid URL (e.g., mailto:email@domain.com)');
    console.error('   Current value:', subject);
    throw new Error(`Vapid subject is not a valid URL. ${subject} → Must start with mailto:, http://, or https://`);
  }

  console.log('🔐 Initializing web-push with VAPID details');
  console.log('   Subject:', subject);
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
      console.error('   HTTP Status Code:', statusCode);

      // 410 Gone means subscription is expired/invalid
      // 404 Not Found means push endpoint no longer exists
      if (statusCode === 410 || statusCode === 404) {
        console.log('🗑️  Subscription is expired/invalid (will be removed from database)');
        return {
          success: false,
          error: 'subscription_expired',
        };
      }

      // 429 Too Many Requests - rate limited
      if (statusCode === 429) {
        console.error('   Rate limited by push service');
        return {
          success: false,
          error: 'rate_limited',
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
  let expired = 0;

  for (const subRecord of subscriptions) {
    console.log(`📤 Sending to endpoint: ${subRecord.endpoint.substring(0, 50)}...`);
    const result = await sendWebPush(subRecord.subscription as PushSubscription, data);

    if (result.success) {
      sent++;
      console.log('   ✅ Sent successfully');
      // Update last_used_at timestamp
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({ last_used_at: new Date().toISOString() })
        .eq('endpoint', subRecord.endpoint);

      if (updateError) {
        console.error('   ⚠️ Failed to update last_used_at:', updateError);
      }
    } else {
      failed++;
      console.log(`   ❌ Failed: ${result.error}`);

      // If subscription is expired/invalid (410 Gone or 404 Not Found), remove it from database
      if (result.error === 'subscription_expired') {
        expired++;
        console.log(`   🗑️  Removing expired subscription from database`);
        const { error: deleteError } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subRecord.endpoint);

        if (deleteError) {
          console.error('   ⚠️ Failed to delete expired subscription:', deleteError);
        } else {
          console.log('   ✅ Expired subscription removed');
        }
      }
    }
  }

  console.log(
    `✅ Web Push complete: ${sent} sent, ${failed} failed${expired > 0 ? `, ${expired} expired and removed` : ''}`,
  );
  return { sent, failed };
}
