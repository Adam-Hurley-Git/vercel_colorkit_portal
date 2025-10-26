# Vercel Deployment Guide - Paddle Next.js Starter Kit

This guide documents all changes needed to deploy your Paddle Next.js Starter Kit from localhost to Vercel production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Code Changes Required](#code-changes-required)
4. [Paddle Configuration](#paddle-configuration)
5. [Supabase Configuration](#supabase-configuration)
6. [Vercel Deployment Steps](#vercel-deployment-steps)
7. [Post-Deployment Testing](#post-deployment-testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying to Vercel, ensure you have:

- [ ] A Vercel account (https://vercel.com)
- [ ] A Paddle account (sandbox or production)
- [ ] A Supabase account with a project set up
- [ ] Git repository connected to Vercel
- [ ] Node.js 20+ installed locally (for testing)

---

## Environment Variables

### Current Local Setup (.env.local)

Your current environment variables are configured for **localhost development**.

### Production Environment Variables (Vercel)

You need to configure these in **Vercel Dashboard → Project Settings → Environment Variables**:

#### Supabase Variables

```bash
# Private
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Public
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

#### Paddle Variables

```bash
# Private
NEXT_PUBLIC_PADDLE_ENV=sandbox  # Change to "production" when ready for live payments
PADDLE_API_KEY=<your-paddle-api-key>
PADDLE_NOTIFICATION_WEBHOOK_SECRET=<your-webhook-secret>

# Public
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=<your-paddle-client-token>
```

**Important Notes:**

- Use **sandbox** credentials initially for testing
- Switch to **production** credentials only after thorough testing
- Keep `PADDLE_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` secret - never commit them to Git
- All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser

---

## Code Changes Required

### 1. **OAuth Redirect URL** (CRITICAL)

**File:** `src/app/login/actions.ts`
**Lines:** 39-42

**Current Code (localhost):**

```typescript
export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // For local testing
      redirectTo: `http://localhost:3000/auth/callback`,
      // NOTE: After Vercel deploy, update this to:
      // redirectTo: `https://YOUR-VERCEL-APP.vercel.app/auth/callback`,
    },
  });
  if (data.url) {
    redirect(data.url);
  }
}
```

**Required Change:**

```typescript
export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Use environment variable for dynamic redirect URL
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });
  if (data.url) {
    redirect(data.url);
  }
}
```

**Then add to Vercel Environment Variables:**

```bash
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### 2. **Image Domains Configuration** (Optional)

**File:** `next.config.mjs`
**Lines:** 3-4

**Current Code:**

```javascript
const nextConfig = {
  images: {
    domains: ['cdn.simpleicons.org', 'localhost', 'paddle-billing.vercel.app'],
  },
};
```

**Recommended Change:**

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
      {
        protocol: 'https',
        hostname: 'paddle-billing.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
    ],
  },
};
```

**Why:** `remotePatterns` is the recommended approach and more secure than `domains`.

---

## Paddle Configuration

### 1. **Update Webhook URL** (CRITICAL - This is why subscriptions don't show)

Currently, your Paddle webhooks are pointing to a placeholder localhost URL, which Paddle cannot reach.

**Steps:**

1. **Deploy your app to Vercel first** to get your production URL
2. **Go to Paddle Dashboard:**
   - Navigate to: **Developer Tools → Notifications → Destination**
   - URL: https://sandbox-vendors.paddle.com/notifications-settings (sandbox) or https://vendors.paddle.com/notifications-settings (production)

3. **Add Webhook Endpoint:**

   ```
   https://your-app-name.vercel.app/api/webhook
   ```

4. **Configure Webhook Secret:**
   - Copy the webhook secret key from Paddle
   - Add it to Vercel environment variables as `PADDLE_NOTIFICATION_WEBHOOK_SECRET`

5. **Subscribe to Events:**
   Ensure these events are enabled:
   - ✅ `customer.created`
   - ✅ `customer.updated`
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.activated`
   - ✅ `subscription.canceled`
   - ✅ `subscription.past_due`
   - ✅ `subscription.paused`
   - ✅ `transaction.completed`
   - ✅ `transaction.updated`

6. **Test Webhook:**
   - Use Paddle's webhook testing tool to send a test event
   - Check your Vercel logs to confirm receipt

### 2. **Paddle Environment Mode**

**Development/Testing:**

```bash
NEXT_PUBLIC_PADDLE_ENV=sandbox
```

**Production (Live Payments):**

```bash
NEXT_PUBLIC_PADDLE_ENV=production
```

**Important:** When switching from `sandbox` to `production`:

- Update ALL Paddle-related environment variables (API key, client token, webhook secret)
- Update webhook URL in Paddle production dashboard
- Test thoroughly in sandbox before switching

---

## Supabase Configuration

### 1. **Update Redirect URLs**

**Go to:** Supabase Dashboard → Authentication → URL Configuration

**Add these URLs:**

```
Site URL: https://your-app-name.vercel.app
Redirect URLs:
  - https://your-app-name.vercel.app/auth/callback
  - https://your-app-name.vercel.app/**
  - http://localhost:3000/auth/callback (for local development)
```

### 2. **Database Migration**

Ensure your database has the required tables:

**Check if migrations are applied:**

```sql
-- In Supabase SQL Editor
SELECT * FROM customers LIMIT 1;
SELECT * FROM subscriptions LIMIT 1;
SELECT * FROM user_agreements LIMIT 1;
```

**If tables don't exist, apply migrations IN ORDER:**

**IMPORTANT:** Migrations must be applied sequentially by timestamp. Do NOT combine them.

#### Migration 1: Initialize Core Tables

- Go to: Supabase Dashboard → SQL Editor
- Copy and paste contents of: `supabase/migrations/20240907140223_initialize.sql`
- Click "Run"
- This creates `customers` and `subscriptions` tables

#### Migration 2: User Agreements Table

- In the same SQL Editor (or new query)
- Copy and paste contents of: `supabase/migrations/20251021000000_user_agreements.sql`
- Click "Run"
- This creates `user_agreements` table with RLS policies

**If only user_agreements table is missing:**

- The core tables were already created (via Vercel integration or manual setup)
- Only run migration: `supabase/migrations/20251021000000_user_agreements.sql`

### 3. **Row Level Security (RLS)**

The migrations automatically set up RLS policies:

- Authenticated users can read `customers` table
- Authenticated users can read `subscriptions` table
- Users can read/insert/update their own `user_agreements`
- Only service role can write to `customers` and `subscriptions` (via webhooks)

**Verify all policies are active:**

```sql
-- In Supabase SQL Editor
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('customers', 'subscriptions', 'user_agreements')
ORDER BY tablename, policyname;
```

**Expected policies:**

- `customers`: Enable read access for authenticated users
- `subscriptions`: Enable read access for authenticated users
- `user_agreements`: Users can view their own agreements
- `user_agreements`: Users can insert their own agreements
- `user_agreements`: Users can update their own agreements

---

## Vercel Deployment Steps

### Step 1: Push Code to Git

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Import Project to Vercel

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `pnpm build` or `npm run build`
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `pnpm install` or `npm install`

### Step 3: Add Environment Variables

In Vercel project settings, add all environment variables from the [Environment Variables](#environment-variables) section.

**Important:**

- Add them for **Production**, **Preview**, and **Development** environments
- Click "Add" after each variable

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Note your production URL: `https://your-app-name.vercel.app`

### Step 5: Update Configurations

Now that you have your production URL:

1. **Update Paddle webhook URL** (see [Paddle Configuration](#paddle-configuration))
2. **Update Supabase redirect URLs** (see [Supabase Configuration](#supabase-configuration))
3. **Add `NEXT_PUBLIC_APP_URL` to Vercel** environment variables
4. **Update code** if using hardcoded URLs (see [Code Changes Required](#code-changes-required))

### Step 6: Redeploy

If you made code changes:

```bash
git add .
git commit -m "Update URLs for production"
git push origin main
```

Vercel will automatically redeploy.

---

## Post-Deployment Testing

### 1. Test Authentication

- [ ] Sign up with email/password
- [ ] Sign in with Google OAuth
- [ ] Anonymous sign-in
- [ ] Verify redirect to onboarding page

### 2. Test Onboarding & User Agreements

- [ ] Complete onboarding steps
- [ ] Reach the onboarding complete page
- [ ] Verify all 5 agreement checkboxes are visible
- [ ] Try to click "Start Free Trial" without checking boxes (should be disabled)
- [ ] Click "Accept All Terms and Conditions to Start" checkbox
- [ ] Verify all individual checkboxes are now checked
- [ ] Click "Start Free Trial" button
- [ ] Verify button shows "Saving..." state
- [ ] Confirm redirect to checkout page occurs

### 3. Test Subscription Flow

- [ ] Complete payment in Paddle sandbox
- [ ] Verify email confirmation from Paddle
- [ ] Check Paddle webhook logs in Vercel
- [ ] Return to dashboard
- [ ] **Verify subscription shows on dashboard** (this is the main fix)

### 4. Test User Agreements Saved

Check that user agreements were saved to database:

```sql
-- Check user agreements table
SELECT
  email,
  terms_accepted,
  terms_accepted_at,
  refund_accepted,
  refund_accepted_at,
  privacy_accepted,
  privacy_accepted_at,
  recurring_accepted,
  recurring_accepted_at,
  withdrawal_accepted,
  withdrawal_accepted_at,
  created_at
FROM user_agreements
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**

- Each user who completed onboarding should have a record
- All required fields (terms, refund, privacy, recurring) should be `true`
- Each accepted agreement should have a timestamp
- Withdrawal field may be `true` or `false` (it's optional)

### 5. Test Database Sync

Check Supabase tables are populated:

```sql
-- Check customers table
SELECT * FROM customers;

-- Check subscriptions table
SELECT * FROM subscriptions;
```

**Expected Result:**

- `customers` table should have an entry with your email and `customer_id` from Paddle
- `subscriptions` table should have your subscription details

### 6. Check Vercel Logs

**Check for webhook events:**

- Go to Vercel Dashboard → Your Project → Logs
- Filter by `/api/webhook`
- Verify webhook events are being received

**Check for user agreements API:**

- Filter by `/api/user-agreements`
- Verify POST requests are successful (200 status)
- Check for any errors during agreement saves

### 7. Check Paddle Webhook Logs

- Go to Paddle Dashboard → Developer Tools → Notifications → Logs
- Verify webhooks are being sent successfully
- Check for any errors (e.g., 404, 500)

---

## Troubleshooting

### Issue: Subscriptions Not Showing on Dashboard

**Root Cause:** Paddle webhooks not reaching your server

**Solution:**

1. Verify webhook URL in Paddle dashboard: `https://your-app.vercel.app/api/webhook`
2. Check webhook secret matches environment variable
3. Test webhook in Paddle dashboard
4. Check Vercel logs for webhook requests
5. Verify `customers` table has data:
   ```sql
   SELECT * FROM customers WHERE email = 'your-email@example.com';
   ```

**Manual Fix (for testing):**
If webhooks still don't work, manually insert customer data:

```sql
INSERT INTO customers (customer_id, email)
VALUES ('ctm_your_paddle_customer_id', 'your-email@example.com');
```

### Issue: OAuth Redirect Fails

**Solution:**

1. Verify `NEXT_PUBLIC_APP_URL` is set correctly
2. Check Supabase redirect URLs include your Vercel domain
3. Update `src/app/login/actions.ts` to use environment variable

### Issue: Build Fails on Vercel

**Common Causes:**

- TypeScript errors (fix locally first)
- Missing environment variables
- Dependency issues
- Lint rules promoted to errors during `next build`

**Solution:**

```bash
# Test build locally
pnpm build
# or
npm run build
```

If the build log shows ESLint failures such as `Unexpected any. Specify a different type.` in
`src/app/api/extension/debug-push/route.ts` or other API routes, update the files locally to use
explicit interfaces instead of `any`, run `pnpm lint`, and commit the fixes before redeploying.

> ℹ️ The Chrome extension bundle under `customise calendar 3/` is excluded from deployments via
> `.vercelignore`, so the removal log you see at the start of a build is expected and not a
> failure condition. Focus on the lint/type errors reported during `pnpm run build` to resolve
> the deployment.

### Issue: Environment Variables Not Loading

**Solution:**

1. Verify variables are set for the correct environment (Production/Preview/Development)
2. Redeploy after adding new variables
3. Check variable names match exactly (case-sensitive)

### Issue: CORS Errors

**Solution:**

- Paddle should not have CORS issues as webhooks are server-to-server
- If you see CORS errors with Paddle.js, ensure `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` is correct
- Check browser console for specific CORS error messages

### Issue: User Agreements Not Saving

**Root Cause:** User agreements API not working or database migration not applied

**Solution:**

1. Check if migration was applied:
   ```sql
   SELECT * FROM user_agreements LIMIT 1;
   ```
2. If table doesn't exist, apply migration: `supabase/migrations/20251021000000_user_agreements.sql`
3. Check Vercel logs for `/api/user-agreements` errors
4. Verify RLS policies exist for `user_agreements` table
5. Test API endpoint manually:
   - Open browser console on onboarding complete page
   - Check Network tab when clicking "Start Free Trial"
   - Look for 200 response from `/api/user-agreements`

**Common Errors:**

- **401 Unauthorized**: User not authenticated - check Supabase session
- **500 Internal Server Error**: Database migration not applied or RLS policies missing
- **Table doesn't exist**: Migration not run - apply migration in Supabase dashboard

### Issue: "Start Free Trial" Button Stays Disabled

**Root Cause:** Required checkboxes not all checked

**Solution:**

1. Ensure all 4 required checkboxes are checked:
   - Terms of Service
   - Refund Policy
   - Privacy Policy
   - Recurring payment subscriptions
2. The withdrawal checkbox is optional and doesn't affect button state
3. Use "Accept All Terms and Conditions to Start" checkbox to check all at once
4. Check browser console for JavaScript errors

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables documented
- [ ] Code changes for production URLs completed
- [ ] **Supabase database migrations ready** (2 files in `supabase/migrations/`)
  - [ ] `20240907140223_initialize.sql` (core tables)
  - [ ] `20251021000000_user_agreements.sql` (user agreements)
- [ ] Local build test successful (`pnpm build`)
- [ ] Code committed to Git

### During Deployment

- [ ] Project imported to Vercel
- [ ] All environment variables added (Supabase + Paddle)
- [ ] Initial deployment successful
- [ ] Production URL noted: `https://your-app-name.vercel.app`

### Post-Deployment: Database Setup

- [ ] **Apply migrations in Supabase Dashboard (IN ORDER)**:
  1. [ ] Check if core tables exist (`SELECT * FROM customers LIMIT 1`)
  2. [ ] If not, run migration: `20240907140223_initialize.sql`
  3. [ ] Run user agreements migration: `20251021000000_user_agreements.sql`
  4. [ ] Verify all tables exist:
     - [ ] `customers` table
     - [ ] `subscriptions` table
     - [ ] `user_agreements` table
  5. [ ] Verify RLS policies for all 3 tables

### Post-Deployment: Configuration

- [ ] **Paddle webhook URL updated** with production URL
  - [ ] URL: `https://your-app-name.vercel.app/api/webhook`
  - [ ] Webhook secret matches `PADDLE_NOTIFICATION_WEBHOOK_SECRET`
  - [ ] All required events subscribed (customer, subscription, transaction)
- [ ] **Supabase redirect URLs updated**
  - [ ] Site URL: `https://your-app-name.vercel.app`
  - [ ] Redirect URL: `https://your-app-name.vercel.app/auth/callback`
  - [ ] Wildcard: `https://your-app-name.vercel.app/**`
- [ ] **Add `NEXT_PUBLIC_APP_URL`** to Vercel environment variables
- [ ] **Redeploy** after URL and environment variable updates

### Post-Deployment: Testing

- [ ] **Authentication flow** tested (email, Google OAuth)
- [ ] **Onboarding flow** tested
  - [ ] User agreements checkboxes display correctly
  - [ ] "Accept All" checkbox works
  - [ ] Button disabled without required agreements
  - [ ] "Saving..." state shows when submitting
- [ ] **User agreements saved** to database (check `user_agreements` table)
- [ ] **Subscription flow** end-to-end tested
  - [ ] Paddle checkout completes
  - [ ] Webhooks received (check Vercel logs: `/api/webhook`)
  - [ ] Customer data synced to `customers` table
  - [ ] Subscription shows on dashboard
- [ ] **API endpoints** working
  - [ ] `/api/user-agreements` POST returns 200
  - [ ] `/api/webhook` receives Paddle webhooks
- [ ] **Webhook logs verified** in both Paddle and Vercel
- [ ] **All database tables populated** correctly

---

## Summary of Critical Changes

### Code Changes

1. **Update `src/app/login/actions.ts`** - Use environment variable for OAuth redirect
2. **User Agreements Feature** - New onboarding complete page with compliance checkboxes
   - File: `src/app/onboarding/complete/page.tsx`
   - API: `src/app/api/user-agreements/route.ts`

### Database Changes

3. **Apply Database Migrations (IMPORTANT)**:
   - Migration 1: `supabase/migrations/20240907140223_initialize.sql` (if not already applied)
   - Migration 2: `supabase/migrations/20251021000000_user_agreements.sql` (NEW - required)
   - **Note:** Vercel does NOT auto-apply these - must be run manually in Supabase Dashboard

### Configuration Changes

4. **Add Vercel environment variables** - All secrets and public variables
5. **Configure Paddle webhook URL** - Point to `https://your-app.vercel.app/api/webhook`
6. **Update Supabase redirect URLs** - Add Vercel domain
7. **Add `NEXT_PUBLIC_APP_URL`** - For OAuth redirects

### Testing Requirements

8. **Test complete subscription flow** - Ensure webhooks populate database
9. **Test user agreements flow** - Ensure agreements save to `user_agreements` table with timestamps

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Paddle Webhooks Guide](https://developer.paddle.com/webhooks/overview)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)

---

## Quick Reference: User Agreements Feature

**What it does:**

- Displays 5 compliance checkboxes on onboarding complete page
- 4 required: Terms, Refund, Privacy, Recurring payments
- 1 optional: 14-day withdrawal right
- Saves user acceptance with timestamps to database
- Blocks checkout until required agreements are accepted

**Files involved:**

- `src/app/onboarding/complete/page.tsx` - Frontend UI
- `src/app/api/user-agreements/route.ts` - API endpoint
- `supabase/migrations/20251021000000_user_agreements.sql` - Database schema

**Database table:**

```sql
user_agreements (
  user_id,
  email,
  terms_accepted,
  terms_accepted_at,
  refund_accepted,
  refund_accepted_at,
  privacy_accepted,
  privacy_accepted_at,
  recurring_accepted,
  recurring_accepted_at,
  withdrawal_accepted,
  withdrawal_accepted_at
)
```

---

**Last Updated:** 2025-10-21 (Added User Agreements feature)

**Note:** Keep this document updated as you make changes to your deployment configuration.
