/**
 * Cost Calculator Service
 * TODO: Integrate with Numbeo/Expatistan API for live cost data.
 */
import { getCountryBySlug } from '@/data/countries';
import type { CostCalculatorInput, CostBreakdown, TravelStyle, HousingType } from '@/types';

const STYLE_MULTIPLIERS: Record<TravelStyle, number> = {
  budget: 0.7,
  mid: 1.0,
  luxury: 1.8,
};

const HOUSING_MULTIPLIERS: Record<HousingType, number> = {
  hostel: 0.3,
  apartment: 1.0,
  hotel: 1.5,
};

export function calculateCost(input: CostCalculatorInput): CostBreakdown | null {
  const country = getCountryBySlug(input.destinationSlug);
  if (!country) return null;

  const styleMult = STYLE_MULTIPLIERS[input.travelStyle];
  const housingMult = HOUSING_MULTIPLIERS[input.housing];
  const col = country.costOfLiving;

  const housing = Math.round(col.housing * styleMult * housingMult);
  const food = Math.round(col.food * styleMult);
  const transportation = Math.round(col.transportation * styleMult);
  const healthcare = Math.round(col.healthcare * styleMult);
  const entertainment = Math.round(col.entertainment * styleMult);
  const emergencySavings = Math.round((housing + food + transportation) * 0.15);
  const total = housing + food + transportation + healthcare + entertainment + emergencySavings;
  const recommendedIncome = Math.round(total * 1.2);

  return {
    housing,
    food,
    transportation,
    healthcare,
    entertainment,
    emergencySavings,
    total,
    recommendedIncome,
    affordable: input.income >= recommendedIncome,
  };
}

export function compareMetricValue(
  slug: string,
  metric: string,
): number {
  const country = getCountryBySlug(slug);
  if (!country) return 0;

  switch (metric) {
    case 'costOfLiving': return 100 - country.costOfLiving.index;
    case 'healthcare': return country.healthcare.englishSpeakingDoctors;
    case 'safety': return country.overview.safetyScore;
    case 'internet': return country.remoteWork.internetSpeed.download;
    case 'taxes': return country.tax.zeroIncomeTax ? 100 : country.tax.territorialTax ? 80 : 50;
    case 'housing': return 100 - Math.min(country.housing.monthlyRent.oneBed / 20, 100);
    case 'visaDifficulty': return country.digitalNomadVisa.approvalDifficulty === 'easy' ? 90 : country.digitalNomadVisa.approvalDifficulty === 'moderate' ? 60 : 30;
    case 'digitalNomadScore': return country.overview.digitalNomadScore;
    case 'transportation': return (country.transportation.metro ? 25 : 0) + (country.transportation.uber ? 25 : 0) + (country.transportation.train ? 25 : 0) + (country.transportation.bus ? 25 : 0);
    case 'english': return country.overview.englishProficiency;
    case 'food': return country.food.vegetarian;
    default: return 50;
  }
}
