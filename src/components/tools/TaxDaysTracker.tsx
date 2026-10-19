import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { countryService } from '@/services/countryService';
import './TaxDaysTracker.css';

/**
 * Tax residency days tracker — a local-storage / profile-based physical
 * presence counter for nomads (183-day rules, US FEIE 330-day test, or a
 * custom threshold). Planning aid only, not tax advice.
 */

type RuleKey = 'rule183' | 'feie' | 'custom';
type PeriodKey = 'calendar' | 'rolling12';

interface TaxStay {
  id: string;
  country: string;
  /** ISO dates, inclusive. */
  entry: string;
  exit: string;
}

const RULES: Record<RuleKey, { label: string; threshold: number; description: string }> = {
  rule183: {
    label: 'Standard 183-day rule',
    threshold: 183,
    description:
      'Most countries treat you as a tax resident once you spend 183 days (inclusive or counted via a sliding scale) in a calendar year.',
  },
  feie: {
    label: 'US FEIE (330 days abroad)',
    threshold: 330,
    description:
      'US citizens/residents: the Foreign Earned Income Exclusion requires 330 full days physically present in a foreign country during 12 consecutive months.',
  },
  custom: {
    label: 'Custom threshold',
    threshold: 183,
    description: 'Set your own presence limit (e.g. a country with a 6-month or 183-day sliding-scale rule).',
  },
};

const ISO_TODAY = () => new Date().toISOString().slice(0, 10);

function parseISO(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function overlapDays(a: TaxStay, from: Date, to: Date): number {
  const start = parseISO(a.entry) < from ? from : parseISO(a.entry);
  const end = parseISO(a.exit) > to ? to : parseISO(a.exit);
  if (start > end) return 0;
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

/** Sums presence days without double-counting overlapping stays. */
function presenceDays(stays: TaxStay[], from: Date, to: Date): number {
  const ranges = stays
    .map((s) => ({
      start: parseISO(s.entry) < from ? from : parseISO(s.entry),
      end: parseISO(s.exit) > to ? to : parseISO(s.exit),
    }))
    .filter((r) => r.start <= r.end)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  let total = 0;
  let cursor: [Date, Date] | null = null;
  for (const range of ranges) {
    if (!cursor) {
      cursor = [range.start, range.end];
      continue;
    }
    if (range.start.getTime() <= cursor[1].getTime() + 86_400_000) {
      if (range.end > cursor[1]) cursor = [cursor[0], range.end];
    } else {
      total += Math.floor((cursor[1].getTime() - cursor[0].getTime()) / 86_400_000) + 1;
      cursor = [range.start, range.end];
    }
  }
  if (cursor) total += Math.floor((cursor[1].getTime() - cursor[0].getTime()) / 86_400_000) + 1;
  return total;
}

export default function TaxDaysTracker() {
  const { user } = useAuth();
  const storageKey = `wandr:taxdays:${user?.id ?? 'anon'}`;

  const [stays, setStays] = useState<TaxStay[]>([]);
  const [rule, setRule] = useState<RuleKey>('rule183');
  const [customThreshold, setCustomThreshold] = useState(183);
  const [period, setPeriod] = useState<PeriodKey>('calendar');
  const [country, setCountry] = useState('');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) || '[]') as TaxStay[];
      setStays(Array.isArray(raw) ? raw : []);
    } catch {
      setStays([]);
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: TaxStay[]) => {
      setStays(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey],
  );

  const { from, to } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (period === 'calendar') {
      return { from: new Date(today.getFullYear(), 0, 1), to: today };
    }
    return { from: addDays(today, -364), to: today };
  }, [period]);

  const threshold = rule === 'custom' ? customThreshold : RULES[rule].threshold;

  const perCountry = useMemo(() => {
    const map = new Map<string, TaxStay[]>();
    for (const stay of stays) {
      const key = stay.country.trim().toLowerCase();
      map.set(key, [...(map.get(key) ?? []), stay]);
    }
    return [...map.entries()]
      .map(([key, list]) => ({
        key,
        label: list[0].country,
        days: presenceDays(list, from, to),
      }))
      .sort((a, b) => b.days - a.days);
  }, [stays, from, to]);

  const totalDaysAbroad = useMemo(() => presenceDays(stays, from, to), [stays, from, to]);

  const addStay = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!country.trim() || !entry || !exit) {
      setError('Country and both dates are required.');
      return;
    }
    if (parseISO(exit) < parseISO(entry)) {
      setError('Exit date must be on or after the entry date.');
      return;
    }
    persist([
      {
        id: `tax_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        country: country.trim(),
        entry,
        exit,
      },
      ...stays,
    ]);
    setCountry('');
    setEntry('');
    setExit('');
  };

  const countrySuggestions = countryService.getAll().map((c) => c.name);

  return (
    <div className="tax-tracker card">
      <div className="tax-tracker__header">
        <div>
          <p className="section-label">Tax Compliance</p>
          <h3 className="tax-tracker__title">Physical Presence Tracker</h3>
        </div>
        <span className={`tax-tracker__badge ${totalDaysAbroad >= threshold ? 'tax-tracker__badge--risk' : ''}`}>
          {totalDaysAbroad} / {threshold} days
        </span>
      </div>

      <div className="tax-tracker__controls">
        <label className="tax-tracker__field">
          <span className="form-label">Rule</span>
          <select
            className="form-select"
            value={rule}
            onChange={(e) => setRule(e.target.value as RuleKey)}
          >
            {Object.entries(RULES).map(([key, r]) => (
              <option key={key} value={key}>{r.label}</option>
            ))}
          </select>
        </label>

        {rule === 'custom' && (
          <label className="tax-tracker__field">
            <span className="form-label">Threshold (days)</span>
            <input
              type="number"
              className="form-input"
              min={1}
              max={365}
              value={customThreshold}
              onChange={(e) => setCustomThreshold(Math.min(365, Math.max(1, +e.target.value)))}
            />
          </label>
        )}

        <label className="tax-tracker__field">
          <span className="form-label">Period</span>
          <select
            className="form-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodKey)}
          >
            <option value="calendar">Calendar year ({new Date().getFullYear()})</option>
            <option value="rolling12">Rolling 12 months</option>
          </select>
        </label>
      </div>

      <p className="tax-tracker__rule-desc">{RULES[rule].description}</p>

      <form className="tax-tracker__form" onSubmit={addStay}>
        <label className="tax-tracker__field">
          <span className="form-label">Country</span>
          <input
            className="form-input"
            list="tax-country-list"
            value={country}
            placeholder="e.g. Portugal"
            onChange={(e) => setCountry(e.target.value)}
            required
          />
          <datalist id="tax-country-list">
            {countrySuggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <label className="tax-tracker__field">
          <span className="form-label">Arrived</span>
          <input type="date" className="form-input" value={entry} max={ISO_TODAY()} onChange={(e) => setEntry(e.target.value)} required />
        </label>
        <label className="tax-tracker__field">
          <span className="form-label">Left</span>
          <input type="date" className="form-input" value={exit} min={entry || undefined} max={ISO_TODAY()} onChange={(e) => setExit(e.target.value)} required />
        </label>
        <button type="submit" className="btn btn-primary">Log stay</button>
      </form>

      {error && <p className="tax-tracker__error" role="alert">⚠ {error}</p>}

      {perCountry.length > 0 ? (
        <div className="tax-tracker__breakdown">
          {perCountry.map((row) => {
            const pct = Math.min(100, Math.round((row.days / threshold) * 100));
            const tone = row.days >= threshold ? 'risk' : row.days >= threshold * 0.8 ? 'warn' : 'ok';
            return (
              <div key={row.key} className="tax-tracker__row">
                <div className="tax-tracker__row-head">
                  <strong>{row.label}</strong>
                  <span className={`tax-tracker__status tax-tracker__status--${tone}`}>
                    {row.days} days{tone === 'risk' ? ' · threshold met' : tone === 'warn' ? ' · approaching' : ''}
                  </span>
                </div>
                <div className="tax-tracker__gauge">
                  <div className={`tax-tracker__gauge-fill tax-tracker__gauge-fill--${tone}`} style={{ width: `${pct}%` }} />
                </div>
                <button
                  type="button"
                  className="tax-tracker__remove"
                  onClick={() => persist(stays.filter((s) => s.country.trim().toLowerCase() !== row.key))}
                >
                  Remove all days for {row.label}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="tax-tracker__empty">
          No stays logged yet. Add where you&apos;ve been this {period === 'calendar' ? 'year' : '12 months'} to start tracking residency risk.
        </p>
      )}

      {stays.length > 0 && (
        <ul className="tax-tracker__stays">
          {stays.map((s) => (
            <li key={s.id}>
              <span>
                {s.country} · {s.entry} → {s.exit} ({overlapDays(s, from, to)} days in period)
              </span>
              <button
                type="button"
                onClick={() => persist(stays.filter((x) => x.id !== s.id))}
                aria-label={`Remove ${s.country} stay`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="tax-tracker__disclaimer">
        Planning aid only — not tax advice. Residency rules vary (domicile, ties, treaty tie-breakers,
        sliding scales). Confirm your status with a qualified tax adviser in your home country.
      </p>
    </div>
  );
}
