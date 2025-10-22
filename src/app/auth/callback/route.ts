import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { hasActiveSubscription } from '@/utils/paddle/check-subscription-status';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If next param is provided, use it
      if (next) {
        // Add extension flag to URL
        const redirectUrl = new URL(next, origin);
        redirectUrl.searchParams.set('ext_auth', 'true');
        return NextResponse.redirect(redirectUrl.toString());
      }

      // Otherwise, check subscription status to determine where to send user
      const hasSubscription = await hasActiveSubscription();
      const destination = hasSubscription ? '/dashboard' : '/onboarding';

      // Add extension flag to URL
      const redirectUrl = new URL(destination, origin);
      redirectUrl.searchParams.set('ext_auth', 'true');

      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
