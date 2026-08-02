import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/explore', label: 'Explore Countries' },
  { to: '/digital-nomad-visas', label: 'Digital Nomad Visas' },
  { to: '/visa-finder', label: 'Visa Finder' },
  { to: '/travel-planner', label: 'Travel Planner' },
  { to: '/cost-calculator', label: 'Cost Calculator' },
  { to: '/compare', label: 'Compare' },
  { to: '/guides', label: 'Guides' },
  { to: '/resources', label: 'Resources' },
  { to: '/assistant', label: 'AI Assistant' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo" aria-label="Wandr home">
          <span className="navbar__logo-mark">✦</span> Wandr
        </Link>

        <div className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__link ${location.pathname === link.to ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/login" className="navbar__login btn btn-primary">Login</Link>
        </div>

        <button
          className="navbar__toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
