import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../AdminIcons.jsx';

const copy = {
  created: {
    title: 'Client created',
    message: (name) =>
      `${name} was saved successfully. A welcome email with temporary login details was sent.`,
  },
  createdEmailFailed: {
    title: 'Client account created',
    message: (name) =>
      `${name} is ready. Share these login details with them so they can sign in.`,
  },
  updated: {
    title: 'Changes saved',
    message: (name) => `${name} was updated successfully.`,
  },
  deleted: {
    title: 'Client deleted',
    message: (name) => `${name} was removed from the client list.`,
  },
  welcomeResent: {
    title: 'Welcome email sent',
    message: (name) => `A new temporary password email was sent to ${name}.`,
  },
  bookingCreated: {
    title: 'Booking created',
    message: (name) => `${name} was saved successfully and is now in your booking list.`,
  },
  bookingCreatedEmailed: {
    title: 'Booking created',
    message: (name) =>
      `${name} was saved and the assigned client was emailed their event details.`,
  },
  bookingCreatedEmailFailed: {
    title: 'Booking created — email not sent',
    message: (name) =>
      `${name} was saved, but the client email could not be sent. Check SMTP settings and save again.`,
  },
  bookingUpdated: {
    title: 'Changes saved',
    message: (name) => `${name} was updated successfully.`,
  },
  bookingUpdatedEmailed: {
    title: 'Changes saved',
    message: (name) => `${name} was updated and the client was emailed the new details.`,
  },
  bookingUpdatedEmailFailed: {
    title: 'Changes saved — email not sent',
    message: (name) =>
      `${name} was updated, but the client email could not be sent. Check SMTP settings and save again.`,
  },
  bookingDeleted: {
    title: 'Booking deleted',
    message: (name) => `${name} was removed from the booking list.`,
  },
};

function CredentialRow({ label, value }) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="clients-modal__credential">
      <div>
        <dt>{label}</dt>
        <dd>
          <code>{value}</code>
        </dd>
      </div>
      <button className="clients-modal__copy" type="button" onClick={copyValue}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function ClientSuccessModal({
  kind,
  clientName,
  username,
  temporaryPassword,
  detail,
  onClose,
  showBackLink = true,
}) {
  const content = copy[kind] || copy.created;

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="clients-modal-root">
      <button
        className="clients-modal-backdrop"
        type="button"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={`clients-modal clients-modal--success${temporaryPassword ? ' clients-modal--credentials' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-success-title"
      >
        <div className="clients-modal__icon" aria-hidden="true">
          <Icon name="selections" />
        </div>
        <h3 id="client-success-title">{content.title}</h3>
        <p>{content.message(clientName)}</p>
        {detail ? <p className="clients-modal__detail">{detail}</p> : null}
        {temporaryPassword ? (
          <div className="clients-modal__credentials">
            <p>They will choose a new password after signing in.</p>
            <dl>
              <CredentialRow label="Username" value={username} />
              <CredentialRow label="Temporary password" value={temporaryPassword} />
            </dl>
          </div>
        ) : null}
        <div className="clients-modal__actions">
          <button className="clients-add" type="button" onClick={onClose}>
            {kind === 'deleted' || kind === 'bookingDeleted' ? 'Done' : 'Continue'}
          </button>
          {showBackLink && kind !== 'deleted' && kind !== 'bookingDeleted' ? (
            <Link
              className="client-form__cancel clients-modal__secondary"
              to={String(kind || '').startsWith('booking') ? '/admin/bookings' : '/admin/clients'}
              onClick={onClose}
            >
              {String(kind || '').startsWith('booking') ? 'Back to Bookings' : 'Back to Clients'}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ClientSuccessModal;
