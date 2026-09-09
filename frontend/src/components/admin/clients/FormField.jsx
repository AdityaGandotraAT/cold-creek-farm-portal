function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  optional = false,
  wide = false,
  options,
  rows,
  autoComplete,
  placeholder,
  min,
  max,
  step,
}) {
  const describedBy = error ? `${id}-error` : undefined;
  const controlProps = {
    id,
    name: id,
    value,
    onChange: (event) => onChange(event.target.value),
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': describedBy,
  };

  let control;

  if (options) {
    control = (
      <select {...controlProps}>
        <option value="">{placeholder || 'Select'}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  } else if (type === 'textarea') {
    control = (
      <textarea
        {...controlProps}
        rows={rows || 4}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    );
  } else {
    control = (
      <input
        {...controlProps}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
    );
  }

  return (
    <div className={`client-form__field${wide ? ' is-wide' : ''}${error ? ' is-invalid' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
        {optional ? <span className="client-form__optional">Optional</span> : null}
      </label>
      {control}
      {error ? (
        <p className="client-form__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default FormField;
