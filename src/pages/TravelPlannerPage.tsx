import { useState } from 'react';
import SeoHead from '@/components/ui/SeoHead';
import { generateItinerary } from '@/services/aiService';
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
}

const defaultForm: PlannerForm = {
  destination: '',
  duration: '7 days',
  budget: 'Mid-range ($100-150/day)',
  party: 'Solo',
  styles: [],
  lodging: 'Mid-range hotels',
  special: '',
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

function ItineraryDisplay({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="itinerary-display">
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return <h2 key={i} className="itinerary-h2">{line.slice(2)}</h2>;
        }
        if (line.startsWith('## ') || line.match(/^Day \d+/)) {
          return <h3 key={i} className="itinerary-h3">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('### ') || line.match(/^(Morning|Afternoon|Evening):/i)) {
          return <h4 key={i} className="itinerary-h4">{line.replace('### ', '')}</h4>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <li key={i} className="itinerary-li">{line.slice(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <strong key={i} className="itinerary-strong">{line.slice(2, -2)}</strong>;
        }
        if (line.trim() === '') {
          return <br key={i} />;
        }
        return <p key={i} className="itinerary-p">{line}</p>;
      })}
    </div>
  );
}

export default function TravelPlannerPage() {
  const [form, setForm] = useState<PlannerForm>(defaultForm);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!form.destination.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prompt = buildPrompt(form);
      const itinerary = await generateItinerary(prompt);
      setResult(itinerary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SeoHead
        title="AI Travel Planner"
        description="Generate a personalized day-by-day travel itinerary with AI. Tell us your destination, budget, and style and get a detailed trip plan in seconds."
        path="/travel-planner"
      />

      <div className="section">
        <div className="container">
          <p className="section-label">AI Travel Planner</p>
          <h1 className="section-title">Plan Your Perfect Trip</h1>
          <p className="section-desc">
            Tell us where you're going and we'll generate a detailed, personalized itinerary in seconds.
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

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={loading || !form.destination.trim()}
              >
                {loading ? 'Generating your itinerary…' : 'Generate Itinerary ✦'}
              </button>

              {loading && (
                <p className="planner-loading-hint">
                  This usually takes 15-30 seconds. We're crafting a detailed, personalised plan just for you.
                </p>
              )}
            </form>

            <div className="planner-result">
              {!result && !loading && !error && (
                <div className="planner-placeholder">
                  <div className="planner-placeholder__icon" aria-hidden="true">🗺</div>
                  <h2>Your itinerary will appear here</h2>
                  <p>Fill in your trip details and click Generate to get a personalised day-by-day plan — including specific restaurants, attractions, transport tips, and local insights.</p>
                  <div className="planner-placeholder__tips">
                    <p>✦ Tip: Be specific about the destination for better results</p>
                    <p>✦ Tip: Add special requests like "no museums" or "vegan food only"</p>
                  </div>
                </div>
              )}

              {loading && (
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

              {result && !loading && (
                <div className="fade-in">
                  <div className="planner-result-header">
                    <div>
                      <h2>{form.destination} — {form.duration}</h2>
                      <p>{form.party} · {form.budget}</p>
                    </div>
                    <div className="planner-result-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          navigator.clipboard?.writeText(result);
                        }}
                        aria-label="Copy itinerary to clipboard"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => { setResult(null); }}
                      >
                        New Plan
                      </button>
                    </div>
                  </div>
                  <div className="card" style={{ padding: '32px' }}>
                    <ItineraryDisplay content={result} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
