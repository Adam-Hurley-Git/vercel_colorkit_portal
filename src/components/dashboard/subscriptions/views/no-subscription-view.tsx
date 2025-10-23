import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DashboardNoSubscriptionCard } from '@/components/dashboard/landing/components/dashboard-no-subscription-card';

export function NoSubscriptionView() {
  return (
    <>
      <DashboardPageHeader pageTitle={'Subscriptions'} />
      <div className={'max-w-4xl'}>
        <DashboardNoSubscriptionCard />
      </div>
    </>
  );
}
