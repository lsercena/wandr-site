import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import ItineraryMarkdown from '@/components/itinerary/ItineraryMarkdown';
import ItineraryToolbar from '@/components/itinerary/ItineraryToolbar';
import ItineraryMap from '@/components/map/ItineraryMap';
import AffiliatePanel from '@/components/monetization/AffiliatePanel';
import { generateItineraryStreaming } from '@/services/aiService';
import { generateTripId } from '@/services/libraryService';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import './TravelPlannerPage.css';

const TRAVEL_STYLES = [
  'Adventure', 'Cultural', 'Relaxation', 'Food & Drink',
  'History', 'Nature', 'Photography', 'Nightlife', 'Budget', 'Luxury',
];

const PARTY_OPTIONS = ['Solo', 'Couple', 'Small group (3-5)', 'Large group (6+)', 'Family with kids'];
const BUDGET_OPTIONS = ['Budget ($50/day)', 'Mid-range ($100-150/day)', 'Comfortable ($200/day)', 'Luxury ($400+/day)'];
const LODGING_OPTIONS = ['Hostels', 'Guesthouses', 'Mid-range hotels', 'Boutique hotels', 'Luxury resorts', 'Airbnb / apartments'];
const DURATION_OPTIONS = ['3 days', '5 days', '7 days', '10 days', '2 weeks', '3 weeks', '1 month'];

interface PlannerForm {
  destination: string;
  duration: string;
  budget: string;
  party: string;
  styles: string[];
  lodging: string;
  special: string;
  startDate: string;
}

const defaultForm: PlannerForm = {
  destination: '',
  duration: '7 days',
  budget: 'Mid-range ($100-150/day)',
  party: 'Solo',
  styles: [],
  lodging: 'Mid-range hotels',
  special: '',
  startDate: '',
};

function buildPrompt(form: PlannerForm): string {
  return `Create a detailed ${form.duration} travel itinerary for ${form.destination}.

Travel profile:
- Party: ${form.party}
- Budget: ${form.budget}
- Accommodation: ${form.lodging}
- Travel style: ${form.styles.length > 0 ? form.styles.join(', ') : 'general'}
${form.special ? `- Special requests: ${form.special}` : ''}

Please include:
- Brief destination overview
- Day-by-day itinerary (morning / afternoon / evening)
- Specific restaurant and attraction names
- Practical transport tips between locations
- Estimated daily costs
- Best time to visit and weather notes
- One local insider tip per day`;
}

export default function TravelPlannerPage() {
  const [form, setForm] = useState<PlannerForm>(defaultForm);
  const [result, setResult] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const { user } = useAuth();
  const { saveTrip } = useLibrary();

  const update = (partial: Partial<PlannerForm>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const toggleStyle = (style: string) => {
    setForm((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.destination.trim() || streaming) return;

    setStreaming(true);
    setError(null);
    setResult('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const prompt = buildPrompt(form);
      let accumulated = '';
      await generateItineraryStreaming(prompt, {
        signal: controller.signal,
        onDelta: (delta) => {
          accumulated += delta;
          setResult(accumulated);
        },
      });
      setResult(accumulated);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Keep whatever streamed in so far — it's still useful.
        setResult((prev) => (prev && prev.trim() ? prev : null));
      } else {
        setError(err instanceof Error ? err.message : 'Failed to generate itinerary. Please try again.');
        setResult(null);
      }
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  };

  const handleSaveTrip = () => {
    if (!result) throw new Error('Nothing to save yet.');
    return saveTrip({
      id: generateTripId(),
      title: `${form.destination} — ${form.duration}`,
      destination: form.destination,
      duration: form.duration,
      startDate: form.startDate || undefined,
      content: result,
    });
  };

  return (
    <>
      <SeoHead
        title="AI Travel Planner"
        description="Generate a personalized day-by-day travel itinerary with AI. Tell us your destination, budget, and style and get a detailed trip plan in seconds — streamed live, with maps and exports."
        path="/travel-planner"
      />

      <div className="section">
        <div className="container">
          <p className="section-label">AI Travel Planner</p>
          <h1 className="section-title">Plan Your Perfect Trip</h1>
          <p className="section-desc">
            Tell us where you're going and we'll stream a detailed, personalized itinerary in seconds.
          </p>

          <div className="planner-layout">
            <form className="card planner-form" onSubmit={handleSubmit} aria-label="Trip planner">
              <div className="form-group">
                <label className="form-label" htmlFor="destination">Where are you going? *</label>
                <input
                  id="destination"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Tokyo, Japan or Portugal"
                  value={form.destination}
                  onChange={(e) => update({ destination: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="duration">Duration</label>
                  <select id="duration" className="form-select" value={form.duration} onChange={(e) => update({ duration: e.target.value })}>
                    {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="party">Traveling with</label>
                  <select id="party" className="form-select" value={form.party} onChange={(e) => update({ party: e.target.value })}>
                    {PARTY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="budget">Daily Budget</label>
                  <select id="budget" className="form-select" value={form.budget} onChange={(e) => update({ budget: e.target.value })}>
                    {BUDGET_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="lodging">Accommodation</label>
                  <select id="lodging" className="form-select" value={form.lodging} onChange={(e) => update({ lodging: e.target.value })}>
                    {LODGING_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="start-date">Start date (optional — used for iCal export)</label>
                <input
                  id="start-date"
                  type="date"
                  className="form-input"
                  value={form.startDate}
                  onChange={(e) => update({ startDate: e.target.value })}
                />
              </div>

              <fieldset className="form-group">
                <legend className="form-label">Travel Style (pick any)</legend>
                <div className="planner-style-chips">
                  {TRAVEL_STYLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`chip ${form.styles.includes(s) ? 'active' : ''}`}
                      onClick={() => toggleStyle(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="form-group">
                <label className="form-label" htmlFor="special">Special Requests (optional)</label>
                <textarea
                  id="special"
                  className="form-textarea"
                  placeholder="Dietary restrictions, accessibility needs, must-see places, avoid tourist traps…"
                  value={form.special}
                  onChange={(e) => update({ special: e.target.value })}
                  rows={3}
                />
              </div>

              {streaming ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-lg planner-stop"
                  onClick={() => abortRef.current?.abort()}
                >
                  ■ Stop generating
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  disabled={!form.destination.trim()}
                >
                  Generate Itinerary ✦
                </button>
              )}
            </form>

            <div className="planner-result">
              {!result && !streaming && !error && (
                <div className="planner-placeholder">
                  <div className="planner-placeholder__icon" aria-hidden="true">🗺</div>
                  <h2>Your itinerary will appear here</h2>
                  <p>Fill in your trip details and click Generate to get a personalised day-by-day plan — streamed live, with a route map, PDF/iCal exports and shareable links.</p>
                  <div className="planner-placeholder__tips">
                    <p>✦ Tip: Be specific about the destination for better results</p>
                    <p>✦ Tip: Add special requests like "no museums" or "vegan food only"</p>
                  </div>
                </div>
              )}

              {streaming && !result && (
                <div className="planner-loading">
                  <div className="planner-loading__spinner" aria-hidden="true">✦</div>
                  <p>Crafting your <strong>{form.duration}</strong> itinerary for <strong>{form.destination}</strong>…</p>
                </div>
              )}

              {error && (
                <div className="planner-error" role="alert">
                  <p>⚠ {error}</p>
                  <button type="button" className="btn btn-secondary" onClick={() => setError(null)}>Dismiss</button>
                </div>
              )}

              {result && (
                <div className="fade-in">
                  <div className="planner-result-header">
                    <div>
                      <h2>{form.destination} — {form.duration}</h2>
                      <p>{form.party} · {form.budget}{streaming ? ' · streaming…' : ''}</p>
                    </div>
                    <div className="planner-result-actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => { setResult(null); setError(null); }}
                      >
                        New Plan
                      </button>
                    </div>
                  </div>

                  <ItineraryToolbar
                    title={`${form.destination} — ${form.duration}`}
                    destination={form.destination}
                    duration={form.duration}
                    content={result}
                    startDate={form.startDate || undefined}
                    canSave={Boolean(user)}
                    onSave={handleSaveTrip}
                  />

                  <div className="card" style={{ padding: '32px' }}>
                    <ItineraryMarkdown content={result} />
                    {streaming && <span className="planner-stream-cursor" aria-hidden="true" />}
                  </div>

                  <div className="planner-map-wrap">
                    <div className="planner-map-toggle">
                      <h3>Route map</h3>
                      <button
                        type="button"
                        className="chip"
                        onClick={() => setShowMap((v) => !v)}
                        aria-expanded={showMap}
                      >
                        {showMap ? 'Hide map' : 'Show map'}
                      </button>
                    </div>
                    {showMap && !streaming && (
                      <ItineraryMap content={result} destination={form.destination} />
                    )}
                    {streaming && showMap && (
                      <p className="planner-map-hint">The map appears once generation finishes.</p>
                    )}
                  </div>

                  <AffiliatePanel destination={form.destination} variant="itinerary" />

                  {!user && (
                    <p className="planner-save-hint">
                      <Link to="/login?next=/travel-planner">Sign in</Link> to save this itinerary to your dashboard and sync it across devices.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
