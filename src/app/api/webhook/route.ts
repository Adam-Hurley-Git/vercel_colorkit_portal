import { NextRequest } from 'next/server';
import { ProcessWebhook } from '@/utils/paddle/process-webhook';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';

const webhookProcessor = new ProcessWebhook();

export async function POST(request: NextRequest) {
  const signature = request.headers.get('paddle-signature') || '';
  const rawRequestBody = await request.text();
  const privateKey = process.env['PADDLE_NOTIFICATION_WEBHOOK_SECRET'] || '';

  console.log('[Webhook Route] 📥 Received webhook');
  console.log('[Webhook Route] Has signature:', !!signature);
  console.log('[Webhook Route] Has body:', !!rawRequestBody);
  console.log('[Webhook Route] Has secret:', !!privateKey);

  try {
    if (!signature || !rawRequestBody) {
      console.error('[Webhook Route] ❌ Missing signature or body');
      return Response.json({ error: 'Missing signature from header' }, { status: 400 });
    }

    const paddle = getPaddleInstance();
    const eventData = await paddle.webhooks.unmarshal(rawRequestBody, privateKey, signature);
    const eventName = eventData?.eventType ?? 'Unknown event';

    console.log('[Webhook Route] ✅ Webhook verified, event type:', eventName);

    if (eventData) {
      await webhookProcessor.processEvent(eventData);
    }

    console.log('[Webhook Route] ✅ Event processed successfully');
    return Response.json({ status: 200, eventName });
  } catch (e) {
    console.error('[Webhook Route] ❌ Error processing webhook:', e);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
