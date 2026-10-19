import { useEffect, useState } from 'react';
import { getRateTable, type RateTable } from '@/services/exchangeRateService';

/** Loads the live (cached) exchange-rate table once per mount. */
export function useExchangeRates() {
  const [table, setTable] = useState<RateTable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void getRateTable()
      .then((t) => {
        if (!cancelled) {
          setTable(t);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { table, loading };
}
