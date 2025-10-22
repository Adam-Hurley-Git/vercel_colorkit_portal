import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { hasActiveSubscription } from '@/utils/paddle/check-subscription-status';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  // Check if user already has a subscription
  const hasSubscription = await hasActiveSubscription();

  // If user already has an active subscription, redirect to dashboard
  if (hasSubscription) {
    redirect('/dashboard');
  }

  // User is authenticated but doesn't have a subscription - show onboarding
  return <>{children}</>;
}
