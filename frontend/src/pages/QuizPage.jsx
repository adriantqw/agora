import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header/Header';

export default function QuizPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9F9F9',
      fontFamily: '"Inter", -apple-system, sans-serif',
    }}>
      <Header
        variant="full"
        showNav={true}
        onQuizClick={() => navigate('/quiz')}
      />

      <div style={{
        padding: '64px 48px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#1a202c',
          marginBottom: '16px',
        }}>
          Style Quiz
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#718096',
          marginBottom: '48px',
        }}>
          This feature is coming soon! We'll help you discover your perfect style.
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #F5A5B8 0%, #E8879C 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(245, 165, 184, 0.3)',
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
