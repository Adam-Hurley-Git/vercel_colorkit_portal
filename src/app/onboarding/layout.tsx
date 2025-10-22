import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { hasActiveSubscription } from '@/utils/paddle/check-subscription-status';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to signup if not authenticated
  if (!user) {
    redirect('/signup');
  }

  // If user already has an active subscription, redirect to dashboard
  const hasSubscription = await hasActiveSubscription();
  if (hasSubscription) {
    redirect('/dashboard');
  }

  // User is authenticated and doesn't have a subscription - show onboarding
  return <>{children}</>;
}
