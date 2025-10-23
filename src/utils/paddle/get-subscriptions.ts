'use server';

import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { SubscriptionResponse } from '@/lib/api.types';
import { getErrorMessage } from '@/utils/paddle/data-helpers';
import { createClient } from '@/utils/supabase/server';

export async function getSubscriptions(): Promise<SubscriptionResponse> {
  try {
    // Try to get customer ID from database first
    let customerId = await getCustomerId();

    // FALLBACK: If no customer ID from database, try to find it by email from Paddle API
    if (!customerId) {
      console.log('[get-subscriptions] No customer_id found in database, attempting fallback...');
      customerId = await getCustomerIdFromPaddleByEmail();

      if (customerId) {
        console.log('[get-subscriptions] ✅ Found customer via Paddle API fallback:', customerId);
      } else {
        console.log('[get-subscriptions] ❌ No customer found via fallback');
        return {
          data: [],
          hasMore: false,
          totalRecords: 0,
        };
      }
    }

    if (customerId) {
      console.log('[get-subscriptions] Fetching subscriptions for customer:', customerId);
      const subscriptionCollection = getPaddleInstance().subscriptions.list({ customerId: [customerId], perPage: 20 });
      const subscriptions = await subscriptionCollection.next();

      console.log('[get-subscriptions] ✅ Found', subscriptions.length, 'subscription(s)');

      return {
        data: subscriptions,
        hasMore: subscriptionCollection.hasMore,
        totalRecords: subscriptionCollection.estimatedTotal,
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.error('[get-subscriptions] ❌ Error fetching subscriptions:', e);
    return getErrorMessage();
  }
  return getErrorMessage();
}

/**
 * Fallback function to find customer ID from Paddle by email
 * Used when customer record doesn't exist in database yet (webhook hasn't processed)
 */
async function getCustomerIdFromPaddleByEmail(): Promise<string> {
  try {
    const supabase = await createClient();
    const user = await supabase.auth.getUser();

    if (!user.data.user?.email) {
      console.log('[get-subscriptions] No user email found');
      return '';
    }

    const userEmail = user.data.user.email;
    console.log('[get-subscriptions] Searching Paddle for customer with email:', userEmail);

    // Search for customer in Paddle by email
    const paddle = getPaddleInstance();
    const customerCollection = paddle.customers.list({ email: [userEmail], perPage: 1 });
    const customers = await customerCollection.next();

    if (customers.length > 0) {
      const paddleCustomerId = customers[0].id;
      console.log('[get-subscriptions] 📥 Found Paddle customer:', paddleCustomerId);

      // Save to database for future use
      await saveCustomerToDatabase(paddleCustomerId, userEmail);

      return paddleCustomerId;
    }

    console.log('[get-subscriptions] No Paddle customer found for email:', userEmail);
    return '';
  } catch (error) {
    console.error('[get-subscriptions] ❌ Error in fallback customer lookup:', error);
    return '';
  }
}

/**
 * Save customer to database (used by fallback function)
 */
async function saveCustomerToDatabase(customerId: string, email: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('customers').upsert({
      customer_id: customerId,
      email: email,
    });

    if (error) {
      console.error('[get-subscriptions] ⚠️ Failed to save customer to database:', error);
    } else {
      console.log('[get-subscriptions] ✅ Customer saved to database');
    }
  } catch (error) {
    console.error('[get-subscriptions] ⚠️ Error saving customer:', error);
  }
}
