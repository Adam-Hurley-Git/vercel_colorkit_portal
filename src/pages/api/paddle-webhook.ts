import type { NextApiRequest, NextApiResponse } from 'next';
import { ProcessWebhook } from '@/utils/paddle/process-webhook';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';

const webhookProcessor = new ProcessWebhook();

/**
 * Paddle Webhook Handler (Pages Router)
 * This route is separate from App Router and bypasses middleware completely.
 * Use this URL in Paddle: https://your-domain.com/api/paddle-webhook
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    console.log('[Paddle Webhook] ❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[Paddle Webhook] 📥 Received webhook request');

  const signature = req.headers['paddle-signature'] as string;
  const privateKey = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET || '';

  // Get raw body as string
  let rawBody: string;
  if (typeof req.body === 'string') {
    rawBody = req.body;
  } else if (typeof req.body === 'object') {
    rawBody = JSON.stringify(req.body);
  } else {
    console.error('[Paddle Webhook] ❌ Invalid body type');
    return res.status(400).json({ error: 'Invalid request body' });
  }

  console.log('[Paddle Webhook] Has signature:', !!signature);
  console.log('[Paddle Webhook] Has body:', !!rawBody);
  console.log('[Paddle Webhook] Has secret:', !!privateKey);

  try {
    if (!signature || !rawBody) {
      console.error('[Paddle Webhook] ❌ Missing signature or body');
      return res.status(400).json({ error: 'Missing signature or body' });
    }

    // Verify webhook signature and unmarshal event
    const paddle = getPaddleInstance();
    const eventData = await paddle.webhooks.unmarshal(rawBody, privateKey, signature);
    const eventName = eventData?.eventType ?? 'Unknown event';

    console.log('[Paddle Webhook] ✅ Webhook verified, event type:', eventName);

    // Process the event
    if (eventData) {
      await webhookProcessor.processEvent(eventData);
    }

    console.log('[Paddle Webhook] ✅ Event processed successfully');
    return res.status(200).json({ success: true, eventName });
  } catch (error) {
    console.error('[Paddle Webhook] ❌ Error processing webhook:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * IMPORTANT: Configure body parsing for Paddle webhooks
 * We need the raw body as a string to verify the signature
 * But Next.js Pages Router will parse JSON by default
 * So we keep bodyParser enabled but handle both cases in the handler
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
