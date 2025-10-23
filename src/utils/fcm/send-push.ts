/**
 * Firebase Cloud Messaging (FCM) Push Notification Utility
 * Sends instant notifications to Chrome extension when subscription changes
 *
 * Setup Required:
 * 1. Create Firebase project: https://console.firebase.google.com/
 * 2. Get Server Key: Firebase Console → Project Settings → Cloud Messaging → Server key
 * 3. Add to environment: FIREBASE_SERVER_KEY=your_server_key_here
 *
 * Cost: FREE and UNLIMITED (Firebase Cloud Messaging is completely free)
 */

interface FCMPushData {
  type: 'SUBSCRIPTION_CANCELLED' | 'SUBSCRIPTION_UPDATED';
  timestamp?: number;
}

interface FCMResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send FCM push notification to a specific token
 */
export async function sendFCMPush(fcmToken: string, data: FCMPushData): Promise<FCMResponse> {
  const serverKey = process.env.FIREBASE_SERVER_KEY;

  if (!serverKey) {
    console.error('❌ FIREBASE_SERVER_KEY not configured');
    return {
      success: false,
      error: 'FCM not configured - missing FIREBASE_SERVER_KEY',
    };
  }

  console.log('📤 Sending FCM push notification:', data.type);

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${serverKey}`,
      },
      body: JSON.stringify({
        to: fcmToken,
        data: {
          type: data.type,
          timestamp: data.timestamp || Date.now(),
        },
        // Priority high to ensure delivery even when extension is inactive
        priority: 'high',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FCM push failed:', response.status, errorText);
      return {
        success: false,
        error: `FCM API returned ${response.status}: ${errorText}`,
      };
    }

    const result = await response.json();

    if (result.failure > 0) {
      console.error('❌ FCM push failed:', result.results[0].error);
      return {
        success: false,
        error: result.results[0].error,
      };
    }

    console.log('✅ FCM push sent successfully:', result.results[0].message_id);
    return {
      success: true,
      messageId: result.results[0].message_id,
    };
  } catch (error) {
    console.error('❌ FCM push error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send FCM push to all tokens for a customer
 * Returns number of successful sends
 */
export async function sendFCMPushToCustomer(
  customerId: string,
  data: FCMPushData,
): Promise<{ sent: number; failed: number }> {
  console.log('📤 Sending FCM push to all tokens for customer:', customerId);

  // Get all FCM tokens for this customer
  const { createClient } = await import('@/utils/supabase/server');
  const supabase = await createClient();

  const { data: tokens, error } = await supabase.from('fcm_tokens').select('fcm_token').eq('customer_id', customerId);

  if (error) {
    console.error('❌ Failed to fetch FCM tokens:', error);
    return { sent: 0, failed: 0 };
  }

  if (!tokens || tokens.length === 0) {
    console.log('ℹ️ No FCM tokens found for customer');
    return { sent: 0, failed: 0 };
  }

  console.log(`📱 Found ${tokens.length} FCM token(s) for customer`);

  // Send to all tokens
  let sent = 0;
  let failed = 0;

  for (const tokenRecord of tokens) {
    const result = await sendFCMPush(tokenRecord.fcm_token, data);
    if (result.success) {
      sent++;
      // Update last_used_at timestamp
      await supabase
        .from('fcm_tokens')
        .update({ last_used_at: new Date().toISOString() })
        .eq('fcm_token', tokenRecord.fcm_token);
    } else {
      failed++;
      // If token is invalid, remove it from database
      if (result.error?.includes('NotRegistered') || result.error?.includes('InvalidRegistration')) {
        console.log('🗑️ Removing invalid FCM token:', tokenRecord.fcm_token);
        await supabase.from('fcm_tokens').delete().eq('fcm_token', tokenRecord.fcm_token);
      }
    }
  }

  console.log(`✅ FCM push complete: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}
