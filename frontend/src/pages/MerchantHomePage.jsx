import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { useThemeColors } from '../hooks/useThemeColors';

export default function MerchantHomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const colors = useThemeColors();

  // Format memberSince date
  const formatMemberSince = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/merchant/login');
  };

  const [stats] = useState({
    totalProducts: 147,
    lowStock: 12,
    totalValue: 24850.00,
    lastUpdated: '2 hours ago'
  });

  const [sales] = useState({
    todayOrders: 23,
    todayRevenue: 1247.50,
    weekOrders: 156,
    weekRevenue: 8934.25,
    monthRevenue: 34521.00,
    avgOrderValue: 57.25
  });

  const [recentOrders] = useState([
    { id: 'ORD-1047', customer: 'Sarah M.', items: 3, total: 89.97, status: 'completed', time: '12 min ago' },
    { id: 'ORD-1046', customer: 'Mike R.', items: 1, total: 49.99, status: 'processing', time: '28 min ago' },
    { id: 'ORD-1045', customer: 'Emma L.', items: 5, total: 156.45, status: 'completed', time: '1 hour ago' },
    { id: 'ORD-1044', customer: 'James K.', items: 2, total: 74.98, status: 'shipped', time: '2 hours ago' },
    { id: 'ORD-1043', customer: 'Lisa P.', items: 1, total: 29.99, status: 'completed', time: '3 hours ago' },
  ]);

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.page.background,
      fontFamily: '"Source Sans 3", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: colors.card.background,
        borderBottom: `1px solid ${colors.border.color}`,
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: colors.gradient.blue,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <span style={{ fontWeight: '700', fontSize: '18px', color: colors.text.primary }}>Agora MerchantHub</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ThemeToggle />
          <div style={{ width: '1px', height: '32px', background: colors.border.color }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {user?.merchantName?.substring(0, 2).toUpperCase() || 'JS'}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text.primary }}>{user?.storeName || 'Store'}</div>
              <div style={{ fontSize: '12px', color: colors.text.secondary }}>{user?.email || ''}</div>
            </div>
          </div>
          <div style={{ width: '1px', height: '32px', background: colors.border.color }} />
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.text.secondary,
              background: 'none',
              border: `1px solid ${colors.border.color}`,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{
          background: colors.gradient.blue,
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }}>
            Welcome back, {user?.merchantName?.split(' ')[0] || 'Merchant'}! 👋
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
            Here's what's happening with {user?.storeName || 'your store'} today.
          </p>
        </div>

        {/* Stats Grid - Inventory */}
        <h2 style={{ fontSize: '14px', fontWeight: '600', color: colors.text.secondary, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Inventory Overview
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: colors.card.background,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.border.color}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: colors.icon.bgBlue,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4299e1" strokeWidth="2">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <span style={{ fontSize: '14px', color: colors.text.secondary }}>Total Products</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: colors.text.primary }}>
              {stats.totalProducts}
            </div>
          </div>

          <div style={{
            background: colors.card.background,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.border.color}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: colors.icon.bgRed,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.status.error.text} strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <span style={{ fontSize: '14px', color: colors.text.secondary }}>Low Stock</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: colors.status.error.text }}>
              {stats.lowStock}
            </div>
          </div>

          <div style={{
            background: colors.card.background,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.border.color}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: colors.icon.bgGreen,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.status.success.icon} strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <span style={{ fontSize: '14px', color: colors.text.secondary }}>Inventory Value</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: colors.text.primary }}>
              ${stats.totalValue.toLocaleString()}
            </div>
          </div>

          {/* Manage Inventory Quick Action */}
          <button
            onClick={() => navigate('/merchant/inventory')}
            style={{
              background: colors.gradient.blue,
              borderRadius: '12px',
              padding: '24px',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s',
              boxShadow: colors.shadow.blue,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(66, 153, 225, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = colors.shadow.blue;
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>
                Manage Inventory
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View all products
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Stats Grid - Sales */}
        <h2 style={{ fontSize: '14px', fontWeight: '600', color: colors.text.secondary, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Sales Overview
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: colors.card.background,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.border.color}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: colors.icon.bgYellow,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.status.warning.text} strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <span style={{ fontSize: '14px', color: colors.text.secondary }}>Today's Orders</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: colors.text.primary }}>
              {sales.todayOrders}
            </div>
            <div style={{ fontSize: '14px', color: colors.status.success.icon, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              +12% vs yesterday
            </div>
          </div>

          <div style={{
            background: colors.card.background,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.border.color}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: colors.status.success.bg,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.status.success.text} strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <span style={{ fontSize: '14px', color: colors.text.secondary }}>Today's Revenue</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: colors.text.primary }}>
              ${sales.todayRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '14px', color: colors.status.success.icon, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              +8% vs yesterday
            </div>
          </div>

          <div style={{
            background: colors.card.background,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.border.color}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: colors.status.info.bg,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.status.info.text} strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span style={{ fontSize: '14px', color: colors.text.secondary }}>This Week</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: colors.text.primary }}>
              ${sales.weekRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '14px', color: colors.text.secondary, marginTop: '8px' }}>
              {sales.weekOrders} orders
            </div>
          </div>

          {/* View Orders Quick Action */}
          <button
            onClick={() => navigate('/merchant/orders?status=processing,pending')}
            style={{
              background: colors.gradient.purple,
              borderRadius: '12px',
              padding: '24px',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s',
              boxShadow: colors.shadow.purple,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(128, 90, 213, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = colors.shadow.purple;
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>
                View All Orders
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Manage orders
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Orders */}
        <div style={{
          background: colors.card.background,
          borderRadius: '12px',
          border: `1px solid ${colors.border.color}`,
          overflow: 'hidden',
          marginBottom: '32px'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.border.color}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: colors.text.primary, margin: 0 }}>
              Recent Orders
            </h2>
            <button
              onClick={() => navigate('/merchant/orders?date=today')}
              style={{ fontSize: '13px', color: colors.primary.blue, fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              View All →
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: colors.card.background }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase' }}>Order</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase' }}>Items</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase' }}>Total</th>
                <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} style={{ borderTop: `1px solid ${colors.border.color}` }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: colors.text.primary }}>{order.id}</div>
                    <div style={{ fontSize: '12px', color: colors.text.secondary }}>{order.time}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: colors.text.secondary }}>{order.customer}</td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: colors.text.secondary, textAlign: 'center' }}>{order.items}</td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '600', color: colors.text.primary, textAlign: 'right' }}>${order.total.toFixed(2)}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '12px',
                      background: order.status === 'completed' ? colors.status.success.bg :
                                 order.status === 'processing' ? colors.status.warning.bg :
                                 order.status === 'shipped' ? colors.status.info.bg : colors.border.color,
                      color: order.status === 'completed' ? colors.status.success.text :
                             order.status === 'processing' ? colors.status.warning.text :
                             order.status === 'shipped' ? colors.status.info.text : colors.text.secondary
                    }}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Store Information */}
        <div style={{
          background: colors.card.background,
          borderRadius: '12px',
          padding: '24px',
          border: `1px solid ${colors.border.color}`
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: colors.text.primary, margin: '0 0 20px' }}>
            Store Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${colors.border.color}` }}>
              <span style={{ fontSize: '14px', color: colors.text.secondary }}>Store Name</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: colors.text.primary }}>{user?.storeName || ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${colors.border.color}` }}>
              <span style={{ fontSize: '14px', color: colors.text.secondary }}>Email</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: colors.text.primary }}>{user?.email || ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${colors.border.color}` }}>
              <span style={{ fontSize: '14px', color: colors.text.secondary }}>Store ID</span>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: colors.primary.purple,
                background: colors.icon.bgPurple,
                padding: '4px 12px',
                borderRadius: '12px'
              }}>
                {user?.storeId || 'N/A'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${colors.border.color}` }}>
              <span style={{ fontSize: '14px', color: colors.text.secondary }}>Member Since</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: colors.text.primary }}>
                {user?.memberSince ? formatMemberSince(user.memberSince) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}
