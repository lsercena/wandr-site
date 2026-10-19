/**
 * Affiliate / monetization configuration.
 *
 * ─── HOW TO GO LIVE ──────────────────────────────────────────────────────────
 * Search this file for `YOUR_` (and `via=wandr`) — every placeholder to swap
 * is listed below. Replace each one, rebuild, and links start earning
 * immediately. No UI or component edits are ever needed.
 *
 *   1. SafetyWing     → replace `via=wandr`            (line ~`insurance.url`)
 *                       Referral code from safetywing.com → "Refer & earn".
 *   2. GetYourGuide   → replace `YOUR_GETYOURGUIDE_ID` (`activities.url`)
 *                       Numeric partner ID from the GetYourGuide affiliate
 *                       program dashboard (tune/awin).
 *   3. Viator         → replace `YOUR_VIATOR_ID`       (`tours.url`)
 *                       `afflid` from the Viator Affiliate Program.
 *   4. Booking.com    → replace `YOUR_BOOKING_AID`     (`stays.url`)
 *                       `aid` value from Booking.com's Affiliate Partner
 *                       Central (deep-link generator).
 *
 * Tip: `grep -n "YOUR_\|via=wandr" src/config/affiliates.ts` lists every
 * remaining placeholder in one shot.
 *
 * ─── CONVENTIONS ─────────────────────────────────────────────────────────────
 * • Every partner URL is built here so monetization is a single point of change.
 * • Every outbound link carries `rel="sponsored nofollow noopener"` (set at
 *   render time by AffiliatePanel) plus UTM parameters for attribution in
 *   partner dashboards.
 * • A placeholder ID still produces a *working* destination URL — it just
 *   won't attribute — so the site is safe to deploy before IDs arrive.
 */

const UTM = 'utm_source=wandr&utm_medium=affiliate&utm_campaign=nomad-intelligence';

export interface AffiliatePartner {
  id: string;
  name: string;
  tagline: string;
  cta: string;
  /** Builds a contextual destination URL (falls back to the generic link). */
  url: (destination?: string) => string;
}

function withUtm(url: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}${UTM}`;
}

export const AFFILIATES = {
  /** Travel/medical insurance for nomads (SafetyWing referral program). */
  insurance: {
    id: 'safetywing',
    name: 'SafetyWing',
    tagline: 'Nomad insurance — travel & medical cover in 175+ countries, billed monthly.',
    cta: 'Get covered',
    url: () =>
      withUtm('https://safetywing.com/?via=wandr'), // ← replace `wandr` with your referral code
  } satisfies AffiliatePartner,

  /** Co-living / flexible stays (Coliving.com marketplace). */
  coliving: {
    id: 'coliving',
    name: 'Coliving.com',
    tagline: 'Book co-living spaces by the month — community included.',
    cta: 'Browse co-living',
    url: (destination) =>
      withUtm(
        destination
          ? `https://www.coliving.com/search?location=${encodeURIComponent(destination)}`
          : 'https://www.coliving.com/',
      ),
  } satisfies AffiliatePartner,

  /** Activities & tours (GetYourGuide affiliate program). */
  activities: {
    id: 'getyourguide',
    name: 'GetYourGuide',
    tagline: 'Skip-the-line tours, food walks and day trips wherever you land.',
    cta: 'Explore activities',
    url: (destination) =>
      withUtm(
        destination
          ? `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination)}&partner_id=YOUR_GETYOURGUIDE_ID`
          : 'https://www.getyourguide.com/?partner_id=YOUR_GETYOURGUIDE_ID', // ← replace
      ),
  } satisfies AffiliatePartner,

  /** Activities alternate (Viator affiliate program). */
  tours: {
    id: 'viator',
    name: 'Viator',
    tagline: '300,000+ trips and experiences — free cancellation on most bookings.',
    cta: 'Find experiences',
    url: (destination) =>
      withUtm(
        destination
          ? `https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination)}&afflid=YOUR_VIATOR_ID`
          : 'https://www.viator.com/?afflid=YOUR_VIATOR_ID', // ← replace
      ),
  } satisfies AffiliatePartner,

  /** Accommodation (Booking.com affiliate). */
  stays: {
    id: 'booking',
    name: 'Booking.com',
    tagline: 'Hotels, apartments and guesthouses with free cancellation options.',
    cta: 'Find a stay',
    url: (destination) =>
      withUtm(
        destination
          ? `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}&aid=YOUR_BOOKING_AID`
          : 'https://www.booking.com/?aid=YOUR_BOOKING_AID', // ← replace
      ),
  } satisfies AffiliatePartner,
};

export const AFFILIATE_DISCLOSURE =
  'Affiliate links — we may earn a commission at no extra cost to you. It keeps Wandr free.';
