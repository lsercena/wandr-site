import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import { findVisaRecommendations } from '@/services/visaService';
import { nationalities } from '@/data/countries';
import type { VisaFinderInput, VisaRecommendation } from '@/types';

const STEPS = ['Profile', 'Work Status', 'Travel Goals', 'Results'];

const initialInput: VisaFinderInput = {
  nationality: 'US',
  passportExpiry: '',
  age: 30,
  income: 3000,
  savings: 10000,
  remoteWorker: true,
  freelancer: false,
  businessOwner: false,
  student: false,
  retired: false,
  travelGoals: [],
  hasFamily: false,
  hasPets: false,
  lengthOfStay: '6 months',
};

export default function VisaFinderPage() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<VisaFinderInput>(initialInput);
  const [results, setResults] = useState<VisaRecommendation[]>([]);

  const update = (partial: Partial<VisaFinderInput>) => setInput((prev) => ({ ...prev, ...partial }));

  const handleNext = () => {
    if (step < STEPS.length - 2) {
      setStep(step + 1);
    } else {
      setResults(findVisaRecommendations(input));
      setStep(STEPS.length - 1);
    }
  };

  return (
    <>
      <SeoHead
        title="AI Visa Finder"
        description="Find the best visa and country for your nationality, income, and travel goals. Personalized recommendations in minutes."
        path="/visa-finder"
      />
      <div className="section">
        <div className="container-narrow">
          <p className="section-label">Visa Intelligence</p>
          <h1 className="section-title">Visa Finder</h1>
          <p className="section-desc">Answer a few questions and we'll recommend the best visas and countries for you.</p>

          <div className="wizard-steps" role="tablist">
            {STEPS.map((s, i) => (
              <span key={s} className={`wizard-step ${i <= step ? 'wizard-step--active' : ''} ${i === step ? 'wizard-step--current' : ''}`}>
                {i + 1}. {s}
              </span>
            ))}
          </div>

          <div className="card" style={{ padding: 40 }}>
            {step === 0 && (
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="nationality">Nationality</label>
                  <select id="nationality" className="form-select" value={input.nationality} onChange={(e) => update({ nationality: e.target.value })}>
                    {nationalities.map((n) => <option key={n.code} value={n.code}>{n.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="age">Age</label>
                  <input id="age" type="number" className="form-input" value={input.age} onChange={(e) => update({ age: +e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="income">Monthly Income (USD)</label>
                  <input id="income" type="number" className="form-input" value={input.income} onChange={(e) => update({ income: +e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="savings">Savings (USD)</label>
                  <input id="savings" type="number" className="form-input" value={input.savings} onChange={(e) => update({ savings: +e.target.value })} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="wizard-chips">
                {([
                  ['remoteWorker', 'Remote Worker'],
                  ['freelancer', 'Freelancer'],
                  ['businessOwner', 'Business Owner'],
                  ['student', 'Student'],
                  ['retired', 'Retired'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`chip ${input[key] ? 'active' : ''}`}
                    onClick={() => update({ [key]: !input[key] })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="stay">Length of Stay</label>
                    <select id="stay" className="form-select" value={input.lengthOfStay} onChange={(e) => update({ lengthOfStay: e.target.value })}>
                      <option value="1 month">1 Month</option>
                      <option value="3 months">3 Months</option>
                      <option value="6 months">6 Months</option>
                      <option value="1 year">1 Year</option>
                      <option value="2+ years">2+ Years</option>
                    </select>
                  </div>
                </div>
                <div className="wizard-chips" style={{ marginTop: 20 }}>
                  <button type="button" className={`chip ${input.hasFamily ? 'active' : ''}`} onClick={() => update({ hasFamily: !input.hasFamily })}>Traveling with Family</button>
                  <button type="button" className={`chip ${input.hasPets ? 'active' : ''}`} onClick={() => update({ hasPets: !input.hasPets })}>Bringing Pets</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="visa-results">
                {results.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--subtle)' }}>No matches found. Try adjusting your criteria.</p>
                ) : (
                  results.map((r) => (
                    <div key={r.country.id} className="visa-result card" style={{ padding: 24, marginBottom: 16 }}>
                      <div className="visa-result__header">
                        <span className="visa-result__flag">{r.country.overview.flag}</span>
                        <div>
                          <Link to={`/countries/${r.country.slug}`}><strong>{r.country.name}</strong></Link>
                          <span className="badge badge-terra">{r.visaType}</span>
                        </div>
                        <span className="visa-result__score">{r.matchScore}% match</span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--muted)', margin: '12px 0' }}>
                        Est. cost: ${r.estimatedCost} · {r.taxNotes}
                      </p>
                      <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--terra)', marginBottom: 8 }}>Checklist</h4>
                      <ul style={{ listStyle: 'none', fontSize: 13, color: 'var(--muted)' }}>
                        {r.checklist.slice(0, 5).map((item) => <li key={item} style={{ padding: '4px 0' }}>✓ {item}</li>)}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
              {step > 0 && step < 3 && (
                <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>Back</button>
              )}
              {step < 3 && (
                <button type="button" className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={handleNext}>
                  {step === 2 ? 'Find Visas' : 'Continue'}
                </button>
              )}
              {step === 3 && (
                <button type="button" className="btn btn-secondary" onClick={() => { setStep(0); setResults([]); }}>Start Over</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
