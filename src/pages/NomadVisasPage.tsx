import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import { countryService } from '@/services/countryService';
import './NomadVisasPage.css';

type DifficultyFilter = 'all' | 'easy' | 'moderate' | 'hard';
type IncomeFilter = 'all' | 'under2k' | 'under4k' | 'over4k' | 'free';

const INCOME_LABELS: Record<IncomeFilter, string> = {
  all: 'Any income',
  free: 'Free / No min.',
  under2k: 'Under $2K/mo',
  under4k: 'Under $4K/mo',
  over4k: '$4K+/mo',
};

const DIFFICULTY_LABELS: Record<DifficultyFilter, string> = {
  all: 'Any difficulty',
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
};

function parseIncome(str: string): number {
  const m = str.match(/[\d,]+/);
  return m ? parseInt(m[0].replace(',', ''), 10) : 0;
}

function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'moderate' | 'hard' }) {
  const map = { easy: 'badge-green', moderate: 'badge-gold', hard: 'badge-terra' };
  return <span className={`badge ${map[difficulty]}`}>{difficulty}</span>;
}

export default function NomadVisasPage() {
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [incomeFilter, setIncomeFilter] = useState<IncomeFilter>('all');

  const nomadCountries = countryService.getNomadVisas();

  const filtered = nomadCountries.filter((c) => {
    const visa = c.digitalNomadVisa;
    if (!visa.available) return false;

    if (difficultyFilter !== 'all' && visa.approvalDifficulty !== difficultyFilter) return false;

    if (incomeFilter !== 'all') {
      const income = parseIncome(visa.incomeRequirement || '0');
      if (incomeFilter === 'free' && income !== 0) return false;
      if (incomeFilter === 'under2k' && income >= 2000) return false;
      if (incomeFilter === 'under4k' && income >= 4000) return false;
      if (incomeFilter === 'over4k' && income < 4000) return false;
    }

    return true;
  });

  const stats = {
    total: nomadCountries.length,
    easy: nomadCountries.filter((c) => c.digitalNomadVisa.approvalDifficulty === 'easy').length,
    freeEntry: nomadCountries.filter((c) => {
      const income = parseIncome(c.digitalNomadVisa.incomeRequirement || '0');
      return income === 0;
    }).length,
  };

  return (
    <>
      <SeoHead
        title="Digital Nomad Visas by Country"
        description="Complete database of digital nomad visa programs worldwide. Income requirements, processing times, costs, and application guides for every country."
        path="/digital-nomad-visas"
      />

      {/* Hero */}
      <section className="nomad-hero">
        <div className="container nomad-hero__inner">
          <p className="section-label">Remote Work Visas</p>
          <h1 className="nomad-hero__title">Digital Nomad Visas</h1>
          <p className="nomad-hero__subtitle">
            Official remote work visa programs worldwide — income requirements, costs, and everything you need to apply.
          </p>

          <div className="nomad-stats">
            <div className="nomad-stat">
              <strong>{stats.total}</strong>
              <span>Countries</span>
            </div>
            <div className="nomad-stat">
              <strong>{stats.easy}</strong>
              <span>Easy approval</span>
            </div>
            <div className="nomad-stat">
              <strong>{stats.freeEntry}</strong>
              <span>No income min.</span>
            </div>
          </div>
        </div>
      </section>

      <div className="section">
        <div className="container">
          {/* Filters */}
          <div className="nomad-filters">
            <div className="nomad-filter-group">
              <span className="nomad-filter-label">Difficulty</span>
              <div className="nomad-filter-chips">
                {(Object.keys(DIFFICULTY_LABELS) as DifficultyFilter[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`chip ${difficultyFilter === key ? 'active' : ''}`}
                    onClick={() => setDifficultyFilter(key)}
                  >
                    {DIFFICULTY_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>

            <div className="nomad-filter-group">
              <span className="nomad-filter-label">Income Requirement</span>
              <div className="nomad-filter-chips">
                {(Object.keys(INCOME_LABELS) as IncomeFilter[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`chip ${incomeFilter === key ? 'active' : ''}`}
                    onClick={() => setIncomeFilter(key)}
                  >
                    {INCOME_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="nomad-count">
            Showing <strong>{filtered.length}</strong> of {nomadCountries.length} programs
          </p>

          {filtered.length === 0 ? (
            <div className="nomad-empty">
              <p>No programs match your filters. Try adjusting your criteria.</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setDifficultyFilter('all'); setIncomeFilter('all'); }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="nomad-grid">
              {filtered.map((country) => {
                const visa = country.digitalNomadVisa;
                return (
                  <Link
                    key={country.id}
                    to={`/countries/${country.slug}`}
                    className="nomad-card card"
                    aria-label={`${country.name} digital nomad visa`}
                  >
                    <div className="nomad-card__header">
                      <span className="nomad-card__flag">{country.overview.flag}</span>
                      <div className="nomad-card__name">
                        <strong>{country.name}</strong>
                        <span>{visa.name}</span>
                      </div>
                      {visa.approvalDifficulty && (
                        <DifficultyBadge difficulty={visa.approvalDifficulty} />
                      )}
                    </div>

                    <div className="nomad-card__stats">
                      <div className="nomad-card__stat">
                        <span>Income</span>
                        <strong>{visa.incomeRequirement || 'None'}</strong>
                      </div>
                      <div className="nomad-card__stat">
                        <span>Cost</span>
                        <strong>{visa.applicationCost || '—'}</strong>
                      </div>
                      <div className="nomad-card__stat">
                        <span>Processing</span>
                        <strong>{visa.processingTime || '—'}</strong>
                      </div>
                      <div className="nomad-card__stat">
                        <span>Renewal</span>
                        <strong>{visa.renewal || '—'}</strong>
                      </div>
                    </div>

                    <div className="nomad-card__features">
                      {visa.familyEligibility && (
                        <span className="nomad-feature">👨‍👩‍👧 Family eligible</span>
                      )}
                      {visa.remoteWorkAllowed && (
                        <span className="nomad-feature">💻 Remote work OK</span>
                      )}
                      {!visa.localEmploymentAllowed && (
                        <span className="nomad-feature nomad-feature--warn">⚠ No local jobs</span>
                      )}
                      {visa.taxResidencyTrigger && (
                        <span className="nomad-feature">📋 {visa.taxResidencyTrigger}</span>
                      )}
                    </div>

                    {visa.requiredDocuments && visa.requiredDocuments.length > 0 && (
                      <div className="nomad-card__docs">
                        <p className="nomad-card__docs-label">Key Requirements</p>
                        <ul>
                          {visa.requiredDocuments.slice(0, 3).map((doc) => (
                            <li key={doc}>{doc}</li>
                          ))}
                          {visa.requiredDocuments.length > 3 && (
                            <li>+{visa.requiredDocuments.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="nomad-card__cta">
                      View full details →
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="nomad-cta card">
            <div>
              <h2>Not sure which visa fits you?</h2>
              <p>Answer 4 quick questions and our AI Visa Finder will match you with the best programs for your nationality, income, and goals.</p>
            </div>
            <Link to="/visa-finder" className="btn btn-primary btn-lg">Find My Visa →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
