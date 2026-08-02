/**
 * Weather Service
 * TODO: Integrate with OpenWeatherMap or similar API.
 */
import type { WeatherInfo } from '@/types';

export async function getLiveWeather(_lat: number, _lng: number): Promise<{ temp: number; condition: string } | null> {
  // PLACEHOLDER: Return mock data until API is connected
  return { temp: 22, condition: 'Partly cloudy' };
}

export function getWeatherSummary(weather: WeatherInfo): string {
  const best = weather.bestMonths.join(', ');
  const worst = weather.worstMonths.join(', ');
  return `Best months: ${best}. Avoid: ${worst}.`;
}
