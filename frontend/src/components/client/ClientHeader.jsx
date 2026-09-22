import { Icon } from '../admin/AdminIcons.jsx';
import { useAdminTheme } from '../admin/AdminTheme.jsx';

function ClientHeader({ title, crumbs, user, toggleLabel, toggleExpanded, onToggle }) {
  const { lightMode, setLightMode } = useAdminTheme();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Client';
  const initials = `${user?.firstName?.[0] || 'C'}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <header className="admin-header">
      <div className="admin-header__bar">
        <div className="admin-header__left">
          <button
            className="admin-header__toggle"
            type="button"
            onClick={onToggle}
            aria-label={toggleLabel}
            aria-expanded={toggleExpanded}
          >
            <Icon name="menu" />
          </button>
          <div className="admin-header__copy">
            {crumbs ? <p className="admin-header__crumbs">{crumbs}</p> : null}
            <h1 className="admin-header__title">{title}</h1>
          </div>
        </div>

        <div className="admin-header__actions">
          <button
            className="admin-header__theme"
            type="button"
            aria-pressed={lightMode}
            aria-label={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
            title={lightMode ? 'Dark mode' : 'Light mode'}
            onClick={() => setLightMode(!lightMode)}
          >
            <Icon name={lightMode ? 'sun' : 'moon'} />
          </button>
          <div className="admin-header__account" title={fullName}>
            <span className="admin-header__avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="admin-header__identity">
              <strong>{fullName}</strong>
              <small>Client</small>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default ClientHeader;
