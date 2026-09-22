import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePasswordRequest } from '../api/auth.js';
import { clearSession, getSession, saveSession } from '../auth/session.js';
import logo from '../assets/ccf-logo.png';
import venuePhoto from '../assets/login-venue.webp';
import Button from '../components/Button.jsx';
import TextField from '../components/TextField.jsx';
import '../components/LoginForm.css';
import './LoginPage.css';

function postLoginPath(user) {
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

function ChangePasswordPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firstName = session?.user?.firstName;
  const signedInAs = session?.user?.email;

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice('');

    if (newPassword.length < 10) {
      setNoticeTone('error');
      setNotice('New password must be at least 10 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setNoticeTone('error');
      setNotice('New password and confirmation do not match.');
      return;
    }

    if (!session?.token) {
      setNoticeTone('error');
      setNotice('Sign in with your temporary password first, then you can set a new one.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changePasswordRequest({ currentPassword, newPassword });
      const rememberMe = Boolean(localStorage.getItem('ccf.session'));
      saveSession(session.token, result.user, rememberMe);
      setNoticeTone('success');
      setNotice('Password updated. Continuing…');
      navigate(postLoginPath(result.user), { replace: true });
    } catch (err) {
      setNoticeTone('error');
      setNotice(err.message || 'Unable to change password');
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="login-page__title">One more step before your celebration.</h1>
          <p className="login-page__welcome">Replace your temporary password to enter the portal.</p>
        </div>
      </section>

      <section className="login-page__panel">
        <div className="login-page__card">
          <p className="login-page__card-kicker">Account security</p>
          <h2 className="login-page__form-title">
            {firstName ? `${firstName}, choose a new password.` : 'Choose a new password.'}
          </h2>
          <p className="login-page__form-copy">
            Your temporary password was only for this first sign-in. Create a password you will use
            from now on.
          </p>
          {signedInAs ? <p className="login-page__signed-in">Signed in as {signedInAs}</p> : null}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="current-password"
              label="Current temporary password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              revealable
              revealText
            />
            <TextField
              id="new-password"
              label="New password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              revealable
              revealText
            />
            <TextField
              id="confirm-password"
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              revealable
              revealText
            />
            <p className="login-page__hint">Use at least 10 characters. Keep this password private.</p>
            {notice ? (
              <p className={`login-form__notice login-form__notice--${noticeTone}`} role="status">
                {notice}
              </p>
            ) : null}
            <div className="login-form__actions">
              <Button type="submit" className="button--pill" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save new password'}
              </Button>
              <button
                className="login-form__forgot"
                type="button"
                onClick={() => {
                  clearSession();
                  navigate('/login', { replace: true });
                }}
              >
                Sign out
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default ChangePasswordPage;
