import {
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  EventEntity,
  EventName,
  SubscriptionCreatedEvent,
  SubscriptionUpdatedEvent,
} from '@paddle/paddle-node-sdk';
import { createClient } from '@/utils/supabase/server-internal';

export class ProcessWebhook {
  async processEvent(eventData: EventEntity) {
    switch (eventData.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
        await this.updateSubscriptionData(eventData);
        break;
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await this.updateCustomerData(eventData);
        break;
    }
  }

  private async updateSubscriptionData(eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent) {
    console.log('[Webhook] Processing subscription event:', eventData.eventType);
    console.log('[Webhook] Subscription ID:', eventData.data.id);
    console.log('[Webhook] Customer ID:', eventData.data.customerId);

    const supabase = await createClient();
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
      throw error;
    }

    console.log('[Webhook] ✅ Subscription saved successfully:', data);
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
      throw error;
    }

    console.log('[Webhook] ✅ Customer saved successfully:', data);
  }
}
