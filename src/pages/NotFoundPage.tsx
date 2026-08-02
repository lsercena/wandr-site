import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';

const QUICK_LINKS = [
  { to: '/explore', label: 'Explore Countries' },
  { to: '/digital-nomad-visas', label: 'Nomad Visas' },
  { to: '/visa-finder', label: 'Visa Finder' },
  { to: '/cost-calculator', label: 'Cost Calculator' },
  { to: '/compare', label: 'Compare Countries' },
  { to: '/assistant', label: 'AI Assistant' },
];

export default function NotFoundPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <SeoHead
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Search for a country or explore our travel intelligence platform."
        path="/404"
      />

      <div style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', alignItems: 'center' }}>
        <div className="container-narrow" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(80px, 15vw, 140px)',
              color: 'var(--mist)',
              lineHeight: 1,
              userSelect: 'none',
            }}
            aria-hidden="true"
          >
            404
          </p>

          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', margin: '16px 0 12px' }}>
            Page not found
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 40 }}>
            This destination doesn't exist in our database yet — or the URL may have changed.
          </p>

          <form onSubmit={handleSearch} role="search" style={{ marginBottom: 48 }}>
            <label htmlFor="not-found-search" className="sr-only">Search for a country</label>
            <div style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto' }}>
              <input
                id="not-found-search"
                type="search"
                className="form-input"
                placeholder="Search for a country…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </div>
          </form>

          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--subtle)', marginBottom: 16 }}>
            Popular pages
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {QUICK_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="chip">{l.label}</Link>
            ))}
          </div>

          <div style={{ marginTop: 40 }}>
            <Link to="/" className="btn btn-ghost">← Back to Home</Link>
          </div>
        </div>
      </div>
    </>
  );
}
