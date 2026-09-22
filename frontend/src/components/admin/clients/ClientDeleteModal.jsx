import { useEffect } from 'react';

function ClientDeleteModal({
  clientName,
  onConfirm,
  onClose,
  isDeleting,
  entityLabel = 'client',
}) {
  const titleLabel = entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape' && !isDeleting) {
        onClose();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isDeleting, onClose]);

  return (
    <div className="clients-modal-root">
      <button
        className="clients-modal-backdrop"
        type="button"
        aria-label="Close"
        onClick={onClose}
        disabled={isDeleting}
      />
      <div
        className="clients-modal clients-modal--danger"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-delete-title"
      >
        <h3 id="client-delete-title">Delete {entityLabel}?</h3>
        <p>
          This will permanently remove <strong>{clientName}</strong> from the {entityLabel} list.
          This action cannot be undone.
        </p>
        <div className="client-form__actions clients-modal__actions">
          <button className="clients-delete" type="button" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : `Delete ${titleLabel}`}
          </button>
          <button className="client-form__cancel" type="button" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientDeleteModal;
