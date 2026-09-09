function StatusBadge({ tone = 'neutral', children }) {
  return <span className={`clients-badge clients-badge--${tone}`}>{children}</span>;
}

export default StatusBadge;
