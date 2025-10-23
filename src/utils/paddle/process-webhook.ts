import {
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  EventEntity,
  EventName,
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

  private async updateSubscriptionData(eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent) {
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

    // Note: Extension cache invalidation happens automatically
    // When user visits dashboard, it checks subscription status and sends cancellation message if needed
  }

  private async updateCustomerData(eventData: CustomerCreatedEvent | CustomerUpdatedEvent) {
    console.log('[Webhook] Processing customer event:', eventData.eventType);
    console.log('[Webhook] Customer ID:', eventData.data.id);
    console.log('[Webhook] Email:', eventData.data.email);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customers')
      .upsert({
        customer_id: eventData.data.id,
        email: eventData.data.email,
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

      // Save to database
      const { data, error } = await supabase
        .from('customers')
        .insert({
          customer_id: customerId,
          email: customer.email || email || '',
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
}
