import { AFFILIATES, AFFILIATE_DISCLOSURE } from '@/config/affiliates';
import './AffiliatePanel.css';

interface Props {
  /** Free-text destination ("Lisbon, Portugal") — drives contextual links. */
  destination?: string;
  /** 'country' shows insurance + stays + activities; 'itinerary' shows trips focus. */
  variant?: 'country' | 'itinerary';
}

/**
 * Contextual affiliate hooks for city/country profiles and AI itineraries.
 * Contextual = the destination is injected into search links, which converts
 * far better than generic banners.
 */
export default function AffiliatePanel({ destination, variant = 'country' }: Props) {
  const cards =
    variant === 'itinerary'
      ? [
          { partner: AFFILIATES.insurance, focus: 'Before you go — cover for the whole trip' },
          { partner: AFFILIATES.activities, focus: 'Book the highlights in ' + (destination || 'your destination') },
          { partner: AFFILIATES.stays, focus: 'Where to stay' },
        ]
      : [
          { partner: AFFILIATES.insurance, focus: 'Stay covered while based here' },
          { partner: AFFILIATES.coliving, focus: 'Live with other nomads' },
          { partner: AFFILIATES.activities, focus: 'Things to do' },
          { partner: AFFILIATES.tours, focus: 'Day trips & tours' },
        ];

  return (
    <aside className="affiliates" aria-label="Recommended services">
      <p className="section-label">Recommended for {destination || 'nomads'}</p>
      <div className="affiliates__grid">
        {cards.map(({ partner, focus }) => (
          <a
            key={partner.id}
            className="affiliate-card"
            href={partner.url(destination)}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
          >
            <span className="affiliate-card__focus">{focus}</span>
            <strong className="affiliate-card__name">{partner.name}</strong>
            <span className="affiliate-card__tagline">{partner.tagline}</span>
            <span className="affiliate-card__cta">{partner.cta} ↗</span>
          </a>
        ))}
      </div>
      <p className="affiliates__disclosure">{AFFILIATE_DISCLOSURE}</p>
    </aside>
  );
}
