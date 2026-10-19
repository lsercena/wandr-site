import { useEffect, useState } from 'react';
import {
  SUPPORTED_CURRENCIES,
  convertCurrency,
  rateBetween,
  formatMoney,
} from '@/services/exchangeRateService';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import './CurrencyConverter.css';

interface Props {
  defaultAmount?: number;
  defaultFrom?: string;
  defaultTo?: string;
  /** 'inline' renders a compact single-row widget. */
  variant?: 'card' | 'inline';
}

/**
 * Live multi-currency converter (USD-based rate table from free APIs,
 * cached for offline use). Shows source + freshness so users know the
 * rates are live, not hardcoded.
 */
export default function CurrencyConverter({
  defaultAmount = 1000,
  defaultFrom = 'USD',
  defaultTo = 'EUR',
  variant = 'card',
}: Props) {
  const { table, loading } = useExchangeRates();
  const [amount, setAmount] = useState(defaultAmount);
  const [from, setFrom] = useState(defaultFrom.toUpperCase());
  const [to, setTo] = useState(defaultTo.toUpperCase());

  useEffect(() => {
    if (!SUPPORTED_CURRENCIES.includes(to as never) && table) {
      setTo(table.rates[to] ? to : 'EUR');
    }
  }, [table, to]);

  const converted =
    table && amount > 0 ? convertCurrency(amount, from, to, table) : null;
  const rate = table ? rateBetween(table, from, to) : null;

  return (
    <div className={`fx-converter fx-converter--${variant}`} aria-label="Live currency converter">
      {variant === 'card' && <h3 className="fx-title">Live Currency Converter</h3>}

      <div className="fx-row">
        <label className="fx-field">
          <span className="fx-label">Amount</span>
          <input
            type="number"
            className="form-input"
            value={amount}
            min={0}
            onChange={(e) => setAmount(Math.max(0, +e.target.value))}
          />
        </label>

        <label className="fx-field">
          <span className="fx-label">From</span>
          <select className="form-select" value={from} onChange={(e) => setFrom(e.target.value)}>
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="fx-swap"
          onClick={() => { setFrom(to); setTo(from); }}
          aria-label="Swap currencies"
          title="Swap currencies"
        >
          ⇄
        </button>

        <label className="fx-field">
          <span className="fx-label">To</span>
          <select className="form-select" value={to} onChange={(e) => setTo(e.target.value)}>
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="fx-result" aria-live="polite">
        {loading && !table ? (
          <span className="fx-loading">Fetching live rates…</span>
        ) : converted != null ? (
          <>
            <strong>{formatMoney(converted, to)}</strong>
            {rate != null && (
              <span className="fx-rate">
                1 {from} = {rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4)} {to}
              </span>
            )}
          </>
        ) : (
          <span className="fx-loading">Enter an amount to convert.</span>
        )}
      </div>

      {variant === 'card' && table && (
        <p className={`fx-meta ${table.source.includes('snapshot') ? 'fx-meta--warn' : ''}`}>
          {table.source.includes('snapshot')
            ? '⚠ Offline snapshot rates — reconnect to refresh live rates.'
            : `Live rates via ${table.source} · updated ${new Date(table.updatedAt).toLocaleString()}`}
        </p>
      )}
    </div>
  );
}
