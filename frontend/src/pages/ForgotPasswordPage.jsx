import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../api/auth.js';
import logo from '../assets/ccf-logo.png';
import venuePhoto from '../assets/login-venue.webp';
import Button from '../components/Button.jsx';
import TextField from '../components/TextField.jsx';
import '../components/LoginForm.css';
import './LoginPage.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice('');

    if (!email.trim()) {
      setNoticeTone('error');
      setNotice('Enter the email on your account.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await forgotPasswordRequest({ email: email.trim() });
      setSent(true);
      setNoticeTone('success');
      setNotice(result.message);
    } catch (err) {
      setNoticeTone('error');
      setNotice(err.message || 'Unable to send the reset email');
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
          <h1 className="login-page__title">We'll send a reset link.</h1>
          <p className="login-page__welcome">Use the email on your portal account.</p>
        </div>
      </section>

      <section className="login-page__panel">
        <div className="login-page__card">
          <p className="login-page__card-kicker">Account recovery</p>
          <h2 className="login-page__form-title">Forgot your password?</h2>
          <p className="login-page__form-copy">
            Enter your email and we will send a link to choose a new password. The link expires in
            one hour.
          </p>
          {sent ? (
            <p className={`login-form__notice login-form__notice--${noticeTone}`} role="status">
              {notice} Check your inbox, and the spam folder if it is not there.
            </p>
          ) : (
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <TextField
                id="forgot-email"
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              {notice ? (
                <p className={`login-form__notice login-form__notice--${noticeTone}`} role="status">
                  {notice}
                </p>
              ) : null}
              <div className="login-form__actions">
                <Button type="submit" className="button--pill" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send reset link'}
                </Button>
              </div>
            </form>
          )}
          <p className="login-page__hint login-page__back">
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
