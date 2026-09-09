import { useEffect, useState } from 'react';
import FormField from '../clients/FormField.jsx';
import { validatePasswordChange } from './settingsForm.js';

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function SettingsPasswordModal({ onClose }) {
  const [values, setValues] = useState(emptyPasswordForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');

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

  function updateField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setNotice('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validatePasswordChange(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setValues(emptyPasswordForm);
    setNotice('Password changes are not connected yet.');
  }

  return (
    <div className="clients-modal-root">
      <button
        className="clients-modal-backdrop"
        type="button"
        aria-label="Close"
        onClick={onClose}
      />
      <form
        className="clients-modal settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-password-title"
        onSubmit={handleSubmit}
        noValidate
      >
        <h3 id="settings-password-title">Change Password</h3>
        <p>This form is visual only. Passwords are not updated in this version.</p>
        {notice ? (
          <p className="settings-saved" role="status">
            {notice}
          </p>
        ) : null}
        <div className="settings-modal__fields">
          <FormField
            id="currentPassword"
            label="Current Password"
            type="password"
            value={values.currentPassword}
            onChange={(value) => updateField('currentPassword', value)}
            error={errors.currentPassword}
            autoComplete="current-password"
            required
          />
          <FormField
            id="newPassword"
            label="New Password"
            type="password"
            value={values.newPassword}
            onChange={(value) => updateField('newPassword', value)}
            error={errors.newPassword}
            autoComplete="new-password"
            required
          />
          <FormField
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={values.confirmPassword}
            onChange={(value) => updateField('confirmPassword', value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="client-form__actions">
          <button className="clients-add" type="submit">
            Update Password
          </button>
          <button className="client-form__cancel" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsPasswordModal;
