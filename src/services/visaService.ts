/**
 * Visa Service — visa finder logic and recommendations.
 * TODO: Integrate with official government immigration APIs.
 */
import { countries } from '@/data/countries';
import type { VisaFinderInput, VisaRecommendation, Country } from '@/types';

function parseIncomeRequirement(req?: string): number {
  if (!req) return 0;
  const match = req.match(/\$?([\d,]+)/);
  return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
}

function scoreCountry(country: Country, input: VisaFinderInput): number {
  let score = 0;

  if (country.visa.visaFreeFor?.includes(input.nationality)) score += 30;
  if (country.digitalNomadVisa.available) score += 25;

  if (input.remoteWorker || input.freelancer) {
    if (country.digitalNomadVisa.remoteWorkAllowed) score += 15;
    score += country.overview.digitalNomadScore * 0.15;
  }

  const incomeReq = parseIncomeRequirement(country.digitalNomadVisa.incomeRequirement);
  if (incomeReq > 0 && input.income >= incomeReq) score += 20;
  else if (incomeReq === 0) score += 10;

  if (input.hasFamily && country.digitalNomadVisa.familyEligibility) score += 10;
  if (input.retired && country.visa.visaFree) score += 15;

  score += country.overview.safetyScore * 0.1;
  score += country.costOfLiving.index < 50 ? 10 : 0;

  return Math.min(Math.round(score), 100);
}

export function findVisaRecommendations(input: VisaFinderInput): VisaRecommendation[] {
  const recommendations: VisaRecommendation[] = [];

  for (const country of countries) {
    const matchScore = scoreCountry(country, input);
    if (matchScore < 30) continue;

    let visaType = 'Tourist Visa';
    let estimatedCost = 0;

    if (country.digitalNomadVisa.available && (input.remoteWorker || input.freelancer)) {
      visaType = country.digitalNomadVisa.name || 'Digital Nomad Visa';
      const costMatch = country.digitalNomadVisa.applicationCost?.match(/\$?([\d,]+)/);
      estimatedCost = costMatch ? parseInt(costMatch[1].replace(/,/g, ''), 10) : 0;
    } else if (country.visa.visaFreeFor?.includes(input.nationality)) {
      visaType = 'Visa-Free Entry';
    } else if (country.visa.eVisa) {
      visaType = 'eVisa';
      estimatedCost = 50;
    }

    const checklist = [
      'Valid passport (6+ months validity)',
      ...country.visa.requiredDocuments,
      ...(country.digitalNomadVisa.requiredDocuments || []),
    ];

    if (input.hasFamily) checklist.push('Family member documents', 'Marriage/birth certificates');
    if (country.digitalNomadVisa.healthInsuranceRequired) checklist.push('Health insurance proof');

    recommendations.push({
      country,
      visaType,
      estimatedCost,
      checklist: [...new Set(checklist)],
      taxNotes: country.tax.taxResidency,
      matchScore,
    });
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
}
