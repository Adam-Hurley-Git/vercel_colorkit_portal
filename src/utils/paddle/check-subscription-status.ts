'use server';

import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';

/**
 * Check if the current user has any active subscriptions
 * @returns Promise<boolean> - true if user has active subscription, false otherwise
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    const customerId = await getCustomerId();

    // If no customer ID, user hasn't subscribed yet
    if (!customerId) {
      return false;
    }

    // Fetch subscriptions for this customer
    const subscriptionCollection = getPaddleInstance().subscriptions.list({
      customerId: [customerId],
      perPage: 1, // We only need to know if at least one exists
    });

    const subscriptions = await subscriptionCollection.next();

    // Check if any subscriptions exist and are active
    const hasActiveSubscription = subscriptions.some(
      (sub) => sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due',
    );

    return hasActiveSubscription;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

/**
 * Get user's subscription status details
 * @returns Promise with subscription status information
 */
export async function getSubscriptionStatus(): Promise<{
  hasSubscription: boolean;
  hasCustomerId: boolean;
  needsOnboarding: boolean;
}> {
  try {
    const customerId = await getCustomerId();
    const hasCustomerId = !!customerId;

    if (!hasCustomerId) {
      return {
        hasSubscription: false,
        hasCustomerId: false,
        needsOnboarding: true,
      };
    }

    const hasSubscription = await hasActiveSubscription();

    return {
      hasSubscription,
      hasCustomerId,
      needsOnboarding: !hasSubscription,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return {
      hasSubscription: false,
      hasCustomerId: false,
      needsOnboarding: true,
    };
  }
}
