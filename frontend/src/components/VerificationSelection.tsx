import { useState } from 'react'
import EmailVerification from './EmailVerification'
import PhoneVerification from './PhoneVerification'

type VerificationType = 'email' | 'phone' | null

function VerificationSelection() {
  const [selectedType, setSelectedType] = useState<VerificationType>(null)

  if (selectedType === 'email') {
    return <EmailVerification onBack={() => setSelectedType(null)} />
  }

  if (selectedType === 'phone') {
    return <PhoneVerification onBack={() => setSelectedType(null)} />
  }

  return (
    <div className="verification-container">
      <h2>Choose Verification Method</h2>
      <p>Select how you would like to verify your account:</p>

      <div className="verification-options">
        <button
          className="option-button"
          onClick={() => setSelectedType('email')}
        >
          📧 Email Verification
        </button>

        <button
          className="option-button"
          onClick={() => setSelectedType('phone')}
        >
          📱 Phone Verification
        </button>
      </div>
    </div>
  )
}

export default VerificationSelection
