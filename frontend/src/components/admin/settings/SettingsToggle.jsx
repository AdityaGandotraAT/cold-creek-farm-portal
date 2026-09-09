function SettingsToggle({ id, label, hint, checked, onChange, disabled = false }) {
  return (
    <div className={`settings-toggle${disabled ? ' is-disabled' : ''}`}>
      <span>
        <label htmlFor={id}>{label}</label>
        {hint ? (
          <small id={`${id}-hint`}>{hint}</small>
        ) : null}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
    </div>
  );
}

export default SettingsToggle;
