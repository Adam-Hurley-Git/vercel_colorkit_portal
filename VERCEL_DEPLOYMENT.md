# Vercel Deployment Guide - Subscription Fix

## Overview

This guide covers deploying the subscription dashboard fixes to Vercel. The changes ensure subscriptions appear correctly after Paddle checkout.

## What Changed

### Code Changes:

- ✅ `src/utils/paddle/process-webhook.ts` - Enhanced webhook processing with fallbacks
- ✅ `src/utils/paddle/get-subscriptions.ts` - Added Paddle API fallback for subscription display

### Key Features Added:

1. **Transaction webhook handling** - Backup customer creation path
2. **Automatic customer fetching** - From Paddle API when missing from database
3. **Paddle API fallback** - Dashboard queries Paddle directly if needed
4. **Enhanced logging** - Better debugging for webhook issues

## Vercel Environment Variables

### Required Variables (Set in Vercel Dashboard)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

#### 1. Supabase (Private)

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find:** Supabase Dashboard → Project Settings → API → service_role key

#### 2. Paddle API Key (Private)

```bash
# For Sandbox Testing:
PADDLE_API_KEY=pdl_sdbx_apikey_01xxxxx

# For Production:
PADDLE_API_KEY=pdl_live_apikey_01xxxxx
```

**Where to find:** Paddle Dashboard → Developer Tools → Authentication

#### 3. Paddle Webhook Secret (Private)

```bash
# For Sandbox Testing:
PADDLE_NOTIFICATION_WEBHOOK_SECRET=ntfset_01xxxxx_sandbox

# For Production:
PADDLE_NOTIFICATION_WEBHOOK_SECRET=ntfset_01xxxxx_live
```

**Where to find:** Paddle Dashboard → Developer Tools → Notifications → Your Webhook → Notification Secret Key

#### 4. Paddle Client Token (Public)

```bash
# For Sandbox Testing:
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_xxxxx

# For Production:
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_xxxxx
```

**Where to find:** Paddle Dashboard → Developer Tools → Client-side tokens

#### 5. Chrome Extension ID (Public - Optional)

```bash
NEXT_PUBLIC_EXTENSION_ID=your-extension-id
```

**Where to find:** Chrome Extensions page after loading your extension

### Already Set (Public Variables)

These are in `.env.production` and will be automatically picked up:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wmmnunrcthtnahxwjlgn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_PADDLE_ENV=sandbox  # Change to "production" when ready
```

## Paddle Webhook Configuration

### 1. Get Your Vercel Deployment URL

After deployment, your URL will be:

```
https://your-project-name.vercel.app
```

Or if using custom domain:

```
https://your-custom-domain.com
```

### 2. Configure Webhook in Paddle

**For Sandbox (Testing):**

1. Go to https://sandbox-vendors.paddle.com
2. Navigate to **Developer Tools → Notifications**
3. Click **"New Destination"** or edit existing webhook
4. Set URL to:
   ```
   https://your-project-name.vercel.app/api/paddle/webhook
   ```
5. Enable these events:
   - ✅ `customer.created`
   - ✅ `customer.updated`
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `transaction.completed`
6. Copy the **Notification Secret Key**
7. Add it to Vercel environment variables as `PADDLE_NOTIFICATION_WEBHOOK_SECRET`

**For Production:**

- Repeat above steps in production Paddle dashboard
- Use production webhook secret
- Ensure `NEXT_PUBLIC_PADDLE_ENV=production` in Vercel

### 3. Test Webhook Delivery

After deployment:

1. Complete a test purchase in Paddle sandbox
2. Check Paddle Dashboard → Developer Tools → Notifications → Recent Deliveries
3. Verify webhook shows **200 OK** status
4. Check Vercel logs for webhook processing

## Deployment Steps

### Step 1: Push to GitHub

From your local repository:

```bash
cd paddle-nextjs-starter-kit

# Stage changes
git add src/utils/paddle/get-subscriptions.ts
git add src/utils/paddle/process-webhook.ts

# Commit changes
git commit -m "Fix subscription dashboard integration with Paddle

- Add transaction.completed webhook handling
- Implement Paddle API fallback for missing customers
- Add automatic customer creation from Paddle API
- Enhance logging for better debugging
- Ensure subscriptions display even when webhooks delayed"

# Push to GitHub
git push origin main
```

### Step 2: Verify Vercel Auto-Deploy

1. Vercel will automatically detect the push and start deploying
2. Go to Vercel Dashboard → Your Project → Deployments
3. Watch the build logs
4. Wait for deployment to complete

### Step 3: Set Environment Variables

**CRITICAL:** Ensure these are set in Vercel:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
PADDLE_API_KEY=your-paddle-api-key
PADDLE_NOTIFICATION_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your-client-token
```

**To set variables:**

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable for **Production** environment
3. Click **"Redeploy"** after adding variables

### Step 4: Update Paddle Webhook URL

1. Copy your Vercel deployment URL
2. Update Paddle webhook destination to:
   ```
   https://your-vercel-url.vercel.app/api/paddle/webhook
   ```
3. Save in Paddle dashboard

### Step 5: Test the Integration

1. Complete a test payment in Paddle sandbox
2. Watch Vercel function logs:
   - Vercel Dashboard → Your Project → Deployments → Latest → Functions
   - Look for `/api/paddle/webhook` logs
3. Verify subscription appears in dashboard
4. Check Supabase tables:
   - `customers` should have new record
   - `subscriptions` should have subscription data

## Vercel Function Logs

To view webhook logs in Vercel:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Click **"Functions"** tab
4. Find `/api/paddle/webhook` function
5. View logs to see webhook processing

Expected log output:

```
[Paddle Webhook] 📥 Received webhook request
[Paddle Webhook] ✅ Webhook verified successfully
[ProcessWebhook] Processing event type: subscription.created
[Webhook] ✅ Subscription saved successfully
```

## Troubleshooting

### ❌ Webhooks Failing (400/500 errors)

**Check:**

1. `PADDLE_NOTIFICATION_WEBHOOK_SECRET` is set in Vercel
2. Webhook secret matches the one in Paddle dashboard
3. Vercel function logs show the actual error

**Fix:**

- Verify environment variable is set correctly
- Redeploy after setting variables
- Test webhook with Paddle's "Send Test Event" feature

### ❌ Subscription Not Showing

**Check:**

1. Vercel logs show webhook was received (200 OK)
2. Supabase `customers` table has record for your email
3. Supabase `subscriptions` table has subscription data

**Fix:**

- With the new fallback, subscription should show even if webhooks fail
- Dashboard will query Paddle API directly
- Check Vercel function logs for errors

### ❌ Environment Variables Not Working

**Symptoms:**

- "Missing PADDLE_API_KEY" errors
- "Webhook secret not configured" errors

**Fix:**

1. Verify variables are set in **Production** environment
2. Click **"Redeploy"** after setting variables
3. Check variable names match exactly (case-sensitive)

## Production Checklist

Before switching to production:

- [ ] All environment variables set in Vercel
- [ ] Webhook URL updated in Paddle production dashboard
- [ ] `NEXT_PUBLIC_PADDLE_ENV=production` in Vercel
- [ ] Production Paddle API keys configured
- [ ] Production webhook secret configured
- [ ] Test purchase completed successfully
- [ ] Subscription appears in dashboard
- [ ] Webhooks showing 200 OK in Paddle
- [ ] Supabase tables receiving data

## Monitoring

### Watch These:

1. **Vercel Function Logs** - Check for webhook processing errors
2. **Paddle Dashboard** - Monitor webhook delivery success rate
3. **Supabase Tables** - Verify customers and subscriptions are being created
4. **User Reports** - Check if subscriptions are displaying correctly

### Set Up Alerts:

- Enable Vercel error notifications
- Monitor Paddle webhook failure rate
- Set up Supabase database alerts for errors

## Support

If issues persist:

1. Check Vercel function logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test webhooks with Paddle's "Send Test Event" feature
4. Review `SUBSCRIPTION_TROUBLESHOOTING.md` for detailed debugging steps

## Key Files

- `src/utils/paddle/process-webhook.ts` - Webhook event processing
- `src/utils/paddle/get-subscriptions.ts` - Subscription fetching with fallback
- `src/pages/api/paddle/webhook.ts` - Webhook endpoint
- `.env.production` - Environment variable template

## Next Steps After Deployment

1. Test with sandbox payment
2. Verify subscription displays
3. Monitor webhook delivery
4. Switch to production when ready

---

**Deployment Status:** ✅ Ready to Deploy

**Last Updated:** 2025-10-23
