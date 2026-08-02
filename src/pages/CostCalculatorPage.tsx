import { useState } from 'react';
import SeoHead from '@/components/ui/SeoHead';
import { calculateCost } from '@/services/costService';
import { countryService } from '@/services/countryService';
import type { CostCalculatorInput, CostBreakdown, TravelStyle, HousingType } from '@/types';
import './CostCalculatorPage.css';

const STYLE_OPTIONS: { value: TravelStyle; label: string; desc: string }[] = [
  { value: 'budget', label: 'Budget', desc: 'Hostels, street food, local transport' },
  { value: 'mid', label: 'Mid-Range', desc: 'Apartments, restaurants, occasional Uber' },
  { value: 'luxury', label: 'Luxury', desc: 'Hotels, fine dining, private transport' },
];

const HOUSING_OPTIONS: { value: HousingType; label: string }[] = [
  { value: 'hostel', label: 'Hostel / Coliving' },
  { value: 'apartment', label: 'Rented Apartment' },
  { value: 'hotel', label: 'Hotel / Serviced Apartment' },
];

const CATEGORIES: { key: keyof CostBreakdown; label: string; color: string }[] = [
  { key: 'housing', label: 'Housing', color: '#C4622D' },
  { key: 'food', label: 'Food', color: '#D4A853' },
  { key: 'transportation', label: 'Transport', color: '#2D6A4F' },
  { key: 'healthcare', label: 'Healthcare', color: '#4A7FA5' },
  { key: 'entertainment', label: 'Entertainment', color: '#8B5CF6' },
  { key: 'emergencySavings', label: 'Emergency Fund', color: '#6B5E4E' },
];

const defaultInput: CostCalculatorInput = {
  income: 4000,
  destinationSlug: 'portugal',
  travelStyle: 'mid',
  housing: 'apartment',
  lengthOfStay: 1,
};

function CostBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="cost-bar">
      <div className="cost-bar__meta">
        <span className="cost-bar__label">{label}</span>
        <span className="cost-bar__value">${value.toLocaleString()}</span>
        <span className="cost-bar__pct">{pct}%</span>
      </div>
      <div className="cost-bar__track">
        <div
          className="cost-bar__fill"
          style={{ width: `${pct}%`, background: color }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${pct}%`}
        />
      </div>
    </div>
  );
}

export default function CostCalculatorPage() {
  const [input, setInput] = useState<CostCalculatorInput>(defaultInput);
  const [result, setResult] = useState<CostBreakdown | null>(null);
  const [calculated, setCalculated] = useState(false);

  const countries = countryService.getAll();
  const update = (partial: Partial<CostCalculatorInput>) =>
    setInput((prev) => ({ ...prev, ...partial }));

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const breakdown = calculateCost(input);
    setResult(breakdown);
    setCalculated(true);
  };

  const selectedCountry = countryService.getBySlug(input.destinationSlug);

  const totalForBars = result
    ? result.housing + result.food + result.transportation + result.healthcare + result.entertainment
    : 0;

  return (
    <>
      <SeoHead
        title="Cost of Living Calculator"
        description="Calculate your monthly budget for living and working abroad. See housing, food, transport, healthcare, and entertainment costs broken down by country."
        path="/cost-calculator"
      />

      <div className="section">
        <div className="container">
          <p className="section-label">Budget Planning</p>
          <h1 className="section-title">Cost of Living Calculator</h1>
          <p className="section-desc">
            Enter your details and destination to see a realistic monthly budget breakdown.
          </p>

          <div className="calc-layout">
            {/* Form panel */}
            <form className="card calc-form" onSubmit={handleCalculate} aria-label="Budget calculator">
              <h2 className="calc-form__heading">Your Details</h2>

              <div className="form-group">
                <label className="form-label" htmlFor="income">Monthly Income (USD)</label>
                <input
                  id="income"
                  type="number"
                  className="form-input"
                  value={input.income}
                  min={0}
                  onChange={(e) => update({ income: +e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="destination">Destination</label>
                <select
                  id="destination"
                  className="form-select"
                  value={input.destinationSlug}
                  onChange={(e) => update({ destinationSlug: e.target.value })}
                >
                  {countries.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.overview.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="stay">Length of Stay (months)</label>
                <input
                  id="stay"
                  type="number"
                  className="form-input"
                  value={input.lengthOfStay}
                  min={1}
                  max={24}
                  onChange={(e) => update({ lengthOfStay: +e.target.value })}
                />
              </div>

              <fieldset className="calc-fieldset">
                <legend className="form-label">Travel Style</legend>
                <div className="calc-options">
                  {STYLE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`calc-option ${input.travelStyle === opt.value ? 'calc-option--active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="style"
                        value={opt.value}
                        checked={input.travelStyle === opt.value}
                        onChange={() => update({ travelStyle: opt.value })}
                        className="sr-only"
                      />
                      <strong>{opt.label}</strong>
                      <span>{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="calc-fieldset">
                <legend className="form-label">Housing Type</legend>
                <div className="calc-options calc-options--row">
                  {HOUSING_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`calc-option calc-option--sm ${input.housing === opt.value ? 'calc-option--active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="housing"
                        value={opt.value}
                        checked={input.housing === opt.value}
                        onChange={() => update({ housing: opt.value })}
                        className="sr-only"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}>
                Calculate Budget
              </button>
            </form>

            {/* Results panel */}
            <div className="calc-results">
              {!calculated ? (
                <div className="calc-results__placeholder">
                  <span className="calc-placeholder-icon" aria-hidden="true">💰</span>
                  <p>Fill in your details and click <strong>Calculate Budget</strong> to see your monthly cost breakdown.</p>
                </div>
              ) : result ? (
                <div className="fade-in">
                  {/* Affordability banner */}
                  <div className={`calc-banner ${result.affordable ? 'calc-banner--good' : 'calc-banner--warn'}`}>
                    <span className="calc-banner__icon">{result.affordable ? '✓' : '⚠'}</span>
                    <div>
                      <strong>{result.affordable ? 'Budget Friendly' : 'Income Shortfall'}</strong>
                      <p>
                        {result.affordable
                          ? `Your $${input.income.toLocaleString()} income covers this budget with ${Math.round(((input.income - result.recommendedIncome) / input.income) * 100)}% remaining.`
                          : `You need $${(result.recommendedIncome - input.income).toLocaleString()} more/month to live comfortably here.`}
                      </p>
                    </div>
                  </div>

                  {/* Key numbers */}
                  <div className="calc-totals">
                    <div className="calc-total-card">
                      <span>Monthly Total</span>
                      <strong>${result.total.toLocaleString()}</strong>
                    </div>
                    <div className="calc-total-card calc-total-card--recommended">
                      <span>Recommended Income</span>
                      <strong>${result.recommendedIncome.toLocaleString()}</strong>
                    </div>
                    {input.lengthOfStay > 1 && (
                      <div className="calc-total-card">
                        <span>{input.lengthOfStay}-Month Total</span>
                        <strong>${(result.total * input.lengthOfStay).toLocaleString()}</strong>
                      </div>
                    )}
                  </div>

                  {/* Category breakdown */}
                  <div className="card" style={{ padding: 24, marginTop: 20 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 20 }}>Monthly Breakdown</h3>
                    {CATEGORIES.map((cat) => (
                      <CostBar
                        key={cat.key}
                        label={cat.label}
                        value={result[cat.key] as number}
                        total={totalForBars || result.total}
                        color={cat.color}
                      />
                    ))}
                  </div>

                  {/* Country context */}
                  {selectedCountry && (
                    <div className="calc-context card">
                      <span className="calc-context__flag">{selectedCountry.overview.flag}</span>
                      <div>
                        <strong>{selectedCountry.name} at a glance</strong>
                        <p>Digital Nomad Score: {selectedCountry.overview.digitalNomadScore}/100 · Safety: {selectedCountry.overview.safetyScore}/100 · Internet: {selectedCountry.remoteWork.internetSpeed.download} Mbps</p>
                      </div>
                    </div>
                  )}

                  <p className="calc-note">
                    * Estimates based on average cost-of-living data. Actual costs vary by neighbourhood and lifestyle.
                    {/* TODO: Integrate Numbeo/Expatistan API for live pricing data */}
                  </p>
                </div>
              ) : (
                <div className="calc-results__placeholder">
                  <p>No data available for this destination. Try another country.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
