import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/ccf-logo.png';
import { Icon } from './AdminIcons.jsx';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/clients', label: 'Clients', icon: 'clients' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'bookings' },
  {
    label: 'Vendors',
    icon: 'vendors',
    children: [
      { to: '/admin/vendors', label: 'All Vendors' },
      { to: '/admin/vendor-categories', label: 'Categories' },
    ],
  },
  { to: '/admin/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
];

function isVendorPath(pathname) {
  return pathname.startsWith('/admin/vendors') || pathname.startsWith('/admin/vendor-categories');
}

function AdminSidebar({ collapsed, hidden, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const vendorActive = isVendorPath(location.pathname);
  const [vendorsOpen, setVendorsOpen] = useState(vendorActive);

  useEffect(() => {
    if (vendorActive) {
      setVendorsOpen(true);
    }
  }, [vendorActive]);

  function handleVendorsToggle() {
    if (collapsed) {
      navigate('/admin/vendors');
      return;
    }

    if (!vendorActive && !vendorsOpen) {
      setVendorsOpen(true);
      navigate('/admin/vendors');
      return;
    }

    setVendorsOpen((open) => !open);
  }

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
            <p className="admin-sidebar__title">Admin Portal</p>
          </div>
        )}
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin">
        {links.map((link) => {
          if (link.children) {
            const showChildren = !collapsed && vendorsOpen;

            return (
              <div key={link.label} className="admin-sidebar__group">
                <button
                  className={`admin-sidebar__link${vendorActive ? ' is-section' : ''}`}
                  type="button"
                  title={link.label}
                  aria-expanded={showChildren}
                  onClick={handleVendorsToggle}
                >
                  <span className="admin-sidebar__icon">
                    <Icon name={link.icon} />
                  </span>
                  {collapsed ? null : <span className="admin-sidebar__label">{link.label}</span>}
                  {collapsed ? null : (
                    <Icon
                      name="chevron"
                      className={`admin-icon admin-sidebar__chevron${vendorsOpen ? ' is-open' : ''}`}
                    />
                  )}
                </button>
                {showChildren ? (
                  <div className="admin-sidebar__sub">
                    {link.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `admin-sidebar__link${isActive ? ' is-active' : ''}`
                        }
                        title={child.label}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <NavLink
              key={link.to}
              to={link.to}
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
          );
        })}
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

export default AdminSidebar;
