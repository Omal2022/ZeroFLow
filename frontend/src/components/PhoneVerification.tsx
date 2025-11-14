import { useState } from 'react'

interface PhoneVerificationProps {
  onBack: () => void
}

function PhoneVerification({ onBack }: PhoneVerificationProps) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'input' | 'verify'>('input')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '')

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    }
  }

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic phone validation (must be 10 digits)
    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    // Simulate sending verification code
    setMessage(`Verification code sent to ${phone}`)
    setStep('verify')

    // In production, this would call your backend API to send SMS
    console.log('Sending verification code to:', phone)
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
    setMessage('Phone number verified successfully!')
    console.log('Verifying code:', code, 'for phone:', phone)
  }

  return (
    <div className="verification-container">
      <h2>Phone Verification</h2>

      {step === 'input' && (
        <form onSubmit={handleSendCode} className="verification-form">
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="(123) 456-7890"
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
          <p>A 6-digit verification code has been sent to {phone}</p>

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

          <button type="submit">Verify Phone</button>
          <button
            type="button"
            className="back-button"
            onClick={() => {
              setStep('input')
              setCode('')
              setMessage('')
            }}
          >
            Change Phone Number
          </button>
        </form>
      )}

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default PhoneVerification
