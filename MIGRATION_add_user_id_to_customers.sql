-- Migration: Add user_id column to customers table
-- Purpose: Link Paddle customers directly to Supabase auth users
-- This eliminates fragile email matching and enables reliable push notification linking
--
-- Created: October 26, 2025
-- Status: CRITICAL FIX - Apply immediately

-- ============================================================================
-- PART 1: Add user_id column
-- ============================================================================

-- Add the column (nullable for existing rows)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add comment explaining the column
COMMENT ON COLUMN public.customers.user_id IS
'Foreign key to auth.users table. Links Paddle customer to Supabase user for reliable push notification delivery.';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- Create unique constraint to prevent duplicate customer records per user
-- Note: Multiple customers per user is technically possible (business + personal)
-- But for this app, we expect 1:1 mapping
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_user_id_unique ON public.customers(user_id)
WHERE user_id IS NOT NULL;

-- ============================================================================
-- PART 2: Backfill user_id for existing customers (match by email)
-- ============================================================================

-- This function attempts to link existing customers to users by matching emails
-- Run this ONCE after adding the column
DO $$
DECLARE
  updated_count INTEGER := 0;
  customer_record RECORD;
  matched_user_id UUID;
BEGIN
  RAISE NOTICE 'Starting customer-user linking backfill...';

  -- Loop through all customers without user_id
  FOR customer_record IN
    SELECT customer_id, email
    FROM public.customers
    WHERE user_id IS NULL
  LOOP
    -- Try to find matching user by email
    SELECT id INTO matched_user_id
    FROM auth.users
    WHERE email = customer_record.email
    LIMIT 1;

    IF matched_user_id IS NOT NULL THEN
      -- Found a match! Update the customer
      UPDATE public.customers
      SET user_id = matched_user_id
      WHERE customer_id = customer_record.customer_id;

      updated_count := updated_count + 1;
      RAISE NOTICE 'Linked customer % (email: %) to user %',
        customer_record.customer_id,
        customer_record.email,
        matched_user_id;
    ELSE
      RAISE NOTICE 'No matching user found for customer % (email: %)',
        customer_record.customer_id,
        customer_record.email;
    END IF;
  END LOOP;

  RAISE NOTICE 'Backfill complete! Linked % customers to users', updated_count;
END $$;

-- ============================================================================
-- PART 3: Verification queries
-- ============================================================================

-- Run these to verify migration was successful:

-- 1. Check column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- 2. Check how many customers are linked
SELECT
  COUNT(*) as total_customers,
  COUNT(user_id) as linked_customers,
  COUNT(*) - COUNT(user_id) as unlinked_customers
FROM public.customers;

-- 3. Show customers with and without user_id
SELECT
  customer_id,
  email,
  user_id,
  CASE
    WHEN user_id IS NOT NULL THEN '✅ Linked'
    ELSE '⚠️ Not Linked'
  END as status,
  created_at
FROM public.customers
ORDER BY created_at DESC
LIMIT 20;

-- 4. Verify push subscriptions can now be linked via user_id
SELECT
  ps.id as subscription_id,
  ps.user_id,
  ps.customer_id,
  c.customer_id as customer_via_user_id,
  c.email as customer_email,
  CASE
    WHEN ps.customer_id IS NOT NULL THEN '✅ Already Linked'
    WHEN c.customer_id IS NOT NULL THEN '🔄 Can Be Linked'
    ELSE '⚠️ No Customer Found'
  END as link_status
FROM push_subscriptions ps
LEFT JOIN public.customers c ON c.user_id = ps.user_id
ORDER BY ps.created_at DESC
LIMIT 10;

-- ============================================================================
-- PART 4: Helper function to manually link a customer to a user
-- ============================================================================

-- This function can be called manually if automatic linking fails
CREATE OR REPLACE FUNCTION link_customer_to_user(
  p_customer_id TEXT,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update customer with user_id
  UPDATE public.customers
  SET user_id = p_user_id
  WHERE customer_id = p_customer_id;

  -- Update all push subscriptions for this user to have correct customer_id
  UPDATE public.push_subscriptions
  SET customer_id = p_customer_id
  WHERE user_id = p_user_id
    AND (customer_id IS NULL OR customer_id != p_customer_id);

  RAISE NOTICE 'Linked customer % to user % and updated push subscriptions', p_customer_id, p_user_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error linking customer to user: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Example usage:
-- SELECT link_customer_to_user('ctm_01xxxxx', 'user-uuid-here');

COMMENT ON FUNCTION link_customer_to_user IS
'Manually link a Paddle customer to a Supabase user and update all their push subscriptions. Use this for edge cases where automatic linking failed.';

-- ============================================================================
-- PART 5: Function to auto-link push subscriptions when customer is created
-- ============================================================================

-- This trigger function automatically updates push subscriptions when customer.user_id is set
CREATE OR REPLACE FUNCTION auto_link_push_subscriptions_on_customer_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If user_id was just set (changed from NULL or changed to different value)
  IF NEW.user_id IS NOT NULL AND (OLD.user_id IS NULL OR OLD.user_id != NEW.user_id) THEN
    -- Update all push subscriptions for this user
    UPDATE public.push_subscriptions
    SET customer_id = NEW.customer_id
    WHERE user_id = NEW.user_id
      AND (customer_id IS NULL OR customer_id != NEW.customer_id);

    RAISE NOTICE 'Auto-linked push subscriptions: customer_id=%, user_id=%', NEW.customer_id, NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_link_push_subscriptions ON public.customers;
CREATE TRIGGER trigger_auto_link_push_subscriptions
  AFTER INSERT OR UPDATE OF user_id ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_push_subscriptions_on_customer_update();

COMMENT ON FUNCTION auto_link_push_subscriptions_on_customer_update IS
'Trigger function that automatically links push subscriptions to customer when customer.user_id is set. This ensures push notifications work immediately after payment.';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary of changes:
-- ✅ Added user_id column to customers table
-- ✅ Created index for performance
-- ✅ Created unique constraint to prevent duplicates
-- ✅ Backfilled existing customers (matched by email)
-- ✅ Created helper function for manual linking
-- ✅ Created automatic trigger to link push subscriptions
-- ✅ Added verification queries

-- What happens now:
-- 1. When webhook creates customer → Sets user_id if available
-- 2. Trigger fires → Automatically links push subscriptions
-- 3. Push notifications work immediately!

-- No more relying on fragile email matching!
