function StatusBadge({ tone = 'neutral', children }) {
  return <span className={`dashboard-badge dashboard-badge--${tone}`}>{children}</span>;
}

export default StatusBadge;
