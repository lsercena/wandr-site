import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { parseItineraryWaypoints } from '@/utils/itineraryPlaces';
import 'leaflet/dist/leaflet.css';
import './ItineraryMap.css';

interface Props {
  /** Full itinerary markdown. */
  content: string;
  /** Trip destination (free text, e.g. "Lisbon, Portugal"). */
  destination: string;
  height?: number;
}

/**
 * Interactive Leaflet map plotting day-by-day itinerary waypoints and the
 * route between them. Leaflet is loaded on demand so it never bloats the
 * initial bundle; the bundled city dataset means no geocoding API calls.
 */
export default function ItineraryMap({ content, destination, height = 420 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | undefined;

    void (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current) return;

      const waypoints = parseItineraryWaypoints(content, destination);
      if (waypoints.length === 0) {
        setState('unavailable');
        return;
      }

      const el = containerRef.current;
      el.innerHTML = '';
      map = L.map(el, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const latlngs: [number, number][] = waypoints.map((w) => [w.lat, w.lng]);

      if (latlngs.length > 1) {
        L.polyline(latlngs, { color: '#9E4A1E', weight: 3, opacity: 0.9, dashArray: '6 6' }).addTo(map);
      }

      waypoints.forEach((w, i) => {
        const icon = L.divIcon({
          className: 'itinerary-waypoint',
          html: `<span>${i + 1}</span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        L.marker([w.lat, w.lng], { icon })
          .addTo(map!)
          .bindPopup(w.day != null ? `<strong>Day ${w.day}</strong> — ${w.label}` : `<strong>${w.label}</strong>`);
      });

      if (latlngs.length === 1) {
        map.setView(latlngs[0], 9);
      } else {
        map.fitBounds(L.latLngBounds(latlngs).pad(0.2));
      }
      setState('ready');
    })();

    return () => {
      cancelled = true;
      if (map) {
        map.remove();
        map = undefined;
      }
    };
  }, [content, destination]);

  if (state === 'unavailable') {
    return (
      <div className="itinerary-map itinerary-map--empty" style={{ height }}>
        <p>📍 No locations could be mapped for this itinerary yet — the route appears once the AI names specific stops.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="itinerary-map"
      style={{ height }}
      role="application"
      aria-label="Itinerary route map"
    />
  );
}
