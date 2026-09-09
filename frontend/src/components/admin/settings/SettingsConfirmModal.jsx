import { useEffect } from 'react';

function SettingsConfirmModal({ title, message, confirmLabel, onConfirm, onClose }) {
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
        className="clients-modal settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-confirm-title"
      >
        <h3 id="settings-confirm-title">{title}</h3>
        <p>{message}</p>
        <div className="client-form__actions">
          <button className="clients-add" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="client-form__cancel" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsConfirmModal;
