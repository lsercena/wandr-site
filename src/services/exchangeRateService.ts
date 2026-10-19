/**
 * Live exchange-rate service.
 * Primary: open.er-api.com (free, no key). Fallback: frankfurter.app (ECB).
 * Last resort: bundled snapshot rates. Results are cached in localStorage so
 * the app — including the offline PWA — always has usable rates.
 */
export interface RateTable {
  base: 'USD';
  /** units of currency per 1 USD */
  rates: Record<string, number>;
  source: string;
  updatedAt: string;
}

export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'JPY', 'NZD', 'SGD', 'HKD',
  'THB', 'MXN', 'IDR', 'INR', 'BRL', 'ARS', 'COP', 'PEN', 'CLP', 'VND',
  'PHP', 'MYR', 'GEL', 'CRC', 'PAB', 'TRY', 'ZAR', 'KES', 'EGP', 'MAD',
  'NGN', 'AED', 'QAR', 'SAR', 'OMR', 'JOD', 'ILS', 'PKR', 'LKR', 'NPR',
  'TWD', 'KRW', 'CZK', 'PLN', 'RON', 'HUF', 'BGN', 'SEK', 'NOK', 'DKK',
  'UAH', 'KZT', 'UZS',
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/** Offline snapshot (approximate, refreshes whenever online). */
const FALLBACK_RATES: Record<string, number> = {
  EUR: 0.92, GBP: 0.79, AUD: 1.52, CAD: 1.36, CHF: 0.88, JPY: 150, NZD: 1.64,
  SGD: 1.34, HKD: 7.8, THB: 35, MXN: 17, IDR: 15800, INR: 83, BRL: 5.1,
  ARS: 900, COP: 4000, PEN: 3.7, CLP: 930, VND: 25000, PHP: 56, MYR: 4.4,
  GEL: 2.7, CRC: 520, PAB: 1, TRY: 32, ZAR: 18, KES: 153, EGP: 47,
  MAD: 10, NGN: 1500, AED: 3.67, QAR: 3.64, SAR: 3.75, OMR: 0.38, JOD: 0.71,
  ILS: 3.7, PKR: 280, LKR: 305, NPR: 133, TWD: 32, KRW: 1330, CZK: 23,
  PLN: 4, RON: 4.58, HUF: 355, BGN: 1.8, SEK: 10.5, NOK: 10.7, DKK: 6.9,
  UAH: 39, KZT: 450, UZS: 12600,
};

const CACHE_KEY = 'wandr:fx:usd-rates';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CachedRates extends RateTable {
  fetchedAt: number;
}

function readCache(): CachedRates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRates;
    if (!parsed?.rates || typeof parsed.rates !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(table: RateTable): void {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...table, fetchedAt: Date.now() } satisfies CachedRates),
    );
  } catch {
    /* storage full/blocked — non-fatal */
  }
}

function buildFallbackTable(): RateTable {
  return {
    base: 'USD',
    rates: { USD: 1, ...FALLBACK_RATES },
    source: 'offline snapshot',
    updatedAt: new Date(0).toISOString(),
  };
}

/** Fetches the live USD-based rate table (cached; falls back gracefully). */
export async function getRateTable(): Promise<RateTable> {
  const cached = readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { base: 'USD', rates: cached.rates, source: cached.source, updatedAt: cached.updatedAt };
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.result === 'success' && data.rates?.EUR) {
        const table: RateTable = {
          base: 'USD',
          rates: { USD: 1, ...data.rates },
          source: 'open.er-api.com',
          updatedAt: data.time_last_update_utc || new Date().toISOString(),
        };
        writeCache(table);
        return table;
      }
    }
  } catch {
    /* try next source */
  }

  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD', { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.rates?.EUR) {
        const table: RateTable = {
          base: 'USD',
          rates: { USD: 1, ...data.rates },
          source: 'frankfurter.app (ECB)',
          updatedAt: data.date || new Date().toISOString(),
        };
        writeCache(table);
        return table;
      }
    }
  } catch {
    /* fall through */
  }

  if (cached) {
    // Stale cache beats a wrong answer.
    return { base: 'USD', rates: cached.rates, source: `${cached.source} (cached)`, updatedAt: cached.updatedAt };
  }
  return buildFallbackTable();
}

/** Live rate from → to (both converted through the USD base). */
export async function getExchangeRate(from: string, to: string): Promise<number> {
  const table = await getRateTable();
  return rateBetween(table, from, to);
}

export function rateBetween(table: RateTable, from: string, to: string): number {
  const f = table.rates[from.toUpperCase()];
  const t = table.rates[to.toUpperCase()];
  if (!f || !t) return 1;
  return t / f; // 1 unit of `from` → ? units of `to`
}

export function convertCurrency(amount: number, from: string, to: string, table: RateTable): number {
  const value = amount * rateBetween(table, from, to);
  return Math.round(value * 100) / 100;
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: amount >= 1000 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${Math.round(amount).toLocaleString()}`;
  }
}
