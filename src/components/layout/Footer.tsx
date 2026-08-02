import { Link } from 'react-router-dom';
import './Footer.css';

const FOOTER_SEO_LINKS = [
  { slug: 'cheapest-countries-digital-nomads', h1: 'Cheapest Countries for Digital Nomads' },
  { slug: 'best-digital-nomad-visas', h1: 'Best Digital Nomad Visas' },
  { slug: 'europe-digital-nomad-visa', h1: 'Europe Digital Nomad Visas' },
  { slug: 'best-countries-remote-work', h1: 'Best Countries for Remote Work' },
  { slug: 'tax-free-countries-digital-nomads', h1: 'Tax-Free Countries for Nomads' },
];

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo">✦ Wandr</div>
            <p className="footer__tagline">
              AI-powered travel intelligence. Know before you go.
            </p>
          </div>

          <div className="footer__col">
            <p className="footer__heading">Platform</p>
            <Link to="/explore">Explore Countries</Link>
            <Link to="/visa-finder">Visa Finder</Link>
            <Link to="/cost-calculator">Cost Calculator</Link>
            <Link to="/compare">Compare Countries</Link>
            <Link to="/assistant">AI Assistant</Link>
          </div>

          <div className="footer__col">
            <p className="footer__heading">Resources</p>
            <Link to="/digital-nomad-visas">Nomad Visas</Link>
            <Link to="/guides">Travel Guides</Link>
            <Link to="/resources">Tax Intelligence</Link>
            <Link to="/travel-planner">Trip Planner</Link>
          </div>

          <div className="footer__col">
            <p className="footer__heading">Popular Guides</p>
            {FOOTER_SEO_LINKS.map((page) => (
              <Link key={page.slug} to={`/seo/${page.slug}`}>{page.h1}</Link>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} <strong>Wandr</strong>. All rights reserved.</p>
          <p className="footer__disclaimer">
            Information is for guidance only. Always verify with official government sources.
          </p>
        </div>
      </div>
    </footer>
  );
}
