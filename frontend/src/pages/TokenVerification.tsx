import { useState } from "react";

interface TokenVerificationProps {
  onVerified: (type: 'email' | 'phone', contact: string) => void;
}

export default function TokenVerification({ onVerified }: TokenVerificationProps) {
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const primaryColor = "#ac0509";
  const textColor = "#ffffff";
  const bgDark = "#1a1a1a";
  const bgMedium = "#2d2d2d";

  const handleSendToken = async () => {
    if (!contact) {
      setError(verificationType === 'email' ? 'Please enter your email' : 'Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/send-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: verificationType,
          email: verificationType === 'email' ? contact : undefined,
          phone: verificationType === 'phone' ? contact : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send token');
      }

      setDemoToken(data.demoToken);
      setStep('verify');

      // Start countdown timer
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!token || token.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: verificationType,
          email: verificationType === 'email' ? contact : undefined,
          phone: verificationType === 'phone' ? contact : undefined,
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid token');
      }

      // Success! Call parent callback
      onVerified(verificationType, contact);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendToken = async () => {
    setToken('');
    setTimeLeft(600);
    await handleSendToken();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${bgDark} 0%, ${bgMedium} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: bgMedium,
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(172, 5, 9, 0.3)',
        border: `2px solid ${primaryColor}`,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            color: primaryColor,
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 10px 0',
          }}>
            🔐 Verification Required
          </h1>
          <p style={{ color: textColor, opacity: 0.8, margin: 0 }}>
            {step === 'input'
              ? 'Choose how you want to verify your identity'
              : 'Enter the code we sent you'}
          </p>
        </div>

        {step === 'input' ? (
          <>
            {/* Verification Type Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: textColor,
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                Verification Method
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setVerificationType('email')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    backgroundColor: verificationType === 'email' ? primaryColor : bgDark,
                    color: textColor,
                    border: `2px solid ${verificationType === 'email' ? primaryColor : 'transparent'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                  }}
                >
                  📧 Email
                </button>
                <button
                  onClick={() => setVerificationType('phone')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    backgroundColor: verificationType === 'phone' ? primaryColor : bgDark,
                    color: textColor,
                    border: `2px solid ${verificationType === 'phone' ? primaryColor : 'transparent'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                  }}
                >
                  📱 Phone
                </button>
              </div>
            </div>

            {/* Contact Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: textColor,
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                {verificationType === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <input
                type={verificationType === 'email' ? 'email' : 'tel'}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={verificationType === 'email' ? 'your@email.com' : '+234 800 000 0000'}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: bgDark,
                  color: textColor,
                  border: `2px solid ${primaryColor}40`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: `${primaryColor}20`,
                border: `1px solid ${primaryColor}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                color: primaryColor,
                fontSize: '14px',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendToken}
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px',
                backgroundColor: primaryColor,
                color: textColor,
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Sending...' : `Send Code via ${verificationType === 'email' ? 'Email' : 'SMS'}`}
            </button>
          </>
        ) : (
          <>
            {/* Demo Token Display */}
            <div style={{
              backgroundColor: bgDark,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'center',
              border: `2px solid ${primaryColor}`,
            }}>
              <p style={{ color: textColor, opacity: 0.8, margin: '0 0 10px 0', fontSize: '14px' }}>
                Demo Token (Check console for full details)
              </p>
              <p style={{
                color: primaryColor,
                fontSize: '32px',
                fontWeight: 'bold',
                margin: 0,
                letterSpacing: '8px',
              }}>
                {demoToken}
              </p>
              <p style={{ color: textColor, opacity: 0.6, margin: '10px 0 0 0', fontSize: '12px' }}>
                ⏱️ Expires in: {formatTime(timeLeft)}
              </p>
            </div>

            {/* Token Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: textColor,
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setToken(value);
                }}
                placeholder="000000"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: bgDark,
                  color: textColor,
                  border: `2px solid ${primaryColor}40`,
                  borderRadius: '12px',
                  fontSize: '24px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  fontWeight: 'bold',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: `${primaryColor}20`,
                border: `1px solid ${primaryColor}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                color: primaryColor,
                fontSize: '14px',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerifyToken}
              disabled={loading || token.length !== 6}
              style={{
                width: '100%',
                padding: '18px',
                backgroundColor: primaryColor,
                color: textColor,
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: (loading || token.length !== 6) ? 'not-allowed' : 'pointer',
                opacity: (loading || token.length !== 6) ? 0.7 : 1,
                transition: 'all 0.3s ease',
                marginBottom: '12px',
              }}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            {/* Resend Button */}
            <button
              onClick={handleResendToken}
              disabled={loading || timeLeft > 540} // Can resend after 1 minute
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'transparent',
                color: timeLeft > 540 ? '#666' : primaryColor,
                border: `2px solid ${timeLeft > 540 ? '#666' : primaryColor}`,
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (loading || timeLeft > 540) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {timeLeft > 540 ? `Resend in ${formatTime(600 - timeLeft)}` : 'Resend Code'}
            </button>
          </>
        )}

        {/* Info Box */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: `${primaryColor}10`,
          borderRadius: '12px',
          fontSize: '13px',
          color: textColor,
          opacity: 0.8,
        }}>
          <strong>💡 Note:</strong> This is a demo. In production, the code would be sent via {verificationType === 'email' ? 'email' : 'SMS'}. Check your browser console to see the token.
        </div>
      </div>
    </div>
  );
}
