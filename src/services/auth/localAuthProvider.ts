/**
 * Local auth provider — used when Supabase credentials aren't configured.
 * Accounts live in this browser's localStorage (PBKDF2-hashed passwords) so
 * the full login/dashboard flow — including offline use — still works.
 * NOTE: a production deployment should configure VITE_SUPABASE_URL +
 * VITE_SUPABASE_ANON_KEY to enable real, cross-device accounts.
 */
import type { AuthProvider, AuthUser } from './authTypes';
import { friendlyAuthError } from './authTypes';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  salt: string;
  hash: string;
  createdAt: string;
}

const USERS_KEY = 'wandr:auth:users';
const SESSION_KEY = 'wandr:auth:session';
const CHANGE_EVENT = 'wandr:auth:change';

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function assertValidEmail(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please enter a valid email address.');
  }
}

function toPublic(u: StoredUser): AuthUser {
  return { id: u.id, email: u.email, name: u.name, provider: 'local', createdAt: u.createdAt };
}

function emit(user: AuthUser | null): void {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: user }));
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100_000, hash: 'SHA-256' },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function createLocalAuthProvider(): AuthProvider {
  const subscribers = new Set<(user: AuthUser | null) => void>();

  const notify = (user: AuthUser | null) => {
    emit(user);
    subscribers.forEach((cb) => cb(user));
  };

  const windowListener = (e: Event) => notify((e as CustomEvent<AuthUser | null>).detail);
  window.addEventListener(CHANGE_EVENT, windowListener);

  const storageListener = (e: StorageEvent) => {
    if (e.key === SESSION_KEY) notify(getSessionSync());
  };
  window.addEventListener('storage', storageListener);

  function getSessionSync(): AuthUser | null {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const user = readUsers().find((u) => u.id === id);
    return user ? toPublic(user) : null;
  }

  return {
    mode: 'local',

    async getSession() {
      return getSessionSync();
    },

    async signIn(email, password) {
      try {
        assertValidEmail(email);
        const normalized = normalizeEmail(email);
        const user = readUsers().find((u) => u.email === normalized);
        if (!user) throw new Error('Invalid login credentials');
        const hash = await hashPassword(password, user.salt);
        if (hash !== user.hash) throw new Error('Invalid login credentials');
        localStorage.setItem(SESSION_KEY, user.id);
        const publicUser = toPublic(user);
        notify(publicUser);
        return publicUser;
      } catch (err) {
        throw friendlyAuthError(err);
      }
    },

    async signUp(name, email, password) {
      try {
        assertValidEmail(email);
        if (password.length < 8) throw new Error('Password should be at least 8 characters.');
        const normalized = normalizeEmail(email);
        const users = readUsers();
        if (users.some((u) => u.email === normalized)) {
          throw new Error('An account with this email has already been registered.');
        }
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
        const stored: StoredUser = {
          id: `local_${crypto.randomUUID()}`,
          email: normalized,
          name: name.trim() || normalized.split('@')[0],
          salt: saltHex,
          hash: await hashPassword(password, saltHex),
          createdAt: new Date().toISOString(),
        };
        users.push(stored);
        writeUsers(users);
        localStorage.setItem(SESSION_KEY, stored.id);
        const publicUser = toPublic(stored);
        notify(publicUser);
        return publicUser;
      } catch (err) {
        throw friendlyAuthError(err);
      }
    },

    async signInWithOAuth() {
      throw new Error('Social login requires Supabase to be configured. Use email & password for now.');
    },

    async resetPassword(email) {
      assertValidEmail(email);
      // Local accounts can't receive email — surface a clear, honest state.
      throw new Error('Password reset emails require Supabase. Create a new account or configure Supabase.');
    },

    async signOut() {
      localStorage.removeItem(SESSION_KEY);
      notify(null);
    },

    async updateName(user, name) {
      const users = readUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) throw new Error('Account not found.');
      users[idx] = { ...users[idx], name: name.trim() || users[idx].name };
      writeUsers(users);
      const publicUser = toPublic(users[idx]);
      notify(publicUser);
      return publicUser;
    },

    onAuthChange(cb) {
      // Window-level listeners are attached once at provider creation and
      // live for the page lifetime; only subscriber bookkeeping happens here.
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
  };
}
