/**
 * Auth provider factory. Picks Supabase when credentials exist in the env,
 * otherwise the offline-capable local provider so the app never dead-ends.
 */
import type { AuthProvider, AuthMode } from './authTypes';

export type { AuthUser, AuthProvider, AuthMode } from './authTypes';
export { friendlyAuthError } from './authTypes';

export function isSupabaseConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export const authMode: AuthMode = isSupabaseConfigured() ? 'supabase' : 'local';

export async function getAuthProvider(): Promise<AuthProvider> {
  if (isSupabaseConfigured()) {
    const { createSupabaseAuthProvider } = await import('./supabaseAuthProvider');
    return createSupabaseAuthProvider(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    );
  }
  const { createLocalAuthProvider } = await import('./localAuthProvider');
  return createLocalAuthProvider();
}
