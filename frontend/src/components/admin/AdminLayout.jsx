import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getSession } from '../../auth/session.js';
import AdminHeader from './AdminHeader.jsx';
import AdminSidebar from './AdminSidebar.jsx';
import { AdminThemeProvider, useAdminTheme } from './AdminTheme.jsx';
import './admin.css';

const titles = {
  '/admin/dashboard': { title: 'Dashboard', crumbs: 'Admin / Dashboard' },
  '/admin/clients': { title: 'Clients', crumbs: 'Admin / Clients' },
  '/admin/clients/new': { title: 'Add New Client', crumbs: 'Admin / Clients / New' },
  '/admin/bookings': { title: 'Bookings', crumbs: 'Admin / Bookings' },
  '/admin/bookings/new': { title: 'Add New Booking', crumbs: 'Admin / Bookings / New' },
  '/admin/vendors': { title: 'Vendors', crumbs: 'Admin / Vendors / All Vendors' },
  '/admin/vendors/new': { title: 'Add Vendor', crumbs: 'Admin / Vendors / New' },
  '/admin/vendor-categories': {
    title: 'Categories',
    crumbs: 'Admin / Vendors / Categories',
  },
  '/admin/vendor-categories/new': {
    title: 'Add Category',
    crumbs: 'Admin / Vendors / Categories / New',
  },
  '/admin/vendor-selections': {
    title: 'Vendor Selections',
    crumbs: 'Admin / Vendor Selections',
  },
  '/admin/notifications': { title: 'Notifications', crumbs: 'Admin / Notifications' },
  '/admin/settings': { title: 'Settings', crumbs: 'Admin / Settings' },
};

function pageMeta(pathname) {
  if (titles[pathname]) {
    return titles[pathname];
  }

  if (pathname.startsWith('/admin/bookings/') && pathname.endsWith('/edit')) {
    return { title: 'Edit Booking', crumbs: 'Admin / Bookings / Edit' };
  }

  if (pathname.startsWith('/admin/bookings/')) {
    return { title: 'View Booking', crumbs: 'Admin / Bookings / View' };
  }

  if (pathname.startsWith('/admin/vendors/') && pathname.endsWith('/edit')) {
    return { title: 'Edit Vendor', crumbs: 'Admin / Vendors / Edit' };
  }

  if (pathname.startsWith('/admin/vendors/')) {
    return { title: 'View Vendor', crumbs: 'Admin / Vendors / View' };
  }

  if (pathname.startsWith('/admin/vendor-categories/') && pathname.endsWith('/edit')) {
    return { title: 'Edit Category', crumbs: 'Admin / Vendors / Categories / Edit' };
  }

  if (pathname.startsWith('/admin/vendor-categories/')) {
    return { title: 'View Category', crumbs: 'Admin / Vendors / Categories / View' };
  }

  return { title: 'Admin', crumbs: 'Admin' };
}

function AdminLayout() {
  return (
    <AdminThemeProvider>
      <AdminShell />
    </AdminThemeProvider>
  );
}

function AdminShell() {
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
    navigate('/', { replace: true });
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
      className={`admin-shell${collapsed ? ' is-collapsed' : ''}${isCompact ? ' is-compact' : ''}${menuOpen ? ' is-menu-open' : ''}`}
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
      <AdminSidebar
        collapsed={!isCompact && collapsed}
        hidden={isCompact && !menuOpen}
        onLogout={handleLogout}
      />
      <div className="admin-main">
        <AdminHeader
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

export default AdminLayout;
