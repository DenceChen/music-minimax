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
      <div className="auth-card">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl" style={{
            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
            boxShadow: 'var(--shadow-glow)'
          }}>
            🎵
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            {step === 'email' ? 'Enter your email to get started' : 'Enter the verification code'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-center text-sm" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--error)'
          }}>
            {error}
          </div>
        )}

        {step === 'email' ? (
          <div className="space-y-4">
            <input
              type="email"
              required
              className="auth-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={handleSendCode}
              disabled={loading}
              className="auth-btn"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              required
              className="auth-input text-center text-2xl tracking-widest font-mono"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />

            <input
              type="password"
              required
              className="auth-input"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              required
              className="auth-input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="auth-btn"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email')
                setCode('')
                setDemoCode('')
              }}
              className="w-full text-center text-sm py-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Use a different email
            </button>
          </form>
        )}

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
