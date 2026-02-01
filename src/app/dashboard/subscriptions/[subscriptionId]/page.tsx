'use client';

import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { SubscriptionDetail } from '@/components/dashboard/subscriptions/components/subscription-detail';

export default function SubscriptionPage() {
  const params = useParams<{ subscriptionId: string }>();
  const subscriptionId = params?.subscriptionId ?? '';
  return (
    <main className="p-4 lg:gap-6 lg:p-8">
      <Suspense fallback={<LoadingScreen />}>
        <SubscriptionDetail subscriptionId={subscriptionId} />
      </Suspense>
    </main>
  );
}
