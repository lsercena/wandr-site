/**
 * Country Service — data access layer for country information.
 * TODO: Replace mock data with CMS/API when backend is ready.
 */
import { countries, getCountryBySlug, getCountriesByFilter, travelGuides, seoPages } from '@/data/countries';
import type { Country, TravelGuide, SeoPageMeta } from '@/types';

export const countryService = {
  getAll(): Country[] {
    return countries;
  },

  getBySlug(slug: string): Country | undefined {
    return getCountryBySlug(slug);
  },

  search(query: string): Country[] {
    const q = query.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.overview.capital.toLowerCase().includes(q) ||
        c.overview.region.toLowerCase().includes(q),
    );
  },

  filter(key: string, value?: string): Country[] {
    return getCountriesByFilter(key, value);
  },

  getPopular(): Country[] {
    return countries.slice(0, 4);
  },

  getTrendingNomad(): Country[] {
    return getCountriesByFilter('nomad-destinations').slice(0, 4);
  },

  getCheapest(): Country[] {
    return getCountriesByFilter('cheapest').slice(0, 4);
  },

  getSafest(): Country[] {
    return getCountriesByFilter('safest').slice(0, 4);
  },

  getNomadVisas(): Country[] {
    return getCountriesByFilter('digital-nomad');
  },
};

export const guideService = {
  getAll(): TravelGuide[] {
    return travelGuides;
  },

  getFeatured(): TravelGuide[] {
    return travelGuides.slice(0, 3);
  },

  getBySlug(slug: string): TravelGuide | undefined {
    return travelGuides.find((g) => g.slug === slug);
  },
};

export const seoService = {
  getAll(): SeoPageMeta[] {
    return seoPages;
  },

  getBySlug(slug: string): SeoPageMeta | undefined {
    return seoPages.find((p) => p.slug === slug);
  },
};
