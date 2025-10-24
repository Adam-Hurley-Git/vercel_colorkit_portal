-- Create push_subscriptions table for Web Push API
-- Replaces fcm_tokens table with modern Web Push standard

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT,
  subscription JSONB NOT NULL, -- Full push subscription object {endpoint, keys: {p256dh, auth}}
  endpoint TEXT NOT NULL UNIQUE, -- Push service endpoint URL (unique identifier)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_customer_id_idx ON push_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_endpoint_idx ON push_subscriptions(endpoint);

-- Add comment explaining the table
COMMENT ON TABLE push_subscriptions IS 'Stores Web Push API subscriptions for instant notifications to Chrome extensions';
COMMENT ON COLUMN push_subscriptions.subscription IS 'Full Web Push subscription object with endpoint and encryption keys';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Push service endpoint URL - unique identifier for each subscription';
COMMENT ON COLUMN push_subscriptions.last_used_at IS 'Timestamp of last successful push notification delivery';

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);
