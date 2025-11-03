import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DashboardLandingPage } from '@/components/dashboard/landing/dashboard-landing-page';
import { ExtensionNotifier } from '@/components/extension/ExtensionNotifier';
import { prepareAuthSuccessMessage, type ExtensionSubscriptionCancelledMessage } from '@/utils/extension-messaging';

export default async function LandingPage() {
  // Always prepare auth message for extension when user visits dashboard
  // This ensures extension gets session tokens even if they didn't come from auth callback
  const extensionMessage = await prepareAuthSuccessMessage();

  // Check if subscription is cancelled and send cache invalidation message
  // FAIL-OPEN: Only send cancellation if we CONFIRMED the subscription is inactive
  // Do NOT send cancellation if verification failed (preserves user's existing state)
  let cancellationMessage: ExtensionSubscriptionCancelledMessage | null = null;
  if (extensionMessage && extensionMessage.subscriptionStatus) {
    const subStatus = extensionMessage.subscriptionStatus;

    // Only send cancellation if:
    // 1. We successfully verified subscription status (verificationFailed is false/undefined)
    // 2. AND subscription is confirmed inactive
    if (
      !subStatus.verificationFailed &&
      (!subStatus.hasSubscription || subStatus.status === 'canceled' || subStatus.status === 'cancelled')
    ) {
      console.log(
        '[Dashboard] User has cancelled/inactive subscription (verified) - sending lock message to extension',
      );

      cancellationMessage = {
        type: 'SUBSCRIPTION_CANCELLED',
        timestamp: Date.now(),
      };
    } else if (subStatus.verificationFailed) {
      console.log('[Dashboard] ⚠️ Subscription verification failed - NOT sending lock message (fail-open)');
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
