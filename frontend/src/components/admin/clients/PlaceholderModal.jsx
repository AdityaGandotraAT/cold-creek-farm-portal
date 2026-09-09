function PlaceholderModal({ title, message, onClose }) {
  return (
    <div className="clients-modal-root">
      <button
        className="clients-modal-backdrop"
        type="button"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="clients-modal" role="dialog" aria-modal="true" aria-labelledby="clients-modal-title">
        <h3 id="clients-modal-title">{title}</h3>
        <p>{message}</p>
        <button className="clients-modal__close" type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default PlaceholderModal;
