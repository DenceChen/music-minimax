'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'

export default function RegisterPage() {
  const locale = useLocale()
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verification/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send code')
        return
      }

      setCodeSent(true)
      setStep('code')
    } catch (err) {
      setError('Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      router.push(`/${locale}/login?registered=true`)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      {/* Animated Background Orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-card page-enter-active" style={{ position: 'relative' }}>
        {/* Art Deco Decorations */}
        <div className="auth-decoration top-left" />
        <div className="auth-decoration top-right" />
        <div className="auth-decoration bottom-left" />
        <div className="auth-decoration bottom-right" />

        <div className="text-center mb-8">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl"
            style={{
              background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
              boxShadow: 'var(--shadow-glow-strong)',
              animation: 'welcomePulse 3s ease-in-out infinite',
            }}
          >
            🎵
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            {step === 'email' ? 'Enter your email to get started' : 'Enter the verification code'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <span className="auth-error-icon">!</span>
            <span className="auth-error-text">{error}</span>
          </div>
        )}

        {codeSent && step === 'code' && (
          <div className="auth-success">
            <span className="auth-success-icon">✓</span>
            <span className="auth-success-text">Verification code sent to {email}</span>
          </div>
        )}

        {step === 'email' ? (
          <div className="space-y-4">
            <div className="floating-input-group">
              <input
                type="email"
                required
                className="floating-input"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <label className="floating-label">Email address</label>
            </div>

            <button
              onClick={handleSendCode}
              disabled={loading}
              className="auth-btn-premium"
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Sending...
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="floating-input-group">
              <input
                type="text"
                required
                className="floating-input text-center tracking-widest"
                placeholder=" "
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
              />
              <label className="floating-label" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                6-digit code
              </label>
            </div>

            <div className="floating-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="floating-input"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '3rem' }}
              />
              <label className="floating-label">Password (min 6 characters)</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <div className="floating-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="floating-input"
                placeholder=" "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <label className="floating-label">Confirm password</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn-premium"
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email')
                setCode('')
                setCodeSent(false)
              }}
              className="w-full text-center py-3 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Use a different email
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <span className="auth-divider-line" />
        </div>

        <button type="button" className="social-btn">
          <svg className="social-btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="text-center mt-6">
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link href={`/${locale}/login`} className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
