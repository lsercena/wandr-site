import SeoHead from '@/components/ui/SeoHead';
import SchengenTracker from '@/components/tools/SchengenTracker';
import './SchengenPage.css';

export default function SchengenPage() {
  return (
    <>
      <SeoHead
        title="Schengen 90/180-Day Tracker"
        description="Track your Schengen Area 90/180-day allowance in real time. Add past stays and see exactly how many visa-free days you have left."
        path="/schengen-tracker"
      />

      <div className="section schengen-page">
        <div className="container-narrow">
          <p className="section-label">Nomad Logistics</p>
          <h1 className="section-title">Schengen 90/180-Day Tracker</h1>
          <p className="section-desc">
            Overstaying is the fastest way to lose visa-free access. Log your entries and exits to
            see exactly how many of your 90 rolling days remain — stored locally on this device
            (and synced to your account when signed in).
          </p>

          <SchengenTracker />

          <div className="schengen-page__tips">
            <h2>How the 90/180 rule works</h2>
            <ul>
              <li><strong>90 days</strong> of presence is allowed within <strong>any rolling 180-day window</strong> — not per calendar year.</li>
              <li>The window moves daily: on any given day, the last 180 days are what count.</li>
              <li>Days in one Schengen country count against the whole 27-country area.</li>
              <li>A new 90-day block only becomes available as old days “roll out” of the window — the tracker shows that date for you.</li>
              <li>Certain long-stay national visas (e.g. D-visas) can change how days are counted — verify with the consulate.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
