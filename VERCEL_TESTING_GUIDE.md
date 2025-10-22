# 🧪 VERCEL TESTING GUIDE

## Complete End-to-End Testing for ColorKit Deployment

This guide provides detailed testing procedures to verify your Vercel deployment is working correctly with the Chrome extension, Supabase, and Paddle integration.

---

## 📋 PREREQUISITES

Before starting tests:

- ✅ Deployment complete (see DEPLOYMENT_CHECKLIST.md)
- ✅ Extension loaded in Chrome with correct config
- ✅ `NEXT_PUBLIC_EXTENSION_ID` set in Vercel
- ✅ All external services configured (Supabase, Paddle)
- ✅ Have Paddle test card handy: `4242 4242 4242 4242`

---

## 🔍 TEST SUITE 1: Build & Deployment Verification

### Test 1.1: Local Build Test

**Purpose:** Verify code builds successfully before deployment

**Steps:**

```bash
cd paddle-nextjs-starter-kit
npm run verify-build
# or
pnpm run build
```

**Expected Results:**

- ✅ Build completes without errors
- ✅ Shows "Build verification successful!" message
- ✅ `.next` folder created
- ✅ No TypeScript errors
- ✅ No ESLint errors

**On Failure:**

- Check console for specific error messages
- Review recent code changes
- Verify all dependencies installed
- Check TypeScript configuration

---

### Test 1.2: Vercel Build Verification

**Purpose:** Ensure Vercel build succeeds

**Steps:**

1. Go to Vercel Dashboard
2. Navigate to your project → Deployments
3. Click on latest deployment
4. Review build logs

**Expected Results:**

- ✅ Build status: "Ready"
- ✅ No errors in build logs
- ✅ Functions deployed successfully
- ✅ Build time < 3 minutes (typically)

**On Failure:**

- Check build logs for error details
- Verify environment variables set correctly
- Ensure `.nvmrc` file exists with Node 20
- Check for missing dependencies

---

### Test 1.3: Deployment URL Access

**Purpose:** Verify app is accessible online

**Steps:**

1. Copy your Vercel deployment URL
2. Open in browser: `https://your-project.vercel.app`
3. Open DevTools (F12) → Console tab
4. Check Network tab

**Expected Results:**

- ✅ Page loads within 2-3 seconds
- ✅ Redirects to `/signup` page
- ✅ No console errors
- ✅ All assets load (CSS, JS, images)
- ✅ Extension bridge script loads

**On Failure:**

- Check for 500/404 errors in Network tab
- Verify DNS propagation (may take minutes)
- Clear browser cache and try incognito
- Check Vercel function logs for errors

---

## 🔐 TEST SUITE 2: Authentication & Extension Connection

### Test 2.1: Extension Loading

**Purpose:** Verify extension loads without errors

**Steps:**

1. Go to `chrome://extensions/`
2. Find "ColorKit for Google Calendar"
3. Check for errors
4. Click extension icon

**Expected Results:**

- ✅ Extension shows "Enabled"
- ✅ No error messages
- ✅ Popup opens smoothly
- ✅ Shows auth overlay (if not logged in)

**On Failure:**

- Check manifest.json for syntax errors
- Verify all files exist
- Check extension console for errors
- Reload extension

---

### Test 2.2: Extension to Web App Connection

**Purpose:** Verify extension can communicate with Vercel app

**Steps:**

1. Open extension popup
2. Right-click → Inspect
3. Go to Console tab
4. Look for connection messages

**Expected Results:**

- ✅ See: `[ColorKit] Checking auth and subscription status...`
- ✅ See: `[ColorKit] API response:` message
- ✅ No "Extension not reachable" errors
- ✅ Auth overlay displays correctly

**On Failure:**

- Verify config.production.js has correct Vercel URL
- Check manifest.json has Vercel URL in externally_connectable
- Verify NEXT_PUBLIC_EXTENSION_ID set in Vercel
- Check CORS headers in Network tab

---

### Test 2.3: "Get Started" Button

**Purpose:** Verify extension can open web app

**Steps:**

1. Click extension popup
2. Click "Get Started - 7 Day Free Trial" button
3. Observe new tab opening

**Expected Results:**

- ✅ New Chrome tab opens
- ✅ Navigates to `https://your-project.vercel.app/onboarding`
- ✅ Page loads successfully
- ✅ Shows onboarding welcome screen

**On Failure:**

- Check background.js config
- Verify OPEN_WEB_APP message handler
- Check console for errors

---

### Test 2.4: Sign Up Flow

**Purpose:** Verify complete signup process

**Steps:**

1. From `/onboarding`, click "Let's Get Started"
2. Complete personalization step (select options)
3. Click "Continue"
4. On complete page, accept all agreements
5. Click "Start Free Trial"

**Expected Results:**

- ✅ Smooth navigation between onboarding steps
- ✅ Progress bar updates correctly
- ✅ Agreement checkboxes work
- ✅ Redirects to `/checkout/[priceId]`
- ✅ Paddle checkout loads

**On Failure:**

- Check browser console for errors
- Verify routing in app directory
- Check onboarding page components
- Verify Paddle client token

---

### Test 2.5: Supabase Authentication

**Purpose:** Verify Supabase auth works on Vercel

**Steps:**

1. On checkout page, click "Sign in" (if available)
2. Or complete signup with email/password
3. Check Supabase dashboard for new user

**Expected Results:**

- ✅ Sign up/login succeeds
- ✅ User created in Supabase Auth
- ✅ Cookies set in browser
- ✅ Redirected to appropriate page

**On Failure:**

- Check Supabase redirect URLs configured
- Verify environment variables in Vercel
- Check Supabase logs for errors
- Test in incognito window

---

## 💳 TEST SUITE 3: Payment & Subscription Flow

### Test 3.1: Paddle Checkout Loading

**Purpose:** Verify Paddle checkout initializes

**Steps:**

1. Navigate to `/checkout/[priceId]`
2. Wait for Paddle iframe to load
3. Check browser console
4. Check Network tab for Paddle requests

**Expected Results:**

- ✅ Paddle checkout iframe appears
- ✅ Shows correct price and product name
- ✅ "ColorKit" product displayed
- ✅ 7-day trial mentioned
- ✅ No Paddle errors in console

**On Failure:**

- Verify `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` set
- Check `NEXT_PUBLIC_PADDLE_ENV` = `sandbox`
- Verify pricing-tier.ts has correct price ID
- Check Paddle dashboard for price status

---

### Test 3.2: Complete Test Payment

**Purpose:** Verify end-to-end payment flow

**Test Card Details:**

- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/26`)
- CVC: Any 3 digits (e.g., `123`)
- Name: Any name
- Email: Use your test email
- Country: Any country
- ZIP: Any valid ZIP

**Steps:**

1. Fill in test card details
2. Complete checkout
3. Wait for success redirect

**Expected Results:**

- ✅ Payment processes successfully
- ✅ Redirects to `/checkout/success`
- ✅ Shows success message
- ✅ "Payment Successful" confirmation
- ✅ Links to dashboard work

**On Failure:**

- Verify using sandbox environment
- Check test card details correct
- Review Paddle dashboard for transaction
- Check browser console for errors

---

### Test 3.3: Webhook Delivery

**Purpose:** Verify Paddle webhook reaches Vercel

**Steps:**

1. After payment, wait 10-30 seconds
2. Go to Vercel Dashboard → Functions → Logs
3. Look for webhook event logs
4. Check Paddle Dashboard → Developer Tools → Event Logs

**Expected Results:**

- ✅ Webhook received by Vercel
- ✅ Log shows: `[Webhook Route] 📥 Received webhook`
- ✅ Log shows: `[Webhook Route] ✅ Webhook verified`
- ✅ Log shows: `[Webhook Route] ✅ Event processed successfully`
- ✅ Paddle shows webhook delivered (green checkmark)

**On Failure:**

- Verify webhook URL: `https://your-project.vercel.app/api/webhook`
- Check `PADDLE_NOTIFICATION_WEBHOOK_SECRET` matches
- Test webhook manually in Paddle dashboard
- Check Vercel function logs for errors

---

### Test 3.4: Database Updates

**Purpose:** Verify subscription data saved to Supabase

**Steps:**

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Check `customers` table
4. Check `subscriptions` table

**Expected Results:**

- ✅ New row in `customers` table with your email
- ✅ `customer_id` matches Paddle customer ID
- ✅ New row in `subscriptions` table
- ✅ `subscription_status` = `trialing`
- ✅ `price_id` matches your product
- ✅ Timestamps populated

**On Failure:**

- Check Vercel function logs for database errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` set correctly
- Check Supabase RLS policies
- Verify webhook processed successfully

---

## 🧩 TEST SUITE 4: Extension Post-Payment Validation

### Test 4.1: Extension Receives Payment Notification

**Purpose:** Verify extension knows about successful payment

**Steps:**

1. After payment success, check extension background console
2. Go to `chrome://extensions/`
3. Find your extension
4. Click "service worker" link
5. Check console logs

**Expected Results:**

- ✅ See: `[ColorKit] Handling web app message: PAYMENT_SUCCESS`
- ✅ See: `[ColorKit] Payment success saved`
- ✅ Storage updated with subscription info

**On Failure:**

- Check extension-bridge.js loaded on success page
- Verify extension ID matches in Vercel
- Check externally_connectable in manifest
- Test bridge script manually

---

### Test 4.2: Subscription API Validation

**Purpose:** Verify extension can validate subscription

**Steps:**

1. Close extension popup (if open)
2. Click extension icon to reopen
3. Check popup console (right-click → Inspect)
4. Look for validation API call

**Expected Results:**

- ✅ See: `[ColorKit] API response: { isActive: true, status: 'trialing', ... }`
- ✅ Auth overlay is HIDDEN
- ✅ Main extension UI is VISIBLE
- ✅ Trial banner shows: "🎉 Free Trial: 7 days remaining"

**On Failure:**

- Check `/api/extension/validate` endpoint
- Verify Supabase cookies set
- Test API manually: visit `https://your-project.vercel.app/api/extension/validate`
- Check Vercel function logs

---

### Test 4.3: Extension Features Work

**Purpose:** Verify extension functions on Google Calendar

**Steps:**

1. Navigate to https://calendar.google.com
2. Wait for page to load
3. Open extension popup
4. Enable day coloring (or other features)
5. Observe calendar changes

**Expected Results:**

- ✅ Extension content scripts load
- ✅ No auth overlay blocking features
- ✅ Calendar customizations apply
- ✅ No console errors
- ✅ Features persist after refresh

**On Failure:**

- Check content scripts in manifest.json
- Verify calendar permissions granted
- Check console for script errors
- Reload extension

---

## 🎛️ TEST SUITE 5: API Endpoint Tests

### Test 5.1: Extension Validation Endpoint

**Purpose:** Test subscription validation API

**Manual API Test:**

```bash
# Without auth (should fail)
curl https://your-project.vercel.app/api/extension/validate

# With browser cookies (should succeed)
# Open browser console on your-project.vercel.app
fetch('/api/extension/validate', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
```

**Expected Results:**

- ✅ Without auth: Returns `{ isActive: false, reason: 'not_authenticated' }`
- ✅ With auth: Returns `{ isActive: true, status: 'trialing', ... }`
- ✅ Response time < 500ms
- ✅ Proper CORS headers set

---

### Test 5.2: Webhook Endpoint

**Purpose:** Verify webhook security

**Manual Test:**

```bash
# Should reject unsigned requests
curl -X POST https://your-project.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

**Expected Results:**

- ✅ Returns 400 Bad Request
- ✅ Error message about missing signature
- ✅ Webhook not processed

---

### Test 5.3: User Agreements Endpoint

**Purpose:** Test agreement saving

**Steps:**

1. Navigate to `/onboarding/complete`
2. Accept agreements
3. Click "Start Free Trial"
4. Check Supabase `user_agreements` table

**Expected Results:**

- ✅ New row created with user_id
- ✅ All agreement booleans set to true
- ✅ Timestamps populated
- ✅ No errors in console

---

## 🚨 TEST SUITE 6: Error Handling & Edge Cases

### Test 6.1: Expired Session

**Purpose:** Verify auth expiration handling

**Steps:**

1. Clear browser cookies
2. Try to access `/dashboard`
3. Observe redirect behavior

**Expected Results:**

- ✅ Redirects to `/login` or `/signup`
- ✅ No error page shown
- ✅ User can log back in

---

### Test 6.2: Network Failure

**Purpose:** Test offline behavior

**Steps:**

1. Open extension popup
2. Disconnect internet
3. Click extension icon
4. Reconnect internet

**Expected Results:**

- ✅ Shows error message gracefully
- ✅ Doesn't crash extension
- ✅ Recovers when connection restored

---

### Test 6.3: Invalid Extension ID

**Purpose:** Verify error handling for misconfiguration

**Steps:**

1. Temporarily remove `NEXT_PUBLIC_EXTENSION_ID` from Vercel
2. Redeploy
3. Try to use extension

**Expected Results:**

- ✅ Console shows: "Extension ID not configured"
- ✅ App doesn't crash
- ✅ Can still use web app directly

---

## ✅ FINAL VERIFICATION CHECKLIST

Run through this final checklist to ensure everything works:

- [ ] Vercel build succeeded
- [ ] App loads at Vercel URL
- [ ] Extension loads without errors
- [ ] Extension connects to Vercel app
- [ ] "Get Started" opens correct URL
- [ ] Signup flow completes
- [ ] Login works
- [ ] Paddle checkout loads
- [ ] Test payment succeeds
- [ ] Redirects to success page
- [ ] Webhook fires and processes
- [ ] Data saves to Supabase
- [ ] Extension receives payment notification
- [ ] Extension validates subscription
- [ ] Auth overlay disappears
- [ ] Trial banner shows
- [ ] Extension features work on Google Calendar
- [ ] All API endpoints respond correctly
- [ ] Error handling works

---

## 📊 MONITORING & LOGS

### Where to Check Logs:

**Vercel:**

- Dashboard → Deployments → View Function Logs
- Real-time logs for API routes and webhooks

**Supabase:**

- Dashboard → Logs → API Logs
- Shows auth and database queries

**Paddle:**

- Dashboard → Developer Tools → Event Logs
- Shows webhook delivery status

**Chrome Extension:**

- `chrome://extensions/` → service worker → Console
- Popup → Right-click → Inspect → Console
- Content script → Page DevTools → Console

---

## 🐛 COMMON ISSUES & SOLUTIONS

| Issue                   | Likely Cause       | Solution                                |
| ----------------------- | ------------------ | --------------------------------------- |
| Build fails             | Dependency error   | Run `npm install` and retry             |
| Extension can't connect | Wrong extension ID | Verify ID matches in Vercel             |
| Webhook not received    | Wrong URL          | Check Paddle webhook URL                |
| Auth doesn't persist    | Cookie issues      | Check Supabase redirect URLs            |
| Payment fails           | Wrong environment  | Verify `NEXT_PUBLIC_PADDLE_ENV=sandbox` |
| Features don't work     | Not authenticated  | Complete login flow                     |

---

## 📈 PERFORMANCE BENCHMARKS

**Expected Performance:**

- Homepage load: < 2s
- API response: < 500ms
- Checkout load: < 3s
- Webhook processing: < 1s
- Extension validation: < 300ms

If performance is slower, check:

- Vercel region (should be close to you)
- Supabase region
- Network throttling in DevTools
- Large bundle sizes

---

## 🎯 SUCCESS CRITERIA

Testing is complete when:

✅ All test suites pass
✅ No console errors
✅ End-to-end flow works smoothly
✅ Logs show no errors
✅ Performance meets benchmarks

---

**Congratulations!** 🎉 If all tests pass, your ColorKit deployment is production-ready!

**Next Steps:**

- Monitor logs for first few days
- Test from different browsers/devices
- Consider setting up error tracking (Sentry, etc.)
- Plan migration from Paddle Sandbox to Production
