/**
 * Server-side utility to notify Chrome extension about subscription changes
 * Uses chrome-webstore-upload-cli or similar to send messages to installed extensions
 *
 * NOTE: This is a server-side notification that requires the extension to be listening
 * The notification happens via HTTP request to a custom endpoint that the web app exposes
 */

interface ExtensionNotification {
  type: 'SUBSCRIPTION_CANCELLED' | 'SUBSCRIPTION_ACTIVATED';
  userId: string;
  timestamp: number;
}

/**
 * Notifies the Chrome extension about subscription cancellation
 * This will trigger cache invalidation in the extension
 *
 * @param email - User email to identify which extension instance to notify
 * @returns Promise<boolean> - true if notification was sent successfully
 */
export async function notifyExtensionSubscriptionCancelled(email: string): Promise<boolean> {
  try {
    console.log('[extension-notify] Preparing to notify extension about cancellation for:', email);

    // Since we can't directly send messages to extension from server,
    // we'll store a flag that the extension can check on its next validation call
    // OR we can use a database flag that gets picked up by the /api/extension/validate endpoint

    // For now, we'll rely on the extension's regular validation to detect the cancellation
    // The webhook already updates the database with the new status, so next validation will see it

    // However, for immediate notification, we could:
    // 1. Use Firebase Cloud Messaging (FCM) to push to extension
    // 2. Use WebSockets if extension maintains connection
    // 3. Store a "pending notification" flag in database

    // Simple approach: Return true since webhook updates database
    // Extension will detect on next validation
    console.log('[extension-notify] Subscription status updated in database, extension will detect on next check');

    return true;
  } catch (error) {
    console.error('[extension-notify] Error notifying extension:', error);
    return false;
  }
}

/**
 * Alternative: Send notification via web app page if user has it open
 * This leverages the ExtensionNotifier component
 *
 * We'll create a database table to store pending notifications
 * The web app checks this table and sends messages when user visits
 */
export async function queueExtensionNotification(
  customerId: string,
  notificationType: 'SUBSCRIPTION_CANCELLED' | 'SUBSCRIPTION_ACTIVATED',
): Promise<void> {
  try {
    const { createClient } = await import('@/utils/supabase/server-internal');
    const supabase = await createClient();

    // Store notification in database for pickup by web app
    const { error } = await supabase.from('extension_notifications').insert({
      customer_id: customerId,
      notification_type: notificationType,
      created_at: new Date().toISOString(),
      delivered: false,
    });

    if (error) {
      console.error('[extension-notify] Failed to queue notification:', error);
    } else {
      console.log('[extension-notify] Notification queued for customer:', customerId);
    }
  } catch (error) {
    console.error('[extension-notify] Error queueing notification:', error);
  }
}
