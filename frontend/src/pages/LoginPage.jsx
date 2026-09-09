import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { loginRequest } from '../api/auth.js'
import { getSession, saveSession } from '../auth/session.js'
import logo from '../assets/ccf-logo.png'
import venuePhoto from '../assets/login-venue.webp'
import LoginForm from '../components/LoginForm.jsx'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const existingSession = getSession()
  const [notice, setNotice] = useState('')
  const [noticeTone, setNoticeTone] = useState('info')
  const [authenticatedRole, setAuthenticatedRole] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (existingSession?.user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }

  async function handleSubmit({ email, password, rememberMe }) {
    setNotice('')
    setAuthenticatedRole('')
    setIsSubmitting(true)

    try {
      const result = await loginRequest({ email, password, rememberMe })
      saveSession(result.token, result.user, rememberMe)
      setNotice('Login successful')
      setNoticeTone('success')
      setAuthenticatedRole(result.user.role)

      if (result.user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      }
    } catch (err) {
      setNotice(err.message)
      setNoticeTone('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleForgotPassword() {
    setAuthenticatedRole('')
    setNoticeTone('info')
    setNotice('Password reset is not connected yet.')
  }

  return (
    <main className="login-page">
      <section className="login-page__intro" aria-label="Cold Creek Farm">
        <img
          className="login-page__photo"
          src={venuePhoto}
          alt="Wedding party walking toward the Cold Creek Farm venue"
        />
        <div className="login-page__overlay">
          <img className="login-page__logo" src={logo} alt="Cold Creek Farm" />
          <h1 className="login-page__title">A working farm, eleven seasons in.</h1>
          <p className="login-page__welcome">Dawsonville, Georgia · Est. 2013</p>
        </div>
      </section>

      <section className="login-page__panel">
        <div className="login-page__card">
          <p className="login-page__card-kicker">Portal sign-in</p>
          <h2 className="login-page__form-title">Pick up where you left off.</h2>
          <p className="login-page__form-copy">Admin and client use the same login.</p>
          <LoginForm
            onSubmit={handleSubmit}
            onForgotPassword={handleForgotPassword}
            notice={notice}
            noticeTone={noticeTone}
            isSubmitting={isSubmitting}
            authenticatedRole={authenticatedRole}
          />
        </div>
      </section>
    </main>
  )
}

export default LoginPage
