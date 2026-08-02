import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import { countryService } from '@/services/countryService';
import { compareMetricValue } from '@/services/costService';
import type { CompareMetric } from '@/types';
import './ComparePage.css';

type MetricGroup = { label: string; metrics: { key: CompareMetric; label: string }[] };

const METRIC_GROUPS: MetricGroup[] = [
  {
    label: 'Affordability',
    metrics: [
      { key: 'costOfLiving', label: 'Low Cost of Living' },
      { key: 'housing', label: 'Affordable Housing' },
      { key: 'taxes', label: 'Low Tax Burden' },
    ],
  },
  {
    label: 'Infrastructure',
    metrics: [
      { key: 'internet', label: 'Internet Speed' },
      { key: 'transportation', label: 'Transportation' },
      { key: 'healthcare', label: 'Healthcare' },
    ],
  },
  {
    label: 'Lifestyle',
    metrics: [
      { key: 'safety', label: 'Safety' },
      { key: 'english', label: 'English Proficiency' },
      { key: 'food', label: 'Food Quality' },
    ],
  },
  {
    label: 'Nomad',
    metrics: [
      { key: 'digitalNomadScore', label: 'Nomad Score' },
      { key: 'visaDifficulty', label: 'Easy Visa' },
    ],
  },
];

const MAX_COUNTRIES = 3;
const COUNTRY_COLORS = ['#C4622D', '#2D6A4F', '#4A7FA5'];

function ScoreCell({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="compare-score">
      <div className="compare-score__bar">
        <div className="compare-score__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="compare-score__val">{Math.round(value)}</span>
    </div>
  );
}

export default function ComparePage() {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(['portugal', 'thailand']);
  const [activeGroup, setActiveGroup] = useState(0);

  const allCountries = countryService.getAll();
  const selected = selectedSlugs.map((s) => countryService.getBySlug(s)).filter(Boolean);

  const addCountry = (slug: string) => {
    if (slug && !selectedSlugs.includes(slug) && selectedSlugs.length < MAX_COUNTRIES) {
      setSelectedSlugs((prev) => [...prev, slug]);
    }
  };

  const removeCountry = (slug: string) => {
    setSelectedSlugs((prev) => prev.filter((s) => s !== slug));
  };

  const currentMetrics = METRIC_GROUPS[activeGroup].metrics;

  return (
    <>
      <SeoHead
        title="Compare Countries"
        description="Side-by-side country comparison for digital nomads. Compare cost of living, safety, internet, visa difficulty, healthcare, and more."
        path="/compare"
      />

      <div className="section">
        <div className="container">
          <p className="section-label">Side by Side</p>
          <h1 className="section-title">Compare Countries</h1>
          <p className="section-desc">Compare up to 3 countries across cost, safety, nomad scores, healthcare, and more.</p>

          {/* Country selector row */}
          <div className="compare-selector-row">
            {selected.map((c, i) => c && (
              <div key={c.slug} className="compare-slot card">
                <div className="compare-slot__color" style={{ background: COUNTRY_COLORS[i] }} />
                <span className="compare-slot__flag">{c.overview.flag}</span>
                <strong>{c.name}</strong>
                <button
                  type="button"
                  className="compare-slot__remove"
                  onClick={() => removeCountry(c.slug)}
                  aria-label={`Remove ${c.name}`}
                >
                  ×
                </button>
              </div>
            ))}

            {selectedSlugs.length < MAX_COUNTRIES && (
              <div className="compare-add card">
                <label htmlFor="add-country" className="sr-only">Add a country to compare</label>
                <select
                  id="add-country"
                  className="form-select compare-add__select"
                  value=""
                  onChange={(e) => addCountry(e.target.value)}
                >
                  <option value="">+ Add Country</option>
                  {allCountries
                    .filter((c) => !selectedSlugs.includes(c.slug))
                    .map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.overview.flag} {c.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {selected.length < 2 ? (
            <div className="compare-empty">
              <p>Select at least 2 countries to compare.</p>
            </div>
          ) : (
            <>
              {/* Category tabs */}
              <div className="compare-tabs" role="tablist">
                {METRIC_GROUPS.map((group, i) => (
                  <button
                    key={group.label}
                    role="tab"
                    className={`chip ${i === activeGroup ? 'active' : ''}`}
                    onClick={() => setActiveGroup(i)}
                    aria-selected={i === activeGroup}
                  >
                    {group.label}
                  </button>
                ))}
              </div>

              {/* Comparison table */}
              <div className="compare-table card" role="tabpanel">
                {/* Header row */}
                <div className="compare-row compare-row--header">
                  <div className="compare-row__metric">Metric</div>
                  {selected.map((c, i) => c && (
                    <div key={c.slug} className="compare-row__country">
                      <span style={{ color: COUNTRY_COLORS[i] }}>{c.overview.flag}</span>
                      <Link to={`/countries/${c.slug}`}>{c.name}</Link>
                    </div>
                  ))}
                </div>

                {currentMetrics.map((metric) => {
                  const values = selected.map((c) =>
                    c ? compareMetricValue(c.slug, metric.key) : 0,
                  );
                  const best = Math.max(...values);

                  return (
                    <div key={metric.key} className="compare-row">
                      <div className="compare-row__metric">{metric.label}</div>
                      {values.map((val, i) => (
                        <div
                          key={i}
                          className={`compare-row__value ${val === best ? 'compare-row__value--best' : ''}`}
                        >
                          <ScoreCell value={val} />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Key facts strip */}
              <div className="compare-facts">
                {selected.map((c, i) => c && (
                  <div key={c.slug} className="compare-fact-card card">
                    <div
                      className="compare-fact-card__accent"
                      style={{ background: COUNTRY_COLORS[i] }}
                    />
                    <div className="compare-fact-card__body">
                      <h3>{c.overview.flag} {c.name}</h3>
                      <dl className="compare-fact-list">
                        <div>
                          <dt>Currency</dt>
                          <dd>{c.overview.currency}</dd>
                        </div>
                        <div>
                          <dt>Capital</dt>
                          <dd>{c.overview.capital}</dd>
                        </div>
                        <div>
                          <dt>Budget / mo</dt>
                          <dd>${c.costOfLiving.monthlyBudget.budget.toLocaleString()}</dd>
                        </div>
                        <div>
                          <dt>Mid-range / mo</dt>
                          <dd>${c.costOfLiving.monthlyBudget.mid.toLocaleString()}</dd>
                        </div>
                        <div>
                          <dt>Nomad Visa</dt>
                          <dd>{c.digitalNomadVisa.available ? `✓ ${c.digitalNomadVisa.name}` : '✗ None'}</dd>
                        </div>
                        <div>
                          <dt>Tourist Stay</dt>
                          <dd>{c.visa.maxStay}</dd>
                        </div>
                        <div>
                          <dt>Territorial Tax</dt>
                          <dd>{c.tax.territorialTax ? '✓ Yes' : '✗ No'}</dd>
                        </div>
                        <div>
                          <dt>Internet</dt>
                          <dd>{c.remoteWork.internetSpeed.download} Mbps avg</dd>
                        </div>
                      </dl>
                      <Link to={`/countries/${c.slug}`} className="btn btn-ghost" style={{ marginTop: 12, padding: '8px 0', fontSize: 12 }}>
                        Full profile →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
