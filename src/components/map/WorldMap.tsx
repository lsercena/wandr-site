import { useState } from 'react';
import { countryService } from '@/services/countryService';
import './WorldMap.css';

type MapLayer = 'visa-free' | 'nomad' | 'visa-required' | 'safety' | 'cost';

export default function WorldMap() {
  const [layer, setLayer] = useState<MapLayer>('nomad');
  const countries = countryService.getAll();

  const layers: { key: MapLayer; label: string }[] = [
    { key: 'visa-free', label: 'Visa Free' },
    { key: 'nomad', label: 'Nomad Visas' },
    { key: 'visa-required', label: 'Visa Required' },
    { key: 'safety', label: 'Safety' },
    { key: 'cost', label: 'Cost of Living' },
  ];

  function getMarkerColor(slug: string): string {
    const c = countryService.getBySlug(slug);
    if (!c) return 'var(--subtle)';
    switch (layer) {
      case 'visa-free': return c.visa.visaFree ? 'var(--success)' : 'var(--subtle)';
      case 'nomad': return c.digitalNomadVisa.available ? 'var(--terra)' : 'var(--mist)';
      case 'visa-required': return c.visa.visaRequired ? '#8B3A1E' : 'var(--success)';
      case 'safety': return c.overview.safetyScore > 80 ? 'var(--success)' : c.overview.safetyScore > 60 ? 'var(--gold)' : '#8B3A1E';
      case 'cost': return c.costOfLiving.index < 40 ? 'var(--success)' : c.costOfLiving.index < 60 ? 'var(--gold)' : 'var(--terra)';
      default: return 'var(--terra)';
    }
  }

  // Simple SVG world map with country markers
  // TODO: Replace with Mapbox/Leaflet for interactive pan/zoom
  return (
    <div className="world-map">
      <div className="world-map__controls" role="tablist" aria-label="Map layers">
        {layers.map((l) => (
          <button
            key={l.key}
            role="tab"
            aria-selected={layer === l.key}
            className={`chip ${layer === l.key ? 'active' : ''}`}
            onClick={() => setLayer(l.key)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="world-map__canvas">
        <svg viewBox="0 0 1000 500" className="world-map__svg" aria-label="World map showing country data">
          <rect width="1000" height="500" fill="var(--mist)" rx="4" />
          {/* Simplified continent shapes */}
          <ellipse cx="220" cy="180" rx="100" ry="80" fill="rgba(196,98,45,0.06)" />
          <ellipse cx="500" cy="160" rx="80" ry="70" fill="rgba(196,98,45,0.06)" />
          <ellipse cx="750" cy="200" rx="120" ry="90" fill="rgba(196,98,45,0.06)" />
          <ellipse cx="280" cy="340" rx="70" ry="60" fill="rgba(196,98,45,0.06)" />
          <ellipse cx="820" cy="370" rx="60" ry="40" fill="rgba(196,98,45,0.06)" />

          {countries.map((c) => {
            const x = ((c.mapCoordinates.lng + 180) / 360) * 1000;
            const y = ((90 - c.mapCoordinates.lat) / 180) * 500;
            return (
              <g key={c.id}>
                <circle
                  cx={x} cy={y} r="12"
                  fill={getMarkerColor(c.slug)}
                  stroke="white" strokeWidth="2"
                  opacity="0.9"
                />
                <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">
                  {c.overview.flag}
                </text>
                <title>{c.name} — {layer.replace('-', ' ')}</title>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="world-map__legend">
        <span className="world-map__legend-item"><span className="world-map__dot" style={{ background: 'var(--success)' }} /> Good / Available</span>
        <span className="world-map__legend-item"><span className="world-map__dot" style={{ background: 'var(--gold)' }} /> Moderate</span>
        <span className="world-map__legend-item"><span className="world-map__dot" style={{ background: 'var(--terra)' }} /> Higher / Required</span>
      </div>
    </div>
  );
}
