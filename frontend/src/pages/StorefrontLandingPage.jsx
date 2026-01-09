import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Sample product data
const featuredProducts = [
  { id: 1, name: 'Blue Cotton Shirt', price: 29.99, image: null, tag: 'New', category: 'Clothing' },
  { id: 2, name: 'Black Slim Pants', price: 49.99, image: null, tag: 'Bestseller', category: 'Clothing' },
  { id: 3, name: 'Red Summer Dress', price: 79.99, image: null, tag: 'Sale', category: 'Clothing' },
  { id: 4, name: 'Leather Wallet', price: 34.99, image: null, tag: null, category: 'Accessories' },
  { id: 5, name: 'Canvas Backpack', price: 59.99, image: null, tag: 'New', category: 'Bags' },
  { id: 6, name: 'Running Shoes', price: 89.99, image: null, tag: null, category: 'Footwear' },
  { id: 7, name: 'Denim Jacket', price: 89.99, image: null, tag: 'Popular', category: 'Clothing' },
  { id: 8, name: 'Silk Scarf', price: 54.99, image: null, tag: null, category: 'Accessories' },
];

const categories = [
  { name: 'Clothing', icon: '👕', count: 124 },
  { name: 'Footwear', icon: '👟', count: 56 },
  { name: 'Accessories', icon: '👜', count: 89 },
  { name: 'Bags', icon: '🎒', count: 34 },
];

export default function StorefrontLandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  const addToCart = (productId) => {
    setCartCount(prev => prev + 1);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fb',
      fontFamily: '"Source Sans 3", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Top Bar */}
        <div style={{
          background: '#1a202c',
          padding: '8px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          color: '#a0aec0'
        }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span>✉️ support@agora.com</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/merchant/login')}
              style={{
                color: '#a0aec0',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              Merchant Portal
            </button>
          </div>
        </div>

        {/* Main Header */}
        <div style={{
          padding: '16px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(66, 153, 225, 0.25)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <span style={{ fontWeight: '700', fontSize: '24px', color: '#1a202c' }}>Agora</span>
          </div>

          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
            <svg
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                fontSize: '15px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                background: '#f7fafc',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4299e1';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = '#f7fafc';
              }}
            />
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Wishlist */}
            <button style={{
              width: '48px',
              height: '48px',
              border: 'none',
              background: 'transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4a5568',
              transition: 'all 0.2s'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Cart */}
            <button style={{
              height: '48px',
              padding: '0 20px',
              border: 'none',
              background: '#f7fafc',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#4a5568',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              <div style={{ position: 'relative' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '20px',
                    height: '20px',
                    background: '#e53e3e',
                    color: 'white',
                    borderRadius: '50%',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {cartCount}
                  </span>
                )}
              </div>
              Cart
            </button>

            {/* Login/Account */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                style={{
                  height: '48px',
                  padding: '0 20px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(66, 153, 225, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Sign In
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
                  transform: showLoginDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Login Dropdown */}
              {showLoginDropdown && (
                <>
                  <div
                    onClick={() => setShowLoginDropdown(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '280px',
                    background: 'white',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                    zIndex: 100,
                    overflow: 'hidden'
                  }}>
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                        Welcome to Agora
                      </h3>
                      <button style={{
                        width: '100%',
                        padding: '14px',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: 'white',
                        background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        marginBottom: '12px'
                      }}>
                        Sign In
                      </button>
                      <button style={{
                        width: '100%',
                        padding: '14px',
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#4a5568',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}>
                        Create Account
                      </button>
                    </div>
                    <div style={{
                      padding: '16px 20px',
                      background: '#f7fafc',
                      borderTop: '1px solid #e2e8f0'
                    }}>
                      <button
                        onClick={() => navigate('/merchant/login')}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#718096',
                          textDecoration: 'none',
                          fontSize: '14px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                        Are you a merchant? Login here
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <nav style={{
          padding: '0 48px',
          display: 'flex',
          gap: '8px',
          borderTop: '1px solid #e2e8f0'
        }}>
          {['All Products', 'New Arrivals', 'Clothing', 'Footwear', 'Accessories', 'Bags', 'Sale'].map((cat, i) => (
            <a
              key={cat}
              href="#"
              style={{
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '500',
                color: i === 0 ? '#4299e1' : '#4a5568',
                textDecoration: 'none',
                borderBottom: i === 0 ? '2px solid #4299e1' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {cat}
              {cat === 'Sale' && (
                <span style={{
                  marginLeft: '6px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: '#fed7d7',
                  color: '#c53030',
                  borderRadius: '10px'
                }}>
                  HOT
                </span>
              )}
            </a>
          ))}
        </nav>
      </header>

      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
        padding: '60px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '48px'
      }}>
        <div style={{ maxWidth: '500px' }}>
          <span style={{
            display: 'inline-block',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#4299e1',
            background: 'rgba(66, 153, 225, 0.15)',
            borderRadius: '20px',
            marginBottom: '20px'
          }}>
            ✨ New Collection 2026
          </span>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 16px',
            lineHeight: '1.2'
          }}>
            Discover Your Style
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#a0aec0',
            margin: '0 0 32px',
            lineHeight: '1.6'
          }}>
            Explore our curated collection of premium products. Quality meets style in every piece.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(66, 153, 225, 0.3)'
            }}>
              Shop Now
            </button>
            <button style={{
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              background: 'transparent',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              cursor: 'pointer'
            }}>
              View Lookbook
            </button>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div style={{
          width: '500px',
          height: '320px',
          background: 'linear-gradient(135deg, rgba(66, 153, 225, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p style={{ margin: '16px 0 0', fontSize: '14px' }}>Hero Image</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section style={{ padding: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
            Shop by Category
          </h2>
          <a href="#" style={{ color: '#4299e1', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>
            View All Categories →
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {categories.map((cat) => (
            <a
              key={cat.name}
              href="#"
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '28px',
                textDecoration: 'none',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                background: '#f7fafc',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                {cat.icon}
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                  {cat.name}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>
                  {cat.count} Products
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section style={{ padding: '0 48px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
            Featured Products
          </h2>
          <a href="#" style={{ color: '#4299e1', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>
            View All Products →
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Product Image */}
              <div style={{
                aspectRatio: '1',
                background: '#f7fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>

                {/* Tag */}
                {product.tag && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: product.tag === 'Sale' ? '#fed7d7' : product.tag === 'New' ? '#c6f6d5' : '#e9d8fd',
                    color: product.tag === 'Sale' ? '#c53030' : product.tag === 'New' ? '#276749' : '#6b46c1',
                    borderRadius: '8px'
                  }}>
                    {product.tag}
                  </span>
                )}

                {/* Quick Actions */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <button style={{
                    width: '36px',
                    height: '36px',
                    border: 'none',
                    background: 'white',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#718096' }}>
                  {product.category}
                </p>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                  {product.name}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c' }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product.id)}
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'white',
                      background: '#4299e1',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section style={{
        background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
        padding: '64px 48px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'white', margin: '0 0 12px' }}>
          Stay in the Loop
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', margin: '0 0 32px' }}>
          Subscribe to our newsletter for exclusive deals and new arrivals
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              flex: 1,
              padding: '16px 20px',
              fontSize: '15px',
              border: 'none',
              borderRadius: '12px',
              outline: 'none'
            }}
          />
          <button style={{
            padding: '16px 32px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#4299e1',
            background: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer'
          }}>
            Subscribe
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1a202c',
        padding: '64px 48px 32px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: '48px',
          marginBottom: '48px'
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <span style={{ fontWeight: '700', fontSize: '20px', color: 'white' }}>Agora</span>
            </div>
            <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.8', margin: 0, maxWidth: '300px' }}>
              Your trusted destination for quality products. We bring you the best from top merchants worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '600', margin: '0 0 20px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Home', 'Products', 'Categories', 'Deals'].map(link => (
                <li key={link} style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#718096', textDecoration: 'none', fontSize: '14px' }}>{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '600', margin: '0 0 20px' }}>Customer Service</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Contact Us', 'FAQs', 'Shipping', 'Returns'].map(link => (
                <li key={link} style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#718096', textDecoration: 'none', fontSize: '14px' }}>{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '600', margin: '0 0 20px' }}>Account</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Sign In', 'Register', 'Order History', 'Wishlist'].map(link => (
                <li key={link} style={{ marginBottom: '12px' }}>
                  <a href="#" style={{ color: '#718096', textDecoration: 'none', fontSize: '14px' }}>{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Merchants */}
          <div>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '600', margin: '0 0 20px' }}>For Merchants</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Merchant Portal', 'Become a Seller', 'Merchant Support', 'API Docs'].map((link, index) => (
                <li key={link} style={{ marginBottom: '12px' }}>
                  {index === 0 ? (
                    <button
                      onClick={() => navigate('/merchant/login')}
                      style={{
                        color: '#718096',
                        textDecoration: 'none',
                        fontSize: '14px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'inherit'
                      }}
                    >
                      {link}
                    </button>
                  ) : (
                    <a href="#" style={{ color: '#718096', textDecoration: 'none', fontSize: '14px' }}>{link}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div style={{
          borderTop: '1px solid #2d3748',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
            © 2026 Agora. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ color: '#718096', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#718096', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</a>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}
