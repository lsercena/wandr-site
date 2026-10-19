/**
 * Library service — the user's personal Wandr library:
 * saved countries, saved guides, and custom AI trip itineraries.
 *
 * Offline-first: everything is written to localStorage (per-user namespaced)
 * so it works with the PWA offline cache. When Supabase is configured, trips
 * are *also* mirrored to the `trips` table (best-effort) so share links work
 * across devices; reads always fall back to local data on any failure.
 */
import type { TripItinerary } from '@/types';

const NS = 'wandr:library';

// ─── Saved countries / guides ────────────────────────────────────────────────

export interface SavedEntry {
  slug: string;
  savedAt: string;
}

function readList<T extends { slug: string }>(userId: string, kind: 'countries' | 'guides'): T[] {
  try {
    return JSON.parse(localStorage.getItem(`${NS}:${userId}:${kind}`) || '[]') as T[];
  } catch {
    return [];
  }
}

function writeList<T extends { slug: string }>(userId: string, kind: 'countries' | 'guides', list: T[]): void {
  localStorage.setItem(`${NS}:${userId}:${kind}`, JSON.stringify(list));
}

export const savedService = {
  getCountries(userId: string): SavedEntry[] {
    return readList<SavedEntry>(userId, 'countries');
  },
  getGuides(userId: string): SavedEntry[] {
    return readList<SavedEntry>(userId, 'guides');
  },
  toggleCountry(userId: string, slug: string): SavedEntry[] {
    const list = readList<SavedEntry>(userId, 'countries');
    const next = list.some((e) => e.slug === slug)
      ? list.filter((e) => e.slug !== slug)
      : [{ slug, savedAt: new Date().toISOString() }, ...list];
    writeList(userId, 'countries', next);
    return next;
  },
  toggleGuide(userId: string, slug: string): SavedEntry[] {
    const list = readList<SavedEntry>(userId, 'guides');
    const next = list.some((e) => e.slug === slug)
      ? list.filter((e) => e.slug !== slug)
      : [{ slug, savedAt: new Date().toISOString() }, ...list];
    writeList(userId, 'guides', next);
    return next;
  },
};

// ─── Trip itineraries ────────────────────────────────────────────────────────

const TRIPS_KEY = `${NS}:trips`;

function readTrips(): TripItinerary[] {
  try {
    const raw = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]') as TripItinerary[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeTrips(trips: TripItinerary[]): void {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export function generateTripId(): string {
  return `trip_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function mirrorTripToCloud(trip: TripItinerary): Promise<void> {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) return;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    );
    const { error } = await client.from('trips').upsert(
      {
        id: trip.id,
        owner_id: trip.ownerId,
        title: trip.title,
        destination: trip.destination,
        duration: trip.duration,
        start_date: trip.startDate ?? null,
        content: trip.content,
        updated_at: trip.updatedAt,
      },
      { onConflict: 'id' },
    );
    if (error) console.warn('[library] cloud mirror skipped:', error.message);
  } catch (err) {
    console.warn('[library] cloud mirror unavailable:', err);
  }
}

export const tripService = {
  listForUser(userId: string): TripItinerary[] {
    return readTrips()
      .filter((t) => t.ownerId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  save(userId: string, trip: Omit<TripItinerary, 'ownerId' | 'createdAt' | 'updatedAt'>): TripItinerary {
    const trips = readTrips();
    const now = new Date().toISOString();
    const existing = trips.find((t) => t.id === trip.id);
    const record: TripItinerary = {
      ...trip,
      ownerId: userId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    const next = existing
      ? trips.map((t) => (t.id === record.id ? record : t))
      : [record, ...trips];
    writeTrips(next);
    void mirrorTripToCloud(record);
    return record;
  },

  update(id: string, patch: Partial<TripItinerary>): TripItinerary | null {
    const trips = readTrips();
    const idx = trips.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const record = { ...trips[idx], ...patch, id, updatedAt: new Date().toISOString() };
    trips[idx] = record;
    writeTrips(trips);
    void mirrorTripToCloud(record);
    return record;
  },

  remove(id: string): void {
    writeTrips(readTrips().filter((t) => t.id !== id));
  },

  /** Lookup used by share pages: local first, then the cloud mirror. */
  async getShared(id: string): Promise<TripItinerary | null> {
    const local = readTrips().find((t) => t.id === id);
    if (local) return local;
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) return null;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(
        import.meta.env.VITE_SUPABASE_URL as string,
        import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      );
      const { data, error } = await client.from('trips').select('*').eq('id', id).maybeSingle();
      if (error || !data) return null;
      return {
        id: data.id,
        ownerId: data.owner_id,
        title: data.title,
        destination: data.destination,
        duration: data.duration,
        startDate: data.start_date ?? undefined,
        content: data.content,
        createdAt: data.created_at ?? data.updated_at,
        updatedAt: data.updated_at,
      };
    } catch {
      return null;
    }
  },
};

// ─── Share-link payload (works for recipients with no local copy) ────────────

/** UTF-8 safe base64url encoding of a share payload. */
export function encodeTripPayload(trip: TripItinerary): string {
  const json = JSON.stringify(trip);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeTripPayload(encoded: string): TripItinerary | null {
  try {
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as TripItinerary;
    if (!parsed || typeof parsed.id !== 'string' || typeof parsed.content !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Builds a share URL for a trip: `/itinerary/share/:id` plus an `#d=` payload
 * so the link renders for anyone, even without a shared database or account.
 */
export function buildShareUrl(trip: TripItinerary): string {
  const payload = encodeTripPayload(trip);
  const base = `${window.location.origin}/itinerary/share/${trip.id}`;
  // Keep URLs sane — very large trips fall back to id-only lookup.
  return payload.length <= 12_000 ? `${base}#d=${payload}` : base;
}
