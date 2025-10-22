import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { hasActiveSubscription } from '@/utils/paddle/check-subscription-status';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Only redirect to login if there's an error AND no user
  // This prevents redirect loops after OAuth callback
  if (!user && error) {
    redirect('/login');
  }

  // If we have a user, check if they already have a subscription
  if (user) {
    const hasSubscription = await hasActiveSubscription();

    // If user already has an active subscription, redirect to dashboard
    if (hasSubscription) {
      redirect('/dashboard');
    }
  }

  // User is authenticated (or being authenticated) and doesn't have a subscription - show onboarding
  return <>{children}</>;
}
