import type { NextApiRequest, NextApiResponse } from 'next';
import { ProcessWebhook } from '@/utils/paddle/process-webhook';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';

const webhookProcessor = new ProcessWebhook();

/**
 * Paddle Webhook Handler - Dedicated Endpoint
 *
 * This endpoint is specifically designed to avoid 307 redirects and middleware issues.
 * It's isolated in the Pages Router and completely bypasses all Next.js middleware.
 *
 * Use this URL in Paddle Dashboard:
 * - Production: https://your-domain.com/api/paddle/webhook
 * - Development (ngrok): https://your-ngrok-url.ngrok-free.app/api/paddle/webhook
 *
 * Why this path?
 * - Pages Router API routes don't trigger App Router middleware
 * - Path /api/paddle/webhook is explicitly excluded from Supabase auth middleware
 * - No authentication, no redirects, no session management
 * - Pure server-to-server webhook processing
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    console.log('[Paddle Webhook] ❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[Paddle Webhook] 📥 Received webhook request at /api/paddle/webhook');
  console.log('[Paddle Webhook] Headers:', JSON.stringify(req.headers, null, 2));

  const signature = req.headers['paddle-signature'] as string;
  const privateKey = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET || '';

  // Get raw body as string
  let rawBody: string;
  if (typeof req.body === 'string') {
    rawBody = req.body;
  } else if (typeof req.body === 'object') {
    rawBody = JSON.stringify(req.body);
  } else {
    console.error('[Paddle Webhook] ❌ Invalid body type:', typeof req.body);
    return res.status(400).json({ error: 'Invalid request body' });
  }

  console.log('[Paddle Webhook] 🔍 Validation checks:');
  console.log('  - Has signature:', !!signature);
  console.log('  - Has body:', !!rawBody);
  console.log('  - Has secret:', !!privateKey);
  console.log('  - Body length:', rawBody?.length || 0);

  try {
    if (!signature) {
      console.error('[Paddle Webhook] ❌ Missing paddle-signature header');
      return res.status(400).json({ error: 'Missing paddle-signature header' });
    }

    if (!rawBody) {
      console.error('[Paddle Webhook] ❌ Missing request body');
      return res.status(400).json({ error: 'Missing request body' });
    }

    if (!privateKey) {
      console.error('[Paddle Webhook] ❌ Missing PADDLE_NOTIFICATION_WEBHOOK_SECRET environment variable');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature and unmarshal event
    console.log('[Paddle Webhook] 🔐 Verifying signature...');
    const paddle = getPaddleInstance();
    const eventData = await paddle.webhooks.unmarshal(rawBody, privateKey, signature);
    const eventName = eventData?.eventType ?? 'Unknown event';

    console.log('[Paddle Webhook] ✅ Webhook verified successfully');
    console.log('[Paddle Webhook] 📋 Event type:', eventName);
    console.log('[Paddle Webhook] 📋 Event ID:', eventData?.eventId || 'N/A');

    // Process the event
    if (eventData) {
      console.log('[Paddle Webhook] ⚙️ Processing event...');
      await webhookProcessor.processEvent(eventData);
      console.log('[Paddle Webhook] ✅ Event processed successfully');
    } else {
      console.warn('[Paddle Webhook] ⚠️ No event data to process');
    }

    return res.status(200).json({
      success: true,
      eventName,
      eventId: eventData?.eventId,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('[Paddle Webhook] ❌ Error processing webhook:');
    console.error('  Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('  Error message:', error instanceof Error ? error.message : String(error));
    console.error('  Error stack:', error instanceof Error ? error.stack : 'N/A');

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'UnknownError',
    });
  }
}

/**
 * CRITICAL: Body Parser Configuration
 *
 * We need the raw request body as a string to verify Paddle's signature.
 * However, we also need Next.js to handle JSON parsing for ease of use.
 *
 * This config keeps bodyParser enabled but with a reasonable size limit.
 * Our handler above handles both string and object body formats.
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    // Explicitly disable external resolver to keep this route internal
    externalResolver: false,
  },
};
