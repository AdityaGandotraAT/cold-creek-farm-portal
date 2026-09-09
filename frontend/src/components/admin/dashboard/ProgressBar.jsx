function ProgressBar({ value, max = 6, label }) {
  const safeMax = max || 1;
  const percent = Math.min(100, Math.round((value / safeMax) * 100));
  const complete = value >= safeMax;

  return (
    <div className={`dashboard-progress${complete ? ' is-complete' : ''}`}>
      <div
        className="dashboard-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={value}
        aria-label={label}
      >
        <span className="dashboard-progress__fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="dashboard-progress__label">
        {value} / {safeMax}
      </span>
    </div>
  );
}

export default ProgressBar;
