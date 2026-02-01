'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

interface FormData {
  email: string;
  password: string;
}

export async function signup(data: FormData) {
  const supabase = await createClient();

  // Add redirect URL for email confirmation
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback?context=signup`,
    },
  });

  if (error) {
    return { error: true };
  }

  // Check if email confirmation is required
  // If user is returned but session is null, email confirmation is required
  if (signUpData.user && !signUpData.session) {
    return {
      error: false,
      needsConfirmation: true,
      message: 'Please check your email to confirm your account',
    };
  }

  revalidatePath('/', 'layout');
  // If session exists (email confirmation disabled), redirect to onboarding
  redirect('/onboarding');
}
