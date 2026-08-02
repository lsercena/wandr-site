import { useParams, Link } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import CountryCard from '@/components/ui/CountryCard';
import { seoService, countryService } from '@/services/countryService';
import NotFoundPage from './NotFoundPage';

export default function SeoPage() {
  const { slug } = useParams<{ slug: string }>();
  const meta = seoService.getBySlug(slug ?? '');

  if (!meta) return <NotFoundPage />;

  const countries = countryService.filter(meta.filterKey, meta.filterValue);

  return (
    <>
      <SeoHead
        title={meta.title}
        description={meta.description}
        path={`/seo/${meta.slug}`}
      />

      <div className="section">
        <div className="container">
          <p className="section-label">Travel Intelligence</p>
          <h1 className="section-title">{meta.h1}</h1>
          <p className="section-desc">{meta.description}</p>

          {countries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <p>No countries match this filter yet.</p>
              <Link to="/explore" className="btn btn-secondary" style={{ marginTop: 16 }}>
                Browse All Countries
              </Link>
            </div>
          ) : (
            <div className="grid-4">
              {countries.map((c) => (
                <CountryCard key={c.id} country={c} showScores />
              ))}
            </div>
          )}

          {/* Related SEO pages */}
          <div style={{ marginTop: 64 }}>
            <h2 style={{ fontSize: 22, marginBottom: 20 }}>Explore More</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {seoService.getAll()
                .filter((p) => p.slug !== meta.slug)
                .slice(0, 6)
                .map((p) => (
                  <Link key={p.slug} to={`/seo/${p.slug}`} className="chip">
                    {p.title}
                  </Link>
                ))}
            </div>
          </div>

          {/* CTA */}
          <div className="card" style={{ display: 'flex', gap: 32, alignItems: 'center', padding: 40, marginTop: 48, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 24, marginBottom: 8 }}>Not sure where to go?</h2>
              <p style={{ color: 'var(--muted)', fontSize: 15 }}>
                Answer 4 quick questions and our AI Visa Finder will recommend the best countries for your passport, income, and goals.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
              <Link to="/visa-finder" className="btn btn-primary">Find My Visa</Link>
              <Link to="/assistant" className="btn btn-secondary">Ask AI</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
