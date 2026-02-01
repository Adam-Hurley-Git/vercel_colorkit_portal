import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { hasActiveSubscription } from '@/utils/paddle/check-subscription-status';

export default async function SignupLayout({ children }: { children: React.ReactNode }) {
  // Check if user is already authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already authenticated, redirect based on subscription status
  if (user) {
    const hasSubscription = await hasActiveSubscription();
    redirect(hasSubscription ? '/dashboard' : '/onboarding');
  }

  // User is not authenticated - show signup page
  return <>{children}</>;
}
