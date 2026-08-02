import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import SeoHead from '@/components/ui/SeoHead';
import CountryCard from '@/components/ui/CountryCard';
import { countryService } from '@/services/countryService';

export default function ExplorePage() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';

  const results = useMemo(() => {
    return query ? countryService.search(query) : countryService.getAll();
  }, [query]);

  return (
    <>
      <SeoHead
        title="Explore Countries"
        description="Browse every country in the Wandr database. Visa info, cost of living, safety scores, and digital nomad programs."
        path="/explore"
      />
      <div className="section">
        <div className="container">
          <p className="section-label">Database</p>
          <h1 className="section-title">
            {query ? `Results for "${query}"` : 'Explore Countries'}
          </h1>
          <p className="section-desc">
            {results.length} countries with visa requirements, cost of living, safety data, and remote work info.
          </p>
          <div className="grid-3">
            {results.map((c) => (
              <CountryCard key={c.id} country={c} showScores />
            ))}
          </div>
          {results.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--subtle)', padding: '40px 0' }}>
              No countries found. Try a different search term.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
