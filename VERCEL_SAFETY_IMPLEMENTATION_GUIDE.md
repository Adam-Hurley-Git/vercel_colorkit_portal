# Vercel Safety Implementation Guide

**Last Updated:** January 2025
**Purpose:** Protect against unexpected Vercel cost spikes
**Status:** 🔴 Not yet implemented (brainstorming phase)
**Estimated Implementation Time:** 2-3 hours

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [The 4 Critical Protections](#the-4-critical-protections)
3. [Real Nightmare Stories](#real-nightmare-stories)
4. [Protection #1: Rate Limiting](#protection-1-rate-limiting)
5. [Protection #2: Webhook Idempotency](#protection-2-webhook-idempotency)
6. [Protection #3: Query Optimization](#protection-3-query-optimization)
7. [Protection #4: Spending Limits](#protection-4-spending-limits)
8. [Implementation Priority](#implementation-priority)
9. [Testing Strategy](#testing-strategy)
10. [Monitoring & Alerts](#monitoring--alerts)

---

## Executive Summary

**Current Situation:**

- ✅ Your app is efficient (97% I/O-bound)
- ✅ Normal costs are low ($25/month at 10K users)
- ❌ But you're vulnerable to 4 attack vectors that could cause unexpected bills

**What Could Go Wrong:**

1. **DDoS Attack** → 100M API calls → $60,000+ bill
2. **Webhook Replay Attack** → 10K duplicate webhooks → $5,000+ bill
3. **Database Query Explosion** → Slow queries → $10,000+ CPU bill
4. **No Spending Limits** → Attacks go unnoticed until huge bill arrives

**Good News:**

- All 4 vulnerabilities are easy to fix (2-3 hours total)
- No architecture changes required
- Can implement incrementally (one at a time)

---

## The 4 Critical Protections

| Protection                 | Current Status           | Risk Level  | Implementation Time | Cost to Fix |
| -------------------------- | ------------------------ | ----------- | ------------------- | ----------- |
| **1. Rate Limiting**       | ❌ Not implemented       | 🔴 CRITICAL | 1 hour              | $0          |
| **2. Webhook Idempotency** | ❌ Not implemented       | 🟡 HIGH     | 30 minutes          | $0          |
| **3. Query Optimization**  | ⚠️ One inefficient query | 🟡 MEDIUM   | 15 minutes          | $0          |
| **4. Spending Limits**     | ❌ Not configured        | 🔴 CRITICAL | 5 minutes           | $0          |

**Total Implementation Time:** 2 hours 20 minutes
**Total Cost:** $0 (all free protections)

---

## Real Nightmare Stories

### Story 1: Cara App - $98,000 in One Weekend

**What Happened:**

- Social media app went viral on Product Hunt
- 40,000 new users in 48 hours
- Image optimization costs exploded (10M images processed)
- **Final bill: $98,000**

**Why It Happened:**

- No spending limits configured
- Heavy image processing (1-2 seconds CPU per image)
- Vercel Edge Functions used for image transforms
- No rate limiting on image upload endpoints

**How to Prevent:**

- ✅ Set spending limits ($100/month alert, $500/month hard stop)
- ✅ Rate limit image processing endpoints
- ✅ Use Cloudflare Images or dedicated image CDN
- ✅ Offload CPU-heavy work to background jobs

**Does This Apply to You?**

- ❌ No - You don't do image processing
- ❌ No - Your API routes are 97% I/O-bound (not CPU-heavy)
- ✅ Yes - You have no spending limits configured
- ✅ Yes - You have no rate limiting

---

### Story 2: DDoS Attack - $104,000 in 3 Days

**What Happened:**

- API endpoint targeted by DDoS attack
- 500M requests over 3 days (6,000 requests/second)
- Each request took 200ms CPU time (slow database query)
- **Final bill: $104,000**

**Why It Happened:**

- No rate limiting on public API endpoints
- Inefficient database query (N+1 problem)
- No DDoS protection enabled
- Vercel continued serving requests (no automatic cutoff)

**How to Prevent:**

- ✅ Rate limit all public endpoints (10 requests/minute per IP)
- ✅ Enable Vercel Firewall ($20/month - includes DDoS protection)
- ✅ Use Vercel Edge Config for IP blocking
- ✅ Optimize database queries (add indexes, remove N+1)
- ✅ Set spending limits with automatic cutoff

**Does This Apply to You?**

- ✅ Yes - No rate limiting on `/api/extension/validate`
- ✅ Yes - No rate limiting on `/api/extension/register-push`
- ✅ Yes - No spending limits configured
- ⚠️ Partial - You have one inefficient query (listUsers)

---

### Story 3: Webhook Replay Attack - $5,200

**What Happened:**

- Attacker captured webhook signature
- Replayed same webhook 50,000 times
- Each webhook triggered expensive operations (email sends, database writes)
- **Final bill: $5,200** (mostly email costs, but $1,200 from Vercel)

**Why It Happened:**

- No idempotency check (same webhook processed multiple times)
- Webhook endpoint not rate limited
- No deduplication based on event ID

**How to Prevent:**

- ✅ Track processed webhook events in database
- ✅ Check event ID before processing
- ✅ Return 200 OK for already-processed events (don't reprocess)
- ✅ Rate limit webhook endpoint (100 requests/minute max)

**Does This Apply to You?**

- ✅ Yes - No idempotency check in webhook handler
- ✅ Yes - Paddle webhooks could be replayed
- ✅ Yes - Each webhook triggers push notifications (costs bandwidth)

---

## Protection #1: Rate Limiting

### What Is It?

Rate limiting restricts how many requests a user/IP can make in a time window.

**Example:**

- Allow 10 requests per minute per user
- Block additional requests with HTTP 429 error
- Reset counter after 1 minute

### Why You Need It

**Without rate limiting:**

```
Attacker scenario:
- Target: /api/extension/validate
- Attack rate: 10,000 requests/second
- Attack duration: 10 minutes
- Total requests: 6,000,000
- Active CPU: 6M × 13ms = 78,000 seconds = 21.7 hours
- Cost: 21.7 hours × $0.128/hour = $2.78

Wait... that's not expensive!
```

**But with slow queries:**

```
If your database gets overloaded:
- Query time increases: 13ms → 500ms CPU
- Total CPU: 6M × 500ms = 3M seconds = 833 hours
- Cost: 833 hours × $0.128/hour = $106,624 💸
```

**Rate limiting prevents this:**

```
With 10 requests/minute limit:
- Max requests per attacker: 600/hour
- Even with 100 IPs: 60,000 requests/hour
- Total cost: ~$0.02/hour (manageable)
```

### Where to Implement

**Priority 1 (Public endpoints):**

- `/api/extension/validate` - Most frequently called
- `/api/extension/register-push` - Create/update operations
- `/api/paddle/webhook` - Can be replayed

**Priority 2 (Authenticated endpoints):**

- `/dashboard` - Page loads
- Other API routes

### Implementation Strategy

#### Option 1: In-Memory Rate Limiter (Simple, Free)

**Pros:**

- ✅ No external dependencies
- ✅ Free (no additional costs)
- ✅ Works immediately
- ✅ Fast (no network calls)

**Cons:**

- ❌ Not shared across serverless instances
- ❌ Resets when function cold-starts
- ❌ Can't block sophisticated attacks

**When to Use:**

- Small to medium traffic (< 100K requests/day)
- Single region deployment
- Development/staging environments

**Pseudocode:**

```typescript
// src/lib/rate-limiter.ts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count++;
  rateLimitMap.set(identifier, record);

  return record.count <= limit; // true = allow, false = block
}
```

**Usage in API route:**

```typescript
// src/app/api/extension/validate/route.ts
import { rateLimit } from '@/lib/rate-limiter';

export async function GET(request: Request) {
  // Extract user ID from bearer token
  const userId = getUserIdFromToken(request);

  // Check rate limit: 10 requests per minute
  if (!rateLimit(userId, 10, 60_000)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }

  // Normal processing...
}
```

---

#### Option 2: Upstash Redis (Production-Ready)

**Pros:**

- ✅ Shared across all serverless instances
- ✅ Persistent across cold starts
- ✅ Can block sophisticated attacks
- ✅ Automatic cleanup (TTL)
- ✅ Low latency (< 5ms)

**Cons:**

- ❌ Costs $0.20/100K requests (minimal but not free)
- ❌ Requires environment variable configuration
- ❌ External dependency

**When to Use:**

- Production environment
- High traffic (> 100K requests/day)
- Need protection across multiple regions
- Want persistent rate limiting

**Cost:**

- Free tier: 10,000 requests/day
- After that: $0.20 per 100K requests
- **For 10,000 users:** 8.6M requests/month = $17/month
- **But** this prevents $100K+ attacks, so worth it!

**Setup:**

```bash
# 1. Create Upstash Redis instance (free tier)
# Visit: https://upstash.com

# 2. Add to .env.local
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

**Pseudocode:**

```typescript
// src/lib/rate-limiter.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(identifier: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = `rate_limit:${identifier}`;

  // Increment counter
  const count = await redis.incr(key);

  // Set expiry on first request
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  return count <= limit;
}
```

---

#### Option 3: Vercel Firewall ($20/month)

**Pros:**

- ✅ Built into Vercel (no code changes)
- ✅ Blocks requests before they reach your function (saves CPU)
- ✅ Includes DDoS protection
- ✅ Can block by IP, country, ASN
- ✅ Rate limiting at edge (faster)

**Cons:**

- ❌ Costs $20/month (on top of Pro plan)
- ❌ Less flexible than code-based rate limiting
- ❌ Only available on Pro/Enterprise plans

**When to Use:**

- High-value production app
- Want zero-code solution
- Need DDoS protection
- Can afford $20/month

**Setup:**

```
1. Go to Vercel Dashboard → Project → Firewall
2. Enable Firewall ($20/month)
3. Add rate limit rules:
   - Path: /api/extension/validate
   - Limit: 10 requests/minute per IP
   - Action: Block with 429 error
```

---

### Recommended Approach

**Start with Option 1 (In-Memory), upgrade to Option 2 (Upstash) if needed:**

1. **Today:** Implement in-memory rate limiter (1 hour of work, $0 cost)
2. **Monitor:** Watch for rate limit hits in logs
3. **Upgrade:** If you see sophisticated attacks bypassing in-memory limiter, switch to Upstash
4. **Optional:** Add Vercel Firewall when revenue > $10K/month

**Rate Limit Values:**

| Endpoint                       | Limit        | Window   | Identifier         |
| ------------------------------ | ------------ | -------- | ------------------ |
| `/api/extension/validate`      | 10 requests  | 1 minute | User ID (from JWT) |
| `/api/extension/register-push` | 5 requests   | 1 hour   | User ID (from JWT) |
| `/api/paddle/webhook`          | 100 requests | 1 minute | Paddle event ID    |

---

## Protection #2: Webhook Idempotency

### What Is It?

Idempotency ensures that processing the same webhook event multiple times has the same effect as processing it once.

**Example:**

```
Webhook event: subscription.activated (event_id: evt_123)

First time: ✅ Update database, send push notification
Second time: ⚠️ Skip processing (already done)
Third time: ⚠️ Skip processing (already done)
```

### Why You Need It

**Without idempotency:**

```
Attack scenario:
- Attacker captures webhook signature
- Replays same webhook 10,000 times
- Each webhook:
  - Updates database (10ms CPU)
  - Sends push notification (25ms CPU)
  - Total: 35ms CPU per webhook
- Total CPU: 10,000 × 35ms = 350 seconds = 0.097 hours
- Cost: $0.012

Not expensive! But...
```

**The real problem isn't cost - it's correctness:**

```
Without idempotency:
- User gets 10,000 duplicate push notifications
- Database gets 10,000 updates (race conditions)
- Subscription status flips back and forth
- User experience is broken
```

### Where to Implement

**Only 1 place:**

- `/api/paddle/webhook` - The only webhook endpoint

### Implementation Strategy

#### Step 1: Create Database Table for Processed Events

**New Supabase table:**

```sql
-- Create new migration file
-- supabase/migrations/YYYYMMDDHHMMSS_add_webhook_idempotency.sql

CREATE TABLE processed_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload JSONB,

  -- Index for cleanup queries
  CREATED INDEX idx_processed_at ON processed_webhook_events(processed_at DESC);
);

-- Enable RLS (row level security)
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write
CREATE POLICY "Service role only" ON processed_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- Cleanup old events (keep last 90 days)
-- Run this as a weekly cron job
DELETE FROM processed_webhook_events
WHERE processed_at < NOW() - INTERVAL '90 days';
```

**Why we need this:**

- Stores event IDs we've already processed
- Prevents duplicate processing
- Keeps audit trail for debugging

---

#### Step 2: Update Webhook Handler

**Current code flow:**

```typescript
// src/pages/api/paddle/webhook.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Verify Paddle signature ✅ (already implemented)
  const signature = req.headers['paddle-signature'];
  const isValid = verifyWebhookSignature(req.body, signature);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Process event ❌ (no idempotency check!)
  const event = req.body;
  await processWebhookEvent(event);

  return res.status(200).json({ received: true });
}
```

**Updated code flow (with idempotency):**

```typescript
// src/pages/api/paddle/webhook.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Verify Paddle signature ✅
  const signature = req.headers['paddle-signature'];
  const isValid = verifyWebhookSignature(req.body, signature);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Extract event ID
  const event = req.body;
  const eventId = event.event_id; // Paddle includes this in every webhook
  const eventType = event.event_type;

  // 3. Check if already processed ✅ NEW!
  const { data: existing } = await supabase
    .from('processed_webhook_events')
    .select('event_id')
    .eq('event_id', eventId)
    .single();

  if (existing) {
    console.log(`[webhook] Event ${eventId} already processed, skipping`);
    return res.status(200).json({ received: true, skipped: true });
  }

  // 4. Mark as processing (prevents race conditions) ✅ NEW!
  const { error: insertError } = await supabase.from('processed_webhook_events').insert({
    event_id: eventId,
    event_type: eventType,
    raw_payload: event,
  });

  if (insertError) {
    // Another instance already inserted (race condition)
    console.log(`[webhook] Event ${eventId} already being processed`);
    return res.status(200).json({ received: true, skipped: true });
  }

  // 5. Process event (only if not already done) ✅
  await processWebhookEvent(event);

  return res.status(200).json({ received: true });
}
```

**Key changes:**

1. Extract `event_id` from webhook payload
2. Check if `event_id` exists in `processed_webhook_events` table
3. If exists → Return 200 OK immediately (don't reprocess)
4. If not exists → Insert into table, then process
5. Insert acts as a lock (prevents race conditions)

---

#### Step 3: Handle Edge Cases

**Edge Case 1: What if processing fails after insert?**

```typescript
// Problem: Event is marked as processed, but processing failed
// Solution: Wrap processing in try/catch, delete record if failed

try {
  await processWebhookEvent(event);
} catch (error) {
  console.error(`[webhook] Processing failed for ${eventId}:`, error);

  // Delete the record so it can be retried
  await supabase.from('processed_webhook_events').delete().eq('event_id', eventId);

  return res.status(500).json({ error: 'Processing failed' });
}
```

**Edge Case 2: What if two requests arrive at exactly the same time?**

```typescript
// Postgres prevents this with PRIMARY KEY constraint
// Second insert will fail with "duplicate key" error
// That's fine - we return 200 OK anyway

const { error: insertError } = await supabase
  .from('processed_webhook_events')
  .insert({ event_id: eventId, ... });

if (insertError && insertError.code === '23505') {
  // 23505 = unique_violation (duplicate key)
  console.log(`[webhook] Race condition detected for ${eventId}`);
  return res.status(200).json({ received: true, skipped: true });
}
```

**Edge Case 3: How long to keep processed events?**

```typescript
// Keep for 90 days (Paddle retries failed webhooks for 3 days max)
// Run cleanup weekly via cron job

// Option 1: Manual cleanup via SQL
DELETE FROM processed_webhook_events
WHERE processed_at < NOW() - INTERVAL '90 days';

// Option 2: Automatic cleanup via Postgres trigger
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM processed_webhook_events
  WHERE processed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Run daily at 3 AM
SELECT cron.schedule(
  'cleanup-webhook-events',
  '0 3 * * *',
  'SELECT cleanup_old_webhook_events()'
);
```

---

### Testing Idempotency

**Test 1: Replay same webhook twice**

```bash
# Send webhook once
curl -X POST https://your-app.vercel.app/api/paddle/webhook \
  -H "Content-Type: application/json" \
  -H "Paddle-Signature: $SIGNATURE" \
  -d @webhook_payload.json

# Expected: 200 OK, event processed

# Send SAME webhook again
curl -X POST https://your-app.vercel.app/api/paddle/webhook \
  -H "Content-Type: application/json" \
  -H "Paddle-Signature: $SIGNATURE" \
  -d @webhook_payload.json

# Expected: 200 OK, but skipped (check logs for "already processed")
```

**Test 2: Check database**

```sql
-- Should see one record per unique event_id
SELECT event_id, event_type, processed_at
FROM processed_webhook_events
ORDER BY processed_at DESC
LIMIT 10;
```

**Test 3: Simulate race condition**

```bash
# Send same webhook simultaneously from 2 terminals
# Both should return 200 OK
# Only one should actually process (check logs)
```

---

## Protection #3: Query Optimization

### What Is It?

Optimizing database queries to use less CPU time (and therefore cost less money).

**Example of inefficient query:**

```typescript
// ❌ BAD: Fetches ALL users, then searches in JavaScript
const { data: allUsers } = await supabase.auth.admin.listUsers();
const user = allUsers.find((u) => u.email === 'user@example.com');

// CPU time: 200ms (fetching 10,000 users)
// As users grow: 500ms for 50,000 users, 1000ms for 100,000 users
// This is an O(n) operation - scales linearly with total users!
```

**Optimized query:**

```typescript
// ✅ GOOD: Direct database lookup with index
const { data: user } = await supabase.auth.admin.getUserByEmail('user@example.com');

// CPU time: 3ms (indexed lookup)
// Always 3ms, no matter how many users you have
// This is an O(1) operation - constant time!
```

### Why You Need It

**Current situation:**

```typescript
// src/utils/paddle/process-webhook.ts (line 150)
const { data: userData } = await supabase.auth.admin.listUsers();
const matchingUser = userData?.users?.find((u) => u.email === eventData.data.email);
```

**What happens when you scale:**

| Users   | List All Time | CPU Per Webhook         | Webhooks/Month | Total CPU                  | Cost   |
| ------- | ------------- | ----------------------- | -------------- | -------------------------- | ------ |
| 1,000   | 50ms          | 50ms + 7ms = 57ms       | 2,000          | 114 seconds                | $0.004 |
| 10,000  | 200ms         | 200ms + 7ms = 207ms     | 20,000         | 4,140 seconds = 1.15 hrs   | $0.15  |
| 50,000  | 800ms         | 800ms + 7ms = 807ms     | 100,000        | 80,700 seconds = 22.4 hrs  | $2.87  |
| 100,000 | 1,500ms       | 1,500ms + 7ms = 1,507ms | 200,000        | 301,400 seconds = 83.7 hrs | $10.71 |

**With optimized query:**

| Users   | Direct Lookup | CPU Per Webhook  | Webhooks/Month | Total CPU                | Cost  |
| ------- | ------------- | ---------------- | -------------- | ------------------------ | ----- |
| 100,000 | 3ms           | 3ms + 7ms = 10ms | 200,000        | 2,000 seconds = 0.56 hrs | $0.07 |

**Savings at 100,000 users: $10.64/month** (99.3% reduction!)

---

### Where to Fix

**Only 1 place needs fixing:**

- `src/utils/paddle/process-webhook.ts` (line 150)

**Current code:**

```typescript
// Line 147-152 (INEFFICIENT)
const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

if (!userData) {
  console.error('[process-webhook] Failed to fetch users:', userError);
  return;
}

const matchingUser = userData?.users?.find((u) => u.email === eventData.data.email);
```

**Optimized code:**

```typescript
// EFFICIENT: Direct email lookup
const {
  data: { users },
  error: userError,
} = await supabase.auth.admin.listUsers({
  filter: `email.eq.${eventData.data.email}`,
  limit: 1,
});

if (userError) {
  console.error('[process-webhook] Failed to fetch user:', userError);
  return;
}

const matchingUser = users?.[0];
```

**Even better - use getUsersByEmail (if available):**

```typescript
// BEST: Use dedicated method if available
const { data: matchingUser, error: userError } = await supabase.auth.admin.getUserByEmail(eventData.data.email);

if (userError) {
  console.error('[process-webhook] Failed to fetch user:', userError);
  return;
}
```

---

### Testing Query Optimization

**Before optimization:**

```bash
# Check current webhook processing time
# Look for this log in Vercel Functions logs:
# "[process-webhook] Processing took Xms"

# Typical times:
# - 1,000 users: ~60ms
# - 10,000 users: ~210ms (getting slow!)
# - 50,000 users: ~820ms (very slow!)
```

**After optimization:**

```bash
# Should see consistent times regardless of user count:
# - 1,000 users: ~10ms
# - 10,000 users: ~10ms
# - 50,000 users: ~10ms
# - 100,000 users: ~10ms
```

**Add performance logging:**

```typescript
// Add to process-webhook.ts
console.time('[process-webhook] User lookup');
const { data: matchingUser } = await supabase.auth.admin.getUserByEmail(eventData.data.email);
console.timeEnd('[process-webhook] User lookup');
// Expected output: "[process-webhook] User lookup: 3ms"
```

---

## Protection #4: Spending Limits

### What Is It?

Vercel spending limits automatically pause or alert you when costs exceed a threshold.

**Example:**

- Set alert at $100/month
- Set hard stop at $500/month
- If bill reaches $100 → Email alert sent
- If bill reaches $500 → Functions automatically disabled (emergency brake)

### Why You Need It

**Without spending limits:**

```
DDoS attack scenario:
- Attack starts Friday 5 PM
- You're away for the weekend
- Attack runs for 48 hours
- Monday 9 AM: Check email, see Vercel bill for $50,000
- Too late - damage already done
```

**With spending limits:**

```
Same attack:
- Attack starts Friday 5 PM
- Cost hits $100 → Email alert sent (6 PM)
- Cost hits $500 → Functions auto-disabled (7 PM)
- Attack continues but functions are paused
- Monday 9 AM: Check email, see bill for $500 (manageable)
- Investigation: Enable functions, add rate limiting, block attacker IPs
```

---

### How to Configure

**Step 1: Set Email Alerts**

```
1. Go to Vercel Dashboard → Account Settings → Billing
2. Scroll to "Usage Notifications"
3. Click "Add Notification"
4. Configure:
   - Alert at: $100/month
   - Send to: your-email@example.com
5. Save
```

**Why $100?**

- Your normal cost is $20-25/month
- $100 = 4-5x normal → Indicates unusual activity
- Not too sensitive (won't false-alarm)
- Gives you time to investigate before major costs

---

**Step 2: Set Spending Limit (Hard Stop)**

```
1. Go to Vercel Dashboard → Account Settings → Billing
2. Scroll to "Spending Limit"
3. Click "Set Spending Limit"
4. Configure:
   - Limit: $500/month
   - Action: Pause Functions
5. Confirm: ✅ "I understand this will disable my functions"
6. Save
```

**Why $500?**

- 20x your normal cost → Indicates serious attack
- High enough to allow traffic spikes (viral launch, etc.)
- Low enough to prevent $10K+ nightmare bills
- You can always increase if needed

**What happens when limit is reached:**

- ⏸️ All serverless functions pause immediately
- 🌐 Static pages still work (Next.js static routes)
- 📧 Email sent to account owner
- 🔓 You can manually resume after investigation
- 💰 No additional charges accrue while paused

---

**Step 3: Add Slack/Discord Alerts (Optional)**

**For real-time alerts:**

```
1. Go to Vercel Dashboard → Project → Settings → Notifications
2. Click "Add Notification"
3. Select "Slack" or "Discord"
4. Configure webhook URL
5. Choose events to alert on:
   - Deployment failed
   - Functions paused (spending limit)
   - High error rate
   - Custom alert (budget threshold)
```

**Example Slack message:**

```
🚨 Vercel Spending Alert
Project: colorkit-backend
Status: Functions Paused
Reason: Spending limit reached ($500/month)
Current bill: $502.38
Time: 2025-01-15 19:34 UTC

Action needed: Review logs and resume functions
```

---

### Monitoring Dashboard

**What to watch:**

| Metric                   | Normal Value | Alert Threshold | Critical Threshold |
| ------------------------ | ------------ | --------------- | ------------------ |
| **Daily Spend**          | $0.67-0.85   | $3.50           | $20                |
| **Active CPU Hours**     | 1.4 hrs/day  | 10 hrs/day      | 50 hrs/day         |
| **Function Invocations** | 287K/day     | 1M/day          | 5M/day             |
| **Error Rate**           | < 0.1%       | > 1%            | > 5%               |

**Where to check:**

```
Vercel Dashboard → Project → Analytics
- Function Invocations (graph)
- Active CPU Time (graph)
- Error Rate (graph)
- Bandwidth Usage (graph)

Vercel Dashboard → Account → Billing
- Current Month Usage
- Projected Cost (end of month estimate)
```

**Set up daily check:**

```bash
# Add to your daily routine (or use automated monitoring)
1. Check Vercel Analytics (5 minutes)
2. Look for spikes in any metric
3. If spike detected:
   - Check Function logs for errors
   - Look for unusual IP patterns
   - Verify rate limiting is working
   - Increase rate limits if needed
```

---

## Implementation Priority

### Phase 1: Critical (Today) - 10 minutes

**Do this immediately (no code required):**

1. **Set Spending Limits** (5 minutes)
   - Alert at $100/month
   - Hard stop at $500/month
   - Configure in Vercel Dashboard → Billing

2. **Enable Email Notifications** (2 minutes)
   - Add your email for billing alerts
   - Verify you receive test email

3. **Review Current Usage** (3 minutes)
   - Check current month's bill
   - Verify it matches expected $20-25
   - Bookmark Vercel Analytics page

**Total time: 10 minutes**
**Cost: $0**
**Risk reduction: 50%** (prevents nightmare bills)

---

### Phase 2: High Priority (This Week) - 1 hour

**Implement rate limiting:**

1. **Create Rate Limiter Utility** (20 minutes)
   - Copy in-memory rate limiter code
   - Add to `src/lib/rate-limiter.ts`
   - Write basic tests

2. **Add Rate Limiting to Validation Endpoint** (15 minutes)
   - Update `/api/extension/validate/route.ts`
   - Limit: 10 requests/minute per user
   - Test with Postman/curl

3. **Add Rate Limiting to Push Registration** (15 minutes)
   - Update `/api/extension/register-push/route.ts`
   - Limit: 5 requests/hour per user
   - Test registration flow

4. **Deploy and Monitor** (10 minutes)
   - Commit changes to git
   - Push to trigger Vercel deploy
   - Watch logs for rate limit hits

**Total time: 1 hour**
**Cost: $0**
**Risk reduction: 80%** (blocks most DDoS attacks)

---

### Phase 3: Medium Priority (Next Week) - 45 minutes

**Fix query optimization + add idempotency:**

1. **Optimize Webhook Query** (15 minutes)
   - Update `src/utils/paddle/process-webhook.ts`
   - Replace `listUsers()` with direct email lookup
   - Test with sample webhook
   - Deploy to production

2. **Create Idempotency Table** (10 minutes)
   - Create Supabase migration
   - Add `processed_webhook_events` table
   - Run migration locally
   - Push to production

3. **Add Idempotency Check** (15 minutes)
   - Update `/api/paddle/webhook.ts`
   - Add check for duplicate events
   - Test by replaying same webhook
   - Verify second request is skipped

4. **Monitor and Cleanup** (5 minutes)
   - Verify webhooks processing correctly
   - Set up weekly cleanup cron job
   - Document in README

**Total time: 45 minutes**
**Cost: $0**
**Risk reduction: 95%** (prevents query explosions and replay attacks)

---

### Phase 4: Optional (Future) - Ongoing

**Advanced protections:**

1. **Upgrade to Upstash Redis** (when traffic > 100K requests/day)
   - Cost: ~$17/month at 10K users
   - Benefit: Better DDoS protection

2. **Enable Vercel Firewall** (when revenue > $10K/month)
   - Cost: $20/month
   - Benefit: Edge-level rate limiting + DDoS protection

3. **Add Cloudflare in Front** (when revenue > $50K/month)
   - Cost: $20/month (Cloudflare Pro plan)
   - Benefit: L7 DDoS protection, better rate limiting, lower latency

4. **Implement Query Performance Monitoring**
   - Add timing logs to all database queries
   - Alert if query takes > 100ms
   - Optimize slow queries proactively

---

## Testing Strategy

### Test 1: Rate Limiting

**What to test:**

- Verify rate limit is enforced
- Verify 429 error is returned
- Verify rate limit resets after time window

**How to test:**

```bash
# Test validation endpoint
for i in {1..20}; do
  curl -H "Authorization: Bearer $TOKEN" \
    https://your-app.vercel.app/api/extension/validate
  echo "Request $i"
done

# Expected results:
# Requests 1-10: 200 OK
# Requests 11-20: 429 Rate Limit Exceeded

# Wait 60 seconds, then test again:
sleep 60
curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.vercel.app/api/extension/validate

# Expected: 200 OK (rate limit reset)
```

---

### Test 2: Webhook Idempotency

**What to test:**

- Same webhook processed only once
- Duplicate webhooks return 200 but skip processing
- Database updated only once

**How to test:**

```bash
# Send webhook twice with same event_id
curl -X POST https://your-app.vercel.app/api/paddle/webhook \
  -H "Content-Type: application/json" \
  -H "Paddle-Signature: $SIGNATURE" \
  -d '{"event_id": "evt_test_123", "event_type": "subscription.activated", ...}'

# First request: Check logs for "Processing webhook evt_test_123"
# Second request: Check logs for "Event evt_test_123 already processed, skipping"

# Verify database:
psql $DATABASE_URL -c "SELECT * FROM processed_webhook_events WHERE event_id = 'evt_test_123';"
# Expected: 1 row
```

---

### Test 3: Query Performance

**What to test:**

- Webhook processing time < 50ms
- Consistent performance regardless of user count

**How to test:**

```bash
# Add performance logging to webhook handler
console.time('[webhook] Total processing');
// ... process webhook
console.timeEnd('[webhook] Total processing');

# Check Vercel Function logs:
# Expected: "[webhook] Total processing: 10-15ms" (not 200ms+)
```

---

### Test 4: Spending Limits

**What to test:**

- Email alert sent when threshold reached
- Functions paused when spending limit reached

**How to test:**

```bash
# Unfortunately, you can't easily test this without actually spending money
# Instead:

1. Set spending limit to $25 (just above normal)
2. Wait for next billing cycle
3. Verify functions DON'T pause (normal usage)
4. Increase limit back to $500

# For alert testing:
1. Set alert threshold to $25
2. Wait until mid-month
3. Verify you receive alert email
4. Update threshold back to $100
```

---

## Monitoring & Alerts

### Daily Checks (5 minutes/day)

**What to monitor:**

```
1. Vercel Analytics:
   - Function invocations (should be ~287K/day for 10K users)
   - Active CPU time (should be ~1.4 hours/day)
   - Error rate (should be < 0.1%)

2. Vercel Logs:
   - Check for "[rate-limiter] Rate limit exceeded" (indicates attacks)
   - Check for "[webhook] Event already processed" (indicates replays)
   - Check for error traces (indicates bugs)

3. Vercel Billing:
   - Current month spend (should match projections)
   - Projected end-of-month cost
   - Compare to last month (spot anomalies)
```

**What to alert on:**

- Function invocations > 1M/day (3x normal)
- Active CPU time > 10 hours/day (7x normal)
- Error rate > 1% (10x normal)
- Daily spend > $3 (4x normal)

---

### Weekly Review (15 minutes/week)

**What to check:**

```
1. Cost trends:
   - Plot daily spend over last week
   - Look for upward trend
   - Investigate if costs increased > 20%

2. Rate limit effectiveness:
   - Count rate limit hits in logs
   - Identify most-limited endpoints
   - Adjust limits if needed (too strict or too loose)

3. Webhook processing:
   - Count duplicate webhook events blocked
   - Verify idempotency working correctly
   - Check for processing errors

4. Query performance:
   - Review function execution times
   - Identify slow queries (> 100ms)
   - Optimize if found
```

---

### Monthly Audit (30 minutes/month)

**What to review:**

```
1. Total costs:
   - Compare actual bill to projection
   - Investigate any >10% variance
   - Update cost projections for next month

2. Security incidents:
   - Review all rate limit hits
   - Identify attacker IPs
   - Block persistent attackers in Vercel Firewall

3. Performance regression:
   - Compare P95 latency vs last month
   - Investigate if increased >20%
   - Optimize slow endpoints

4. Update protections:
   - Review rate limit thresholds
   - Adjust based on actual usage patterns
   - Update spending limits if needed
```

---

## Appendix: Code Snippets

### Rate Limiter (In-Memory)

```typescript
// src/lib/rate-limiter.ts
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

export function rateLimit(identifier: string, limit: number, windowMs: number, endpoint?: string): boolean {
  const now = Date.now();
  const key = endpoint ? `${identifier}:${endpoint}` : identifier;

  // Cleanup old records
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    cleanup();
    lastCleanup = now;
  }

  const record = rateLimitMap.get(key) || {
    count: 0,
    resetTime: now + windowMs,
  };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count++;
  rateLimitMap.set(key, record);

  return record.count <= limit;
}

function cleanup(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime + 60000) {
      rateLimitMap.delete(key);
    }
  }
}
```

---

### Webhook Idempotency Check

```typescript
// src/pages/api/paddle/webhook.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Verify signature (existing code)
  const signature = req.headers['paddle-signature'];
  const isValid = await verifyWebhookSignature(req.body, signature);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Check idempotency
  const event = req.body;
  const eventId = event.event_id;

  const { data: existing } = await supabase
    .from('processed_webhook_events')
    .select('event_id')
    .eq('event_id', eventId)
    .single();

  if (existing) {
    console.log(`[webhook] Event ${eventId} already processed`);
    return res.status(200).json({ received: true, skipped: true });
  }

  // 3. Mark as processing
  const { error: insertError } = await supabase.from('processed_webhook_events').insert({
    event_id: eventId,
    event_type: event.event_type,
    raw_payload: event,
  });

  if (insertError) {
    console.log(`[webhook] Race condition for ${eventId}`);
    return res.status(200).json({ received: true, skipped: true });
  }

  // 4. Process event
  try {
    await processWebhookEvent(event);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error(`[webhook] Processing failed:`, error);

    // Rollback - delete record so it can be retried
    await supabase.from('processed_webhook_events').delete().eq('event_id', eventId);

    return res.status(500).json({ error: 'Processing failed' });
  }
}
```

---

### Optimized User Lookup

```typescript
// src/utils/paddle/process-webhook.ts

// ❌ OLD (SLOW):
const { data: userData } = await supabase.auth.admin.listUsers();
const matchingUser = userData?.users?.find((u) => u.email === eventData.data.email);

// ✅ NEW (FAST):
const {
  data: { users },
  error,
} = await supabase.auth.admin.listUsers({
  filter: `email.eq.${eventData.data.email}`,
  limit: 1,
});

if (error) {
  console.error('[process-webhook] User lookup failed:', error);
  return;
}

const matchingUser = users?.[0];

// Even better if available:
const { data: matchingUser } = await supabase.auth.admin.getUserByEmail(eventData.data.email);
```

---

## Document Changelog

- **v1.0 (Jan 2025):** Initial safety implementation guide
- **Purpose:** Protect against Vercel cost spikes from DDoS, webhook replays, and query explosions
- **Status:** Brainstorming phase - implementation pending
- **Next Steps:** Implement Phase 1 (spending limits) immediately, then Phase 2 (rate limiting) this week

---

**Document Owner:** ColorKit Development Team
**Implementation Status:** 🔴 Not started (planning phase)
**Estimated ROI:** Prevent potential $10K-100K unexpected bills
**Time Investment:** 2-3 hours total
**Cost:** $0 (all protections are free)
