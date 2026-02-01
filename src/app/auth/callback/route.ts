import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const context = searchParams.get('context'); // 'signup' or 'login'
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[Auth Callback] exchangeCodeForSession error:', error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    if (data.session) {
      console.log('[Auth Callback] Session created successfully for user:', data.user?.email);

      // If next param provided, use it
      if (next) {
        const redirectUrl = new URL(next, origin);
        redirectUrl.searchParams.set('ext_auth', 'true');
        return NextResponse.redirect(redirectUrl.toString());
      }

      // Import the subscription check function here to avoid circular dependencies
      const { hasActiveSubscription } = await import('@/utils/paddle/check-subscription-status');

      // Route based on context
      let destination: string;
      if (context === 'signup') {
        destination = '/onboarding';
      } else {
        const hasSubscription = await hasActiveSubscription();
        destination = hasSubscription ? '/dashboard' : '/onboarding';
      }

      const redirectUrl = new URL(destination, origin);
      redirectUrl.searchParams.set('ext_auth', 'true');
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  console.error('[Auth Callback] No code provided in callback URL');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
