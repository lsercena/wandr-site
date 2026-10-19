/**
 * Auth contracts shared by every provider (Supabase in production,
 * a local offline-capable provider as fallback while credentials
 * aren't configured).
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  /** Which backend authenticated this user. */
  provider: 'supabase' | 'local';
  createdAt?: string;
}

export type AuthMode = 'supabase' | 'local';

export interface AuthProvider {
  readonly mode: AuthMode;
  /** Restore an existing session (null when signed out). */
  getSession(): Promise<AuthUser | null>;
  signIn(email: string, password: string): Promise<AuthUser>;
  signUp(name: string, email: string, password: string): Promise<AuthUser>;
  /** OAuth (Google/Apple). Throws when unsupported by the active provider. */
  signInWithOAuth(provider: 'google' | 'apple'): Promise<void>;
  resetPassword(email: string): Promise<void>;
  signOut(): Promise<void>;
  updateName(user: AuthUser, name: string): Promise<AuthUser>;
  /** Subscribe to session changes; returns an unsubscribe function. */
  onAuthChange(cb: (user: AuthUser | null) => void): () => void;
}

export function friendlyAuthError(err: unknown): Error {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  const msg = raw.toLowerCase();
  if (msg.includes('invalid login')) return new Error('That email and password combination is not correct.');
  if (msg.includes('already registered') || msg.includes('already been registered')) return new Error('An account with that email already exists. Try signing in.');
  if (msg.includes('password should be at least')) return new Error('Password must be at least 8 characters.');
  if (msg.includes('email not confirmed')) return new Error('Please confirm your email first — check your inbox.');
  if (msg.includes('network') || msg.includes('fetch')) return new Error('Could not reach the sign-in service. Check your connection and try again.');
  return err instanceof Error ? err : new Error('Something went wrong. Please try again.');
}
