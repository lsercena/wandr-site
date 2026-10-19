import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import './SchengenTracker.css';

/** Max stay in the Schengen area: 90 days within any rolling 180-day window. */
const ALLOWED_DAYS = 90;
const WINDOW_DAYS = 180;

interface SchengenTrip {
  id: string;
  /** ISO dates (yyyy-mm-dd), inclusive. */
  entry: string;
  exit: string;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseISO(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isWithin(iso: string, from: Date, to: Date): boolean {
  const d = parseISO(iso).getTime();
  return d >= from.getTime() && d <= to.getTime();
}

/** Total days present in Schengen inside [from, to]. */
function daysInWindow(trips: SchengenTrip[], from: Date, to: Date): number {
  let total = 0;
  for (const trip of trips) {
    const start = parseISO(trip.entry);
    const end = parseISO(trip.exit);
    const clampedStart = start < from ? from : start;
    const clampedEnd = end > to ? to : end;
    if (clampedStart <= clampedEnd) {
      total += Math.floor((clampedEnd.getTime() - clampedStart.getTime()) / 86_400_000) + 1;
    }
  }
  return total;
}

/**
 * Schengen 90/180 day tracker — a pure client-side widget (localStorage,
 * per-profile). Add entry/exit dates and see exactly how many of your 90
 * rolling days remain, plus the date each old stay starts "rolling out".
 */
export default function SchengenTracker() {
  const { user } = useAuth();
  const storageKey = `wandr:schengen:${user?.id ?? 'anon'}`;
  const [trips, setTrips] = useState<SchengenTrip[]>([]);
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) || '[]') as SchengenTrip[];
      setTrips(Array.isArray(raw) ? raw : []);
    } catch {
      setTrips([]);
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: SchengenTrip[]) => {
      setTrips(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey],
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { used, remaining, windowStart, resetHint } = useMemo(() => {
    const from = addDays(today, -(WINDOW_DAYS - 1));
    const usedDays = Math.min(ALLOWED_DAYS, daysInWindow(trips, from, today));
    const lastCountedDay = trips
      .flatMap((t) => [t.entry, t.exit])
      .filter((iso) => isWithin(iso, from, today))
      .sort()
      .pop();
    return {
      used: usedDays,
      remaining: ALLOWED_DAYS - usedDays,
      windowStart: from,
      resetHint: lastCountedDay ? addDays(parseISO(lastCountedDay), 1) : null,
    };
  }, [trips, today]);

  const addTrip = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!entry || !exit) {
      setError('Please pick both an entry and an exit date.');
      return;
    }
    if (parseISO(exit) < parseISO(entry)) {
      setError('Exit date must be on or after the entry date.');
      return;
    }
    if (isWithin(exit, addDays(today, 1), new Date(8640000000000000))) {
      setError('Future stays can be added once they happen — this tracker counts days you have actually spent in Schengen.');
      return;
    }
    persist([
      { id: `sch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, entry, exit },
      ...trips,
    ]);
    setEntry('');
    setExit('');
  };

  const removeTrip = (id: string) => persist(trips.filter((t) => t.id !== id));

  const pctUsed = Math.round((used / ALLOWED_DAYS) * 100);
  const tone = remaining === 0 ? 'full' : remaining < 10 ? 'warn' : remaining < 30 ? 'caution' : 'ok';

  return (
    <div className="schengen card">
      <div className="schengen__header">
        <div>
          <p className="section-label">Schengen Area</p>
          <h3 className="schengen__title">90 / 180-Day Tracker</h3>
        </div>
        <span className={`schengen__badge schengen__badge--${tone}`}>
          {remaining} days left
        </span>
      </div>

      <div className="schengen__gauge" aria-label={`${used} of ${ALLOWED_DAYS} days used in the last 180 days`}>
        <div
          className={`schengen__gauge-fill schengen__gauge-fill--${tone}`}
          style={{ width: `${pctUsed}%` }}
        />
      </div>

      <div className="schengen__stats">
        <div className="schengen__stat">
          <span>Used</span>
          <strong>{used} days</strong>
        </div>
        <div className="schengen__stat">
          <span>Remaining</span>
          <strong>{remaining} days</strong>
        </div>
        <div className="schengen__stat">
          <span>Rolling window</span>
          <strong>{toISODate(windowStart)} → {toISODate(today)}</strong>
        </div>
        {resetHint && (
          <div className="schengen__stat">
            <span>Oldest days roll out</span>
            <strong>{toISODate(addDays(resetHint, -1))}</strong>
          </div>
        )}
      </div>

      <form className="schengen__form" onSubmit={addTrip}>
        <label className="schengen__field">
          <span className="form-label">Entry date</span>
          <input
            type="date"
            className="form-input"
            value={entry}
            max={toISODate(today)}
            onChange={(e) => setEntry(e.target.value)}
            required
          />
        </label>
        <label className="schengen__field">
          <span className="form-label">Exit date</span>
          <input
            type="date"
            className="form-input"
            value={exit}
            min={entry || undefined}
            max={toISODate(today)}
            onChange={(e) => setExit(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary">Add stay</button>
      </form>

      {error && <p className="schengen__error" role="alert">⚠ {error}</p>}

      {trips.length > 0 ? (
        <ul className="schengen__trips">
          {trips.map((t) => (
            <li key={t.id} className="schengen__trip">
              <span>
                {t.entry} → {t.exit}
                <em> · {daysInWindow([t], parseISO(t.entry), parseISO(t.exit))} days</em>
              </span>
              <button type="button" onClick={() => removeTrip(t.id)} aria-label={`Remove stay ${t.entry}`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="schengen__empty">No stays recorded yet. Add past entries from your passport stamps to see your remaining allowance.</p>
      )}

      <p className="schengen__disclaimer">
        Rule: 90 days of presence in any rolling 180-day period across the Schengen area (not per country).
        This tracker is a planning aid — always verify with official sources before travel.
      </p>
    </div>
  );
}
