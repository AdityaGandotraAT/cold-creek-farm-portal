import './Button.css'

function Button({ type = 'button', children, disabled = false, className = '' }) {
  return (
    <button className={`button${className ? ` ${className}` : ''}`} type={type} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
