import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { savedService, tripService } from '@/services/libraryService';
import type { SavedEntry } from '@/services/libraryService';
import type { TripItinerary } from '@/types';

interface LibraryContextValue {
  savedCountries: SavedEntry[];
  savedGuides: SavedEntry[];
  trips: TripItinerary[];
  isCountrySaved: (slug: string) => boolean;
  isGuideSaved: (slug: string) => boolean;
  toggleCountry: (slug: string) => void;
  toggleGuide: (slug: string) => void;
  saveTrip: (trip: Omit<TripItinerary, 'ownerId' | 'createdAt' | 'updatedAt'>) => TripItinerary;
  removeTrip: (id: string) => void;
  refresh: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedCountries, setSavedCountries] = useState<SavedEntry[]>([]);
  const [savedGuides, setSavedGuides] = useState<SavedEntry[]>([]);
  const [trips, setTrips] = useState<TripItinerary[]>([]);

  const refresh = useCallback(() => {
    if (!user) {
      setSavedCountries([]);
      setSavedGuides([]);
      setTrips([]);
      return;
    }
    setSavedCountries(savedService.getCountries(user.id));
    setSavedGuides(savedService.getGuides(user.id));
    setTrips(tripService.listForUser(user.id));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleCountry = useCallback(
    (slug: string) => {
      if (!user) return;
      setSavedCountries(savedService.toggleCountry(user.id, slug));
    },
    [user],
  );

  const toggleGuide = useCallback(
    (slug: string) => {
      if (!user) return;
      setSavedGuides(savedService.toggleGuide(user.id, slug));
    },
    [user],
  );

  const saveTrip = useCallback<LibraryContextValue['saveTrip']>(
    (trip) => {
      if (!user) throw new Error('Sign in to save trips.');
      const record = tripService.save(user.id, trip);
      setTrips(tripService.listForUser(user.id));
      return record;
    },
    [user],
  );

  const removeTrip = useCallback(
    (id: string) => {
      tripService.remove(id);
      setTrips(user ? tripService.listForUser(user.id) : []);
    },
    [user],
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      savedCountries,
      savedGuides,
      trips,
      isCountrySaved: (slug) => savedCountries.some((e) => e.slug === slug),
      isGuideSaved: (slug) => savedGuides.some((e) => e.slug === slug),
      toggleCountry,
      toggleGuide,
      saveTrip,
      removeTrip,
      refresh,
    }),
    [savedCountries, savedGuides, trips, toggleCountry, toggleGuide, saveTrip, removeTrip, refresh],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside <LibraryProvider>');
  return ctx;
}
