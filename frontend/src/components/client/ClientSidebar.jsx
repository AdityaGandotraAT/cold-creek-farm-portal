import { NavLink } from 'react-router-dom';
import logo from '../../assets/ccf-logo.png';
import { Icon } from '../admin/AdminIcons.jsx';

const links = [
  { to: '/client/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/client/booking', label: 'My Booking', icon: 'bookings' },
  { to: '/client/vendors', label: 'Vendor Selections', icon: 'selections' },
  { to: '/client/account', label: 'Account / Password', icon: 'settings' },
  { to: '/client/notifications', label: 'Notifications', icon: 'notifications' },
];

function ClientSidebar({ collapsed, hidden, onLogout }) {
  return (
    <aside
      className={`admin-sidebar${collapsed ? ' is-collapsed' : ''}`}
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
    >
      <div className="admin-sidebar__brand">
        <img src={logo} alt="Cold Creek Farm" className="admin-sidebar__logo" />
        {collapsed ? null : (
          <div className="admin-sidebar__brand-copy">
            <p className="admin-sidebar__product">Cold Creek Farm Portal</p>
            <p className="admin-sidebar__title">Client Portal</p>
          </div>
        )}
      </div>

      <nav className="admin-sidebar__nav" aria-label="Client portal">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/client/dashboard'}
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? ' is-active' : ''}`
            }
            title={link.label}
          >
            <span className="admin-sidebar__icon">
              <Icon name={link.icon} />
            </span>
            {collapsed ? null : <span className="admin-sidebar__label">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <button
          className="admin-sidebar__link admin-sidebar__logout"
          type="button"
          title="Logout"
          onClick={onLogout}
        >
          <span className="admin-sidebar__icon">
            <Icon name="logout" />
          </span>
          {collapsed ? null : <span className="admin-sidebar__label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default ClientSidebar;
