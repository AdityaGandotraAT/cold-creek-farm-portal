import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginRequest } from '../api/auth.js';
import { fetchPublicSettings } from '../api/settings.js';
import { getSession, saveSession } from '../auth/session.js';
import logo from '../assets/ccf-logo.png';
import venuePhoto from '../assets/login-venue.webp';
import LoginForm from '../components/LoginForm.jsx';
import './LoginPage.css';

function destinationForUser(user) {
  if (user?.mustChangePassword) {
    return '/change-password';
  }
  if (user?.role === 'ADMIN') {
    return '/admin/dashboard';
  }
  if (user?.role === 'CLIENT') {
    return '/client/dashboard';
  }
  return '/';
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const existingSession = getSession();
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [noticeTone, setNoticeTone] = useState(location.state?.noticeTone || 'info');
  const [authenticatedRole, setAuthenticatedRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portalNotice, setPortalNotice] = useState('');

  useEffect(() => {
    let active = true;
    fetchPublicSettings()
      .then((settings) => {
        if (!active) {
          return;
        }
        if (settings.maintenanceMode) {
          setPortalNotice('The portal is under maintenance. Administrators can still sign in.');
        } else if (!settings.clientPortalEnabled) {
          setPortalNotice('Client access is turned off. Administrators can still sign in.');
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (existingSession?.token && existingSession?.user) {
    return <Navigate to={destinationForUser(existingSession.user)} replace />;
  }

  async function handleSubmit({ email, password, rememberMe }) {
    setNotice('');
    setAuthenticatedRole('');
    setIsSubmitting(true);

    try {
      const result = await loginRequest({ email, password, rememberMe });
      saveSession(result.token, result.user, rememberMe, {
        sessionTimeout: result.sessionTimeout,
      });
      setNotice('Login successful');
      setNoticeTone('success');
      setAuthenticatedRole(result.user.role);
      navigate(destinationForUser(result.user), { replace: true });
    } catch (err) {
      setNotice(err.message);
      setNoticeTone('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleForgotPassword() {
    navigate('/forgot-password');
  }

  return (
    <main className="login-page">
      <section className="login-page__intro" aria-label="Cold Creek Farm">
        <img
          className="login-page__photo"
          src={venuePhoto}
          alt="Wedding party walking toward the Cold Creek Farm venue"
        />
        <div className="login-page__overlay">
          <img className="login-page__logo" src={logo} alt="Cold Creek Farm" />
          <h1 className="login-page__title">A working farm, eleven seasons in.</h1>
          <p className="login-page__welcome">Dawsonville, Georgia · Est. 2013</p>
        </div>
      </section>

      <section className="login-page__panel">
        <div className="login-page__card">
          <p className="login-page__card-kicker">Portal sign-in</p>
          <h2 className="login-page__form-title">Pick up where you left off.</h2>
          <p className="login-page__form-copy">
            {portalNotice || 'Admin and client use the same login.'}
          </p>
          <LoginForm
            onSubmit={handleSubmit}
            onForgotPassword={handleForgotPassword}
            notice={notice}
            noticeTone={noticeTone}
            isSubmitting={isSubmitting}
            authenticatedRole={authenticatedRole}
          />
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
