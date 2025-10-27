# ColorKit Troubleshooting - Quick Reference Guide

**Last Updated:** 2025-01-26

This is a rapid-response guide for diagnosing and fixing common issues. For complete technical details, see `SYSTEM_ARCHITECTURE_COMPLETE.md`.

---

## 🚨 Emergency Checklist

**Extension not working? Run through this in 60 seconds:**

### Step 1: Check Extension ID Match (10 seconds)

```
1. Go to chrome://extensions/
2. Find ColorKit extension ID
3. Does it match Vercel NEXT_PUBLIC_EXTENSION_ID?
   YES → Go to Step 2
   NO  → UPDATE VERCEL ENV VAR AND REDEPLOY
```

### Step 2: Check Storage Format (15 seconds)

Open extension service worker console, paste:

```javascript
chrome.storage.local.get(['subscriptionStatus'], (data) => {
  console.log('Type:', typeof data.subscriptionStatus);
  console.log('Is Object:', typeof data.subscriptionStatus === 'object');
});
```

**Expected:** `Type: object` and `Is Object: true`
**If string:** CRITICAL BUG - Check background.js lines 231-276

### Step 3: Check Subscription Active (10 seconds)

```javascript
chrome.storage.local.get(['subscriptionActive'], console.log);
```

**Expected:** `{ subscriptionActive: true }`
**If false:** User not subscribed OR storage not updated after payment

### Step 4: Check Auth Session (10 seconds)

```javascript
chrome.storage.local.get(['supabaseSession'], (data) => {
  console.log('Has session:', !!data.supabaseSession);
  console.log('Has token:', !!data.supabaseSession?.access_token);
});
```

**Expected:** Both true
**If false:** User needs to login via web app

### Step 5: Force Refresh (15 seconds)

```javascript
// Clear cache and re-check
chrome.storage.local.remove(['lastChecked', 'subscriptionStatus']);

// Force API check
chrome.runtime.sendMessage({ type: 'CHECK_SUBSCRIPTION' }, console.log);
```

**Expected:** Returns `{ isActive: true, status: 'active' }`

---

## 🔍 Diagnostic Decision Tree

```
Extension Not Unlocking?
│
├─ Payment succeeded?
│  ├─ NO → User needs to purchase subscription
│  └─ YES → Continue below
│
├─ User redirected to /checkout/success?
│  ├─ NO → Check Paddle redirect URL configuration
│  └─ YES → Continue below
│
├─ Extension ID matches Vercel?
│  ├─ NO → Fix: Update NEXT_PUBLIC_EXTENSION_ID in Vercel
│  └─ YES → Continue below
│
├─ Check storage format
│  ├─ subscriptionStatus is STRING → FIX: Update background.js
│  └─ subscriptionStatus is OBJECT → Continue below
│
├─ subscriptionActive === true?
│  ├─ NO → Storage not updated
│  │      └─ Check: ExtensionNotifier sent message?
│  │         └─ Check web app console for logs
│  └─ YES → Continue below
│
├─ Extension receives PAYMENT_SUCCESS message?
│  ├─ NO → Check manifest.json externally_connectable
│  └─ YES → Continue below
│
├─ Popup shows correct status?
│  ├─ NO → Cache issue - Clear and refresh
│  └─ YES → Continue below
│
└─ Calendar page features work?
   ├─ NO → Content script issue
   │      └─ Check: validateSubscriptionBeforeInit()
   │         └─ Reload calendar page (Ctrl+Shift+R)
   └─ YES → Everything working! ✅
```

---

## 🐛 Common Issues & Quick Fixes

### Issue 1: Storage Format Bug (MOST COMMON)

**Symptoms:**

- Payment succeeded
- Extension storage has data
- Popup still shows "locked"

**Diagnosis:**

```javascript
chrome.storage.local.get(['subscriptionStatus'], (data) => {
  console.log(data.subscriptionStatus);
});

// If you see: "active" (a string)
// Should be: { isActive: true, status: "active", ... } (an object)
```

**Root Cause:** background.js saving string instead of object

**Fix:** Check these lines in background.js:

- Line 231-246: PAYMENT_SUCCESS handler
- Line 196-207: AUTH_SUCCESS handler
- Line 263-276: SUBSCRIPTION_CANCELLED handler

All must save this format:

```javascript
subscriptionStatus: {
  isActive: true,
  status: 'active',
  message: 'Subscription active',
  dataSource: 'payment_success'
}
```

**Temporary Fix (to unlock immediately):**

```javascript
// Run in extension service worker console
chrome.storage.local.set({
  subscriptionActive: true,
  subscriptionStatus: {
    isActive: true,
    status: 'active',
    message: 'Subscription active',
    dataSource: 'manual_fix',
  },
  lastChecked: Date.now(),
});

// Then reload calendar page
```

---

### Issue 2: Extension ID Mismatch

**Symptoms:**

- Web app console: `Could not establish connection. Receiving end does not exist.`
- ExtensionNotifier logs show error

**Diagnosis:**

```
1. Chrome: chrome://extensions/ → ColorKit → Copy ID
2. Vercel: Check NEXT_PUBLIC_EXTENSION_ID value
3. Compare: Do they match exactly?
```

**Fix:**

```bash
# Update Vercel environment variable
NEXT_PUBLIC_EXTENSION_ID=<actual-extension-id-from-chrome>

# Trigger redeploy
```

**Important Notes:**

- Unpacked extension ID changes if you recreate the folder
- Published extension ID is permanent
- Use the ACTUAL ID from chrome://extensions/

---

### Issue 3: Push Notifications Not Working

**Symptoms:**

- Subscription changes don't reflect immediately
- Need to reload extension/page to see updates

**Diagnosis:**

```javascript
// 1. Check push subscription exists
chrome.storage.local.get(['pushSubscription'], (data) => {
  console.log('Has push:', !!data.pushSubscription);
  console.log('Endpoint:', data.pushSubscription?.endpoint);
});

// 2. Check VAPID key in extension config.production.js
// Must match Vercel VAPID_PUBLIC_KEY EXACTLY
```

**Common Causes:**

**A. VAPID Key Mismatch**

```
Extension config.production.js has: BDzFvolcEIcAVROnYjC...
Vercel VAPID_PUBLIC_KEY has:       BGtPXrmKYAzNkPdQ7vW...
                                   ^ DIFFERENT = BROKEN
```

**Fix:** Ensure both have EXACT same key (no spaces/newlines)

**B. Email Mismatch**

```
Signup email:  user@gmail.com
Paddle email:  user@work.com
              ^ DIFFERENT = PUSH WON'T WORK
```

**Fix:** Use same email for both OR manually link in database:

```sql
UPDATE customers
SET user_id = '<user-uuid-from-auth-users>'
WHERE email = 'paddle-email@example.com';
```

**C. Push Subscription Not Linked**

Check database:

```sql
SELECT * FROM push_subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@gmail.com');
```

If `customer_id` is NULL:

```sql
UPDATE push_subscriptions
SET customer_id = (SELECT customer_id FROM customers WHERE email = 'user@gmail.com')
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@gmail.com');
```

---

### Issue 4: Calendar Features Not Initializing

**Symptoms:**

- Extension unlocked (popup shows active)
- Calendar loads but no colors/toolbar
- No errors in console

**Diagnosis:**

```javascript
// On calendar.google.com, run in console:
chrome.storage.local.get(['subscriptionActive'], console.log);
// Should return: { subscriptionActive: true }

// Check if content script loaded
console.log(window.cc3Features); // Should exist
console.log(window.cc3Storage); // Should exist
```

**Fixes:**

**A. Hard Reload Calendar**

```
Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

**B. Reload Extension**

```
1. chrome://extensions/
2. Find ColorKit
3. Click reload icon
4. Refresh calendar page
```

**C. Check Content Script Load**

```javascript
// If window.cc3Features is undefined
// Check manifest.json has correct content_scripts
// Should include: content/index.js as LAST script
```

---

### Issue 5: Webhook Not Processing

**Symptoms:**

- Payment succeeds in Paddle
- Database not updated
- No push notifications sent
- Vercel logs show no webhook calls

**Diagnosis:**

```
1. Go to Paddle Dashboard → Developer Tools → Webhooks
2. Check webhook URL: https://portal.calendarextension.com/api/paddle/webhook
3. Check "Recent Deliveries" tab
4. Look for 200 OK responses
```

**Common Causes:**

**A. Webhook Not Configured**

- Add webhook in Paddle Dashboard
- URL: `https://portal.calendarextension.com/api/paddle/webhook`
- Events: Select ALL (or minimum: customer._, subscription._, transaction.\*)

**B. Wrong Webhook Secret**

```
Paddle Dashboard Secret:     ntfset_01k86v9...
Vercel PADDLE_NOTIFICATION_WEBHOOK_SECRET: ntfset_01k81qg...
                                           ^ DIFFERENT = 400 ERROR
```

**Fix:** Copy exact secret from Paddle to Vercel

**C. Webhook Signature Verification Fails**

Check Vercel logs:

```
Filter: /api/paddle/webhook
Look for: "Invalid signature" or 400 status
```

**Fix:** Regenerate webhook secret in Paddle, update Vercel

---

## 🔧 Manual Fixes

### Force Unlock Extension (Emergency)

```javascript
// Run in extension service worker console
// ⚠️ This is temporary - doesn't fix root cause!

chrome.storage.local.set({
  authenticated: true,
  authTimestamp: Date.now(),
  subscriptionActive: true,
  subscriptionStatus: {
    isActive: true,
    status: 'active',
    message: 'Subscription active',
    dataSource: 'manual_unlock',
  },
  subscriptionTimestamp: Date.now(),
  lastChecked: Date.now(),
});

// Reload calendar page
// Features should now work
```

### Clear All Extension Data (Nuclear Option)

```javascript
// ⚠️ WARNING: This deletes EVERYTHING
chrome.storage.local.clear(() => {
  console.log('All data cleared');
  // Extension will be in fresh install state
  // User must re-login and re-subscribe to push
});
```

### Manually Link Push Subscription to Customer

```sql
-- Find user
SELECT id, email FROM auth.users WHERE email = 'user@gmail.com';

-- Find customer
SELECT customer_id, email, user_id FROM customers WHERE email = 'user@gmail.com';

-- If customer.user_id is NULL, link it:
UPDATE customers
SET user_id = '<user-uuid>'
WHERE email = 'user@gmail.com';

-- Trigger will automatically link push subscriptions

-- Or manually link push subscription:
UPDATE push_subscriptions
SET customer_id = '<customer-id>'
WHERE user_id = '<user-uuid>';
```

---

## 📊 Health Check Scripts

### Extension Health Check (Run in Service Worker Console)

```javascript
(async function healthCheck() {
  console.log('=== EXTENSION HEALTH CHECK ===\n');

  // 1. Auth
  const { authenticated, supabaseSession } = await chrome.storage.local.get(['authenticated', 'supabaseSession']);
  console.log('✓ Auth:', {
    authenticated,
    hasSession: !!supabaseSession,
    hasToken: !!supabaseSession?.access_token,
  });

  // 2. Subscription
  const { subscriptionActive, subscriptionStatus } = await chrome.storage.local.get([
    'subscriptionActive',
    'subscriptionStatus',
  ]);
  console.log('✓ Subscription:', {
    active: subscriptionActive,
    status: subscriptionStatus,
    isObject: typeof subscriptionStatus === 'object',
    isActive: subscriptionStatus?.isActive,
  });

  // 3. Push
  const { pushSubscription } = await chrome.storage.local.get(['pushSubscription']);
  console.log('✓ Push:', {
    registered: !!pushSubscription,
    endpoint: pushSubscription?.endpoint?.substring(0, 50) + '...',
  });

  // 4. Cache
  const { lastChecked } = await chrome.storage.local.get(['lastChecked']);
  const cacheAge = lastChecked ? Date.now() - lastChecked : null;
  console.log('✓ Cache:', {
    lastChecked: lastChecked ? new Date(lastChecked).toISOString() : 'never',
    ageMinutes: cacheAge ? Math.round(cacheAge / 60000) : null,
    fresh: cacheAge < 24 * 60 * 60 * 1000,
  });

  console.log('\n=== END HEALTH CHECK ===');
})();
```

### Backend Health Check (Run in Terminal)

```bash
# Check if extension can reach API
curl -H "Authorization: Bearer <access_token>" \
  https://portal.calendarextension.com/api/extension/validate

# Expected:
# {"isActive":true,"status":"active",...}

# Check push notification config
curl -H "Authorization: Bearer <access_token>" \
  https://portal.calendarextension.com/api/extension/debug-push

# Expected:
# {"user":{...},"vapid":{...},"subscriptions":{...}}
```

---

## 🎯 Testing Checklist

### Test New Signup → Payment → Unlock

```
□ Step 1: Clear extension data
  chrome.storage.local.clear()

□ Step 2: Reload extension
  chrome://extensions/ → Reload button

□ Step 3: Fresh signup
  - Use NEW email (not used before)
  - Sign up via web app
  - Extension receives AUTH_SUCCESS ✓

□ Step 4: Complete payment
  - Use SAME email in Paddle checkout
  - Complete test payment
  - Redirected to /checkout/success ✓

□ Step 5: Verify messages sent
  Web app console shows:
  - [ExtensionNotifier] Sending PAYMENT_SUCCESS ✓
  - [ExtensionNotifier] Extension response: success ✓

□ Step 6: Verify storage updated
  Extension console shows:
  - subscriptionActive: true ✓
  - subscriptionStatus: { isActive: true, ... } ✓

□ Step 7: Test popup
  - Open extension popup
  - Shows "Subscription Active" ✓

□ Step 8: Test calendar features
  - Open calendar.google.com
  - Features work (colors, toolbar) ✓

□ Step 9: Test push notifications
  - Change subscription in Paddle
  - Wait 30 seconds
  - Extension updates automatically ✓
```

---

## 🆘 Still Broken? Check These

### Vercel Environment Variables

```
Required:
✓ NEXT_PUBLIC_EXTENSION_ID
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY
✓ PADDLE_API_KEY
✓ PADDLE_NOTIFICATION_WEBHOOK_SECRET
✓ VAPID_PUBLIC_KEY
✓ VAPID_PRIVATE_KEY
✓ VAPID_SUBJECT
```

### Extension manifest.json

```json
{
  "externally_connectable": {
    "matches": [
      "https://portal.calendarextension.com/*"
      // Must include your production domain!
    ]
  }
}
```

### Database Tables Exist

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('customers', 'subscriptions', 'push_subscriptions');

-- Should return 3 rows
```

### Database Trigger Active

```sql
-- Check trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_link_push_subscriptions';

-- Should return 1 row
-- If not: Run MIGRATION_add_user_id_to_customers.sql
```

---

## 📞 Support Information

**Documentation:**

- Complete guide: `SYSTEM_ARCHITECTURE_COMPLETE.md`
- This guide: `TROUBLESHOOTING_QUICK_GUIDE.md`

**Key Files to Check:**

- Extension: `background.js` (message handlers)
- Extension: `content/index.js` (feature initialization)
- Backend: `src/utils/paddle/process-webhook.ts` (webhook processing)
- Backend: `src/utils/fcm/send-push.ts` (push notifications)

**Logs to Monitor:**

- Extension: Service worker console (right-click extension → Inspect)
- Web App: Browser console (F12)
- Backend: Vercel Dashboard → Logs
- Webhooks: Paddle Dashboard → Developer Tools → Webhooks → Recent Deliveries

**Database Access:**

- Supabase Dashboard → Table Editor
- Or use SQL Editor for custom queries

---

## 🔑 Critical Values Reference

**Extension ID:** `fembfgpdkdghicfocfcijepgmelaibhm` (your current ID)

**VAPID Public Key:** `BDzFvolcEIcAVROnYjCpQian2gKqPy6rETx0jEJntUSakNLlo0F1pv40LUZ524zaHd5S-xDqfipCDMdpP-o74T4`

**Web App URL:** `https://portal.calendarextension.com`

**Supabase URL:** `https://wmmnunrcthtnahxwjlgn.supabase.co`

⚠️ **These must match EXACTLY between extension config and Vercel environment variables!**

---

**Last Resort:** If nothing works, check `SYSTEM_ARCHITECTURE_COMPLETE.md` section "Common Issues & Solutions" for detailed debugging steps.
