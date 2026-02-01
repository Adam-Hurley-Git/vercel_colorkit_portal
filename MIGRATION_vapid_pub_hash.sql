-- Migration: Add vapid_pub_hash column to push_subscriptions table
-- Purpose: Track which VAPID public key each subscription was created with
-- This prevents 403 errors from key mismatches when sending push notifications

-- Add the column (nullable for existing rows)
ALTER TABLE public.push_subscriptions
ADD COLUMN IF NOT EXISTS vapid_pub_hash text;

-- Add comment explaining the column
COMMENT ON COLUMN public.push_subscriptions.vapid_pub_hash IS
'SHA256 hash of VAPID_PUBLIC_KEY used when this subscription was created. Used to detect and remove subscriptions created with old/different keys.';

-- Optional: Create index for faster lookups (if you plan to query by hash)
-- CREATE INDEX IF NOT EXISTS idx_push_subscriptions_vapid_hash ON public.push_subscriptions(vapid_pub_hash);

-- Note: Existing rows will have NULL vapid_pub_hash
-- They will be automatically updated when:
-- 1. User re-registers push subscription (normal flow)
-- 2. Webhook tries to send and detects NULL hash (will work but won't validate)
--
-- For immediate cleanup of old subscriptions, you can run:
-- DELETE FROM public.push_subscriptions WHERE vapid_pub_hash IS NULL;
