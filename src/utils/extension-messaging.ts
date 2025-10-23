'use server';

import { createClient } from '@/utils/supabase/server';
import { hasActiveSubscription } from '@/utils/paddle/check-subscription-status';

/**
 * Extension Messaging Utility
 * Handles communication between web app and Chrome extension
 */

export interface ExtensionMessage {
  type: 'AUTH_SUCCESS' | 'PAYMENT_SUCCESS' | 'LOGOUT' | 'SUBSCRIPTION_UPDATED';
  session?: {
    access_token: string;
    refresh_token: string;
    user?: {
      id: string;
      email?: string;
    };
  };
  subscriptionStatus?: {
    hasSubscription: boolean;
    status?: 'active' | 'trialing' | 'past_due';
  };
}

/**
 * Prepare auth success message with session and subscription data
 * This is called server-side to get the data, then sent client-side
 */
export async function prepareAuthSuccessMessage(): Promise<ExtensionMessage | null> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      console.log('[Extension Messaging] No session available');
      return null;
    }

    // Check subscription status
    const hasSubscription = await hasActiveSubscription();

    return {
      type: 'AUTH_SUCCESS',
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        user: {
          id: session.user.id,
          email: session.user.email,
        },
      },
      subscriptionStatus: {
        hasSubscription,
        status: hasSubscription ? 'active' : undefined, // We'll get actual status from validate endpoint
      },
    };
  } catch (error) {
    console.error('[Extension Messaging] Error preparing auth message:', error);
    return null;
  }
}

/**
 * Prepare payment success message
 */
export async function preparePaymentSuccessMessage(): Promise<ExtensionMessage> {
  return {
    type: 'PAYMENT_SUCCESS',
    subscriptionStatus: {
      hasSubscription: true,
      status: 'active',
    },
  };
}

/**
 * Prepare logout message
 */
export function prepareLogoutMessage(): ExtensionMessage {
  return {
    type: 'LOGOUT',
  };
}
