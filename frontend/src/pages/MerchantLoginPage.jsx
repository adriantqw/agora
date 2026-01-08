import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const isValidEmail = email.includes('@') && email.includes('.')
  const isFormValid = isValidEmail && password.length >= 6

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    setError('')

    // Simulate login
    setTimeout(() => {
      setIsLoading(false)
      if (email === 'demo@merchant.com') {
        onLogin()
        navigate('/merchant')
      } else {
        setError('Invalid email or password. Try demo@merchant.com')
      }
    }, 1500)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f8f9fb'
    }}>
      {/* Left Panel - Branding */}
      <div style={{
        flex: '1',
        background: 'linear-gradient(145deg, #1a2b4a 0%, #0f1a2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(99, 179, 237, 0.08)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(99, 179, 237, 0.05)',
        }} />

        {/* Logo & Branding */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #63b3ed 0%, #4299e1 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            boxShadow: '0 20px 40px rgba(66, 153, 225, 0.3)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>

          <h1 style={{
            color: 'white',
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 12px',
            letterSpacing: '-0.5px'
          }}>
            Agora MerchantHub
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '16px',
            margin: '0 0 48px',
            maxWidth: '280px',
            lineHeight: '1.6'
          }}>
            Manage your inventory with ease. Simple, fast, reliable.
          </p>

          {/* Feature highlights */}
          <div style={{ textAlign: 'left' }}>
            {[
              { icon: '\u{1F4E6}', text: 'Real-time inventory tracking' },
              { icon: '\u{1F4CA}', text: 'Bulk import & export' },
              { icon: '\u{1F512}', text: 'Secure & reliable' }
            ].map((feature, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '14px'
              }}>
                <span style={{ fontSize: '18px' }}>{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a202c',
              margin: '0 0 8px',
              letterSpacing: '-0.5px'
            }}>
              Welcome back
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#718096',
              margin: '0'
            }}>
              Sign in to your merchant account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#4a5568',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    fontSize: '15px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    background: 'white',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#63b3ed'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <svg
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#a0aec0'
                  }}
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#4a5568',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '14px 44px 14px 44px',
                    fontSize: '15px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    background: 'white',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#63b3ed'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <svg
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#a0aec0'
                  }}
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#a0aec0'
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '24px'
            }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4299e1',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#fff5f5',
                border: '1px solid #feb2b2',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c53030" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ color: '#c53030', fontSize: '14px' }}>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '15px',
                fontWeight: '600',
                color: 'white',
                background: isFormValid ? 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' : '#cbd5e0',
                border: 'none',
                borderRadius: '10px',
                cursor: isFormValid ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                boxShadow: isFormValid ? '0 4px 14px rgba(66, 153, 225, 0.4)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{
            marginTop: '32px',
            padding: '16px',
            background: '#edf2f7',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#718096',
              margin: '0 0 4px'
            }}>
              Demo credentials
            </p>
            <p style={{
              fontSize: '14px',
              color: '#4a5568',
              margin: '0',
              fontFamily: 'monospace'
            }}>
              demo@merchant.com / password123
            </p>
          </div>

          {/* Footer */}
          <p style={{
            textAlign: 'center',
            fontSize: '13px',
            color: '#a0aec0',
            marginTop: '40px'
          }}>
            © 2026 Agora MerchantHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
