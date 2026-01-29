import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Share2, 
  Sparkles,
  Home,
  Gift
} from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import Header from '../components/common/Header/Header';

const SharedWishlistPage = () => {
  const colors = useThemeColors();
  const navigate = useNavigate();
  const { userId } = useParams();

  return (
    <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header variant="landing" showNav={true} />

      <main style={{ 
        flexGrow: 1, 
        padding: '40px 20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          maxWidth: '800px', 
          width: '100%',
          background: colors.card.background,
          borderRadius: '32px',
          padding: '48px',
          boxShadow: colors.shadow.md,
          border: `1px solid ${colors.border.subtle}`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage: `radial-gradient(${colors.primary.pink} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            pointerEvents: 'none'
          }} />

          {/* Floating Graphic */}
          <div style={{
            position: 'relative',
            width: '160px',
            height: '160px',
            margin: '0 auto 40px',
            animation: 'float 6s ease-in-out infinite'
          }}>
            {/* Background Circle */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: colors.primary.eggPinkLight,
              borderRadius: '50%'
            }} />
            <div style={{
              position: 'absolute',
              inset: '12px',
              background: colors.card.background,
              borderRadius: '50%',
              border: `4px dashed ${colors.primary.eggPink}40`
            }} />
            
            {/* Icon */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.primary.eggPink
            }}>
              <Gift size={64} />
            </div>
            
            {/* Decorative Icons */}
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '8px',
              color: '#D8B4FE', // Light purple
              animation: 'pulse 2s infinite'
            }}>
              <Sparkles size={28} fill="currentColor" />
            </div>
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '-4px',
              color: '#FDE047', // Yellow
            }}>
              <Share2 size={28} />
            </div>
          </div>

          {/* Badge */}
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '99px',
            background: colors.primary.eggPinkLight,
            color: colors.primary.eggPink,
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '24px'
          }}>
            Coming Soon
          </div>

          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            color: colors.text.primary, 
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            We're still ironing out the details.
          </h1>
          
          <p style={{ 
            color: colors.text.secondary, 
            fontSize: '18px', 
            maxWidth: '560px', 
            margin: '0 auto 40px',
            lineHeight: '1.6'
          }}>
            This feature is currently being tailored to fit you perfectly. 
            Don't worry, we won't leave you hanging by a thread!
          </p>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center'
          }}>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '14px 40px',
                borderRadius: '99px',
                border: 'none',
                background: colors.primary.eggPink,
                color: 'white',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: `0 10px 20px -5px ${colors.primary.pink}66`,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Home size={18} strokeWidth={2.5} />
              Return to Home
            </button>
          </div>

        </div>
      </main>
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SharedWishlistPage;