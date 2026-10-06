import { useEffect, useState } from 'react';
import { changePasswordRequest } from '../../api/auth.js';
import { fetchMyAccount } from '../../api/clientPortal.js';
import { getSession, saveSession } from '../../auth/session.js';

function addressLines(profile) {
  if (!profile) {
    return [];
  }

  const cityLine = [profile.city, profile.state, profile.zipCode].filter(Boolean).join(', ');
  return [profile.address, cityLine, profile.country].map((line) => String(line || '').trim()).filter(Boolean);
}

function ClientAccountPage() {
  const session = getSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState('info');

  useEffect(() => {
    let active = true;

    fetchMyAccount()
      .then((nextProfile) => {
        if (active) {
          setProfile(nextProfile);
        }
      })
      .catch((err) => {
        if (active) {
          setLoadError(err.message || 'Unable to load your account');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handlePasswordSubmit(event) {
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

    setSaving(true);

    try {
      const result = await changePasswordRequest({ currentPassword, newPassword });
      const rememberMe = Boolean(localStorage.getItem('ccf.session'));
      if (session?.token && result.user) {
        saveSession(session.token, result.user, rememberMe, {
          sessionTimeout: session.sessionTimeout,
        });
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNoticeTone('success');
      setNotice('Password updated. Use this password the next time you sign in.');
    } catch (err) {
      setNoticeTone('error');
      setNotice(err.message || 'Unable to change password');
    } finally {
      setSaving(false);
    }
  }

  const lines = addressLines(profile);

  return (
    <div className="client-account">
      <header className="client-booking__intro">
        <div>
          <p className="client-stub__kicker">Your account</p>
          <h2>Account / Password</h2>
          <p>
            Your name and contact details are kept by Cold Creek Farm. You can change the
            password you use to sign in.
          </p>
        </div>
      </header>

      {loadError ? (
        <p className="client-account__alert" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="client-account__layout">
        <section className="client-booking__panel" aria-labelledby="client-profile-heading">
          <h3 id="client-profile-heading">Profile</h3>
          {loading ? <p className="client-account__muted">Loading your profile...</p> : null}
          {!loading && profile ? (
            <dl className="client-booking__facts client-account__facts">
              <div>
                <dt>Name</dt>
                <dd>{profile.name || '—'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd className="client-account__break">{profile.email || '—'}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{profile.primaryPhone || '—'}</dd>
              </div>
              {profile.secondaryPhone ? (
                <div>
                  <dt>Secondary phone</dt>
                  <dd>{profile.secondaryPhone}</dd>
                </div>
              ) : null}
              {profile.referenceNumber ? (
                <div>
                  <dt>Client reference</dt>
                  <dd>{profile.referenceNumber}</dd>
                </div>
              ) : null}
              {lines.length > 0 ? (
                <div className="client-account__wide">
                  <dt>Address</dt>
                  <dd>
                    {lines.map((line) => (
                      <span key={line} className="client-account__address-line">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          <p className="client-account__muted">
            Contact Cold Creek Farm if your name, email, phone, or address needs a correction.
          </p>
        </section>

        <section className="client-booking__panel" aria-labelledby="client-password-heading">
          <h3 id="client-password-heading">Change password</h3>
          <p className="client-account__muted">
            Use at least 10 characters. This replaces the password on your client login.
          </p>
          <form className="client-account__form" onSubmit={handlePasswordSubmit} noValidate>
            <label className="client-account__field" htmlFor="client-current-password">
              <span>Current password</span>
              <input
                id="client-current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </label>
            <label className="client-account__field" htmlFor="client-new-password">
              <span>New password</span>
              <input
                id="client-new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={10}
              />
            </label>
            <label className="client-account__field" htmlFor="client-confirm-password">
              <span>Confirm new password</span>
              <input
                id="client-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={10}
              />
            </label>
            {notice ? (
              <p className={`client-account__notice is-${noticeTone}`} role="status">
                {notice}
              </p>
            ) : null}
            <button className="client-welcome__cta client-account__submit" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save new password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ClientAccountPage;
