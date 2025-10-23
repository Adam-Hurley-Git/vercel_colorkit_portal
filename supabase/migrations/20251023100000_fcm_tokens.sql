-- Create table for storing Firebase Cloud Messaging tokens
-- Allows server to send push notifications to extension when subscription changes

CREATE TABLE IF NOT EXISTS fcm_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  customer_id TEXT,
  fcm_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);

-- Index for fast lookup by customer_id (for webhook notifications)
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_customer_id ON fcm_tokens(customer_id);

-- Index for fast lookup by token (for validation)
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON fcm_tokens(fcm_token);

-- Add comments for documentation
COMMENT ON TABLE fcm_tokens IS 'Stores Firebase Cloud Messaging tokens for Chrome extension push notifications';
COMMENT ON COLUMN fcm_tokens.user_id IS 'Supabase auth user ID (optional, for authenticated users)';
COMMENT ON COLUMN fcm_tokens.customer_id IS 'Paddle customer ID (linked after first purchase)';
COMMENT ON COLUMN fcm_tokens.fcm_token IS 'FCM registration token from chrome.gcm.register()';
COMMENT ON COLUMN fcm_tokens.last_used_at IS 'Last time a push notification was sent to this token';
