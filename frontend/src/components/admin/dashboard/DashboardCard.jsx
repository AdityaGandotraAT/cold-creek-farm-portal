import { Link } from 'react-router-dom';
import { Icon } from '../AdminIcons.jsx';

function DashboardCard({ label, value, icon, hint, to, tone = 'default' }) {
  const className = `dashboard-card dashboard-card--${tone}${to ? ' is-link' : ''}`;
  const body = (
    <>
      <div className="dashboard-card__icon" aria-hidden="true">
        <Icon name={icon} />
      </div>
      <p className="dashboard-card__label">{label}</p>
      <p className="dashboard-card__value">{value}</p>
      {hint ? <p className="dashboard-card__hint">{hint}</p> : null}
    </>
  );

  if (to) {
    return (
      <Link className={className} to={to}>
        {body}
      </Link>
    );
  }

  return <article className={className}>{body}</article>;
}

export default DashboardCard;
