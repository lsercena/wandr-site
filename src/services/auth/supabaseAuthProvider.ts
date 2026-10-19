/**
 * Supabase auth provider — active when VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY are set. The client is imported lazily so the
 * Supabase bundle is only loaded when credentials are configured.
 */
import type { AuthProvider, AuthUser } from './authTypes';
import { friendlyAuthError } from './authTypes';
import type { SupabaseClient, User } from '@supabase/supabase-js';

function mapUser(u: User): AuthUser {
  const meta = (u.user_metadata ?? {}) as { name?: string; full_name?: string };
  return {
    id: u.id,
    email: u.email ?? '',
    name: meta.name || meta.full_name || (u.email ?? '').split('@')[0] || 'Traveler',
    provider: 'supabase',
    createdAt: u.created_at,
  };
}

export function createSupabaseAuthProvider(url: string, anonKey: string): AuthProvider {
  let clientPromise: Promise<SupabaseClient> | null = null;

  const getClient = () => {
    if (!clientPromise) {
      clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
        createClient(url, anonKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        }),
      );
    }
    return clientPromise;
  };

  return {
    mode: 'supabase',

    async getSession() {
      try {
        const client = await getClient();
        const { data } = await client.auth.getSession();
        return data.session?.user ? mapUser(data.session.user) : null;
      } catch {
        return null;
      }
    },

    async signIn(email, password) {
      try {
        const client = await getClient();
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        return mapUser(data.user);
      } catch (err) {
        throw friendlyAuthError(err);
      }
    },

    async signUp(name, email, password) {
      try {
        const client = await getClient();
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) throw error;
        if (!data.user) {
          // Email confirmation flow — no session yet, but account exists.
          throw new Error('Account created — check your inbox to confirm your email.');
        }
        if (!data.session) {
          throw new Error('Account created — check your inbox to confirm your email before signing in.');
        }
        return mapUser(data.user);
      } catch (err) {
        throw friendlyAuthError(err);
      }
    },

    async signInWithOAuth(provider) {
      try {
        const client = await getClient();
        const { error } = await client.auth.signInWithOAuth({
          provider,
          options: { redirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
      } catch (err) {
        throw friendlyAuthError(err);
      }
    },

    async resetPassword(email) {
      try {
        const client = await getClient();
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/login?mode=reset`,
        });
        if (error) throw error;
      } catch (err) {
        throw friendlyAuthError(err);
      }
    },

    async signOut() {
      try {
        const client = await getClient();
        await client.auth.signOut();
      } catch {
        // Signing out locally is still safe even if the network call fails.
      }
    },

    async updateName(user, name) {
      try {
        const client = await getClient();
        const { error } = await client.auth.updateUser({ data: { name: name.trim() } });
        if (error) throw error;
        return { ...user, name: name.trim() || user.name };
      } catch (err) {
        throw friendlyAuthError(err);
      }
    },

    onAuthChange(cb) {
      let unsub: (() => void) | undefined;
      void getClient().then((client) => {
        const { data } = client.auth.onAuthStateChange((_event, session) => {
          cb(session?.user ? mapUser(session.user) : null);
        });
        unsub = () => data.subscription.unsubscribe();
      });
      return () => unsub?.();
    },
  };
}
