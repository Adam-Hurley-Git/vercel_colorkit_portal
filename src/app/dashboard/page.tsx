import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DashboardLandingPage } from '@/components/dashboard/landing/dashboard-landing-page';
import { ExtensionNotifier } from '@/components/extension/ExtensionNotifier';
import { prepareAuthSuccessMessage } from '@/utils/extension-messaging';
import { createClient } from '@/utils/supabase/server';
import { getCustomerId } from '@/utils/paddle/get-customer-id';

interface DashboardPageProps {
  searchParams: Promise<{ ext_auth?: string }>;
}

export default async function LandingPage({ searchParams }: DashboardPageProps) {
  // Always prepare auth message for extension when user visits dashboard
  // This ensures extension gets session tokens even if they didn't come from auth callback
  const extensionMessage = await prepareAuthSuccessMessage();

  // Check for pending cancellation notifications
  let cancellationMessage: Record<string, unknown> | null = null;
  try {
    const customerId = await getCustomerId();
    if (customerId) {
      const supabase = await createClient();

      // Check if there's a pending cancellation notification
      const { data: notification } = await supabase
        .from('extension_notifications')
        .select('*')
        .eq('customer_id', customerId)
        .eq('delivered', false)
        .eq('notification_type', 'SUBSCRIPTION_CANCELLED')
        .single();

      if (notification) {
        console.log('[Dashboard] Found pending cancellation notification for customer:', customerId);

        cancellationMessage = {
          type: 'SUBSCRIPTION_CANCELLED',
          customerId: customerId,
          timestamp: Date.now(),
        };

        // Mark as delivered
        await supabase
          .from('extension_notifications')
          .update({ delivered: true, delivered_at: new Date().toISOString() })
          .eq('customer_id', customerId);

        console.log('[Dashboard] Cancellation notification marked as delivered');
      }
    }
  } catch (error) {
    console.error('[Dashboard] Error checking for cancellation notifications:', error);
    // Don't throw - this is non-critical
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      {/* Send auth success to extension whenever user is logged in */}
      {extensionMessage && <ExtensionNotifier message={extensionMessage} />}

      {/* Send cancellation notification if pending */}
      {cancellationMessage && <ExtensionNotifier message={cancellationMessage} />}

      <DashboardPageHeader pageTitle={'Dashboard'} />
      <DashboardLandingPage />
    </main>
  );
}
