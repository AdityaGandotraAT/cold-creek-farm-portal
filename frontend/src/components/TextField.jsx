import { useState } from 'react'
import './TextField.css'

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
      />
      <circle
        cx="12"
        cy="12"
        r="2.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3l18 18M9.9 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-.9M6.5 6.7C4.4 8.1 2.8 10.4 2.5 12c0 0 3.5 6.5 9.5 6.5 1.7 0 3.2-.4 4.5-1M17.4 15.3c1.8-1.2 3.2-3 3.6-3.3 0 0-3.5-6.5-9.5-6.5-.8 0-1.6.1-2.3.3"
      />
    </svg>
  )
}

function TextField({
  id,
  label,
  name,
  type = 'text',
  value,
  onChange,
  autoComplete,
  placeholder,
  revealable = false,
  revealText = false,
}) {
  const [revealed, setRevealed] = useState(false)
  const inputType = revealable ? (revealed ? 'text' : 'password') : type

  return (
    <div className="text-field">
      <label className="text-field__label" htmlFor={id}>
        {label}
      </label>
      <div
        className={
          revealable ? 'text-field__control text-field__control--reveal' : 'text-field__control'
        }
      >
        <input
          className="text-field__input"
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        {revealable ? (
          <button
            className={`text-field__reveal${revealText ? ' text-field__reveal--text' : ''}`}
            type="button"
            onClick={() => setRevealed((open) => !open)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
          >
            {revealText ? (revealed ? 'Hide' : 'Show') : revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default TextField
