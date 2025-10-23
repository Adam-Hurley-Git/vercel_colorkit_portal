/**
 * Firebase Cloud Messaging (FCM) Push Notification Utility
 * Sends instant notifications to Chrome extension when subscription changes
 *
 * Uses FCM HTTP v1 API (modern, recommended approach)
 *
 * Setup Required:
 * 1. Create Firebase project: https://console.firebase.google.com/
 * 2. Go to Project Settings → Service Accounts
 * 3. Click "Generate new private key" and download JSON file
 * 4. Add to environment variables (see .env.local.example):
 *    FIREBASE_PROJECT_ID=your-project-id
 *    FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
 *    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *
 * Cost: FREE and UNLIMITED (Firebase Cloud Messaging is completely free)
 */

import { google } from 'googleapis';

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
 * Get OAuth2 access token for FCM v1 API
 */
async function getAccessToken(): Promise<string> {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error('Missing Firebase credentials (FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL)');
  }

  const jwtClient = new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey,
    ['https://www.googleapis.com/auth/firebase.messaging'],
    undefined,
  );

  const tokens = await jwtClient.authorize();
  if (!tokens.access_token) {
    throw new Error('Failed to obtain access token');
  }

  return tokens.access_token;
}

/**
 * Send FCM push notification to a specific token using FCM v1 API
 */
export async function sendFCMPush(fcmToken: string, data: FCMPushData): Promise<FCMResponse> {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    console.error('❌ FIREBASE_PROJECT_ID not configured');
    return {
      success: false,
      error: 'FCM not configured - missing FIREBASE_PROJECT_ID',
    };
  }

  console.log('📤 Sending FCM push notification:', data.type);

  try {
    // Get OAuth2 access token
    const accessToken = await getAccessToken();

    // Send using FCM v1 API
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          data: {
            type: data.type,
            timestamp: String(data.timestamp || Date.now()),
          },
          // Android config for priority (Chrome extensions use Android push)
          android: {
            priority: 'high',
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FCM push failed:', response.status, errorText);

      // Parse error for better handling
      let errorMessage = `FCM API returned ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        // Keep default error message
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const result = await response.json();
    console.log('✅ FCM push sent successfully:', result.name);

    return {
      success: true,
      messageId: result.name,
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
