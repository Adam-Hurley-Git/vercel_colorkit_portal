import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { hasActiveSubscription } from '@/utils/paddle/check-subscription-status';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const context = searchParams.get('context'); // 'signup' or 'login'
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If next param is provided, use it
      if (next) {
        const redirectUrl = new URL(next, origin);
        redirectUrl.searchParams.set('ext_auth', 'true');
        return NextResponse.redirect(redirectUrl.toString());
      }

      // Handle routing based on context
      let destination: string;

      if (context === 'signup') {
        // Signup flow: Always go to onboarding
        destination = '/onboarding';
      } else {
        // Login flow: Check subscription status
        const hasSubscription = await hasActiveSubscription();
        destination = hasSubscription ? '/dashboard' : '/onboarding';
      }

      const redirectUrl = new URL(destination, origin);
      redirectUrl.searchParams.set('ext_auth', 'true');
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
