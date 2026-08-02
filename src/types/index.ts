// ─── Core Country Types ───────────────────────────────────────────

export interface CountryOverview {
  capital: string;
  currency: string;
  languages: string[];
  population: string;
  government: string;
  timezone: string;
  drivingSide: 'left' | 'right';
  powerPlugs: string[];
  emergencyNumbers: { police: string; ambulance: string; fire: string };
  internetSpeed: { download: number; upload: number; unit: 'Mbps' };
  climate: string;
  safetyScore: number;
  familyScore: number;
  soloTravelerScore: number;
  digitalNomadScore: number;
  lgbtqFriendliness: number;
  englishProficiency: number;
  bestTimeToVisit: string[];
  flag: string;
  region: string;
  continent: string;
}

export interface VisaInfo {
  touristVisa: string;
  visaFree: boolean;
  visaRequired: boolean;
  visaOnArrival: boolean;
  eVisa: boolean;
  maxStay: string;
  extensions: string;
  visaRuns: string;
  passportValidity: string;
  blankPages: string;
  entryRequirements: string[];
  requiredDocuments: string[];
  embassyLinks: { label: string; url: string }[];
  officialSources: { label: string; url: string }[];
  lastUpdated: string;
  visaFreeFor?: string[];
}

export interface DigitalNomadVisa {
  available: boolean;
  name?: string;
  incomeRequirement?: string;
  savingsAlternative?: string;
  processingTime?: string;
  applicationCost?: string;
  renewal?: string;
  familyEligibility?: boolean;
  childrenEligibility?: boolean;
  remoteWorkAllowed?: boolean;
  localEmploymentAllowed?: boolean;
  healthInsuranceRequired?: boolean;
  minimumCoverage?: string;
  approvalTimeline?: string;
  taxResidencyTrigger?: string;
  applicationPortal?: string;
  embassy?: string;
  requiredDocuments?: string[];
  approvalDifficulty?: 'easy' | 'moderate' | 'hard';
}

export interface RemoteWorkInfo {
  internetSpeed: { download: number; upload: number };
  fiberAvailability: number;
  averageWifi: number;
  coverage5G: number;
  coworkingSpaces: number;
  laptopFriendlyCafes: number;
  powerReliability: number;
  simProviders: string[];
  esimProviders: string[];
  vpnRestrictions: boolean;
}

export interface HousingInfo {
  monthlyRent: { studio: number; oneBed: number; twoBed: number; currency: string };
  hotels: { budget: number; mid: number; luxury: number };
  hostels: { average: number };
  apartments: { average: number };
  neighborhoods: { name: string; description: string; avgRent: number }[];
  utilities: number;
  leaseTerms: string;
  deposits: string;
}

export interface TransportationInfo {
  uber: boolean;
  bolt: boolean;
  grab: boolean;
  metro: boolean;
  train: boolean;
  bus: boolean;
  scooters: boolean;
  idpRequired: boolean;
  rentalCars: { daily: number; currency: string };
  averageCosts: { metro: number; taxi: number; bus: number };
}

export interface HealthcareInfo {
  emergencyNumbers: string[];
  hospitals: number;
  privateHealthcare: string;
  travelInsurance: string;
  vaccinations: string[];
  englishSpeakingDoctors: number;
}

export interface SafetyInfo {
  crime: number;
  scams: string[];
  naturalDisasters: string[];
  womensSafety: number;
  politicalStability: number;
  airQuality: number;
  waterQuality: number;
  earthquakeRisk: 'low' | 'moderate' | 'high';
  floodRisk: 'low' | 'moderate' | 'high';
}

export interface WeatherInfo {
  monthly: { month: string; tempHigh: number; tempLow: number; rainfall: number; humidity: number }[];
  typhoonSeason?: string;
  monsoon?: string;
  wildfireSeason?: string;
  bestMonths: string[];
  worstMonths: string[];
}

export interface FoodInfo {
  averageMealCost: number;
  streetFood: boolean;
  vegetarian: number;
  vegan: number;
  halal: number;
  kosher: number;
  deliveryApps: string[];
  localDishes: string[];
}

export interface BankingInfo {
  foreignAccounts: boolean;
  atms: boolean;
  cashlessScore: number;
  creditCards: number;
  internationalTransfers: string;
  taxes: string;
}

export interface TaxInfo {
  dayRule183: boolean;
  taxResidency: string;
  doubleTaxTreaties: string[];
  territorialTax: boolean;
  zeroIncomeTax: boolean;
  nomadTaxProgram?: string;
}

export interface CostOfLiving {
  monthlyBudget: { budget: number; mid: number; luxury: number; currency: string };
  housing: number;
  food: number;
  transportation: number;
  healthcare: number;
  entertainment: number;
  index: number;
}

export interface Country {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image: string;
  overview: CountryOverview;
  visa: VisaInfo;
  digitalNomadVisa: DigitalNomadVisa;
  remoteWork: RemoteWorkInfo;
  housing: HousingInfo;
  transportation: TransportationInfo;
  healthcare: HealthcareInfo;
  safety: SafetyInfo;
  weather: WeatherInfo;
  food: FoodInfo;
  banking: BankingInfo;
  tax: TaxInfo;
  costOfLiving: CostOfLiving;
  mapCoordinates: { lat: number; lng: number };
  seoKeywords: string[];
}

export interface VisaFinderInput {
  nationality: string;
  passportExpiry: string;
  age: number;
  income: number;
  savings: number;
  remoteWorker: boolean;
  freelancer: boolean;
  businessOwner: boolean;
  student: boolean;
  retired: boolean;
  travelGoals: string[];
  hasFamily: boolean;
  hasPets: boolean;
  lengthOfStay: string;
}

export interface VisaRecommendation {
  country: Country;
  visaType: string;
  estimatedCost: number;
  checklist: string[];
  taxNotes: string;
  matchScore: number;
}

export type TravelStyle = 'budget' | 'mid' | 'luxury';
export type HousingType = 'hostel' | 'apartment' | 'hotel';

export interface CostCalculatorInput {
  income: number;
  destinationSlug: string;
  travelStyle: TravelStyle;
  housing: HousingType;
  lengthOfStay: number;
}

export interface CostBreakdown {
  housing: number;
  food: number;
  transportation: number;
  healthcare: number;
  entertainment: number;
  emergencySavings: number;
  total: number;
  recommendedIncome: number;
  affordable: boolean;
}

export type CompareMetric =
  | 'costOfLiving' | 'healthcare' | 'safety' | 'weather' | 'internet'
  | 'taxes' | 'housing' | 'visaDifficulty' | 'digitalNomadScore'
  | 'transportation' | 'walkability' | 'english' | 'food' | 'nightlife' | 'nature';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ItineraryRequest {
  destination: string;
  duration: string;
  budget: string;
  party: string;
  styles: string[];
  lodging: string;
  special: string;
}

export interface LocationItem {
  name: string;
  rating: number;
  reviews: string;
  description: string;
  detail: string;
}

export interface LocationData {
  restaurants: { indie: LocationItem[]; mainstream: LocationItem[] };
  attractions: { hidden: LocationItem[]; popular: LocationItem[] };
  accommodation: { boutique: LocationItem[]; hotels: LocationItem[] };
  nightlife: { local: LocationItem[]; popular: LocationItem[] };
  shopping: { local: LocationItem[]; mainstream: LocationItem[] };
}

export interface TravelGuide {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  countrySlug?: string;
  category: string;
  publishedAt: string;
  author: string;
  image: string;
}

export interface SeoPageMeta {
  slug: string;
  title: string;
  description: string;
  h1: string;
  filterKey: string;
  filterValue: string;
}
