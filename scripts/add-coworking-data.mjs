// One-off data migration: adds remoteWork blocks (with coworking picks) to
// the countries that inherit baseCountry defaults (mx, co, ge, cr).
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../src/data/countries.ts', import.meta.url);
let src = readFileSync(file, 'utf8');

const BLOCKS = {
  mx: `    remoteWork: {
      internetSpeed: { download: 95, upload: 40 }, fiberAvailability: 75, averageWifi: 70,
      coverage5G: 65, coworkingSpaces: 120, laptopFriendlyCafes: 350, powerReliability: 88,
      simProviders: ['Telcel', 'AT&T México', 'Movistar'], esimProviders: ['Airalo', 'Holafly'],
      vpnRestrictions: false,
      coworking: [
        { name: 'WeWork Ámsterdam 270', city: 'Mexico City', dayPassUsd: 16, monthlyUsd: 240, tags: ['24/7', 'Roma Norte-adjacent'] },
        { name: 'Centraal', city: 'Mexico City', dayPassUsd: 12, monthlyUsd: 180, tags: ['Community-driven', 'Roma Norte'] },
        { name: 'Nativo Coworking', city: 'Playa del Carmen', dayPassUsd: 14, monthlyUsd: 190, tags: ['Nomad hub', 'Beachside'] },
      ],
    },
`,
  co: `    remoteWork: {
      internetSpeed: { download: 90, upload: 35 }, fiberAvailability: 70, averageWifi: 68,
      coverage5G: 55, coworkingSpaces: 90, laptopFriendlyCafes: 250, powerReliability: 85,
      simProviders: ['Claro', 'Movistar', 'WOM'], esimProviders: ['Airalo', 'Holafly'],
      vpnRestrictions: false,
      coworking: [
        { name: 'WeWork Milla de Oro', city: 'Medellín', dayPassUsd: 13, monthlyUsd: 190, tags: ['24/7', 'El Poblado'] },
        { name: 'Atomhouse Provenza', city: 'Medellín', dayPassUsd: 10, monthlyUsd: 150, tags: ['Nomad favourite', 'Provenza'] },
        { name: 'Nodo Cowork', city: 'Bogotá', dayPassUsd: 11, monthlyUsd: 160, tags: ['Chapinero', 'Events'] },
      ],
    },
`,
  ge: `    remoteWork: {
      internetSpeed: { download: 110, upload: 55 }, fiberAvailability: 85, averageWifi: 80,
      coverage5G: 60, coworkingSpaces: 45, laptopFriendlyCafes: 180, powerReliability: 92,
      simProviders: ['Magti', 'Cellfie', 'Geocell'], esimProviders: ['Airalo', 'Nomad'],
      vpnRestrictions: false,
      coworking: [
        { name: 'Impact Hub Tbilisi', city: 'Tbilisi', dayPassUsd: 9, monthlyUsd: 130, url: 'https://impacthub.net/impact-hub-tbilisi/', tags: ['Community', 'Vera district'] },
        { name: 'Technopark Georgia', city: 'Tbilisi', dayPassUsd: 8, monthlyUsd: 120, tags: ['Startup ecosystem', 'Free-flex desks'] },
        { name: 'Cowork Batumi', city: 'Batumi', dayPassUsd: 7, monthlyUsd: 100, tags: ['Seaside', 'Black Sea views'] },
      ],
    },
`,
  cr: `    remoteWork: {
      internetSpeed: { download: 85, upload: 40 }, fiberAvailability: 70, averageWifi: 66,
      coverage5G: 55, coworkingSpaces: 40, laptopFriendlyCafes: 160, powerReliability: 90,
      simProviders: ['Kolbi', 'Claro', 'Movistar'], esimProviders: ['Airalo', 'Holafly'],
      vpnRestrictions: false,
      coworking: [
        { name: 'Selina San José', city: 'San José', dayPassUsd: 12, monthlyUsd: 170, tags: ['Coliving + cowork', 'Escazú access'] },
        { name: 'Impact Hub San José', city: 'San José', dayPassUsd: 10, monthlyUsd: 140, tags: ['Social enterprise', 'Calle 42'] },
        { name: 'Cloud coworking', city: 'Tamarindo', dayPassUsd: 15, tags: ['Beach town', 'Surf after work'] },
      ],
    },
`,
};

for (const [slug, block] of Object.entries(BLOCKS)) {
  const idMarker = new RegExp(`(id: '${slug}'[^\\n]*\\n)`);
  if (!idMarker.test(src)) throw new Error(`country ${slug} not found`);
  if (src.includes(block)) continue; // idempotent
  // Insert the remoteWork block just before the end of that country's object.
  const idx = src.search(idMarker);
  const endIdx = src.indexOf('\n  }),', idx);
  if (endIdx === -1) throw new Error(`end of country object for ${slug} not found`);
  src = src.slice(0, endIdx + 1) + block + src.slice(endIdx + 1);
  console.log(`✓ inserted remoteWork for ${slug}`);
}

writeFileSync(file, src);
console.log('done');
