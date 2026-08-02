import { Link } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import { countryService, guideService } from '@/services/countryService';
import './AdminPage.css';

// TODO: Replace with real auth gate — redirect to /login if not authenticated
// TODO: Connect to CMS / database when backend is ready

const STATS = [
  { label: 'Countries', value: 0, icon: '🌍', to: '/explore' },
  { label: 'Guides', value: 0, icon: '📖', to: '/guides' },
  { label: 'Nomad Visas', value: 0, icon: '✈️', to: '/digital-nomad-visas' },
  { label: 'Users', value: '—', icon: '👤', to: '#' },
];

const QUICK_ACTIONS = [
  { label: 'Add Country', desc: 'Add a new country to the database', icon: '🌍', to: '#' },
  { label: 'Update Visa', desc: 'Edit visa requirements for a country', icon: '📋', to: '#' },
  { label: 'Publish Guide', desc: 'Write and publish a travel guide', icon: '✍️', to: '#' },
  { label: 'SEO Pages', desc: 'Manage dynamic SEO landing pages', icon: '📈', to: '#' },
  { label: 'Newsletter', desc: 'Compose and send a newsletter', icon: '✉️', to: '#' },
  { label: 'Analytics', desc: 'View traffic and engagement data', icon: '📊', to: '#' },
];

// Mock recent activity for display
const RECENT_ACTIVITY = [
  { action: 'Portugal D8 visa income requirement updated', time: '2 hours ago', type: 'visa' },
  { action: 'New guide published: "Georgia 365-Day Visa Guide"', time: '1 day ago', type: 'guide' },
  { action: 'Colombia digital nomad data refreshed', time: '3 days ago', type: 'country' },
  { action: 'Thailand LTR visa processing time updated', time: '5 days ago', type: 'visa' },
  { action: 'SEO page: "Cheapest Countries for Digital Nomads" updated', time: '1 week ago', type: 'seo' },
];

const TYPE_BADGES: Record<string, string> = {
  visa: 'badge-gold',
  guide: 'badge-green',
  country: 'badge-terra',
  seo: 'badge-gold',
};

export default function AdminPage() {
  const countries = countryService.getAll();
  const guides = guideService.getAll();
  const nomadVisas = countryService.getNomadVisas();

  const liveStats = [
    { ...STATS[0], value: countries.length },
    { ...STATS[1], value: guides.length },
    { ...STATS[2], value: nomadVisas.length },
    { ...STATS[3] },
  ];

  return (
    <>
      <SeoHead
        title="Admin Dashboard"
        description="Wandr admin dashboard — manage countries, visas, guides, and users."
        path="/admin"
      />

      <div className="section">
        <div className="container">
          <div className="admin-header">
            <div>
              <p className="section-label">Content Management</p>
              <h1 className="section-title" style={{ marginBottom: 0 }}>Admin Dashboard</h1>
            </div>
            <div className="admin-header__actions">
              <Link to="/" className="btn btn-ghost">← Back to Site</Link>
              <button type="button" className="btn btn-secondary" onClick={() => { /* TODO: logout */ }}>
                Sign Out
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="admin-stats">
            {liveStats.map((stat) => (
              <Link key={stat.label} to={stat.to} className="admin-stat card">
                <span className="admin-stat__icon" aria-hidden="true">{stat.icon}</span>
                <strong className="admin-stat__value">{stat.value}</strong>
                <span className="admin-stat__label">{stat.label}</span>
              </Link>
            ))}
          </div>

          <div className="admin-grid">
            {/* Quick actions */}
            <div>
              <h2 className="admin-section-title">Quick Actions</h2>
              <div className="admin-actions">
                {QUICK_ACTIONS.map((action) => (
                  <a
                    key={action.label}
                    href={action.to}
                    className="admin-action card"
                    onClick={(e) => { if (action.to === '#') e.preventDefault(); }}
                  >
                    <span className="admin-action__icon" aria-hidden="true">{action.icon}</span>
                    <div>
                      <strong>{action.label}</strong>
                      <p>{action.desc}</p>
                    </div>
                    <span className="admin-action__arrow">→</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div>
              <h2 className="admin-section-title">Recent Activity</h2>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {RECENT_ACTIVITY.map((item, i) => (
                  <div key={i} className="admin-activity-item">
                    <div className="admin-activity-item__content">
                      <span className={`badge ${TYPE_BADGES[item.type] || 'badge-gold'}`}>{item.type}</span>
                      <p>{item.action}</p>
                    </div>
                    <time className="admin-activity-item__time">{item.time}</time>
                  </div>
                ))}
              </div>

              {/* Countries table */}
              <h2 className="admin-section-title" style={{ marginTop: 32 }}>Countries</h2>
              <div className="card admin-table">
                <table>
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Region</th>
                      <th>Nomad Visa</th>
                      <th>Last Updated</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <span style={{ marginRight: 8 }}>{c.overview.flag}</span>
                          {c.name}
                        </td>
                        <td style={{ color: 'var(--subtle)', fontSize: 13 }}>{c.overview.region}</td>
                        <td>
                          {c.digitalNomadVisa.available
                            ? <span className="badge badge-green">Yes</span>
                            : <span className="badge badge-gold">No</span>}
                        </td>
                        <td style={{ color: 'var(--subtle)', fontSize: 12 }}>{c.visa.lastUpdated}</td>
                        <td>
                          <Link to={`/countries/${c.slug}`} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}>
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
