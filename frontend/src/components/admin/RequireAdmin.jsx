import { Navigate, Outlet } from 'react-router-dom';
import { getSession } from '../../auth/session.js';

function RequireAdmin() {
  const session = getSession();

  if (!session?.token || session.user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  if (session.user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}

export default RequireAdmin;
