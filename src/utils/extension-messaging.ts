import { createClient } from '@/utils/supabase/server';
import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';

interface ExtensionAuthMessage {
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
  };
}

interface ExtensionPaymentMessage {
  type: 'PAYMENT_SUCCESS';
  userId: string;
}

/**
 * Prepares an authentication success message for the Chrome extension
 * Extracts Supabase session tokens and checks subscription status
 */
export async function prepareAuthSuccessMessage(): Promise<Record<string, unknown> | null> {
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

    // Check subscription status
    let subscriptionStatus = {
      hasSubscription: false,
      status: undefined as string | undefined,
    };

    try {
      const customerId = await getCustomerId();
      if (customerId) {
        console.log('[extension-messaging] Checking subscription for customer:', customerId);
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
          };
          console.log('[extension-messaging] Active subscription found:', activeSubscription.status);
        } else {
          console.log('[extension-messaging] No active subscription found');
        }
      } else {
        console.log('[extension-messaging] No customer ID found');
      }
    } catch (subError) {
      console.error('[extension-messaging] Subscription check failed:', subError);
      // Continue anyway - user is authenticated even without subscription
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
export async function preparePaymentSuccessMessage(): Promise<Record<string, unknown> | null> {
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
