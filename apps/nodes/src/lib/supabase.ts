import { createClient, SupabaseClient } from '@supabase/supabase-js'

function createSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase: SupabaseClient | null = createSupabaseClient();

export const signInWithGitHub = () => {
  if (!supabase) return;
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${window.location.origin}/auth/callback` }
  });
};

export const signInWithGoogle = () => {
  if (!supabase) return;
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` }
  });
};

export const signInWithDiscord = () => {
  if (!supabase) return;
  return supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo: `${window.location.origin}/auth/callback` }
  });
};

export const signOut = () => supabase?.auth.signOut();
export const getSession = () => supabase?.auth.getSession();
export const getUser = () => supabase?.auth.getUser();
