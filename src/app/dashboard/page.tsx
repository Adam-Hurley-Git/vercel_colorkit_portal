import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DashboardLandingPage } from '@/components/dashboard/landing/dashboard-landing-page';
import { ExtensionNotifier } from '@/components/extension/ExtensionNotifier';
import { prepareAuthSuccessMessage } from '@/utils/extension-messaging';

export default async function LandingPage() {
  // Always prepare auth message for extension when user visits dashboard
  // This ensures extension gets session tokens even if they didn't come from auth callback
  const extensionMessage = await prepareAuthSuccessMessage();

  // Check if subscription is cancelled and send cache invalidation message
  let cancellationMessage: Record<string, unknown> | null = null;
  if (extensionMessage && extensionMessage.subscriptionStatus) {
    const subStatus = extensionMessage.subscriptionStatus as { hasSubscription: boolean; status?: string };

    // If user has no active subscription, send cancellation message to clear extension cache
    if (!subStatus.hasSubscription || subStatus.status === 'canceled' || subStatus.status === 'cancelled') {
      console.log('[Dashboard] User has cancelled/inactive subscription - sending cache clear message to extension');

      cancellationMessage = {
        type: 'SUBSCRIPTION_CANCELLED',
        timestamp: Date.now(),
      };
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      {/* Send auth success to extension whenever user is logged in */}
      {extensionMessage && <ExtensionNotifier message={extensionMessage} />}

      {/* Send cancellation message to clear cache if subscription is inactive */}
      {cancellationMessage && <ExtensionNotifier message={cancellationMessage} />}

      <DashboardPageHeader pageTitle={'Dashboard'} />
      <DashboardLandingPage />
    </main>
  );
}
