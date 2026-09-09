import { useState } from 'react'
import TextField from './TextField.jsx'
import Button from './Button.jsx'
import './LoginForm.css'

function LoginForm({
  onSubmit,
  onForgotPassword,
  notice = '',
  noticeTone = 'info',
  isSubmitting = false,
  authenticatedRole = '',
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit?.({ email, password, rememberMe })
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <TextField
        id="portal-email"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <TextField
        id="portal-password"
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        revealable
        revealText
      />
      {notice ? (
        <p className={`login-form__notice login-form__notice--${noticeTone}`} role="status">
          {notice}
          {authenticatedRole ? (
            <>
              <br />
              Role: {authenticatedRole}
            </>
          ) : null}
        </p>
      ) : null}
      <label className="login-form__remember">
        <input
          type="checkbox"
          name="rememberMe"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
        />
        Remember me
      </label>
      <div className="login-form__actions">
        <Button type="submit" className="button--pill" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
        <button
          className="login-form__forgot"
          type="button"
          onClick={onForgotPassword}
        >
          Forgot password
        </button>
      </div>
    </form>
  )
}

export default LoginForm
