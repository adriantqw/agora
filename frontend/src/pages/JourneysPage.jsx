import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, LogIn } from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import Header from '../components/common/Header/Header';
import Footer from '../components/consumer/Footer/Footer';

const JourneysPage = () => {
  const colors = useThemeColors();
  const navigate = useNavigate();

  return (
    <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header variant="landing" showNav={true} />

      <main style={{ 
        flexGrow: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '40px 20px',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
          padding: '40px',
          background: 'white',
          borderRadius: '32px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: colors.primary.eggPinkLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary.eggPink,
            marginBottom: '8px'
          }}>
            <Compass size={40} />
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', margin: 0 }}>No Journeys Yet</h1>
          <p style={{ color: '#6B7280', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
            Your style journeys will appear here once you start exploring. Please log in to save and view your personal journeys.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '8px' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '16px',
                background: colors.gradient.pink,
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(242, 148, 170, 0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <LogIn size={20} />
              <span>Log In to View</span>
            </button>

            <button 
              onClick={() => navigate('/')}
              style={{
                width: '100%',
                padding: '14px',
                background: 'transparent',
                color: '#9CA3AF',
                border: `1px solid #E5E7EB`,
                borderRadius: '9999px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary.eggPink;
                e.currentTarget.style.color = colors.primary.eggPink;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JourneysPage;
