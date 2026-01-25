import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Briefcase, 
  Shirt, 
  Glasses, 
  Heart, 
  Plus,
  Apple
} from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import Header from '../components/common/Header/Header';
import Footer from '../components/consumer/Footer/Footer';

// SVG Google Logo component
const GoogleLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const ConsumerLoginPage = () => {
  const colors = useThemeColors();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // For now, just navigate to home
      navigate('/');
    }, 1500);
  };

  return (
    <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header variant="landing" showNav={true} />

      <main style={{ 
        flexGrow: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px 20px', 
        minHeight: 'calc(100vh - 80px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Decorative Background Blobs */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          background: colors.primary.eggPinkLight,
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.5,
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: '#E9D8FD', // Light purple
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.5,
          zIndex: 0
        }} />

        {/* Login Card */}
        <div style={{
          background: 'white',
          borderRadius: '32px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '1000px',
          minHeight: 'calc(100vh - 120px)', // Account for header + padding
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10
        }}>
          
          {/* Left Column: Form */}
          <div style={{ padding: '40px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>Welcome Back</h1>
              <p style={{ color: '#6B7280', fontSize: '15px' }}>Continue your style journey where you left off.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Email Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="email" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginLeft: '4px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>
                    <Mail size={20} />
                  </div>
                  <input 
                    type="email" 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@agora.style"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      background: '#F9FAFB',
                      border: '1px solid #F3F4F6',
                      borderRadius: '16px',
                      fontSize: '15px',
                      color: '#111827',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primary.eggPink;
                      e.target.style.boxShadow = `0 0 0 4px ${colors.primary.eggPink}20`;
                      e.target.parentElement.querySelector('div').style.color = colors.primary.eggPink;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#F3F4F6';
                      e.target.style.boxShadow = 'none';
                      e.target.parentElement.querySelector('div').style.color = '#9CA3AF';
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '4px' }}>
                  <label htmlFor="password" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>
                    Password
                  </label>
                  <a href="#" style={{ fontSize: '12px', fontWeight: '500', color: '#8B5CF6', textDecoration: 'none' }}>Forgot Password?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 48px 14px 44px',
                      background: '#F9FAFB',
                      border: '1px solid #F3F4F6',
                      borderRadius: '16px',
                      fontSize: '15px',
                      color: '#111827',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primary.eggPink;
                      e.target.style.boxShadow = `0 0 0 4px ${colors.primary.eggPink}20`;
                      e.target.parentElement.querySelector('div').style.color = colors.primary.eggPink;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#F3F4F6';
                      e.target.style.boxShadow = 'none';
                      e.target.parentElement.querySelector('div').style.color = '#9CA3AF';
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: colors.gradient.pink,
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(242, 148, 170, 0.4)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '16px',
                  transition: 'transform 0.1s, opacity 0.2s',
                  opacity: isLoading ? 0.8 : 1
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isLoading ? (
                  <>
                    <div style={{ animation: 'spin 1s linear infinite' }}>
                      <Loader2 size={20} />
                    </div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} strokeWidth={2.5} />
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <button 
                type="button" 
                onClick={() => navigate('/')}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  color: '#9CA3AF',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  marginTop: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#6B7280'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
              >
                Cancel & Return Home
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
              New to Agora? 
              <a href="#" style={{ color: colors.primary.eggPink, fontWeight: '600', textDecoration: 'none', marginLeft: '4px' }}>
                Start your Style Profile
              </a>
            </div>
          </div>

          {/* Right Column: Visual/Brand (Hidden on mobile) */}
          <div className="login-visual-panel" style={{ 
            background: 'linear-gradient(135deg, #FFF0F3 0%, #FFFFFF 100%)',
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            borderLeft: '1px solid #F3F4F6'
          }}>
            {/* Top Tags */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ 
                padding: '4px 12px', 
                background: 'rgba(255, 255, 255, 0.6)', 
                backdropFilter: 'blur(4px)', 
                borderRadius: '9999px', 
                fontSize: '10px', 
                fontWeight: '700', 
                color: '#7C3AED', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                border: '1px solid white'
              }}>
                Trending
              </span>
              <span style={{ 
                padding: '4px 12px', 
                background: 'rgba(255, 255, 255, 0.6)', 
                backdropFilter: 'blur(4px)', 
                borderRadius: '9999px', 
                fontSize: '10px', 
                fontWeight: '700', 
                color: colors.primary.eggPink, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                border: '1px solid white'
              }}>
                New Season
              </span>
            </div>

            {/* Central Visual */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {/* Background Circles */}
              <div style={{ position: 'absolute', width: '256px', height: '256px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)' }}></div>
              <div style={{ position: 'absolute', width: '192px', height: '192px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.6)' }}></div>

              {/* Floating Icons Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', position: 'relative', zIndex: 10 }}>
                <div style={{ 
                  background: 'white',
                  width: '96px',
                  height: '96px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                  color: colors.primary.eggPink,
                  animation: 'float 6s ease-in-out infinite' 
                }}>
                  <Shirt size={40} />
                </div>
                <div style={{ 
                  background: 'white',
                  width: '96px',
                  height: '96px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                  color: '#A855F7', // Purple
                  marginTop: '48px',
                  animation: 'float 6s ease-in-out 3s infinite'
                }}>
                  <Sparkles size={40} />
                </div>
                <div style={{ 
                  background: 'white',
                  width: '96px',
                  height: '96px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                  color: '#60A5FA', // Blue
                  marginTop: '-24px',
                  animation: 'float 6s ease-in-out 3s infinite'
                }}>
                  <Briefcase size={40} />
                </div>
                <div style={{ 
                  background: 'white',
                  width: '96px',
                  height: '96px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                  color: '#F59E0B', // Yellow
                  marginTop: '24px',
                  animation: 'float 6s ease-in-out infinite'
                }}>
                  <Glasses size={40} />
                </div>
              </div>
            </div>

            {/* Bottom Text */}
            <div style={{ position: 'relative', zIndex: 10 }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>Your Personal AI Stylist</h3>
              <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6' }}>
                Ready for your next event? We've generated <span style={{ color: colors.primary.eggPink, fontWeight: '600' }}>3 new outfits</span> based on your closet and the latest trends.
              </p>

              {/* Fake "Add to Journey" Pill */}
              <div style={{ 
                marginTop: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                background: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(4px)', 
                padding: '16px', 
                borderRadius: '12px', 
                border: '1px solid white' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: '#FCE7F3', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: colors.primary.eggPink 
                  }}>
                    <Heart size={20} fill={colors.primary.eggPink} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Daily Suggestion</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>Date Night Chic</div>
                  </div>
                </div>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: colors.gradient.pink, 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <Plus size={16} strokeWidth={3} />
                </div>
              </div>
            </div>

          </div>
        </div>

        <style>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @media (max-width: 768px) {
            .login-visual-panel {
              display: none !important;
            }
          }
        `}</style>

      </main>

      <Footer />
    </div>
  );
};

export default ConsumerLoginPage;
