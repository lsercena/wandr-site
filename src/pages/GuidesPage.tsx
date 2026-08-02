import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import { guideService } from '@/services/countryService';
import NewsletterForm from '@/components/ui/NewsletterForm';
import type { TravelGuide } from '@/types';
import './GuidesPage.css';

const CATEGORIES = ['All', 'Visas', 'Nomad Life', 'Tax', 'Housing', 'Budgeting', 'Safety'];

function GuideCard({ guide, large }: { guide: TravelGuide; large?: boolean }) {
  return (
    <Link
      to={`/guides`}
      className={`card guide-card${large ? ' guide-card--large' : ''}`}
      aria-label={guide.title}
    >
      <img
        src={guide.image}
        alt=""
        className="guide-card__img"
        loading="lazy"
        width={large ? 800 : 400}
        height={large ? 480 : 240}
      />
      <div className="guide-card__body">
        <span className="badge badge-terra">{guide.category}</span>
        <h2 className={`guide-card__title${large ? ' guide-card__title--lg' : ''}`}>{guide.title}</h2>
        <p className="guide-card__excerpt">{guide.excerpt}</p>
        {large && (
          <div className="guide-card__meta">
            <span>{guide.author}</span>
            <span>·</span>
            <time dateTime={guide.publishedAt}>{new Date(guide.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function GuidesPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const allGuides = guideService.getAll();
  const filtered = activeCategory === 'All'
    ? allGuides
    : allGuides.filter((g) => g.category === activeCategory);

  const [featured, ...rest] = filtered;

  return (
    <>
      <SeoHead
        title="Travel Guides"
        description="Expert guides on digital nomad visas, tax residency, cost of living, remote work, and living abroad. Deep-dive articles for serious travelers."
        path="/guides"
      />

      <div className="section">
        <div className="container">
          <p className="section-label">Knowledge Base</p>
          <h1 className="section-title">Travel Guides</h1>
          <p className="section-desc">
            Expert deep-dives on visas, taxes, nomad life, and living abroad written for travelers who do their research.
          </p>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '60px 0' }}>
              No guides in this category yet.
            </p>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <div style={{ marginBottom: 40 }}>
                  <GuideCard guide={featured} large />
                </div>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid-3">
                  {rest.map((guide) => (
                    <GuideCard key={guide.id} guide={guide} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Newsletter CTA */}
          <div className="newsletter" style={{ marginTop: 80, borderRadius: 'var(--radius)', padding: '48px 40px' }}>
            <div className="container-narrow">
              <h2>Never miss a visa update</h2>
              <p>Weekly travel intelligence — visa changes, new nomad programs, and destination deep-dives.</p>
              <NewsletterForm inputId="guides-newsletter-email" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
