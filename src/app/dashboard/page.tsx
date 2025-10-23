import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DashboardLandingPage } from '@/components/dashboard/landing/dashboard-landing-page';
import { ExtensionNotifier } from '@/components/extension/ExtensionNotifier';
import { prepareAuthSuccessMessage } from '@/utils/extension-messaging';

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ ext_auth?: string }> }) {
  // Check if this is a redirect from auth callback
  const params = await searchParams;
  const isExtensionAuth = params.ext_auth === 'true';

  // Prepare message for extension if this is auth redirect
  const extensionMessage = isExtensionAuth ? await prepareAuthSuccessMessage() : null;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      {/* Send auth success to extension if this is auth redirect */}
      {extensionMessage && <ExtensionNotifier message={extensionMessage} />}

      <DashboardPageHeader pageTitle={'Dashboard'} />
      <DashboardLandingPage />
    </main>
  );
}
