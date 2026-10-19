import SeoHead from '@/components/ui/SeoHead';
import TaxDaysTracker from '@/components/tools/TaxDaysTracker';
import './TaxTrackerPage.css';

export default function TaxTrackerPage() {
  return (
    <>
      <SeoHead
        title="Tax Residency Days Tracker"
        description="Track your physical presence days to monitor tax residency risk — 183-day rules, the US FEIE 330-day test, or custom thresholds."
        path="/tax-tracker"
      />

      <div className="section tax-page">
        <div className="container-narrow">
          <p className="section-label">Nomad Finance</p>
          <h1 className="section-title">Tax Residency Days Tracker</h1>
          <p className="section-desc">
            Tax residency is usually decided by physical presence. Log your stays to monitor the
            thresholds that matter — 183-day rules, the US FEIE 330-day test, or your own limit.
            Everything stays on this device (and syncs to your account when signed in).
          </p>

          <TaxDaysTracker />

          <div className="tax-page__notes">
            <h2>Why this matters</h2>
            <ul>
              <li><strong>183-day rule:</strong> spending 183+ days in a country in a tax year can make you a tax resident there — taxing worldwide income.</li>
              <li><strong>US FEIE:</strong> US persons can exclude foreign-earned income with the Foreign Earned Income Exclusion if they spend 330+ full days abroad in 12 consecutive months (or meet the bona fide residence test).</li>
              <li><strong>Sliding scales:</strong> many countries (e.g. Spain, Portugal, Australia) count a fraction of days from previous years.</li>
              <li><strong>Treaties:</strong> double-tax treaties use tie-breaker tests (permanent home, vital interests, habitual abode).</li>
              <li><strong>Domicile ≠ residency:</strong> some countries (e.g. the UK) tax on domicile too.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
