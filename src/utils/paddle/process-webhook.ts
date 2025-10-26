import {
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  EventEntity,
  EventName,
  SubscriptionCanceledEvent,
  SubscriptionCreatedEvent,
  SubscriptionUpdatedEvent,
  TransactionCompletedEvent,
} from '@paddle/paddle-node-sdk';
import { createClient } from '@/utils/supabase/server-internal';

export class ProcessWebhook {
  async processEvent(eventData: EventEntity) {
    console.log('[ProcessWebhook] Processing event type:', eventData.eventType);

    switch (eventData.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
      case EventName.SubscriptionCanceled:
        await this.updateSubscriptionData(eventData);
        break;
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await this.updateCustomerData(eventData);
        break;
      case EventName.TransactionCompleted:
        await this.handleTransactionCompleted(eventData);
        break;
      default:
        console.log('[ProcessWebhook] ℹ️ Unhandled event type:', eventData.eventType);
    }
  }

  private async updateSubscriptionData(
    eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent | SubscriptionCanceledEvent,
  ) {
    console.log('[Webhook] Processing subscription event:', eventData.eventType);
    console.log('[Webhook] Subscription ID:', eventData.data.id);
    console.log('[Webhook] Customer ID:', eventData.data.customerId);
    console.log('[Webhook] Subscription Status:', eventData.data.status);

    const supabase = await createClient();

    // First, ensure customer exists (defensive programming)
    await this.ensureCustomerExists(eventData.data.customerId);

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        subscription_id: eventData.data.id,
        subscription_status: eventData.data.status,
        price_id: eventData.data.items[0].price?.id ?? '',
        product_id: eventData.data.items[0].price?.productId ?? '',
        scheduled_change: eventData.data.scheduledChange?.effectiveAt,
        customer_id: eventData.data.customerId,
      })
      .select();

    if (error) {
      console.error('[Webhook] ❌ Failed to save subscription:', error);
      console.error('[Webhook] Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('[Webhook] ✅ Subscription saved successfully:', data);

    // IMPORTANT: Update push subscriptions with customer_id
    // When extension first registers, customer may not exist yet (customer_id is null)
    // After payment completes, we need to link push subscription to customer_id
    await this.updatePushSubscriptionsWithCustomerId(eventData.data.customerId);

    // Send Web Push notification on ANY subscription status change
    // This provides instant lock/unlock (< 1 minute) without requiring user to visit dashboard
    // Note: Paddle uses 'canceled' (one 'l'), not 'cancelled'
    const status = eventData.data.status;
    const customerId = eventData.data.customerId;

    console.log('[Webhook] 📤 PUSH NOTIFICATION FLOW STARTING');
    console.log(`[Webhook] Customer ID: ${customerId}`);
    console.log(`[Webhook] Subscription Status: ${status}`);
    console.log(`[Webhook] Event Type: ${eventData.eventType}`);

    // Send push on both active/inactive transitions
    // NOTE: past_due maintains full access (grace period while Paddle retries payment)
    if (['active', 'trialing', 'past_due'].includes(status)) {
      // UNLOCK: subscription has active access
      console.log('[Webhook] 🔓 Subscription active/trialing/past_due - sending unlock push');
      console.log('[Webhook] Push notification type: SUBSCRIPTION_UPDATED');

      try {
        const { sendWebPushToCustomer } = await import('@/utils/fcm/send-push');
        const result = await sendWebPushToCustomer(customerId, {
          type: 'SUBSCRIPTION_UPDATED',
          timestamp: Date.now(),
        });
        console.log(`[Webhook] ✅ Unlock push completed: ${result.sent} successful, ${result.failed} failed`);

        if (result.sent === 0 && result.failed === 0) {
          console.error('[Webhook] ⚠️ WARNING: No push subscriptions found for customer!');
          console.error('[Webhook] Possible causes:');
          console.error('[Webhook]   1. Extension not installed or not registered');
          console.error('[Webhook]   2. Push subscription not linked to customer_id yet');
          console.error('[Webhook]   3. User logged in with different email than Paddle customer');
        }
      } catch (pushError) {
        console.error('[Webhook] ❌ Failed to send unlock push (will fallback to daily check):', pushError);
        console.error('[Webhook] Error details:', pushError);
      }
    } else if (['canceled', 'paused'].includes(status)) {
      // LOCK: subscription is truly inactive
      console.log('[Webhook] 🔒 Subscription cancelled/paused - sending lock push');
      console.log('[Webhook] Push notification type: SUBSCRIPTION_CANCELLED');

      try {
        const { sendWebPushToCustomer } = await import('@/utils/fcm/send-push');
        const result = await sendWebPushToCustomer(customerId, {
          type: 'SUBSCRIPTION_CANCELLED',
          timestamp: Date.now(),
        });
        console.log(`[Webhook] ✅ Lock push completed: ${result.sent} successful, ${result.failed} failed`);

        if (result.sent === 0 && result.failed === 0) {
          console.error('[Webhook] ⚠️ WARNING: No push subscriptions found for customer!');
          console.error('[Webhook] Possible causes:');
          console.error('[Webhook]   1. Extension not installed or not registered');
          console.error('[Webhook]   2. Push subscription not linked to customer_id yet');
          console.error('[Webhook]   3. User logged in with different email than Paddle customer');
        }
      } catch (pushError) {
        console.error('[Webhook] ❌ Failed to send lock push (will fallback to daily check):', pushError);
        console.error('[Webhook] Error details:', pushError);
      }
    } else {
      console.log(`[Webhook] ℹ️ Status "${status}" does not trigger push notification`);
    }

    console.log('[Webhook] 📤 PUSH NOTIFICATION FLOW COMPLETE');
  }

  private async updateCustomerData(eventData: CustomerCreatedEvent | CustomerUpdatedEvent) {
    console.log('[Webhook] Processing customer event:', eventData.eventType);
    console.log('[Webhook] Customer ID:', eventData.data.id);
    console.log('[Webhook] Email:', eventData.data.email);

    const supabase = await createClient();

    // NEW: Look up user_id by email for reliable linking
    console.log('[Webhook] 🔍 Looking up user by email:', eventData.data.email);
    const { data: userData } = await supabase.auth.admin.listUsers();
    const matchingUser = userData?.users?.find((u) => u.email === eventData.data.email);
    const userId = matchingUser?.id || null;

    if (userId) {
      console.log('[Webhook] ✅ Found matching user for customer:', userId);
    } else {
      console.log('[Webhook] ⚠️ No matching user found for email:', eventData.data.email);
      console.log('[Webhook] Customer will be saved without user_id (can be linked later)');
    }

    const { data, error } = await supabase
      .from('customers')
      .upsert({
        customer_id: eventData.data.id,
        email: eventData.data.email,
        user_id: userId, // NEW: Set user_id for automatic linking via trigger
      })
      .select();

    if (error) {
      console.error('[Webhook] ❌ Failed to save customer:', error);
      console.error('[Webhook] Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('[Webhook] ✅ Customer saved successfully:', data);
  }

  private async handleTransactionCompleted(eventData: TransactionCompletedEvent) {
    console.log('[Webhook] Processing transaction.completed event');
    console.log('[Webhook] Transaction ID:', eventData.data.id);
    console.log('[Webhook] Customer ID:', eventData.data.customerId);

    if (!eventData.data.customerId) {
      console.warn('[Webhook] ⚠️ Transaction has no customer ID, skipping customer creation');
      return;
    }

    // When a transaction completes, ensure the customer exists in our database
    // This is a backup path in case customer.created webhook didn't fire first
    await this.ensureCustomerExists(eventData.data.customerId, eventData.data.customerId);

    console.log('[Webhook] ✅ Transaction processed successfully');
  }

  /**
   * Ensures a customer record exists in the database
   * Fetches customer details from Paddle API if needed
   */
  private async ensureCustomerExists(customerId: string, email?: string) {
    console.log('[Webhook] 🔍 Checking if customer exists:', customerId);

    const supabase = await createClient();

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_id', customerId)
      .single();

    if (existingCustomer) {
      console.log('[Webhook] ✅ Customer already exists in database');
      return;
    }

    console.log('[Webhook] 📝 Customer not found, fetching from Paddle API...');

    // Customer doesn't exist, fetch from Paddle API
    try {
      const { getPaddleInstance } = await import('@/utils/paddle/get-paddle-instance');
      const paddle = getPaddleInstance();
      const customer = await paddle.customers.get(customerId);

      console.log('[Webhook] 📥 Fetched customer from Paddle:', customer.email);

      // NEW: Look up user_id by email
      const { data: userData } = await supabase.auth.admin.listUsers();
      const matchingUser = userData?.users?.find((u) => u.email === customer.email);
      const userId = matchingUser?.id || null;

      if (userId) {
        console.log('[Webhook] ✅ Found matching user for customer:', userId);
      } else {
        console.log('[Webhook] ⚠️ No matching user found for customer email:', customer.email);
      }

      // Save to database
      const { data, error } = await supabase
        .from('customers')
        .insert({
          customer_id: customerId,
          email: customer.email || email || '',
          user_id: userId, // NEW: Set user_id for automatic linking
        })
        .select();

      if (error) {
        console.error('[Webhook] ❌ Failed to create customer record:', error);
        console.error('[Webhook] Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('[Webhook] ✅ Customer created successfully:', data);
    } catch (error) {
      console.error('[Webhook] ❌ Failed to fetch customer from Paddle API:', error);
      // Don't throw here - allow the subscription to be saved even if customer fetch fails
      console.warn('[Webhook] ⚠️ Continuing without customer record...');
    }
  }

  /**
   * Updates push subscriptions with customer_id after payment
   * Fixes issue where extension registers push before customer exists
   *
   * Flow:
   * 1. Extension registers → push subscription saved with customer_id=null
   * 2. User purchases → customer created
   * 3. This function links push subscription to customer_id by matching user_id
   * 4. Future webhooks can now send notifications
   */
  private async updatePushSubscriptionsWithCustomerId(customerId: string) {
    console.log('[Webhook] 🔗 CUSTOMER ID LINKING FLOW STARTING');
    console.log(`[Webhook] Customer ID: ${customerId}`);

    const supabase = await createClient();

    // Get customer email
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('email')
      .eq('customer_id', customerId)
      .single();

    if (customerError || !customer?.email) {
      console.error('[Webhook] ❌ Could not find customer email:', customerError?.message);
      console.error('[Webhook] This will prevent push subscription linking!');
      return;
    }

    console.log(`[Webhook] Customer email: ${customer.email}`);

    // Get all push subscriptions that don't have a customer_id
    const { data: nullSubs, error: queryError } = await supabase
      .from('push_subscriptions')
      .select('user_id, endpoint')
      .is('customer_id', null);

    if (queryError) {
      console.error('[Webhook] ❌ Failed to query push subscriptions:', queryError);
      console.error('[Webhook] Error details:', JSON.stringify(queryError, null, 2));
      return;
    }

    if (!nullSubs || nullSubs.length === 0) {
      console.log('[Webhook] ℹ️ No push subscriptions without customer_id found');
      console.log('[Webhook] This is normal if:');
      console.log('[Webhook]   1. All subscriptions already linked');
      console.log('[Webhook]   2. Extension not installed yet');
      console.log('[Webhook]   3. User purchased before installing extension');
      return;
    }

    console.log(`[Webhook] 🔍 Found ${nullSubs.length} push subscription(s) without customer_id`);
    console.log('[Webhook] Attempting to match by email...');

    // For each subscription, check if user email matches customer email
    let updated = 0;
    let checked = 0;
    for (const sub of nullSubs) {
      checked++;
      try {
        // Get user email using admin API (bypasses RLS)
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(sub.user_id);

        if (userError) {
          console.error(`[Webhook] ⚠️ Could not get user data for ${sub.user_id}:`, userError.message);
          continue;
        }

        const userEmail = userData?.user?.email;
        console.log(`[Webhook] Checking subscription ${checked}/${nullSubs.length}: user email = ${userEmail}`);

        if (userEmail === customer.email) {
          // Match found! Update this subscription with customer_id
          console.log(`[Webhook] ✅ EMAIL MATCH FOUND! Linking subscription...`);

          const { error: updateError } = await supabase
            .from('push_subscriptions')
            .update({ customer_id: customerId })
            .eq('endpoint', sub.endpoint);

          if (!updateError) {
            updated++;
            console.log(`[Webhook] ✅ Successfully linked: ${sub.endpoint.substring(0, 50)}...`);
          } else {
            console.error('[Webhook] ❌ Failed to update subscription:', updateError.message);
            console.error('[Webhook] Error details:', JSON.stringify(updateError, null, 2));
          }
        } else {
          console.log(`[Webhook] ⏭️ Email mismatch (customer: ${customer.email}, user: ${userEmail})`);
        }
      } catch (error) {
        console.error('[Webhook] ⚠️ Error checking user:', error);
      }
    }

    if (updated > 0) {
      console.log(`[Webhook] ✅ Successfully linked ${updated}/${nullSubs.length} push subscription(s) to customer`);
    } else {
      console.error(`[Webhook] ⚠️ WARNING: No matching push subscriptions found!`);
      console.error('[Webhook] Checked:', checked, 'subscriptions');
      console.error('[Webhook] Customer email:', customer.email);
      console.error('[Webhook] Possible causes:');
      console.error('[Webhook]   1. User logged into extension with different email than Paddle');
      console.error('[Webhook]   2. Extension was installed on different browser/device');
      console.error('[Webhook]   3. Push subscription registration failed silently');
    }

    console.log('[Webhook] 🔗 CUSTOMER ID LINKING FLOW COMPLETE');
  }
}
