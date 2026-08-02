import { Link } from 'react-router-dom';
import type { Country } from '@/types';
import ScoreBar from './ScoreBar';
import './CountryCard.css';

interface CountryCardProps {
  country: Country;
  showScores?: boolean;
}

export default function CountryCard({ country, showScores = false }: CountryCardProps) {
  return (
    <Link to={`/countries/${country.slug}`} className="country-card card fade-in">
      <div className="country-card__image-wrap">
        <img
          src={country.image}
          alt={`${country.name} landscape`}
          className="country-card__image"
          loading="lazy"
          width={400}
          height={260}
        />
        <span className="country-card__flag" aria-hidden="true">{country.overview.flag}</span>
      </div>
      <div className="country-card__body">
        <h3 className="country-card__name">{country.name}</h3>
        <p className="country-card__tagline">{country.tagline}</p>
        <div className="country-card__meta">
          <span className="badge badge-terra">{country.overview.capital}</span>
          {country.digitalNomadVisa.available && (
            <span className="badge badge-green">Nomad Visa</span>
          )}
          {country.visa.visaFree && (
            <span className="badge badge-gold">Visa-Free</span>
          )}
        </div>
        {showScores && (
          <div className="country-card__scores">
            <ScoreBar label="Safety" value={country.overview.safetyScore} />
            <ScoreBar label="Nomad" value={country.overview.digitalNomadScore} />
          </div>
        )}
        <div className="country-card__cost">
          From <strong>${country.costOfLiving.monthlyBudget.budget}</strong>/mo
        </div>
      </div>
    </Link>
  );
}
