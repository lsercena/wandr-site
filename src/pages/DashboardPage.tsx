import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import CountryCard from '@/components/ui/CountryCard';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { countryService, guideService } from '@/services/countryService';
import { buildShareUrl, tripService } from '@/services/libraryService';
import PageLoader from '@/components/ui/PageLoader';
import type { TripItinerary } from '@/types';
import './DashboardPage.css';

type Tab = 'countries' | 'guides' | 'trips';

export default function DashboardPage() {
  const { user, loading, signOut, mode, updateName } = useAuth();
  const { savedCountries, savedGuides, trips, removeTrip, toggleCountry, toggleGuide, refresh } = useLibrary();
  const location = useLocation();
  const [tab, setTab] = useState<Tab>('countries');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');

  if (loading) return <PageLoader />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const savedCountryCards = savedCountries
    .map((e) => countryService.getBySlug(e.slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const savedGuideItems = savedGuides
    .map((e) => guideService.getBySlug(e.slug))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  const copyShareLink = async (trip: TripItinerary) => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(trip));
      setCopiedId(trip.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      window.prompt('Copy your share link:', buildShareUrl(trip));
    }
  };

  const startRename = (trip: TripItinerary) => {
    setRenaming(trip.id);
    setRenameValue(trip.title);
  };

  const commitRename = (trip: TripItinerary) => {
    const title = renameValue.trim();
    if (title && title !== trip.title) {
      tripService.update(trip.id, { title });
      refresh();
    }
    setRenaming(null);
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'countries', label: 'Saved Countries', count: savedCountryCards.length },
    { key: 'guides', label: 'Saved Guides', count: savedGuideItems.length },
    { key: 'trips', label: 'My Itineraries', count: trips.length },
  ];

  return (
    <>
      <SeoHead
        title="My Dashboard"
        description="Your saved countries, guides, and AI-generated trip itineraries in one place."
        path="/dashboard"
      />

      <div className="section dashboard">
        <div className="container">
          <header className="dashboard__header">
            <div>
              <p className="section-label">Personal Dashboard</p>
              <h1 className="section-title">Welcome back, {user.name.split(' ')[0] || 'Traveler'}</h1>
              <p className="section-desc">
                {mode === 'supabase'
                  ? 'Your account is synced — saved trips are available on every device.'
                  : 'Local account — your saves are stored on this device and work offline.'}
              </p>
            </div>
            <div className="dashboard__account">
              <span className="badge badge-green">{user.email}</span>
              <Link to="/schengen-tracker" className="btn btn-secondary">Schengen</Link>
              <Link to="/tax-tracker" className="btn btn-secondary">Tax days</Link>
              <button type="button" className="btn btn-secondary" onClick={() => setProfileOpen((v) => !v)}>
                Profile
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
                Sign out
              </button>
            </div>
          </header>

          {profileOpen && (
            <form
              className="card dashboard__profile"
              onSubmit={async (e) => {
                e.preventDefault();
                if (profileName.trim()) await updateName(profileName.trim());
                setProfileOpen(false);
              }}
            >
              <label className="form-label" htmlFor="profile-name">Display name</label>
              <div className="dashboard__profile-row">
                <input
                  id="profile-name"
                  className="form-input"
                  value={profileName || user.name}
                  onChange={(e) => setProfileName(e.target.value)}
                  autoComplete="name"
                />
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          )}

          <div className="dashboard__tabs" role="tablist" aria-label="Library sections">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                className={`chip ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label} <span className="dashboard__count">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="dashboard__body">
            {tab === 'countries' && (
              savedCountryCards.length > 0 ? (
                <div className="grid-3 dashboard__grid">
                  {savedCountryCards.map((c) => (
                    <div key={c.slug} className="dashboard__saveable">
                      <CountryCard country={c} showScores />
                      <button
                        type="button"
                        className="dashboard__remove"
                        onClick={() => toggleCountry(c.slug)}
                      >
                        ✕ Remove from saved
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="🌍"
                  title="No saved countries yet"
                  body="Tap “Save to dashboard” on any country page to build your shortlist."
                  cta={{ label: 'Explore countries', to: '/explore' }}
                />
              )
            )}

            {tab === 'guides' && (
              savedGuideItems.length > 0 ? (
                <div className="dashboard__guides">
                  {savedGuideItems.map((g) => (
                    <div key={g.slug} className="card dashboard__guide">
                      <span className="badge badge-terra">{g.category}</span>
                      <h3>{g.title}</h3>
                      <p>{g.excerpt}</p>
                      <div className="dashboard__guide-actions">
                        <Link to={`/guides`} className="btn btn-secondary">Read guide</Link>
                        <button type="button" className="btn btn-ghost" onClick={() => toggleGuide(g.slug)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="📚"
                  title="No saved guides yet"
                  body="Bookmark guides from the Guides page to read them later — even offline."
                  cta={{ label: 'Browse guides', to: '/guides' }}
                />
              )
            )}

            {tab === 'trips' && (
              trips.length > 0 ? (
                <div className="dashboard__trips">
                  {trips.map((trip) => (
                    <div key={trip.id} className="card dashboard__trip">
                      <div className="dashboard__trip-main">
                        {renaming === trip.id ? (
                          <form
                            className="dashboard__rename"
                            onSubmit={(e) => { e.preventDefault(); commitRename(trip); }}
                          >
                            <input
                              className="form-input"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              autoFocus
                              aria-label="Itinerary title"
                            />
                            <button type="submit" className="btn btn-primary">Save</button>
                          </form>
                        ) : (
                          <>
                            <h3>{trip.title}</h3>
                            <p>
                              {trip.destination} · {trip.duration}
                              {trip.startDate ? ` · starts ${trip.startDate}` : ''}
                            </p>
                            <span className="dashboard__trip-meta">
                              Updated {new Date(trip.updatedAt).toLocaleDateString()}
                              {' · '}ID {trip.id}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="dashboard__trip-actions">
                        <Link to={`/itinerary/share/${trip.id}`} className="btn btn-secondary">Open</Link>
                        <button type="button" className="btn btn-secondary" onClick={() => void copyShareLink(trip)}>
                          {copiedId === trip.id ? '✓ Copied' : 'Copy share link'}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => startRename(trip)}>
                          Rename
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost dashboard__danger"
                          onClick={() => {
                            if (window.confirm(`Delete “${trip.title}”? This can't be undone.`)) {
                              removeTrip(trip.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="🗺"
                  title="No itineraries yet"
                  body="Generate a trip with the AI Travel Planner, then save it to your dashboard for sharing and offline access."
                  cta={{ label: 'Plan a trip', to: '/travel-planner' }}
                />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function EmptyState({
  icon,
  title,
  body,
  cta,
}: {
  icon: string;
  title: string;
  body: string;
  cta: { label: string; to: string };
}) {
  return (
    <div className="dashboard__empty">
      <div className="dashboard__empty-icon" aria-hidden="true">{icon}</div>
      <h2>{title}</h2>
      <p>{body}</p>
      <Link to={cta.to} className="btn btn-primary">{cta.label}</Link>
    </div>
  );
}
