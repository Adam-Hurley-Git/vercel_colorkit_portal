-- Create table for storing pending extension notifications
-- This allows the webhook to queue notifications that get delivered when user visits dashboard

CREATE TABLE IF NOT EXISTS extension_notifications (
  id BIGSERIAL PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('SUBSCRIPTION_CANCELLED', 'SUBSCRIPTION_ACTIVATED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered BOOLEAN NOT NULL DEFAULT FALSE,
  delivered_at TIMESTAMPTZ
);

-- Index for fast lookup by customer_id
CREATE INDEX IF NOT EXISTS idx_extension_notifications_customer_id ON extension_notifications(customer_id);

-- Index for finding undelivered notifications
CREATE INDEX IF NOT EXISTS idx_extension_notifications_undelivered ON extension_notifications(delivered) WHERE delivered = FALSE;

-- Add comment to table
COMMENT ON TABLE extension_notifications IS 'Stores pending notifications to be sent to Chrome extension when user visits dashboard';
COMMENT ON COLUMN extension_notifications.customer_id IS 'Paddle customer ID';
COMMENT ON COLUMN extension_notifications.notification_type IS 'Type of notification: SUBSCRIPTION_CANCELLED or SUBSCRIPTION_ACTIVATED';
COMMENT ON COLUMN extension_notifications.delivered IS 'Whether notification has been sent to extension';
COMMENT ON COLUMN extension_notifications.delivered_at IS 'Timestamp when notification was delivered';
