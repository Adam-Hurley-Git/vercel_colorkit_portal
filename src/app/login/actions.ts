'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { hasActiveSubscription } from '@/utils/paddle/check-subscription-status';

interface FormData {
  email: string;
  password: string;
}
export async function login(data: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: true };
  }

  revalidatePath('/', 'layout');

  // Check if user has an active subscription
  const hasSubscription = await hasActiveSubscription();

  // If user has active subscription, go to dashboard
  // Otherwise, send them through onboarding
  if (hasSubscription) {
    redirect('/dashboard');
  } else {
    redirect('/onboarding');
  }
}

export async function signInWithGoogle(isSignup = false) {
  const supabase = await createClient();

  // Use environment variable for redirect URL, fallback to localhost for dev
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Add context to redirect URL so callback knows if this is signup or login
  const callbackUrl = `${baseUrl}/auth/callback?context=${isSignup ? 'signup' : 'login'}`;

  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
    },
  });
  if (data.url) {
    redirect(data.url);
  }
}

export async function loginAnonymously() {
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInAnonymously();
  const { error: updateUserError } = await supabase.auth.updateUser({
    email: `aeroedit+${Date.now().toString(36)}@paddle.com`,
  });

  if (signInError || updateUserError) {
    return { error: true };
  }

  revalidatePath('/', 'layout');

  // Anonymous users are always new, send to onboarding
  redirect('/onboarding');
}
