import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getAuthProvider, authMode, isSupabaseConfigured } from '@/services/auth';
import type { AuthUser, AuthMode } from '@/services/auth';

interface AuthContextValue {
  user: AuthUser | null;
  /** True while the initial session restore is in flight. */
  loading: boolean;
  mode: AuthMode;
  supabaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const providerRef = useRef<Awaited<ReturnType<typeof getAuthProvider>> | null>(null);

  const getProvider = useCallback(async () => {
    if (!providerRef.current) providerRef.current = await getAuthProvider();
    return providerRef.current;
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const provider = await getProvider();
      const session = await provider.getSession();
      if (cancelled) return;
      setUser(session);
      setLoading(false);
      provider.onAuthChange((next) => {
        if (!cancelled) setUser(next);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [getProvider]);

  const signIn = useCallback<AuthContextValue['signIn']>(
    async (email, password) => {
      const provider = await getProvider();
      const next = await provider.signIn(email, password);
      setUser(next);
    },
    [getProvider],
  );

  const signUp = useCallback<AuthContextValue['signUp']>(
    async (name, email, password) => {
      const provider = await getProvider();
      try {
        const next = await provider.signUp(name, email, password);
        setUser(next);
      } catch (err) {
        // Supabase email-confirmation flow: account exists but no session yet.
        if (err instanceof Error && /confirm your email/i.test(err.message)) throw err;
        throw err;
      }
    },
    [getProvider],
  );

  const signInWithOAuth = useCallback<AuthContextValue['signInWithOAuth']>(
    async (providerName) => {
      const provider = await getProvider();
      await provider.signInWithOAuth(providerName);
    },
    [getProvider],
  );

  const resetPassword = useCallback<AuthContextValue['resetPassword']>(
    async (email) => {
      const provider = await getProvider();
      await provider.resetPassword(email);
    },
    [getProvider],
  );

  const signOut = useCallback<AuthContextValue['signOut']>(async () => {
    const provider = await getProvider();
    await provider.signOut();
    setUser(null);
  }, [getProvider]);

  const updateName = useCallback<AuthContextValue['updateName']>(
    async (name) => {
      const provider = await getProvider();
      const current = providerRef.current ? await providerRef.current.getSession() : null;
      const target = current ?? user;
      if (!target) throw new Error('You need to be signed in to update your profile.');
      const next = await provider.updateName(target, name);
      setUser(next);
    },
    [getProvider, user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      mode: authMode,
      supabaseConfigured: isSupabaseConfigured(),
      signIn,
      signUp,
      signInWithOAuth,
      resetPassword,
      signOut,
      updateName,
    }),
    [user, loading, signIn, signUp, signInWithOAuth, resetPassword, signOut, updateName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
