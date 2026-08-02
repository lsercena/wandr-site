import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import CountryCard from '@/components/ui/CountryCard';
import { countryService, guideService } from '@/services/countryService';
import { testimonials } from '@/data/countries';
import WorldMap from '@/components/map/WorldMap';
import './HomePage.css';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/explore?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <>
      <SeoHead
        title="Wandr — AI Travel Intelligence Platform"
        description="Can you legally go there? What visa do you qualify for? Can you afford to live there? Wandr answers every travel intelligence question."
        path="/"
      />

      {/* Hero */}
      <section className="hero">
        <div className="container hero__inner">
          <p className="hero__eyebrow">✦ Travel Intelligence Platform</p>
          <h1 className="hero__title">
            Know before<br /><em>you go anywhere</em>
          </h1>
          <p className="hero__subtitle">
            Visas, costs, safety, remote work — everything you need to travel smarter, work remotely, and live abroad with confidence.
          </p>

          <form className="hero__search" onSubmit={handleSearch} role="search">
            <label htmlFor="hero-search" className="sr-only">Where do you want to go?</label>
            <input
              id="hero-search"
              type="search"
              className="hero__search-input"
              placeholder="Where do you want to go?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary hero__search-btn">Search</button>
          </form>

          <div className="hero__actions">
            <Link to="/explore" className="btn btn-primary btn-lg">Explore Countries</Link>
            <Link to="/visa-finder" className="btn btn-secondary btn-lg">Find My Visa</Link>
            <Link to="/assistant" className="btn btn-ghost btn-lg">Ask AI</Link>
          </div>
        </div>
      </section>

      {/* Popular Countries */}
      <section className="section">
        <div className="container">
          <p className="section-label">Popular Destinations</p>
          <h2 className="section-title">Popular Countries</h2>
          <div className="grid-4">
            {countryService.getPopular().map((c) => (
              <CountryCard key={c.id} country={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Nomad */}
      <section className="section section--alt">
        <div className="container">
          <p className="section-label">Remote Work</p>
          <h2 className="section-title">Trending Nomad Destinations</h2>
          <p className="section-desc">Top-rated countries for digital nomads with visa programs, fast internet, and vibrant communities.</p>
          <div className="grid-4">
            {countryService.getTrendingNomad().map((c) => (
              <CountryCard key={c.id} country={c} showScores />
            ))}
          </div>
        </div>
      </section>

      {/* Cheapest & Safest side by side */}
      <section className="section">
        <div className="container">
          <div className="grid-2">
            <div>
              <p className="section-label">Budget</p>
              <h2 className="section-title">Cheapest Countries</h2>
              <div className="home-mini-grid">
                {countryService.getCheapest().map((c) => (
                  <CountryCard key={c.id} country={c} />
                ))}
              </div>
            </div>
            <div>
              <p className="section-label">Safety</p>
              <h2 className="section-title">Safest Countries</h2>
              <div className="home-mini-grid">
                {countryService.getSafest().map((c) => (
                  <CountryCard key={c.id} country={c} showScores />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="section section--alt">
        <div className="container">
          <p className="section-label">Knowledge Base</p>
          <h2 className="section-title">Featured Guides</h2>
          <div className="grid-3">
            {guideService.getFeatured().map((guide) => (
              <Link key={guide.id} to="/guides" className="guide-card card">
                <img src={guide.image} alt="" className="guide-card__img" loading="lazy" />
                <div className="guide-card__body">
                  <span className="badge badge-terra">{guide.category}</span>
                  <h3 className="guide-card__title">{guide.title}</h3>
                  <p className="guide-card__excerpt">{guide.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Digital Nomad Countries */}
      <section className="section">
        <div className="container">
          <p className="section-label">Visa Programs</p>
          <h2 className="section-title">Digital Nomad Countries</h2>
          <p className="section-desc">Countries with official remote work visa programs.</p>
          <div className="nomad-list">
            {countryService.getNomadVisas().map((c) => (
              <Link key={c.id} to={`/countries/${c.slug}`} className="nomad-list__item">
                <span className="nomad-list__flag">{c.overview.flag}</span>
                <div className="nomad-list__info">
                  <strong>{c.name}</strong>
                  <span>{c.digitalNomadVisa.name}</span>
                </div>
                <span className="nomad-list__income">{c.digitalNomadVisa.incomeRequirement}</span>
                <span className={`badge badge-${c.digitalNomadVisa.approvalDifficulty === 'easy' ? 'green' : 'gold'}`}>
                  {c.digitalNomadVisa.approvalDifficulty}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="section section--alt">
        <div className="container">
          <p className="section-label">Explore</p>
          <h2 className="section-title">Interactive World Map</h2>
          <p className="section-desc">Visualize visa requirements, nomad programs, safety, and cost of living worldwide.</p>
          <WorldMap />
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <p className="section-label">Community</p>
          <h2 className="section-title">What Travelers Say</h2>
          <div className="grid-3">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="testimonial card">
                <p className="testimonial__text">&ldquo;{t.text}&rdquo;</p>
                <footer className="testimonial__author">
                  <span className="testimonial__avatar">{t.avatar}</span>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role} · {t.location}</span>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container newsletter__inner">
          <h2>Stay ahead of visa changes</h2>
          <p>Weekly travel intelligence — visa updates, new nomad programs, and cost-of-living insights.</p>
          <form className="newsletter__form" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              className="newsletter__input"
              placeholder="your@email.com"
              required
            />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
          {/* TODO: Connect to newsletter API (Mailchimp, ConvertKit, etc.) */}
        </div>
      </section>
    </>
  );
}
