import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  Home,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import Header from '../components/common/Header/Header';
import wishlistService from '../services/wishlistService';

const SharedWishlistPage = () => {
  const colors = useThemeColors();
  const navigate = useNavigate();
  const { token } = useParams();

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedWishlist = async () => {
      try {
        setLoading(true);
        const data = await wishlistService.getSharedWishlist(token);
        if (!data) {
          setError('Wishlist not found or expired');
        } else {
          setWishlist(data);
        }
      } catch (err) {
        console.error('Error fetching shared wishlist:', err);
        setError('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedWishlist();
  }, [token]);

  if (loading) {
    return (
      <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: colors.text.primary, marginBottom: '8px' }}>Loading wishlist...</div>
          <div style={{ fontSize: '14px', color: colors.text.secondary }}>Please wait</div>
        </div>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header variant="landing" showNav={true} />
        <main style={{ flexGrow: 1, padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '600px', textAlign: 'center' }}>
            <Heart size={64} style={{ color: colors.text.tertiary, marginBottom: '24px', opacity: 0.3 }} />
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: colors.text.primary, marginBottom: '12px' }}>
              {error || 'Wishlist not found'}
            </h1>
            <p style={{ fontSize: '16px', color: colors.text.secondary, marginBottom: '32px' }}>
              This wishlist may have expired or been removed.
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '14px 32px',
                borderRadius: '99px',
                background: colors.primary.eggPink,
                border: 'none',
                color: 'white',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Home size={18} />
              Return to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  const items = wishlist.items.map(item => ({
    id: item.id,
    name: item.product?.name || 'Unknown',
    price: item.product?.price || 0,
    brand: item.product?.tags?.[0] || 'Unknown',
    image: item.product?.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop',
    inStock: (item.product?.quantity || 0) > 0
  }));

  return (
    <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header variant="landing" showNav={true} />

      <main style={{ flexGrow: 1, padding: '32px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '99px',
              background: colors.primary.eggPinkLight,
              color: colors.primary.eggPink,
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              <Sparkles size={14} fill="currentColor" />
              Shared Wishlist
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: colors.text.primary, marginBottom: '8px' }}>
              {wishlist.share.title || 'Shared Wishlist'}
            </h1>
            <p style={{ fontSize: '16px', color: colors.text.secondary }}>
              {items.length} items shared with you
            </p>
          </div>

          {/* Items Grid */}
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <Heart size={64} style={{ color: colors.text.tertiary, marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ fontSize: '16px', color: colors.text.secondary }}>This wishlist is empty</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: colors.card.background,
                    borderRadius: '16px',
                    padding: '12px',
                    boxShadow: colors.shadow.sm,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Image */}
                  <div style={{
                    position: 'relative',
                    aspectRatio: '3/4',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    background: colors.card.backgroundAlt
                  }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {!item.inStock && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '700'
                      }}>
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    <div style={{ fontSize: '12px', color: colors.text.tertiary, marginBottom: '2px' }}>{item.brand}</div>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: colors.text.primary, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default SharedWishlistPage;