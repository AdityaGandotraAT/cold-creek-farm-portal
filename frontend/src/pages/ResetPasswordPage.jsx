import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordRequest } from '../api/auth.js';
import logo from '../assets/ccf-logo.png';
import venuePhoto from '../assets/login-venue.webp';
import Button from '../components/Button.jsx';
import TextField from '../components/TextField.jsx';
import '../components/LoginForm.css';
import './LoginPage.css';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

    try {
      const result = await resetPasswordRequest({ token, newPassword });
      navigate('/login', {
        replace: true,
        state: { notice: result.message, noticeTone: 'success' },
      });
    } catch (err) {
      setNoticeTone('error');
      setNotice(err.message || 'Unable to reset the password');
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
          <h1 className="login-page__title">Choose a new password.</h1>
          <p className="login-page__welcome">Then sign in to the portal.</p>
        </div>
      </section>

      <section className="login-page__panel">
        <div className="login-page__card">
          <p className="login-page__card-kicker">Account recovery</p>
          <h2 className="login-page__form-title">Reset password</h2>
          {token ? (
            <>
              <p className="login-page__form-copy">
                Use at least 10 characters. This replaces the password on your account.
              </p>
              <form className="login-form" onSubmit={handleSubmit} noValidate>
                <TextField
                  id="reset-password"
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
                  id="reset-confirm"
                  label="Confirm new password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  revealable
                  revealText
                />
                {notice ? (
                  <p className={`login-form__notice login-form__notice--${noticeTone}`} role="status">
                    {notice}
                  </p>
                ) : null}
                <div className="login-form__actions">
                  <Button type="submit" className="button--pill" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save new password'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <p className="login-form__notice login-form__notice--error" role="alert">
              This reset link is missing or invalid. Request a new one from the sign-in page.
            </p>
          )}
          <p className="login-page__hint login-page__back">
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default ResetPasswordPage;
