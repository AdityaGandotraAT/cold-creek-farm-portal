import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getSession } from '../../auth/session.js';
import { AdminThemeProvider, useAdminTheme } from '../admin/AdminTheme.jsx';
import '../admin/admin.css';
import './client.css';
import ClientHeader from './ClientHeader.jsx';
import ClientSidebar from './ClientSidebar.jsx';

const titles = {
  '/client/dashboard': { title: 'Dashboard', crumbs: 'Client / Dashboard' },
  '/client/booking': { title: 'My Booking', crumbs: 'Client / My Booking' },
  '/client/vendors': { title: 'Vendor Selections', crumbs: 'Client / Vendor Selections' },
  '/client/account': { title: 'Account / Password', crumbs: 'Client / Account' },
  '/client/notifications': { title: 'Notifications', crumbs: 'Client / Notifications' },
};

function pageMeta(pathname) {
  return titles[pathname] || { title: 'Client Portal', crumbs: 'Client' };
}

function ClientLayout() {
  return (
    <AdminThemeProvider>
      <ClientShell />
    </AdminThemeProvider>
  );
}

function ClientShell() {
  const { lightMode } = useAdminTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const page = pageMeta(location.pathname);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 960px)');

    function sync() {
      setIsCompact(media.matches);
      if (!media.matches) {
        setMenuOpen(false);
      }
    }

    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    document.body.dataset.adminTheme = lightMode ? 'light' : 'dark';
    return () => {
      delete document.body.dataset.adminTheme;
    };
  }, [lightMode]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  function handleToggle() {
    if (isCompact) {
      setMenuOpen((open) => !open);
      return;
    }

    setCollapsed((value) => !value);
  }

  return (
    <div
      className={`admin-shell client-shell${collapsed && !isCompact ? ' is-collapsed' : ''}${isCompact ? ' is-compact' : ''}${menuOpen ? ' is-menu-open' : ''}`}
      data-theme={lightMode ? 'light' : 'dark'}
    >
      {menuOpen ? (
        <button
          className="admin-backdrop"
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <ClientSidebar
        collapsed={!isCompact && collapsed}
        hidden={isCompact && !menuOpen}
        onLogout={handleLogout}
      />
      <div className="admin-main">
        <ClientHeader
          title={page.title}
          crumbs={page.crumbs}
          user={session?.user}
          toggleLabel={
            isCompact
              ? menuOpen
                ? 'Close menu'
                : 'Open menu'
              : collapsed
                ? 'Expand sidebar'
                : 'Collapse sidebar'
          }
          toggleExpanded={isCompact ? menuOpen : !collapsed}
          onToggle={handleToggle}
        />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default ClientLayout;
