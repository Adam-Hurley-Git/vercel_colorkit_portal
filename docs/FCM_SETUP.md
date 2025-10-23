# Firebase Cloud Messaging (FCM) Setup Guide

This guide explains how to set up Firebase Cloud Messaging for instant Chrome extension notifications when subscriptions change.

## Why FCM?

- **Instant Updates**: Extension blocked within < 1 minute of subscription cancellation
- **Zero Cost**: Firebase Cloud Messaging is completely FREE and UNLIMITED
- **99.9% Cost Reduction**: Only 1 API call/day instead of 288 calls/day (5-minute polling)
- **Reliable**: Native Chrome extension push notification system

## Architecture

```
Paddle Webhook (subscription.updated)
    ↓
Server detects cancellation
    ↓
Server sends FCM push to extension
    ↓
Extension receives push instantly
    ↓
Extension clears cache and blocks access
    ↓
Daily validation at 4 AM (backup)
```

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "ColorKit Extension")
4. Disable Google Analytics (not needed)
5. Click "Create project"

### 2. Get FCM Credentials

#### Get FCM Sender ID

1. In Firebase Console, click ⚙️ Settings → Project settings
2. Go to "Cloud Messaging" tab
3. Copy the **Sender ID** (e.g., `123456789012`)
4. Update `customise calendar 3/config.production.js`:
   ```javascript
   FCM_SENDER_ID: '123456789012', // Replace with your Sender ID
   ```

#### Get FCM Server Key

1. Still in Cloud Messaging settings
2. Under "Cloud Messaging API (Legacy)", click the three dots menu
3. Click "Manage API in Google Cloud Console"
4. Enable "Firebase Cloud Messaging API" if not already enabled
5. Go back to Firebase Console → Cloud Messaging tab
6. Copy the **Server key** (starts with `AAAA...`)
7. Add to Vercel environment variables:
   ```
   FIREBASE_SERVER_KEY=AAAA...your_server_key_here
   ```

### 3. Update Extension Configuration

Edit `customise calendar 3/config.production.js`:

```javascript
export const CONFIG = {
  // ... existing config ...

  // Replace with your actual FCM Sender ID
  FCM_SENDER_ID: '123456789012',

  // ... rest of config ...
};
```

### 4. Deploy to Vercel

1. Add environment variable in Vercel dashboard:
   - Variable name: `FIREBASE_SERVER_KEY`
   - Value: Your Server Key from step 2
   - Environment: Production (and Preview if needed)

2. Redeploy your application:
   ```bash
   git push
   ```
   Or manually redeploy in Vercel dashboard

### 5. Apply Database Migration

Run the migration to create the `fcm_tokens` table:

```bash
cd paddle-nextjs-starter-kit
npx supabase db push
```

Or manually run the SQL from `supabase/migrations/20251023100000_fcm_tokens.sql` in Supabase dashboard.

### 6. Rebuild Extension

After updating `config.production.js` with your FCM Sender ID:

1. Load the updated extension in Chrome
2. The extension will automatically register for FCM notifications
3. Check browser console for: `FCM registered, token: ...`

## Testing

### Test FCM Registration

1. Install/reload extension
2. Open extension popup
3. Check browser console (F12)
4. Look for:
   ```
   [ColorKit] FCM registered, token: ABC123...
   [ColorKit] FCM token registered with server successfully
   ```

### Test Instant Cancellation

1. Create test subscription in Paddle sandbox
2. In extension, verify it's unlocked
3. Cancel subscription in Paddle dashboard
4. Within 1 minute, extension should be blocked
5. Check Vercel logs for:
   ```
   [Webhook] 🔔 Subscription cancelled/paused - sending FCM push notification
   [Webhook] ✅ FCM push sent: 1 successful, 0 failed
   ```

### Test Daily Validation

The extension runs a daily validation at 4 AM local time. To test:

1. Open Chrome → Extensions → Developer mode
2. Find ColorKit → Background page
3. In console, manually trigger alarm:
   ```javascript
   chrome.alarms.create('daily-subscription-check', { when: Date.now() + 1000 });
   ```
4. Wait 1 second, check console for:
   ```
   [ColorKit] Running daily subscription validation...
   [ColorKit] Daily validation complete: Active
   ```

## Troubleshooting

### FCM Token Not Registered

**Symptom**: Console shows "No session available, will register FCM token after login"

**Solution**:

1. User needs to sign in through extension popup
2. Or visit dashboard (extension will receive AUTH_SUCCESS)
3. Pending token will be registered automatically

### FCM Push Not Received

**Symptom**: Subscription cancelled but extension still has access

**Solution**:

1. Check Vercel logs for FCM push errors
2. Verify `FIREBASE_SERVER_KEY` is set correctly
3. Check extension console for FCM listener errors
4. Daily validation will catch it within 24 hours

### Invalid FCM Token Error

**Symptom**: Vercel logs show "NotRegistered" or "InvalidRegistration"

**Solution**:

- This is normal - extension automatically removes invalid tokens
- Happens when user uninstalls extension or clears data
- Old tokens are automatically cleaned up

## Cost Analysis

### Before FCM (5-minute polling):

- 1 user = 12 checks/hour = 288 API calls/day
- 1,000 users = 288,000 API calls/day = 8.64M calls/month
- Cost: ~$37/month at Vercel's $2/million invocations

### After FCM (push + daily):

- 1 user = 1 API call/day (daily validation at 4 AM)
- 1,000 users = 1,000 API calls/day = 30K calls/month
- Cost: $0/month (stays within free tier)
- FCM pushes: $0 (unlimited and free)

**Savings**: 99.7% reduction in API calls + $37/month saved

## Security Notes

- FCM Server Key should be kept secret (server-side only)
- FCM Sender ID is public (safe to include in extension code)
- Tokens are stored per-user, linked to Paddle customer_id
- Invalid tokens are automatically cleaned up
- Push notifications contain no sensitive data (just trigger to revalidate)

## Additional Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Chrome Extension GCM API](https://developer.chrome.com/docs/extensions/reference/gcm/)
- [Supabase Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
