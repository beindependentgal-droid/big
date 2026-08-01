import { createSupabaseBrowserClient } from './client';

export async function signInWithEmail(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, options?: { full_name?: string }) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: options?.full_name ?? '',
      },
    },
  });
}

export async function signInWithGoogle() {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

export async function resetPassword(email: string) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signOut();
}
