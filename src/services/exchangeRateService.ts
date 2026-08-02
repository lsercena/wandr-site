/**
 * Exchange Rate Service
 * TODO: Integrate with Open Exchange Rates or similar API.
 */
export async function getExchangeRate(from: string, to: string): Promise<number> {
  // PLACEHOLDER: Return mock rates until API is connected
  const mockRates: Record<string, number> = {
    'USD-EUR': 0.92,
    'USD-JPY': 150,
    'USD-THB': 35,
    'USD-GBP': 0.79,
    'USD-ARS': 900,
    'USD-MXN': 17,
    'USD-COP': 4000,
    'USD-GEL': 2.7,
    'USD-CRC': 520,
  };
  const key = `${from}-${to}`;
  return mockRates[key] || 1;
}

export function convertCurrency(amount: number, rate: number): number {
  return Math.round(amount * rate * 100) / 100;
}
