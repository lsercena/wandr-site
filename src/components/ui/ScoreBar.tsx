interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
}

export default function ScoreBar({ label, value, max = 100 }: ScoreBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="score-bar">
      <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 60 }}>{label}</span>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="score-bar-label">{value}</span>
    </div>
  );
}
