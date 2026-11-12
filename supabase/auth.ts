import { createSupabaseBrowserClient } from './client';

export async function signInWithEmail(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signInWithPassword({ email, password });
}

function authRedirectUrl() {
  return (import.meta as any).env.VITE_SUPABASE_REDIRECT_URL ||
    (import.meta as any).env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
    `${window.location.origin}/auth/callback`;
}

export async function signUpWithEmail(email: string, password: string, options?: { full_name?: string }) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: authRedirectUrl(),
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
    options: { redirectTo: authRedirectUrl() },
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
