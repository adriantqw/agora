import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '../components/common/Header/Header';

const ConsumerLandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/journey', { state: { searchQuery: searchQuery.trim() } });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#fff9f5',
      backgroundImage: `
        radial-gradient(circle at 50% 50%, #ffecd9 0%, rgba(255, 236, 217, 0) 65%),
        radial-gradient(circle at 0% 50%, #ffb6e6 0%, transparent 60%),
        radial-gradient(circle at 100% 0%, #9dcaff 0%, transparent 60%)
      `,
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Readex Pro", sans-serif',
    }}>
      <Header variant="landing" showNav={true} />

      {/* Main Content */}
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        padding: '220px 20px 40px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
      }}>
        
        {/* Hero Header Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '48px',
          width: '100%',
          maxWidth: '1000px',
          marginBottom: '25px',
          textAlign: 'left',
        }}>
          {/* Mascot (Bigger) */}
          <div style={{
            width: '200px',
            height: '240px',
            flexShrink: 0,
            animation: 'float 6s ease-in-out infinite',
          }}>
             <img 
              src="/egg-chan.svg" 
              alt="Eggora-chan" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Text Content */}
          <div>
            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#2D3748',
              margin: '0 0 16px 0',
              lineHeight: '1.1',
            }}>
              Hi, I'm Eggora-chan!<br/>
              <span style={{ color: '#793DB0' }}>Your personal shopping assistant...</span>
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: '#4A5568',
              maxWidth: '560px',
              margin: 0,
              lineHeight: '1.6',
            }}>
              Tell me about an event, outfit or idea you want to shop for, and I can come back with curated suggestions just for you!
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={handleSearch}
          style={{
            width: '100%',
            maxWidth: '1000px',
            position: 'relative',
            marginBottom: '60px',
          }}
        >
          <textarea
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            placeholder="What are you looking for?"
            style={{
              width: '100%',
              height: '100px',
              padding: '24px 60px 24px 24px',
              fontSize: '16px',
              borderRadius: '32px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              outline: 'none',
              color: '#2D3748',
              transition: 'all 0.3s ease',
              resize: 'none',
              lineHeight: '1.5',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.08)';
              e.target.style.border = '1px solid rgba(255, 255, 255, 0.8)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
              e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
              e.target.style.border = '1px solid rgba(255, 255, 255, 0.4)';
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '16px',
              bottom: '16px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #793DB0 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(118, 75, 162, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(118, 75, 162, 0.3)';
            }}
          >
            <ArrowRight size={22} strokeWidth={2.5} />
          </button>
        </form>

        {/* Floating Bags (Decorative Row) */}
        
        {/* Left Group */}
        <div style={{ position: 'absolute', bottom: '12%', left: '5%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
           <img src="/shopping_bags1.png" alt="Shopping Bags" style={{ width: '130px', transform: 'rotate(-5deg)', animation: 'float 6s ease-in-out infinite' }} />
           <div style={{ width: '90px', height: '14px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(7px)', marginTop: '12px', animation: 'shadow 6s ease-in-out infinite' }} />
        </div>
        
        {/* Center-Left Group (Bunched) */}
        <div style={{ position: 'absolute', bottom: '10%', left: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
           <img src="/shopping_bags2.png" alt="Shopping Bags" style={{ width: '210px', transform: 'rotate(2deg)', animation: 'float 7.5s ease-in-out infinite 0.2s' }} />
           <div style={{ width: '130px', height: '20px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(10px)', marginTop: '18px', animation: 'shadow 7.5s ease-in-out infinite 0.2s' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '15%', left: '28%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
           <img src="/shopping_bags3.png" alt="Shopping Bags" style={{ width: '150px', transform: 'rotate(-3deg)', animation: 'float 6.5s ease-in-out infinite 1s' }} />
           <div style={{ width: '100px', height: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(8px)', marginTop: '15px', animation: 'shadow 6.5s ease-in-out infinite 1s' }} />
        </div>

        {/* Center Cluster (Main Bunch) */}
        <div style={{ position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 0 }}>
           <div style={{ position: 'absolute', bottom: '10px', left: '-70px', animation: 'float 8s ease-in-out infinite' }}>
             <img src="/shopping_bags2.png" alt="Shopping Bags" style={{ width: '170px', transform: 'rotate(-10deg)' }} />
             <div style={{ width: '110px', height: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(8px)', margin: '15px auto 0', animation: 'shadow 8s ease-in-out infinite' }} />
           </div>
           <div style={{ position: 'absolute', bottom: '30px', right: '-60px', animation: 'float 7s ease-in-out infinite 0.5s' }}>
             <img src="/shopping_bags1.png" alt="Shopping Bags" style={{ width: '150px', transform: 'rotate(15deg)' }} />
             <div style={{ width: '100px', height: '14px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(7px)', margin: '12px auto 0', animation: 'shadow 7s ease-in-out infinite 0.5s' }} />
           </div>
           <div style={{ position: 'relative', animation: 'float 6s ease-in-out infinite 1s' }}>
             <img src="/shopping_bags3.png" alt="Shopping Bags" style={{ width: '160px', transform: 'rotate(5deg)' }} />
             <div style={{ width: '100px', height: '15px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(8px)', margin: '14px auto 0', animation: 'shadow 6s ease-in-out infinite 1s' }} />
           </div>
        </div>

        {/* Center-Right Group */}
        <div style={{ position: 'absolute', bottom: '11%', right: '35%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
           <img src="/shopping_bags1.png" alt="Shopping Bags" style={{ width: '170px', transform: 'rotate(4deg)', animation: 'float 7s ease-in-out infinite 0.5s' }} />
           <div style={{ width: '110px', height: '18px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(9px)', marginTop: '15px', animation: 'shadow 7s ease-in-out infinite 0.5s' }} />
        </div>

        {/* Right Group (Bunched) */}
        <div style={{ position: 'absolute', bottom: '12%', right: '15%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
           <img src="/shopping_bags2.png" alt="Shopping Bags" style={{ width: '180px', transform: 'rotate(-6deg)', animation: 'float 8s ease-in-out infinite 1.5s' }} />
           <div style={{ width: '120px', height: '18px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(9px)', marginTop: '18px', animation: 'shadow 8s ease-in-out infinite 1.5s' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '11%', right: '8%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
           <img src="/shopping_bags3.png" alt="Shopping Bags" style={{ width: '140px', transform: 'rotate(3deg)', animation: 'float 6s ease-in-out infinite 2s' }} />
           <div style={{ width: '90px', height: '14px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(7px)', marginTop: '15px', animation: 'shadow 6s ease-in-out infinite 2s' }} />
        </div>

      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-20px) rotate(var(--r, 0deg)); }
        }
        @keyframes shadow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.8); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ConsumerLandingPage;
