import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DashboardLandingPage } from '@/components/dashboard/landing/dashboard-landing-page';
import { ExtensionNotifier } from '@/components/extension/ExtensionNotifier';
import { prepareAuthSuccessMessage } from '@/utils/extension-messaging';

interface DashboardPageProps {
  searchParams: Promise<{ ext_auth?: string }>;
}

export default async function LandingPage({ searchParams }: DashboardPageProps) {
  // Always prepare auth message for extension when user visits dashboard
  // This ensures extension gets session tokens even if they didn't come from auth callback
  const extensionMessage = await prepareAuthSuccessMessage();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      {/* Send auth success to extension whenever user is logged in */}
      {extensionMessage && <ExtensionNotifier message={extensionMessage} />}

      <DashboardPageHeader pageTitle={'Dashboard'} />
      <DashboardLandingPage />
    </main>
  );
}
