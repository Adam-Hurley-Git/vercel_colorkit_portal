import { createClient } from '@/utils/supabase/server';
import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';

// Type definitions for extension messaging (exported for use in other files)
export interface ExtensionAuthMessage {
  type: 'AUTH_SUCCESS';
  session: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email: string;
    };
  };
  subscriptionStatus: {
    hasSubscription: boolean;
    status?: string;
    verificationFailed?: boolean; // Indicates we couldn't verify (fail-open)
  };
}

export interface ExtensionPaymentMessage {
  type: 'PAYMENT_SUCCESS';
  userId: string;
}

export interface ExtensionSubscriptionCancelledMessage {
  type: 'SUBSCRIPTION_CANCELLED';
  customerId?: string;
  timestamp: number;
}

// Union type for all possible extension messages
export type ExtensionMessage = ExtensionAuthMessage | ExtensionPaymentMessage | ExtensionSubscriptionCancelledMessage;

/**
 * Prepares an authentication success message for the Chrome extension
 * Extracts Supabase session tokens and checks subscription status
 */
export async function prepareAuthSuccessMessage(): Promise<ExtensionAuthMessage | null> {
  try {
    const supabase = await createClient();

    // Get session from server cookies
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      console.error('[extension-messaging] No session found:', error?.message);
      return null;
    }

    console.log('[extension-messaging] Session found for user:', session.user.email);

    // Check subscription status with fail-open approach
    let subscriptionStatus = {
      hasSubscription: false,
      status: undefined as string | undefined,
      verificationFailed: undefined as boolean | undefined,
    };

    try {
      const customerId = await getCustomerId();
      if (customerId) {
        console.log('[extension-messaging] Checking subscription for customer:', customerId);

        // Try Paddle API first (most up-to-date)
        try {
          const paddle = getPaddleInstance();
          const subscriptionCollection = paddle.subscriptions.list({
            customerId: [customerId],
            perPage: 5,
          });

          const subscriptions = await subscriptionCollection.next();

          const activeSubscription = subscriptions.find(
            (sub) => sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due',
          );

          if (activeSubscription) {
            subscriptionStatus = {
              hasSubscription: true,
              status: activeSubscription.status,
              verificationFailed: false,
            };
            console.log(
              '[extension-messaging] ✅ Active subscription found via Paddle API:',
              activeSubscription.status,
            );
          } else {
            subscriptionStatus = {
              hasSubscription: false,
              status: 'none',
              verificationFailed: false,
            };
            console.log('[extension-messaging] ✅ No active subscription (confirmed via Paddle API)');
          }
        } catch (paddleError) {
          console.error('[extension-messaging] ⚠️ Paddle API failed, falling back to database check:', paddleError);

          // FAIL-OPEN: Paddle API failed, check database instead
          // This prevents locking users out during Paddle API issues
          try {
            const { data: subscription } = await supabase
              .from('subscriptions')
              .select('subscription_id, subscription_status')
              .eq('customer_id', customerId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (subscription) {
              const activeStatuses = ['active', 'trialing', 'past_due'];
              const isActive = activeStatuses.includes(subscription.subscription_status);

              subscriptionStatus = {
                hasSubscription: isActive,
                status: subscription.subscription_status,
                verificationFailed: false,
              };
              console.log(
                `[extension-messaging] ✅ Database fallback: subscription ${isActive ? 'active' : 'inactive'} (${subscription.subscription_status})`,
              );
            } else {
              subscriptionStatus = {
                hasSubscription: false,
                status: 'none',
                verificationFailed: false,
              };
              console.log('[extension-messaging] ✅ Database fallback: no subscription found');
            }
          } catch (dbError) {
            console.error('[extension-messaging] ❌ Database fallback also failed:', dbError);
            // FAIL-OPEN: Can't verify, don't change user's lock state
            subscriptionStatus = {
              hasSubscription: false,
              status: 'verification_error',
              verificationFailed: true, // Signal to not send cancellation message
            };
            console.log('[extension-messaging] ⚠️ Verification failed - will NOT send lock message (fail-open)');
          }
        }
      } else {
        console.log('[extension-messaging] No customer ID found - user has no subscription');
      }
    } catch (error) {
      console.error('[extension-messaging] ❌ Unexpected error during subscription check:', error);
      // FAIL-OPEN: Preserve existing state on errors
      subscriptionStatus = {
        hasSubscription: false,
        status: 'verification_error',
        verificationFailed: true,
      };
    }

    return {
      type: 'AUTH_SUCCESS',
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        user: {
          id: session.user.id,
          email: session.user.email || '',
        },
      },
      subscriptionStatus,
    };
  } catch (error) {
    console.error('[extension-messaging] Failed to prepare auth message:', error);
    return null;
  }
}

/**
 * Prepares a payment success message for the Chrome extension
 * Notifies extension that payment was completed and subscription should be refreshed
 */
export async function preparePaymentSuccessMessage(): Promise<ExtensionPaymentMessage | null> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      console.error('[extension-messaging] No session for payment message:', error?.message);
      return null;
    }

    console.log('[extension-messaging] Payment success message prepared for user:', session.user.id);

    return {
      type: 'PAYMENT_SUCCESS',
      userId: session.user.id,
    };
  } catch (error) {
    console.error('[extension-messaging] Failed to prepare payment message:', error);
    return null;
  }
}

/**
 * Prepares a subscription cancelled message for the Chrome extension
 * Notifies extension that subscription was cancelled and cache should be cleared
 *
 * @param customerId - Paddle customer ID (used to identify the user)
 * @returns Message object for ExtensionNotifier or null if user session not found
 */
export async function prepareSubscriptionCancelledMessage(
  customerId: string,
): Promise<ExtensionSubscriptionCancelledMessage | null> {
  try {
    console.log('[extension-messaging] Preparing cancellation message for customer:', customerId);

    return {
      type: 'SUBSCRIPTION_CANCELLED',
      customerId: customerId,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('[extension-messaging] Failed to prepare cancellation message:', error);
    return null;
  }
}
