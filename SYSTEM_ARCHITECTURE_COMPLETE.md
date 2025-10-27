# ColorKit System Architecture - Complete Technical Reference

**Last Updated:** 2025-01-26
**Version:** 2.0 (Storage Format Fixed)
**Status:** Production Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Critical Storage Structure](#critical-storage-structure)
3. [Message Flow Architecture](#message-flow-architecture)
4. [Authentication System](#authentication-system)
5. [Payment & Unlock Flow](#payment--unlock-flow)
6. [Push Notification System](#push-notification-system)
7. [Extension Components](#extension-components)
8. [Backend API Endpoints](#backend-api-endpoints)
9. [Database Schema](#database-schema)
10. [Common Issues & Solutions](#common-issues--solutions)
11. [Debugging Guide](#debugging-guide)

---

## System Overview

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Flow                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. User installs Extension                                      │
│  2. Extension registers Web Push subscription                    │
│  3. User clicks "Get Started" → Opens Web App                    │
│  4. User signs up via Google OAuth → Supabase Auth               │
│  5. User purchases subscription → Paddle Checkout                │
│  6. Paddle → Webhook → Backend updates DB                        │
│  7. Backend sends Web Push → Extension receives                  │
│  8. Extension unlocks features                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Component Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Chrome     │◄───────►│   Web App    │                      │
│  │  Extension   │  HTTP   │   (Next.js)  │                      │
│  └──────┬───────┘         └──────┬───────┘                      │
│         │                        │                               │
│         │ Web Push               │ PostgreSQL                    │
│         │                        │                               │
│  ┌──────▼───────┐         ┌──────▼───────┐                      │
│  │   Service    │         │   Supabase   │                      │
│  │   Worker     │         │   Database   │                      │
│  └──────────────┘         └──────────────┘                      │
│                                  ▲                               │
│                                  │                               │
│                           ┌──────┴───────┐                      │
│                           │    Paddle    │                      │
│                           │   Webhooks   │                      │
│                           └──────────────┘                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component          | Technology                   | Purpose                     |
| ------------------ | ---------------------------- | --------------------------- |
| **Extension**      | Chrome Manifest V3           | Calendar customization UI   |
| **Service Worker** | JavaScript ES Modules        | Background message handling |
| **Web App**        | Next.js 15.5.3 (App Router)  | User portal & API           |
| **Database**       | Supabase PostgreSQL          | Data persistence            |
| **Auth**           | Supabase Auth (Google OAuth) | User authentication         |
| **Payments**       | Paddle Billing               | Subscription management     |
| **Push**           | Web Push API + VAPID         | Real-time updates           |
| **Hosting**        | Vercel Serverless            | Web app deployment          |

---

## Critical Storage Structure

### ⚠️ CRITICAL: Storage Keys Format

**This is the #1 source of bugs.** All components must use the SAME format for storage keys.

#### Chrome Storage Schema

```javascript
{
  // === Authentication ===
  "authenticated": true,                    // Boolean: User is logged in
  "authTimestamp": 1234567890000,          // Number: When auth occurred

  "supabaseSession": {                     // Object: Supabase session
    "access_token": "eyJhbGci...",         // JWT for API calls
    "refresh_token": "v1.MXyjW...",        // For token renewal
    "user": {
      "id": "uuid-here",                   // User UUID
      "email": "user@example.com"          // User email
    }
  },

  // === Subscription Status (CRITICAL FORMAT) ===
  "subscriptionActive": true,              // Boolean: Quick check for features

  "subscriptionStatus": {                  // Object: Full status (NOT a string!)
    "isActive": true,                      // Boolean: Subscription active
    "status": "active",                    // String: 'active'|'trialing'|'cancelled'
    "reason": "active",                    // String: Reason code
    "message": "Subscription active",      // String: Human-readable message
    "dataSource": "payment_success"        // String: Where this came from
  },

  "subscriptionTimestamp": 1234567890000,  // Number: When status was updated
  "lastChecked": 1234567890000,            // Number: Cache timestamp (24h)

  // === Push Subscription ===
  "pushSubscription": {                    // Object: Web Push subscription
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "BDzFv...",
      "auth": "xyz123..."
    }
  },
  "pendingPushSubscription": null,         // Object: Temporary storage before auth

  // === Feature State ===
  "dayColoringEnabled": true,              // Boolean: Day coloring on/off
  "taskColoringEnabled": true,             // Boolean: Task coloring on/off
  // ... other feature flags
}
```

#### ⚠️ Common Bug: String vs Object

**WRONG:**

```javascript
// ❌ DON'T DO THIS
subscriptionStatus: 'active'; // String - popup can't read this!
```

**CORRECT:**

```javascript
// ✅ ALWAYS USE THIS
subscriptionStatus: {
  isActive: true,
  status: 'active',
  message: 'Subscription active',
  dataSource: 'payment_success'
}
```

#### Storage Update Locations

| File                        | Function                                        | Updates Keys                                                                            |
| --------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `background.js`             | `handleWebAppMessage('PAYMENT_SUCCESS')`        | `subscriptionActive`, `subscriptionStatus` (object), `lastChecked`                      |
| `background.js`             | `handleWebAppMessage('AUTH_SUCCESS')`           | `authenticated`, `supabaseSession`, `subscriptionActive`, `subscriptionStatus` (object) |
| `background.js`             | `handleWebAppMessage('SUBSCRIPTION_CANCELLED')` | `subscriptionActive`, `subscriptionStatus` (object)                                     |
| `subscription-validator.js` | `cacheStatus()`                                 | `subscriptionStatus` (object), `lastChecked`                                            |

#### Storage Read Locations

| File                        | Function                           | Reads Keys                                   |
| --------------------------- | ---------------------------------- | -------------------------------------------- |
| `content/index.js`          | `validateSubscriptionBeforeInit()` | `subscriptionActive` (boolean only)          |
| `popup/popup.js`            | `checkSubscription()`              | `subscriptionStatus` (object)                |
| `subscription-validator.js` | `getCachedStatus()`                | `subscriptionStatus` (object), `lastChecked` |

---

## Message Flow Architecture

### External Message Flow (Web App → Extension)

#### 1. PAYMENT_SUCCESS Message

**Sent by:** `src/app/checkout/success/page.tsx` (ExtensionNotifier component)

**Flow:**

```
[Web App Success Page]
    ↓ chrome.runtime.sendMessage(extensionId, {type: 'PAYMENT_SUCCESS'})
[Extension Service Worker] background.js
    ↓ onMessageExternal listener
handleWebAppMessage('PAYMENT_SUCCESS')
    ↓ Updates storage
chrome.storage.local.set({
  subscriptionActive: true,
  subscriptionStatus: { isActive: true, status: 'active', ... },
  lastChecked: Date.now()
})
    ↓ Broadcasts
broadcastToCalendarTabs({type: 'SUBSCRIPTION_UPDATED'})
    ↓
[Calendar Content Script] content/index.js
    ↓ onMessage listener receives SUBSCRIPTION_UPDATED
validateSubscriptionBeforeInit()
    ↓ Reads storage
chrome.storage.local.get(['subscriptionActive'])
    ↓ If true
init() → Enables features ✅
```

**Code Location:** `background.js:231-260`

```javascript
case 'PAYMENT_SUCCESS':
  // Clear old cache first
  await chrome.storage.local.remove(['lastChecked']);

  // Set subscription state (CRITICAL: Object format!)
  await chrome.storage.local.set({
    subscriptionActive: true,
    subscriptionStatus: {
      isActive: true,
      status: 'active',
      message: 'Subscription active',
      dataSource: 'payment_success'
    },
    subscriptionTimestamp: Date.now(),
    lastChecked: Date.now(),
  });

  // Notify popup
  notifyPopup({ type: 'SUBSCRIPTION_UPDATED' });

  // Broadcast to all calendar tabs
  await broadcastToCalendarTabs({ type: 'SUBSCRIPTION_UPDATED' });
```

**Timeline:**

- T+0ms: User redirected to `/checkout/success`
- T+100ms: Page renders, ExtensionNotifier mounts
- T+150ms: `chrome.runtime.sendMessage` called
- T+200ms: Extension receives message
- T+250ms: Storage updated
- T+300ms: Broadcast sent (if calendar tabs open)
- **Result:** Extension unlocked in < 1 second ✅

---

#### 2. AUTH_SUCCESS Message

**Sent by:** `src/app/checkout/success/page.tsx`, `src/app/dashboard/page.tsx`

**Purpose:** Sends Supabase session tokens + subscription status to extension

**Flow:**

```
[Web App Dashboard/Success Page]
    ↓ prepareAuthSuccessMessage()
{
  type: 'AUTH_SUCCESS',
  session: { access_token, refresh_token, user },
  subscriptionStatus: { hasSubscription: true, status: 'trialing' }
}
    ↓ chrome.runtime.sendMessage()
[Extension Service Worker]
    ↓ handleWebAppMessage('AUTH_SUCCESS')
Stores session + subscription status
    ↓
Extension can now make authenticated API calls
```

**Code Location:** `background.js:179-228`

```javascript
case 'AUTH_SUCCESS':
  const sessionData = {
    authenticated: true,
    authTimestamp: Date.now(),
  };

  // Store Supabase session
  if (message.session) {
    sessionData.supabaseSession = {
      access_token: message.session.access_token,
      refresh_token: message.session.refresh_token,
      user: message.session.user,
    };
  }

  // Store subscription status (CRITICAL: Object format!)
  if (message.subscriptionStatus) {
    sessionData.subscriptionActive = message.subscriptionStatus.hasSubscription;
    sessionData.subscriptionStatus = {
      isActive: message.subscriptionStatus.hasSubscription,
      status: message.subscriptionStatus.status,
      message: message.subscriptionStatus.hasSubscription
        ? 'Subscription active'
        : 'No active subscription',
      dataSource: 'auth_success'
    };
    sessionData.lastChecked = Date.now();
  }

  await chrome.storage.local.set(sessionData);
```

**When Sent:**

- User logs in for first time
- User completes payment (success page)
- User visits dashboard (every time)

---

#### 3. SUBSCRIPTION_CANCELLED Message

**Sent by:** `src/app/dashboard/page.tsx` (when subscription is cancelled)

**Flow:**

```
[Web App Dashboard]
    ↓ Detects subscription.status === 'cancelled'
prepareSubscriptionCancelledMessage()
    ↓ chrome.runtime.sendMessage()
[Extension Service Worker]
    ↓ handleWebAppMessage('SUBSCRIPTION_CANCELLED')
Updates storage to locked state
    ↓ Broadcasts
broadcastToCalendarTabs({type: 'SUBSCRIPTION_CANCELLED'})
    ↓
[Calendar Content Script]
    ↓ onMessage listener
disableAllFeatures() → Removes colors, hides toolbar ❌
```

**Code Location:** `background.js:263-285`

```javascript
case 'SUBSCRIPTION_CANCELLED':
  // Update to locked state
  await chrome.storage.local.set({
    subscriptionActive: false,
    subscriptionStatus: {
      isActive: false,
      status: 'cancelled',
      reason: 'subscription_cancelled',
      message: 'Subscription cancelled',
      dataSource: 'cancellation_event'
    },
    subscriptionTimestamp: Date.now(),
    lastChecked: Date.now(),
  });

  // Notify popup
  notifyPopup({ type: 'SUBSCRIPTION_UPDATED' });

  // Disable features immediately
  await broadcastToCalendarTabs({ type: 'SUBSCRIPTION_CANCELLED' });
```

---

### Internal Message Flow (Extension Components)

#### Content Script → Background

```javascript
// content/index.js
chrome.runtime.sendMessage(
  {
    type: 'CHECK_SUBSCRIPTION',
  },
  (response) => {
    console.log('Subscription:', response);
  },
);
```

**Handled by:** `background.js` `onMessage` listener

**Available Types:**

- `CHECK_AUTH` - Get auth status
- `CHECK_SUBSCRIPTION` - Get subscription status
- `OPEN_WEB_APP` - Open web app in new tab
- `CLEAR_AUTH` - Logout
- `ENSURE_PUSH` - Force push subscription check

---

#### Background → Content Script (Broadcast)

```javascript
// background.js
async function broadcastToCalendarTabs(message) {
  const tabs = await chrome.tabs.query({
    url: 'https://calendar.google.com/*',
  });

  for (const tab of tabs) {
    chrome.tabs.sendMessage(tab.id, message);
  }
}
```

**Usage:**

```javascript
broadcastToCalendarTabs({ type: 'SUBSCRIPTION_UPDATED' });
broadcastToCalendarTabs({ type: 'SUBSCRIPTION_CANCELLED' });
```

**Received by:** `content/index.js` `onMessage` listener (line 193-218)

---

## Authentication System

### Google OAuth Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Authentication Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. User clicks "Continue with Google"                           │
│     ↓                                                             │
│  2. Web App → Supabase signInWithOAuth({ provider: 'google' })   │
│     ↓                                                             │
│  3. Redirect to Google OAuth consent screen                      │
│     ↓                                                             │
│  4. User approves → Google redirects back                        │
│     ↓                                                             │
│  5. Web App receives at /auth/callback?code=xyz                  │
│     ↓                                                             │
│  6. Backend exchanges code for session tokens                    │
│     ↓                                                             │
│  7. Session stored in cookies (httpOnly, secure)                 │
│     ↓                                                             │
│  8. ExtensionNotifier sends AUTH_SUCCESS to extension            │
│     ↓                                                             │
│  9. Extension stores session in chrome.storage.local             │
│     ↓                                                             │
│ 10. Extension can now make authenticated API calls ✅             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Session Management

**Web App (Cookies):**

- `sb-access-token` - HttpOnly, Secure, SameSite=Lax
- `sb-refresh-token` - HttpOnly, Secure, SameSite=Lax
- Duration: 1 hour (access), 7 days (refresh)
- Auto-renewal: Middleware refreshes on expiry

**Extension (chrome.storage.local):**

- `supabaseSession.access_token` - For API calls
- `supabaseSession.refresh_token` - For token renewal
- Duration: Same as web app
- Renewal: Manual (must re-login via web app)

### API Authentication

**Extension → Backend:**

```javascript
const { supabaseSession } = await chrome.storage.local.get('supabaseSession');

const response = await fetch(`${CONFIG.WEB_APP_URL}/api/extension/validate`, {
  headers: {
    Authorization: `Bearer ${supabaseSession.access_token}`,
  },
});
```

**Backend Validation:**

```javascript
// src/utils/supabase/from-bearer.ts
export function createClientFromBearer(authHeader: string | null) {
  const token = authHeader?.replace('Bearer ', '');

  return createClient({
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}

// Usage in API route
const supabase = createClientFromBearer(request.headers.get('authorization'));
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## Payment & Unlock Flow

### Complete Flow (Start to Finish)

```
┌─────────────────────────────────────────────────────────────────┐
│              Complete Signup → Payment → Unlock Flow            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. USER INSTALLS EXTENSION                                      │
│     ↓                                                             │
│     Extension registers Web Push (silent, no auth required)      │
│     Storage: { pushSubscription: {...}, customer_id: null }      │
│                                                                   │
│  2. USER CLICKS "GET STARTED" IN POPUP                           │
│     ↓                                                             │
│     Opens https://portal.calendarextension.com/signup            │
│                                                                   │
│  3. USER SIGNS UP WITH GOOGLE                                    │
│     ↓                                                             │
│     Supabase creates user account                                │
│     user_id: "ead0345a-a96d-42f4-a388-65783f0e085a"              │
│     email: "user@gmail.com"                                      │
│                                                                   │
│  4. REDIRECT TO /auth/callback                                   │
│     ↓                                                             │
│     Backend exchanges OAuth code for session                     │
│     Sets httpOnly cookies                                        │
│     ↓                                                             │
│     Sends AUTH_SUCCESS message to extension                      │
│     Extension stores session tokens                              │
│     ↓                                                             │
│     Extension registers push subscription with server            │
│     POST /api/extension/register-push                            │
│     Database: push_subscriptions.user_id = "ead0..."             │
│               push_subscriptions.customer_id = null              │
│                                                                   │
│  5. USER REDIRECTED TO /pricing OR /onboarding                   │
│     ↓                                                             │
│     User clicks "Start Free Trial"                               │
│                                                                   │
│  6. PADDLE CHECKOUT OPENS                                        │
│     ↓                                                             │
│     User enters payment details                                  │
│     Email: user@gmail.com (MUST match signup email!)             │
│     ↓                                                             │
│     Payment completes                                            │
│                                                                   │
│  7. PADDLE WEBHOOKS FIRE (in order)                              │
│     ↓                                                             │
│     A. customer.created                                          │
│        POST /api/paddle/webhook                                  │
│        Backend: Look up user by email                            │
│        Database: INSERT customers (                              │
│          customer_id: "ctm_01k8h2...",                           │
│          email: "user@gmail.com",                                │
│          user_id: "ead0345a-..."  ← CRITICAL LINK!               │
│        )                                                          │
│        Trigger: auto_link_push_subscriptions fires               │
│        Database: UPDATE push_subscriptions                       │
│          SET customer_id = "ctm_01k8h2..."                       │
│          WHERE user_id = "ead0345a-..."                          │
│     ↓                                                             │
│     B. subscription.created                                      │
│        POST /api/paddle/webhook                                  │
│        Database: INSERT subscriptions (                          │
│          subscription_id: "sub_01k8h2...",                       │
│          customer_id: "ctm_01k8h2...",                           │
│          status: "trialing"                                      │
│        )                                                          │
│        ↓                                                          │
│        Backend: Send Web Push notification                       │
│        sendWebPushToCustomer("ctm_01k8h2...", {                  │
│          type: 'SUBSCRIPTION_UPDATED'                            │
│        })                                                         │
│        ↓                                                          │
│        Extension service worker receives push                    │
│        ↓                                                          │
│        forceRefreshSubscription() → GET /api/extension/validate  │
│        ↓                                                          │
│        Database query finds active subscription                  │
│        Returns: { isActive: true, status: 'trialing' }           │
│        ↓                                                          │
│        handleWebAppMessage({ type: 'SUBSCRIPTION_UPDATED' })     │
│        ↓                                                          │
│        Storage: subscriptionActive = true ✅                      │
│                subscriptionStatus = { isActive: true, ... }      │
│     ↓                                                             │
│     C. transaction.completed                                     │
│        POST /api/paddle/webhook                                  │
│        (Backup - ensures customer exists)                        │
│                                                                   │
│  8. USER REDIRECTED TO /checkout/success                         │
│     ↓                                                             │
│     ExtensionNotifier component sends messages:                  │
│     A. PAYMENT_SUCCESS → Extension updates storage               │
│     B. AUTH_SUCCESS → Extension gets fresh session               │
│     ↓                                                             │
│     Extension storage now has:                                   │
│     {                                                             │
│       subscriptionActive: true,                                  │
│       subscriptionStatus: {                                      │
│         isActive: true,                                          │
│         status: 'trialing'                                       │
│       },                                                          │
│       supabaseSession: { access_token, ... }                     │
│     }                                                             │
│                                                                   │
│  9. USER OPENS CALENDAR.GOOGLE.COM (anytime)                     │
│     ↓                                                             │
│     content/index.js loads                                       │
│     ↓                                                             │
│     validateSubscriptionBeforeInit()                             │
│     chrome.storage.local.get(['subscriptionActive'])             │
│     ↓                                                             │
│     Returns: { subscriptionActive: true } ✅                      │
│     ↓                                                             │
│     init() → window.cc3Features.boot()                           │
│     ↓                                                             │
│     Features enabled! ✅                                          │
│     - Day coloring applied                                       │
│     - Toolbar mounted                                            │
│     - Task coloring available                                    │
│                                                                   │
│ 10. USER OPENS EXTENSION POPUP                                   │
│     ↓                                                             │
│     popup.js loads                                               │
│     ↓                                                             │
│     checkSubscription()                                          │
│     validateSubscription() in subscription-validator.js          │
│     ↓                                                             │
│     Reads cache: chrome.storage.local.get([                      │
│       'subscriptionStatus', 'lastChecked'                        │
│     ])                                                            │
│     ↓                                                             │
│     Returns cached: {                                            │
│       isActive: true,                                            │
│       status: 'trialing',                                        │
│       message: 'Free trial active'                               │
│     }                                                             │
│     ↓                                                             │
│     Popup shows: "Subscription Active" ✅                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Critical Dependencies

**For unlock to work, ALL of these must be true:**

1. ✅ Extension ID in Vercel matches actual extension
2. ✅ Signup email == Paddle checkout email
3. ✅ `manifest.json` has `externally_connectable` for web app domain
4. ✅ Storage format is OBJECT not STRING
5. ✅ Push subscription linked to customer_id
6. ✅ Webhooks configured in Paddle Dashboard

---

## Push Notification System

### Web Push Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Web Push Flow (FCM)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  REGISTRATION (Once per extension install)                       │
│  ─────────────────────────────────────────────────────────────  │
│  1. Extension service worker calls:                              │
│     self.registration.pushManager.subscribe({                    │
│       userVisibleOnly: true,                                     │
│       applicationServerKey: VAPID_PUBLIC_KEY                     │
│     })                                                            │
│     ↓                                                             │
│  2. Browser contacts FCM, gets subscription object:              │
│     {                                                             │
│       endpoint: "https://fcm.googleapis.com/fcm/send/xyz...",    │
│       keys: {                                                    │
│         p256dh: "BDzF...",  // Encryption key                    │
│         auth: "abc123..."    // Authentication secret            │
│       }                                                           │
│     }                                                             │
│     ↓                                                             │
│  3. Extension sends to backend:                                  │
│     POST /api/extension/register-push                            │
│     Body: { subscription: {...} }                                │
│     Auth: Bearer <access_token>                                  │
│     ↓                                                             │
│  4. Backend stores in database:                                  │
│     INSERT INTO push_subscriptions (                             │
│       user_id,        -- From auth token                         │
│       customer_id,    -- Linked after payment                    │
│       subscription,   -- Full push object (JSONB)                │
│       endpoint,       -- For uniqueness                          │
│       vapid_pub_hash  -- To detect key changes                   │
│     )                                                             │
│                                                                   │
│  SENDING (When subscription status changes)                      │
│  ─────────────────────────────────────────────────────────────  │
│  1. Paddle webhook received (subscription.created/updated)       │
│     ↓                                                             │
│  2. Backend updates database                                     │
│     ↓                                                             │
│  3. Backend calls sendWebPushToCustomer(customer_id, data)       │
│     ↓                                                             │
│  4. Query push_subscriptions WHERE customer_id = ...             │
│     ↓                                                             │
│  5. For each subscription:                                       │
│     webpush.sendNotification(subscription, JSON.stringify({      │
│       type: 'SUBSCRIPTION_UPDATED',                              │
│       timestamp: Date.now()                                      │
│     }))                                                           │
│     ↓                                                             │
│  6. FCM delivers to browser                                      │
│     ↓                                                             │
│  7. Extension service worker 'push' event fires                  │
│     ↓                                                             │
│  8. Extension validates with API:                                │
│     forceRefreshSubscription()                                   │
│     GET /api/extension/validate                                  │
│     ↓                                                             │
│  9. Extension updates storage based on API response              │
│     ↓                                                             │
│ 10. Features unlock/lock immediately ✅                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### VAPID Keys

**Purpose:** Authenticate backend as authorized sender

**Generation:**

```bash
npx web-push generate-vapid-keys
```

**Output:**

```
Public Key: BDzFvolcEIcAVROnYjCpQian2gKqPy6rETx0jEJntUSakNLlo0F1pv40LUZ524zaHd5S-xDqfipCDMdpP-o74T4
Private Key: E6H8SK5UGlG8eJ642k2SjMzERTVTQutfZlz5YxJg3gY
```

**⚠️ CRITICAL:** Public key must match in TWO places:

1. **Vercel Environment Variable:**

   ```
   VAPID_PUBLIC_KEY=BDzFvolcEIcAVROnYjCpQian2gKqPy6rETx0jEJntUSakNLlo0F1pv40LUZ524zaHd5S-xDqfipCDMdpP-o74T4
   VAPID_PRIVATE_KEY=E6H8SK5UGlG8eJ642k2SjMzERTVTQutfZlz5YxJg3gY
   VAPID_SUBJECT=mailto:support@calendarextension.com
   ```

2. **Extension config.production.js:**
   ```javascript
   VAPID_PUBLIC_KEY: 'BDzFvolcEIcAVROnYjCpQian2gKqPy6rETx0jEJntUSakNLlo0F1pv40LUZ524zaHd5S-xDqfipCDMdpP-o74T4';
   ```

**Key Mismatch Detection:**

```javascript
// src/utils/fcm/send-push.ts
const currentVapidHash = getVapidPublicKeyHash(); // SHA256 of public key

if (subRecord.vapid_pub_hash !== currentVapidHash) {
  // Keys don't match - delete stale subscription
  await supabase.from('push_subscriptions').delete().eq('endpoint', subRecord.endpoint);
}
```

---

## Extension Components

### File Structure

```
customise calendar 3/
├── manifest.json              # Extension manifest (V3)
├── background.js              # Service worker (handles messages)
├── config.production.js       # Configuration (VAPID, URLs, etc)
│
├── popup/
│   ├── popup.html            # Popup UI
│   ├── popup.js              # Popup logic
│   └── popup.css             # Popup styles
│
├── content/
│   ├── index.js              # Main content script
│   ├── toolbar.js            # Calendar toolbar
│   ├── modalInjection.js     # Task color picker injection
│   └── content.css           # Content styles
│
├── lib/
│   ├── supabase-extension.js     # Supabase client
│   ├── subscription-validator.js # Subscription validation
│   └── storage.js                # Storage abstraction
│
├── features/
│   ├── calendar-coloring/    # Day coloring feature
│   ├── tasks-coloring/       # Task coloring feature
│   └── time-blocking/        # Time blocking feature
│
└── images/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

### Manifest Configuration

**File:** `manifest.json`

**Critical Settings:**

```json
{
  "manifest_version": 3,
  "name": "ColorKit for Google Calendar",
  "version": "0.0.1",

  "permissions": [
    "storage", // chrome.storage.local
    "tabs", // Query/send messages to tabs
    "cookies", // Read Supabase cookies (not used currently)
    "notifications", // Web Push notifications
    "alarms" // Periodic validation (3-day alarm)
  ],

  "host_permissions": [
    "https://calendar.google.com/*", // Inject content scripts
    "https://*.supabase.co/*", // API calls
    "https://portal.calendarextension.com/*" // Web app API
  ],

  "background": {
    "service_worker": "background.js",
    "type": "module" // ES modules support
  },

  "externally_connectable": {
    // ⚠️ CRITICAL: Allows web app to send messages
    "matches": [
      "http://localhost:3000/*",
      "http://127.0.0.1:3000/*",
      "https://*.vercel.app/*",
      "https://portal.calendarextension.com/*"
    ]
  },

  "content_scripts": [
    {
      "matches": ["https://calendar.google.com/*"],
      "js": [
        "lib/storage.js",
        "content/featureRegistry.js",
        // ... feature files
        "content/index.js" // Runs last, checks subscription
      ],
      "run_at": "document_idle" // After DOM loaded
    }
  ]
}
```

---

### Service Worker (background.js)

**Purpose:** Central message hub, handles all external/internal communication

**Key Functions:**

#### Message Handlers

```javascript
// External messages (from web app)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (sender.url && sender.url.startsWith(CONFIG.WEB_APP_URL)) {
    handleWebAppMessage(message);
    sendResponse({ received: true, status: 'success' });
  }
});

// Internal messages (from popup/content scripts)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'CHECK_AUTH':
      checkAuthStatus().then(sendResponse);
      return true;
    case 'CHECK_SUBSCRIPTION':
      checkSubscriptionStatus().then(sendResponse);
      return true;
    // ... other cases
  }
});
```

#### Web Push Listener

```javascript
self.addEventListener('push', async (event) => {
  const data = event.data ? event.data.json() : {};

  // Always re-validate with server (don't trust push payload)
  const result = await forceRefreshSubscription();

  if (result.isActive) {
    await handleWebAppMessage({ type: 'SUBSCRIPTION_UPDATED' });
  } else {
    await handleWebAppMessage({ type: 'SUBSCRIPTION_CANCELLED' });
  }
});
```

#### Periodic Alarm (3-day validation)

```javascript
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'periodic-subscription-check') {
    const result = await forceRefreshSubscription();

    if (!result.isActive) {
      await handleWebAppMessage({ type: 'SUBSCRIPTION_CANCELLED' });
    }
  }
});
```

---

### Content Script (content/index.js)

**Purpose:** Initializes features on calendar page if subscription is active

**Flow:**

```javascript
async function validateSubscriptionBeforeInit() {
  // Read from storage (no API call!)
  const stored = await chrome.storage.local.get(['subscriptionActive']);

  if (stored.subscriptionActive) {
    return true; // ✅ Unlock
  } else {
    console.log('No active subscription - features disabled');
    return false; // ❌ Lock
  }
}

async function init() {
  // Wait for dependencies
  while (!window.cc3Features && retries < 10) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    retries++;
  }

  // Validate subscription
  const isValid = await validateSubscriptionBeforeInit();
  if (!isValid) {
    return; // Don't initialize features
  }

  // Boot features
  await window.cc3Features.boot();

  // Initialize toolbar, task coloring, etc.
}

// Listen for unlock messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SUBSCRIPTION_UPDATED') {
    validateSubscriptionBeforeInit().then((isValid) => {
      if (isValid && !featuresEnabled) {
        location.reload(); // Reload to initialize features
      }
    });
  } else if (message.type === 'SUBSCRIPTION_CANCELLED') {
    disableAllFeatures();
  }
});
```

---

### Popup (popup.js)

**Purpose:** Show subscription status, allow user actions

**Subscription Check:**

```javascript
async function checkSubscription() {
  // Uses subscription-validator.js
  const result = await validateSubscription();

  if (result.isActive) {
    showActiveState(result.status); // Green, "Subscription Active"
  } else {
    showInactiveState(result.reason, result.message);
  }
}
```

**Key Functions:**

- `showActiveState()` - Green UI, shows trial/active status
- `showInactiveState()` - Shows login/upgrade prompts
- `handleGetStarted()` - Opens web app for signup
- `handleManageSubscription()` - Opens dashboard

---

## Backend API Endpoints

### Extension APIs

#### 1. POST /api/extension/register-push

**Purpose:** Register Web Push subscription for user

**Auth:** Bearer token (required)

**Request:**

```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/xyz...",
    "keys": {
      "p256dh": "BDzF...",
      "auth": "abc123..."
    }
  }
}
```

**Process:**

1. Verify user from Bearer token
2. Compute VAPID public key hash
3. Check if customer exists for this user
4. UPSERT to push_subscriptions table:
   - If customer exists → Set customer_id immediately
   - If no customer → Set customer_id = null (linked later by webhook)

**Response:**

```json
{
  "success": true,
  "message": "Push subscription registered"
}
```

**Code:** `src/app/api/extension/register-push/route.ts`

---

#### 2. GET /api/extension/validate

**Purpose:** Check if user has active subscription

**Auth:** Bearer token (required)

**Process:**

1. Get user from Bearer token
2. Query customers table by email
3. Query subscriptions table by customer_id
4. Check if status in ['active', 'trialing', 'past_due']

**Response (Active):**

```json
{
  "isActive": true,
  "status": "trialing",
  "subscriptionId": "sub_01k8h2...",
  "customerId": "ctm_01k8h2...",
  "message": "Free trial active",
  "dataSource": "database"
}
```

**Response (Inactive):**

```json
{
  "isActive": false,
  "reason": "no_subscription",
  "message": "No subscription found. Start your free trial!"
}
```

**Code:** `src/app/api/extension/validate/route.ts`

---

#### 3. POST /api/extension/validate-push

**Purpose:** Check if push subscription is registered

**Auth:** Bearer token (required)

**Request:**

```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/..."
  }
}
```

**Response:**

```json
{
  "isRegistered": true,
  "createdAt": "2025-01-26T20:17:52.108148+00:00"
}
```

**Code:** `src/app/api/extension/validate-push/route.ts`

---

#### 4. GET /api/extension/subscription-status

**Purpose:** Get push registration status summary

**Auth:** Bearer token (required)

**Response:**

```json
{
  "status": "fully_registered",
  "subscriptionCount": 1,
  "details": {
    "hasSubscription": true,
    "linkedToCustomer": true,
    "endpoint": "https://fcm.googleapis.com/..."
  }
}
```

**Possible Statuses:**

- `fully_registered` - Push registered and linked to customer ✅
- `pending_customer` - Push registered but awaiting payment
- `not_registered` - No push subscription found

**Code:** `src/app/api/extension/subscription-status/route.ts`

---

#### 5. GET /api/extension/debug-push

**Purpose:** Diagnostic endpoint for troubleshooting push notifications

**Auth:** Bearer token (required)

**Query Params:**

- `?test=true` - Send test push notification

**Response:**

```json
{
  "user": {
    "id": "ead0345a-...",
    "email": "user@gmail.com"
  },
  "vapid": {
    "configured": true,
    "publicKeyConfigured": true,
    "privateKeyConfigured": true,
    "subjectConfigured": true,
    "keyHash": "a1b2c3d4...",
    "publicKeyPreview": "BDzFvolcEIcAVROn..."
  },
  "subscriptions": {
    "count": 1,
    "items": [
      {
        "endpoint": "https://fcm.googleapis.com/...",
        "customer_id": "ctm_01k8h2...",
        "created_at": "2025-01-26T20:17:52.108148+00:00",
        "vapid_pub_hash": "a1b2c3d4...",
        "keyMatch": true
      }
    ]
  },
  "customer": {
    "hasCustomer": true,
    "customerId": "ctm_01k8h2...",
    "subscriptionStatus": "trialing"
  },
  "analysis": [
    "✓ All systems operational",
    "✓ Push notifications configured correctly",
    "✓ Subscription linked to customer"
  ],
  "recommendations": []
}
```

**Code:** `src/app/api/extension/debug-push/route.ts`

---

### Webhook API

#### POST /api/paddle/webhook

**Purpose:** Receive and process Paddle webhook events

**Location:** Uses **Pages Router** at `src/pages/api/paddle/webhook.ts` (isolated from middleware)

**Security:**

- Verifies `paddle-signature` header
- Uses `PADDLE_NOTIFICATION_WEBHOOK_SECRET`
- Returns 400 if signature invalid

**Events Processed:**

| Event                   | Action                | Database Updates              | Push Sent?                           |
| ----------------------- | --------------------- | ----------------------------- | ------------------------------------ |
| `subscription.created`  | New subscription      | INSERT subscriptions          | ✅ SUBSCRIPTION_UPDATED              |
| `subscription.updated`  | Status changed        | UPDATE subscriptions          | ✅ SUBSCRIPTION_UPDATED or CANCELLED |
| `subscription.canceled` | User canceled         | UPDATE status                 | ✅ SUBSCRIPTION_CANCELLED            |
| `customer.created`      | New customer          | INSERT customers with user_id | ❌                                   |
| `customer.updated`      | Email/details changed | UPDATE customers              | ❌                                   |
| `transaction.completed` | Payment succeeded     | Ensure customer exists        | ❌                                   |

**Process Flow:**

```javascript
// 1. Verify signature
const signature = request.headers.get('paddle-signature');
const rawBody = await request.text();
const eventData = paddle.webhooks.unmarshal(rawBody, privateKey, signature);

// 2. Process event
switch (eventData.eventType) {
  case EventName.CustomerCreated:
    // Look up user by email
    const { data: userData } = await supabase.auth.admin.listUsers();
    const user = userData.users.find((u) => u.email === eventData.data.email);

    // Save customer with user_id
    await supabase.from('customers').upsert({
      customer_id: eventData.data.id,
      email: eventData.data.email,
      user_id: user?.id || null, // CRITICAL LINK
    });

    // Database trigger auto-links push subscriptions
    break;

  case EventName.SubscriptionCreated:
    // Save subscription
    await supabase.from('subscriptions').upsert({
      subscription_id: eventData.data.id,
      subscription_status: eventData.data.status,
      customer_id: eventData.data.customerId,
    });

    // Send push notification
    if (['active', 'trialing'].includes(eventData.data.status)) {
      await sendWebPushToCustomer(eventData.data.customerId, {
        type: 'SUBSCRIPTION_UPDATED',
        timestamp: Date.now(),
      });
    }
    break;
}

// 3. Return 200 OK
return new Response('OK', { status: 200 });
```

**Code:** `src/utils/paddle/process-webhook.ts`

---

## Database Schema

### Tables

#### customers

```sql
CREATE TABLE customers (
  customer_id TEXT PRIMARY KEY,           -- Paddle customer ID
  email TEXT NOT NULL,                    -- Customer email
  user_id UUID REFERENCES auth.users,    -- Supabase user (CRITICAL!)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_user_id ON customers(user_id);
```

**Purpose:** Links Paddle customers to Supabase users

**Critical:** `user_id` must be set for push notifications to work

---

#### subscriptions

```sql
CREATE TABLE subscriptions (
  subscription_id TEXT PRIMARY KEY,              -- Paddle subscription ID
  subscription_status TEXT NOT NULL,             -- active|trialing|canceled|past_due
  price_id TEXT,                                 -- Paddle price ID
  product_id TEXT,                               -- Paddle product ID
  scheduled_change TEXT,                         -- Upcoming changes (JSON)
  customer_id TEXT REFERENCES customers,         -- FK to customers
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(subscription_status);
```

**Purpose:** Stores subscription status from webhooks

---

#### push_subscriptions

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,   -- Supabase user
  customer_id TEXT REFERENCES customers,         -- Paddle customer (nullable)
  subscription JSONB NOT NULL,                   -- Full push subscription object
  endpoint TEXT UNIQUE NOT NULL,                 -- FCM endpoint (unique)
  vapid_pub_hash TEXT,                           -- VAPID key version detection
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_push_user ON push_subscriptions(user_id);
CREATE INDEX idx_push_customer ON push_subscriptions(customer_id);
CREATE UNIQUE INDEX idx_push_endpoint ON push_subscriptions(endpoint);
```

**Purpose:** Stores Web Push subscriptions for extensions

**Flow:**

1. Extension registers → `user_id` set, `customer_id` NULL
2. User pays → Webhook links `customer_id`
3. Backend can now send push to customer

---

### Database Trigger (Critical)

**File:** `MIGRATION_add_user_id_to_customers.sql`

**Purpose:** Automatically link push subscriptions when customer.user_id is set

```sql
CREATE OR REPLACE FUNCTION auto_link_push_subscriptions_on_customer_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If user_id was just set
  IF NEW.user_id IS NOT NULL AND
     (OLD.user_id IS NULL OR OLD.user_id != NEW.user_id) THEN

    -- Update all push subscriptions for this user
    UPDATE public.push_subscriptions
    SET customer_id = NEW.customer_id
    WHERE user_id = NEW.user_id
      AND (customer_id IS NULL OR customer_id != NEW.customer_id);

    RAISE NOTICE 'Auto-linked push subscriptions: customer_id=%, user_id=%',
      NEW.customer_id, NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_link_push_subscriptions
  AFTER INSERT OR UPDATE OF user_id ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_push_subscriptions_on_customer_update();
```

**When it fires:**

- Customer created with user_id
- Customer updated and user_id changes

**What it does:**

- Finds all push_subscriptions with matching user_id
- Sets customer_id on those subscriptions
- Enables backend to send push notifications immediately

---

## Common Issues & Solutions

### Issue 1: Extension Not Unlocking After Payment

**Symptoms:**

- Payment succeeds
- User redirected to success page
- Extension still shows "locked" or trial overlay
- Popup shows "No subscription"

**Root Cause:** Storage format mismatch

**Check:**

```javascript
// In extension service worker console
chrome.storage.local.get(['subscriptionStatus'], (data) => {
  console.log('Type:', typeof data.subscriptionStatus);
  console.log('Value:', data.subscriptionStatus);
});
```

**If you see:**

```javascript
Type: 'string';
Value: 'active';
```

**Problem:** `subscriptionStatus` is a STRING, should be OBJECT

**Fix:** Update `background.js` to save object format:

```javascript
subscriptionStatus: {
  isActive: true,
  status: 'active',
  message: 'Subscription active',
  dataSource: 'payment_success'
}
```

**Files to check:**

- `background.js:231-246` (PAYMENT_SUCCESS)
- `background.js:196-207` (AUTH_SUCCESS)
- `background.js:263-276` (SUBSCRIPTION_CANCELLED)

---

### Issue 2: Push Notifications Not Working

**Symptoms:**

- Subscription status doesn't update in real-time
- Extension requires reload to see changes
- Webhook sends push but extension doesn't receive

**Diagnostic Steps:**

1. **Check VAPID key match:**

```javascript
// Extension config.production.js
VAPID_PUBLIC_KEY: 'BDzFvolcEIcAVROnYjCpQian2gKqPy6rETx0jEJntUSakNLlo0F1pv40LUZ524zaHd5S-xDqfipCDMdpP-o74T4';

// Vercel environment variable
VAPID_PUBLIC_KEY = BDzFvolcEIcAVROnYjCpQian2gKqPy6rETx0jEJntUSakNLlo0F1pv40LUZ524zaHd5S - xDqfipCDMdpP - o74T4;
```

Must be EXACTLY the same (no extra spaces/newlines)!

2. **Check push subscription registered:**

```sql
SELECT * FROM push_subscriptions WHERE user_id = '<user-uuid>';
```

Expected:

- `user_id` - Should be set ✅
- `customer_id` - Should be set after payment ✅
- `vapid_pub_hash` - Should match current key ✅

3. **Check webhook logs:**

Go to Vercel → Logs → Filter `/api/paddle/webhook`

Look for:

```
[Webhook] 📤 PUSH NOTIFICATION FLOW STARTING
[Webhook] 🔓 Subscription active - sending unlock push
[Webhook] ✅ Unlock push completed: 1 successful, 0 failed
```

If you see `0 successful, 0 failed` → No push subscriptions found

**Common Fixes:**

A. **Email mismatch:**

- Signup email: `user@gmail.com`
- Paddle email: `user@work.com`
- **Solution:** Use same email for both

B. **Customer not linked:**

```sql
SELECT * FROM customers WHERE email = 'user@gmail.com';
```

If `user_id` is NULL:

```sql
UPDATE customers
SET user_id = '<user-uuid>'
WHERE email = 'user@gmail.com';
```

C. **VAPID key mismatch:**

- Delete old subscriptions:
  ```sql
  DELETE FROM push_subscriptions
  WHERE vapid_pub_hash != '<current-hash>';
  ```
- Extension will re-register automatically

---

### Issue 3: Extension ID Mismatch

**Symptoms:**

- Web app console: `Could not establish connection. Receiving end does not exist.`
- ExtensionNotifier messages fail
- Direct messaging test fails

**Check:**

```javascript
// 1. Get actual extension ID
//extensions/ → ColorKit → Copy Extension ID

// 2. Check Vercel environment variable
chrome: NEXT_PUBLIC_EXTENSION_ID = fembfgpdkdghicfocfcijepgmelaibhm;

// 3. Verify they match
```

**Important:**

- **Unpacked extension** - ID changes every time you create new extension folder
- **Published extension** - ID is permanent (assigned by Chrome Web Store)

**Fix:**
Update `NEXT_PUBLIC_EXTENSION_ID` in Vercel to match actual ID, then redeploy.

---

### Issue 4: Manifest externally_connectable

**Symptoms:**

- Messages sent but not received
- `chrome.runtime.sendMessage` returns error
- Extension receives message from unauthorized source

**Check manifest.json:**

```json
"externally_connectable": {
  "matches": [
    "https://portal.calendarextension.com/*"
  ]
}
```

**Must include:**

- Production domain
- Localhost (for testing): `http://localhost:3000/*`
- Vercel preview URLs (optional): `https://*.vercel.app/*`

**If missing:** Messages from web app will be blocked by Chrome

---

### Issue 5: Content Script Not Initializing

**Symptoms:**

- Calendar page loads but no colors applied
- Toolbar doesn't appear
- Console shows no errors

**Check:**

1. **Storage has subscriptionActive:**

   ```javascript
   chrome.storage.local.get(['subscriptionActive'], console.log);
   // Expected: { subscriptionActive: true }
   ```

2. **Content script loaded:**
   - Open `calendar.google.com`
   - DevTools Console
   - Look for: `[ColorKit] Subscription validation...`

3. **Check for errors:**
   - Filter console for `ColorKit`
   - Look for: `features disabled`, `validation failed`

**Common issues:**

A. **subscriptionActive is false:**

- User not subscribed
- Storage not updated after payment
- Check popup shows correct status

B. **Content script blocked:**

- Check manifest.json has correct permissions
- Check `host_permissions` includes `https://calendar.google.com/*`

C. **Features failed to boot:**

- Check `window.cc3Features` exists
- Check `window.cc3Storage` exists
- Look for JavaScript errors in console

**Fix:**
Reload extension and refresh calendar page (Ctrl+Shift+R)

---

### Issue 6: Popup Shows Wrong Status

**Symptoms:**

- Extension unlocked (features work)
- Popup shows "No subscription"
- Or vice versa

**Root Cause:** Cache mismatch

**Check cache:**

```javascript
chrome.storage.local.get(['subscriptionActive', 'subscriptionStatus', 'lastChecked'], (data) => {
  console.log('subscriptionActive:', data.subscriptionActive);
  console.log('subscriptionStatus:', data.subscriptionStatus);
  console.log('Cache age:', Date.now() - data.lastChecked, 'ms');
});
```

**Expected:**

```javascript
{
  subscriptionActive: true,
  subscriptionStatus: {
    isActive: true,
    status: 'trialing',
    message: 'Free trial active'
  },
  lastChecked: 1234567890000  // Recent timestamp
}
```

**If mismatch:**

```javascript
// Clear cache
chrome.storage.local.remove(['subscriptionStatus', 'lastChecked']);

// Force refresh
chrome.runtime.sendMessage({ type: 'CHECK_SUBSCRIPTION' });
```

---

## Debugging Guide

### Enable Debug Logging

**Extension:**

Edit `config.production.js`:

```javascript
DEBUG: true; // Change from false to true
```

Reload extension at `chrome://extensions/`

**What you'll see:**

```
[ColorKit] Extension installed/updated: install
[ColorKit] Scheduling Web Push registration
[ColorKit] External message received from: https://portal...
[ColorKit] Handling web app message: PAYMENT_SUCCESS
[ColorKit] Payment success saved - subscription now active
```

### Debug Endpoints

#### 1. Extension Service Worker Console

```javascript
// Get all storage
chrome.storage.local.get(null, console.log);

// Check specific keys
chrome.storage.local.get(['subscriptionActive', 'subscriptionStatus'], console.log);

// Test broadcast
chrome.runtime.sendMessage({ type: 'CHECK_SUBSCRIPTION' }, console.log);

// Clear all storage (DANGER)
chrome.storage.local.clear();
```

#### 2. Content Script Console (calendar.google.com)

```javascript
// Check if features enabled
console.log('Features enabled:', window.cc3Features);
console.log('Storage:', window.cc3Storage);

// Force validation
chrome.runtime.sendMessage({ type: 'CHECK_SUBSCRIPTION' }, console.log);

// Check subscription state
chrome.storage.local.get(['subscriptionActive'], console.log);
```

#### 3. Backend Debug Push Endpoint

```bash
# Get debug info + send test push
curl -H "Authorization: Bearer <access_token>" \
  "https://portal.calendarextension.com/api/extension/debug-push?test=true"
```

Response shows:

- VAPID configuration
- Push subscriptions
- Customer linkage
- Key mismatches
- Sends test push notification

#### 4. Database Queries

```sql
-- Check user account
SELECT * FROM auth.users WHERE email = 'user@gmail.com';

-- Check customer record
SELECT * FROM customers WHERE email = 'user@gmail.com';

-- Check subscription
SELECT s.*, c.email, c.user_id
FROM subscriptions s
JOIN customers c ON s.customer_id = c.customer_id
WHERE c.email = 'user@gmail.com';

-- Check push subscription
SELECT * FROM push_subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@gmail.com');

-- Check linking
SELECT
  u.email AS user_email,
  c.customer_id,
  c.user_id AS customer_user_id,
  ps.customer_id AS push_customer_id,
  s.subscription_status
FROM auth.users u
LEFT JOIN customers c ON u.id = c.user_id
LEFT JOIN push_subscriptions ps ON u.id = ps.user_id
LEFT JOIN subscriptions s ON c.customer_id = s.customer_id
WHERE u.email = 'user@gmail.com';
```

### Test Scenarios

#### Scenario 1: Fresh Signup → Payment → Unlock

```
1. Clear extension storage:
   chrome.storage.local.clear()

2. Reload extension

3. Install extension in fresh browser profile

4. Sign up with NEW email

5. Complete payment

6. Watch logs in:
   - Extension service worker console
   - Web app console (success page)
   - Vercel function logs
   - Paddle webhook logs

Expected timeline:
T+0s: Payment completes
T+1s: Redirected to success page
T+2s: ExtensionNotifier sends PAYMENT_SUCCESS
T+3s: Extension storage updated
T+4s: Popup shows "Subscription Active"
T+5s: Calendar features work
```

#### Scenario 2: Existing User Revisits

```
1. User already subscribed

2. Opens calendar.google.com

3. Content script validates:
   - Reads subscriptionActive from storage
   - If true → init() → features enabled
   - No API call needed ✅

4. Opens popup:
   - Reads subscriptionStatus from storage
   - If cache < 24h old → shows cached status
   - If cache expired → makes API call
```

#### Scenario 3: Subscription Cancelled

```
1. User cancels via dashboard

2. Paddle sends webhook: subscription.canceled

3. Backend processes:
   - Updates database: status = 'canceled'
   - Sends Web Push: SUBSCRIPTION_CANCELLED

4. Extension receives push:
   - Service worker validates with API
   - Confirms subscription inactive
   - Updates storage: subscriptionActive = false

5. If calendar open:
   - Broadcast sent to content script
   - disableAllFeatures() called
   - Colors removed, toolbar hidden

6. Next calendar load:
   - validateSubscriptionBeforeInit() returns false
   - Features not initialized
```

---

## Deployment Checklist

### Pre-Deploy (Extension)

- [ ] Update `config.production.js` with correct:
  - [ ] `WEB_APP_URL`
  - [ ] `VAPID_PUBLIC_KEY`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `DEBUG: false` (production)

- [ ] Update `manifest.json`:
  - [ ] `version` number incremented
  - [ ] `externally_connectable` includes production domain

- [ ] Test in local Chrome:
  - [ ] Load unpacked extension
  - [ ] Complete signup → payment flow
  - [ ] Verify unlock works
  - [ ] Check push notifications work

- [ ] Build for production:
  - [ ] Remove console.logs (if not using DEBUG flag)
  - [ ] Minify if needed
  - [ ] Create ZIP for Chrome Web Store

### Pre-Deploy (Backend)

- [ ] Verify all environment variables in Vercel:
  - [ ] `NEXT_PUBLIC_EXTENSION_ID` (correct extension ID)
  - [ ] `VAPID_PUBLIC_KEY` (matches extension)
  - [ ] `VAPID_PRIVATE_KEY`
  - [ ] `VAPID_SUBJECT`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `PADDLE_API_KEY`
  - [ ] `PADDLE_NOTIFICATION_WEBHOOK_SECRET`

- [ ] Test webhook endpoint:
  - [ ] Configure in Paddle Dashboard
  - [ ] Send test event
  - [ ] Check Vercel logs show event processed

- [ ] Database migrations applied:
  - [ ] Customers table has `user_id` column
  - [ ] Push subscriptions table has `vapid_pub_hash`
  - [ ] Trigger `auto_link_push_subscriptions` exists

### Post-Deploy

- [ ] Test complete flow with real payment
- [ ] Monitor Vercel logs for errors
- [ ] Check Paddle webhook delivery success rate
- [ ] Test push notifications work
- [ ] Verify extension unlocks in production

---

## Version History

### v2.0 (2025-01-26) - CURRENT

**Changes:**

- ✅ Fixed storage format mismatch (string → object)
- ✅ Added `dataSource` field to subscriptionStatus
- ✅ Fixed cache clearing bug (was removing what it just set)
- ✅ Updated all message handlers (PAYMENT_SUCCESS, AUTH_SUCCESS, SUBSCRIPTION_CANCELLED)
- ✅ Documented complete architecture

**Files Modified:**

- `background.js` - Storage format fixes
- `SYSTEM_ARCHITECTURE_COMPLETE.md` - This file created

### v1.0 (2025-01-25)

**Initial Release:**

- Web Push notifications
- Paddle integration
- Supabase auth
- Chrome extension unlock system

---

## Quick Reference

### Extension ID Verification

```bash
# 1. Get ID from chrome://extensions/
# 2. Update Vercel:
NEXT_PUBLIC_EXTENSION_ID=<actual-extension-id>
# 3. Redeploy
```

### Storage Format Check

```javascript
chrome.storage.local.get(['subscriptionStatus'], (data) => {
  console.log(typeof data.subscriptionStatus); // Must be "object"
});
```

### Force Unlock (Dev Only)

```javascript
// ⚠️ DEV ONLY - Manually unlock extension
chrome.storage.local.set({
  subscriptionActive: true,
  subscriptionStatus: {
    isActive: true,
    status: 'active',
    message: 'DEV: Manually unlocked',
  },
});

// Reload calendar page
location.reload();
```

### Clear All Extension Data

```javascript
// Reset everything
chrome.storage.local.clear();
location.reload(); // If on calendar page
```

---

**END OF DOCUMENTATION**

For issues not covered here, check:

- Vercel function logs
- Paddle webhook delivery logs
- Extension service worker console
- Supabase database directly

All timestamps in this document are in UTC unless specified otherwise.
