import { useState } from 'react'

interface EmailVerificationProps {
  onBack: () => void
}

function EmailVerification({ onBack }: EmailVerificationProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'input' | 'verify'>('input')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    // Simulate sending verification code
    setMessage(`Verification code sent to ${email}`)
    setStep('verify')

    // In production, this would call your backend API
    console.log('Sending verification code to:', email)
  }

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (code.length !== 6) {
      setError('Please enter a 6-digit verification code')
      return
    }

    // Simulate verification
    // In production, this would verify with your backend
    setMessage('Email verified successfully!')
    console.log('Verifying code:', code, 'for email:', email)
  }

  return (
    <div className="verification-container">
      <h2>Email Verification</h2>

      {step === 'input' && (
        <form onSubmit={handleSendCode} className="verification-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>

          <button type="submit">Send Verification Code</button>
          <button type="button" className="back-button" onClick={onBack}>
            Back
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifyCode} className="verification-form">
          <p>A 6-digit verification code has been sent to {email}</p>

          <div className="form-group">
            <label htmlFor="code">Verification Code</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
          </div>

          <button type="submit">Verify Email</button>
          <button
            type="button"
            className="back-button"
            onClick={() => {
              setStep('input')
              setCode('')
              setMessage('')
            }}
          >
            Change Email
          </button>
        </form>
      )}

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default EmailVerification
