import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import PageLoader from '@/components/ui/PageLoader';
import ItineraryMarkdown from '@/components/itinerary/ItineraryMarkdown';
import ItineraryToolbar from '@/components/itinerary/ItineraryToolbar';
import ItineraryMap from '@/components/map/ItineraryMap';
import AffiliatePanel from '@/components/monetization/AffiliatePanel';
import { decodeTripPayload, tripService, buildShareUrl } from '@/services/libraryService';
import type { TripItinerary } from '@/types';
import './ShareItineraryPage.css';

/**
 * Public, read-only view of a shared itinerary: `/itinerary/share/:id`.
 * The trip resolves from the `#d=` payload (works for anyone, no database),
 * the local library, or the Supabase mirror — in that order.
 */
export default function ShareItineraryPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [trip, setTrip] = useState<TripItinerary | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found'>('loading');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (!id) {
        setStatus('not-found');
        return;
      }

      // 1) Payload embedded in the share URL
      const hashMatch = location.hash.match(/[#&]d=([^&]+)/);
      if (hashMatch) {
        const decoded = decodeTripPayload(hashMatch[1]);
        if (decoded && decoded.id === id && !cancelled) {
          setTrip(decoded);
          setStatus('ready');
          return;
        }
      }

      // 2) Local library / cloud mirror
      const found = await tripService.getShared(id);
      if (cancelled) return;
      if (found) {
        setTrip(found);
        setStatus('ready');
      } else {
        setStatus('not-found');
      }
    };

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [id, location.hash]);

  const copyLink = async () => {
    if (!trip) return;
    try {
      await navigator.clipboard.writeText(buildShareUrl(trip));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this share link:', buildShareUrl(trip));
    }
  };

  if (status === 'loading') return <PageLoader />;

  if (status === 'not-found' || !trip) {
    return (
      <>
        <SeoHead title="Itinerary not found" description="This shared itinerary link is invalid or has expired." path={`/itinerary/share/${id ?? ''}`} />
        <div className="section share-page">
          <div className="container-narrow share-notfound">
            <div className="share-notfound__icon" aria-hidden="true">🧭</div>
            <h1>Itinerary not found</h1>
            <p>This link is invalid, incomplete, or the trip was deleted by its owner.</p>
            <div className="share-notfound__actions">
              <Link to="/travel-planner" className="btn btn-primary">Create your own itinerary</Link>
              <Link to="/dashboard" className="btn btn-secondary">Go to dashboard</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title={trip.title}
        description={`Shared Wandr itinerary: ${trip.destination} · ${trip.duration}`}
        path={`/itinerary/share/${trip.id}`}
      />

      <div className="section share-page">
        <div className="container-narrow">
          <div className="share-header">
            <div className="share-header__text">
              <p className="section-label">Shared itinerary</p>
              <h1>{trip.title}</h1>
              <p className="share-header__meta">
                {trip.destination} · {trip.duration}
                {trip.startDate ? ` · starts ${new Date(`${trip.startDate}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
              </p>
            </div>
            <div className="share-header__actions">
              <button type="button" className="btn btn-secondary" onClick={() => void copyLink()}>
                {copied ? '✓ Link copied' : 'Copy link'}
              </button>
            </div>
          </div>

          <ItineraryToolbar
            compact
            title={trip.title}
            destination={trip.destination}
            duration={trip.duration}
            content={trip.content}
            startDate={trip.startDate}
            trip={trip}
          />

          <div className="card share-content">
            <ItineraryMarkdown content={trip.content} />
          </div>

          <div className="share-map">
            <h2>Route map</h2>
            <ItineraryMap content={trip.content} destination={trip.destination} />
          </div>

          <AffiliatePanel destination={trip.destination} variant="itinerary" />

          <div className="share-cta">
            <p>Plan your own trip with Wandr AI — free, private, and offline-ready.</p>
            <div>
              <Link to="/travel-planner" className="btn btn-primary">Plan a trip</Link>
              <Link to="/dashboard" className="btn btn-secondary">Open dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
