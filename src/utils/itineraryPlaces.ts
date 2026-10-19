/**
 * Extracts map waypoints from an AI-generated itinerary by matching known
 * city names against the text and grouping them by day sections.
 * No network calls — uses the bundled city dataset + country centroids.
 */
import { CITIES, type CityPoint } from '@/data/cities';
import { countryService } from '@/services/countryService';

export interface Waypoint {
  /** Day number from the itinerary (null when it's just a destination anchor). */
  day: number | null;
  label: string;
  lat: number;
  lng: number;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** First occurrence of any city in the text, with its character index. */
function findCityMatches(content: string): { city: CityPoint; index: number }[] {
  const matches: { city: CityPoint; index: number }[] = [];
  for (const city of CITIES) {
    let best = -1;
    for (const alias of city.aliases) {
      const re = new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'i');
      const idx = content.search(re);
      if (idx !== -1 && (best === -1 || idx < best)) best = idx;
    }
    if (best !== -1) matches.push({ city, index: best });
  }
  return matches.sort((a, b) => a.index - b.index);
}

/** Day-section character offsets: [{ day: 1, index: 0 }, …] */
function findDayBoundaries(content: string): { day: number; index: number }[] {
  const re = /(?:^|\n)#{0,3}\s*\**day\s*(\d+)/gi;
  const boundaries: { day: number; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    boundaries.push({ day: parseInt(m[1], 10), index: m.index });
  }
  return boundaries;
}

/** Fallback anchor: the trip destination (city lookup, then country centroid). */
export function destinationWaypoint(destination: string): Waypoint | null {
  const q = destination.trim().toLowerCase();
  if (!q) return null;

  const city = CITIES.find((c) => c.aliases.some((a) => q.includes(a)));
  if (city) return { day: null, label: city.name, lat: city.lat, lng: city.lng };

  const firstWord = q.split(/[,\s]/)[0];
  const country =
    countryService.getAll().find((c) => q.includes(c.name.toLowerCase())) ??
    countryService.getAll().find((c) => c.name.toLowerCase().startsWith(firstWord));
  if (country) {
    return {
      day: null,
      label: country.name,
      lat: country.mapCoordinates.lat,
      lng: country.mapCoordinates.lng,
    };
  }
  return null;
}

export function parseItineraryWaypoints(content: string, destination: string): Waypoint[] {
  const anchors = destinationWaypoint(destination);
  const matches = findCityMatches(content);

  if (matches.length === 0) return anchors ? [anchors] : [];

  // Drop consecutive duplicates (same city re-mentioned in one day).
  const deduped = matches.filter((m, i) => i === 0 || m.city.name !== matches[i - 1].city.name);

  const boundaries = findDayBoundaries(content);
  const dayForIndex = (idx: number): number | null => {
    let day: number | null = null;
    for (const b of boundaries) {
      if (b.index <= idx) day = b.day;
      else break;
    }
    return day;
  };

  return deduped.map((m) => ({
    day: dayForIndex(m.index),
    label: m.city.name,
    lat: m.city.lat,
    lng: m.city.lng,
  }));
}
