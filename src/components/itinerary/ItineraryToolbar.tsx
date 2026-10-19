import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  downloadItineraryPdf,
  downloadItineraryIcs,
  copyTextToClipboard,
} from '@/utils/tripExport';
import { buildShareUrl } from '@/services/libraryService';
import type { TripItinerary } from '@/types';
import './ItineraryToolbar.css';

interface Props {
  title: string;
  destination: string;
  duration: string;
  content: string;
  startDate?: string;
  /** True when the viewer is signed in and can save trips. */
  canSave?: boolean;
  /** Persist the trip; must return the stored record (used for share links). */
  onSave?: () => TripItinerary;
  /** Trip already persisted (share pages go straight to "Copy share link"). */
  trip?: TripItinerary | null;
  compact?: boolean;
}

/**
 * Export + save toolbar for generated itineraries:
 * Copy Markdown · Download PDF · Export iCal · Save to dashboard · Share link.
 */
export default function ItineraryToolbar({
  title,
  destination,
  duration,
  content,
  startDate,
  canSave,
  onSave,
  trip,
  compact,
}: Props) {
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [savedTrip, setSavedTrip] = useState<TripItinerary | null>(trip ?? null);

  const exportInput = { title, destination, duration, content, startDate };

  const handleCopyMarkdown = async () => {
    const ok = await copyTextToClipboard(content);
    if (ok) {
      setCopiedMarkdown(true);
      window.setTimeout(() => setCopiedMarkdown(false), 2000);
    }
  };

  const handleSave = () => {
    if (!onSave) return;
    const record = onSave();
    setSavedTrip(record);
  };

  const handleCopyShare = async () => {
    if (!savedTrip) return;
    const ok = await copyTextToClipboard(buildShareUrl(savedTrip));
    if (ok) {
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className={`itinerary-toolbar${compact ? ' itinerary-toolbar--compact' : ''}`} role="group" aria-label="Itinerary export options">
      <button type="button" className="btn btn-secondary" onClick={() => void handleCopyMarkdown()}>
        {copiedMarkdown ? '✓ Copied' : 'Copy Markdown'}
      </button>
      <button type="button" className="btn btn-secondary" onClick={() => void downloadItineraryPdf(exportInput)}>
        ⤓ PDF
      </button>
      <button type="button" className="btn btn-secondary" onClick={() => downloadItineraryIcs(exportInput)}>
        ⇥ iCal
      </button>

      {savedTrip ? (
        <button type="button" className="btn btn-primary" onClick={() => void handleCopyShare()}>
          {copiedShare ? '✓ Link copied' : '⧉ Share link'}
        </button>
      ) : canSave && onSave ? (
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          ♡ Save to dashboard
        </button>
      ) : !canSave ? (
        <Link to="/login?next=/travel-planner" className="btn btn-ghost">
          Sign in to save
        </Link>
      ) : null}
    </div>
  );
}
