import SeoHead from '@/components/ui/SeoHead';
import { Link } from 'react-router-dom';
import './ResourcesPage.css';

interface ResourceLink { label: string; url: string; external?: boolean }
interface ResourceCard { title: string; description: string; links: ResourceLink[] }

const TAX_RESOURCES: ResourceCard[] = [
  {
    title: '183-Day Rule',
    description: 'Most countries consider you a tax resident after spending 183 days in a calendar year. Understanding this rule is essential for nomads.',
    links: [
      { label: 'IRS Foreign Earned Income', url: 'https://www.irs.gov/individuals/international-taxpayers/foreign-earned-income-exclusion', external: true },
      { label: 'Nomad Tax Guide', url: '/guides' },
    ],
  },
  {
    title: 'Territorial Tax Countries',
    description: 'Countries like Panama, Costa Rica, and Georgia only tax income earned within their borders — foreign-sourced income is often tax-free.',
    links: [{ label: 'Compare Tax Systems', url: '/compare' }],
  },
  {
    title: 'Zero Income Tax Countries',
    description: 'Bahrain, UAE, Cayman Islands, and others levy no personal income tax. Understand residency requirements before planning a move.',
    links: [{ label: 'Tax Comparison Tool', url: '/compare' }],
  },
  {
    title: 'Double Tax Treaties',
    description: 'Many countries have bilateral agreements to prevent you from being taxed on the same income twice. Check your country pairs.',
    links: [
      { label: 'OECD Tax Treaties', url: 'https://www.oecd.org/tax/treaties/', external: true },
    ],
  },
  {
    title: 'Foreign Earned Income Exclusion (FEIE)',
    description: 'US citizens living abroad can exclude up to ~$126,500 (2024) of foreign-earned income using the FEIE — Form 2555 required.',
    links: [
      { label: 'IRS Form 2555', url: 'https://www.irs.gov/forms-pubs/about-form-2555', external: true },
    ],
  },
  {
    title: 'Portugal NHR / IFICI Regime',
    description: 'Portugal\'s Non-Habitual Resident regime (now IFICI) offers 20% flat tax on Portuguese-sourced income for qualifying residents.',
    links: [
      { label: 'Portugal Tax Authority', url: 'https://www.portaldasfinancas.gov.pt', external: true },
    ],
  },
];

const BANKING_RESOURCES: ResourceCard[] = [
  {
    title: 'Multi-Currency Accounts',
    description: 'Accounts designed for frequent travelers with low FX fees and global ATM access.',
    links: [
      { label: 'Wise (formerly TransferWise)', url: 'https://wise.com', external: true },
      { label: 'Revolut', url: 'https://www.revolut.com', external: true },
      { label: 'Charles Schwab (US)', url: 'https://www.schwab.com', external: true },
    ],
  },
  {
    title: 'International Transfers',
    description: 'Send money across borders with minimal fees using specialist providers instead of banks.',
    links: [
      { label: 'Wise', url: 'https://wise.com', external: true },
      { label: 'OFX', url: 'https://www.ofx.com', external: true },
    ],
  },
  {
    title: 'Crypto Banking',
    description: 'Some nomads use crypto-friendly banks for easy access to funds in countries with strict banking regulations.',
    links: [],
  },
];

const HEALTH_RESOURCES: ResourceCard[] = [
  {
    title: 'Travel Insurance',
    description: 'Short-trip coverage for medical emergencies, trip cancellations, and lost luggage.',
    links: [
      { label: 'SafetyWing Nomad Insurance', url: 'https://safetywing.com', external: true },
      { label: 'World Nomads', url: 'https://www.worldnomads.com', external: true },
    ],
  },
  {
    title: 'Expat Health Insurance',
    description: 'Comprehensive international health coverage for long-term stays and residency.',
    links: [
      { label: 'Cigna Global', url: 'https://www.cigna.com/global', external: true },
      { label: 'Allianz Care', url: 'https://www.allianzcare.com', external: true },
    ],
  },
  {
    title: 'Vaccinations',
    description: 'Required or recommended vaccinations vary by destination. Check official advisories before traveling.',
    links: [
      { label: 'CDC Traveler\'s Health', url: 'https://wwwnc.cdc.gov/travel', external: true },
      { label: 'WHO Travel Advice', url: 'https://www.who.int/travel-advice', external: true },
    ],
  },
];

const CONNECTIVITY_RESOURCES: ResourceCard[] = [
  {
    title: 'eSIM Providers',
    description: 'Get a local data SIM without a physical card — works in 150+ countries.',
    links: [
      { label: 'Airalo', url: 'https://www.airalo.com', external: true },
      { label: 'Nomad eSIM', url: 'https://www.getnomad.app', external: true },
      { label: 'Holafly', url: 'https://esim.holafly.com', external: true },
    ],
  },
  {
    title: 'VPN Services',
    description: 'A VPN is essential for public WiFi security and accessing services from home while abroad.',
    links: [
      { label: 'Mullvad', url: 'https://mullvad.net', external: true },
      { label: 'ProtonVPN', url: 'https://protonvpn.com', external: true },
    ],
  },
  {
    title: 'Coworking Space Finders',
    description: 'Find coworking spaces, cafes with fast WiFi, and nomad hubs worldwide.',
    links: [
      { label: 'Coworker.com', url: 'https://www.coworker.com', external: true },
      { label: 'Nomad List', url: 'https://nomadlist.com', external: true },
    ],
  },
];

const OFFICIAL_RESOURCES = [
  { label: 'US Travel Advisories', url: 'https://travel.state.gov', flag: '🇺🇸' },
  { label: 'UK Foreign Travel Advice (FCDO)', url: 'https://www.gov.uk/foreign-travel-advice', flag: '🇬🇧' },
  { label: 'EU Travel Safety Tips', url: 'https://ec.europa.eu/consularprotection', flag: '🇪🇺' },
  { label: 'Canadian Travel Advice', url: 'https://travel.gc.ca', flag: '🇨🇦' },
  { label: 'Australian Smart Traveller', url: 'https://www.smartraveller.gov.au', flag: '🇦🇺' },
  { label: 'Passport Index (Visa-Free Access)', url: 'https://www.passportindex.org', flag: '🌍' },
  { label: 'IATA Travel Centre', url: 'https://www.iatatravelcentre.com', flag: '✈️' },
  { label: 'Numbeo Cost of Living Data', url: 'https://www.numbeo.com/cost-of-living/', flag: '💰' },
];

function Section({ title, cards }: { title: string; cards: ResourceCard[] }) {
  return (
    <div className="resource-section">
      <h2 className="resource-section__title">{title}</h2>
      <div className="resource-grid">
        {cards.map((card) => (
          <div key={card.title} className="resource-card card">
            <h3 className="resource-card__title">{card.title}</h3>
            <p className="resource-card__desc">{card.description}</p>
            {card.links.length > 0 && (
              <ul className="resource-card__links">
                {card.links.map((link) => (
                  <li key={link.url}>
                    {link.external ? (
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                        {link.label} ↗
                      </a>
                    ) : (
                      <Link to={link.url} className="resource-link">{link.label} →</Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <>
      <SeoHead
        title="Travel Resources"
        description="Curated resources for digital nomads and long-term travelers. Tax treaties, banking, health insurance, eSIMs, coworking, and official government travel advisories."
        path="/resources"
      />

      <div className="section">
        <div className="container">
          <p className="section-label">Reference Library</p>
          <h1 className="section-title">Resources</h1>
          <p className="section-desc">
            Curated tools, links, and knowledge for digital nomads and long-term travelers.
          </p>

          {/* Quick tools */}
          <div className="resource-tools">
            {[
              { icon: '🔍', label: 'Find My Visa', desc: 'Personalized visa recommendations', to: '/visa-finder' },
              { icon: '💰', label: 'Cost Calculator', desc: 'Monthly budget by country', to: '/cost-calculator' },
              { icon: '⚖️', label: 'Compare Countries', desc: 'Side-by-side comparison', to: '/compare' },
              { icon: '🤖', label: 'Ask AI', desc: 'Instant travel intelligence', to: '/assistant' },
            ].map((tool) => (
              <Link key={tool.to} to={tool.to} className="resource-tool card">
                <span className="resource-tool__icon" aria-hidden="true">{tool.icon}</span>
                <div>
                  <strong>{tool.label}</strong>
                  <span>{tool.desc}</span>
                </div>
              </Link>
            ))}
          </div>

          <Section title="Tax Intelligence" cards={TAX_RESOURCES} />
          <Section title="Banking & Money" cards={BANKING_RESOURCES} />
          <Section title="Health Insurance" cards={HEALTH_RESOURCES} />
          <Section title="Connectivity" cards={CONNECTIVITY_RESOURCES} />

          {/* Official sources */}
          <div className="resource-section">
            <h2 className="resource-section__title">Official Government Sources</h2>
            <div className="official-grid">
              {OFFICIAL_RESOURCES.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="official-link card"
                >
                  <span>{r.flag}</span>
                  <span>{r.label}</span>
                  <span className="official-link__arrow">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
