import { Navigate, Outlet } from 'react-router-dom';
import { getSession } from '../../auth/session.js';

function RequireClient() {
  const session = getSession();

  if (!session?.token || session.user?.role !== 'CLIENT') {
    return <Navigate to="/login" replace />;
  }

  if (session.user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}

export default RequireClient;
