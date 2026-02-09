import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeColors } from '../hooks/useThemeColors';
import ThemeToggle from '../components/ThemeToggle';

export default function MerchantOrdersPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const colors = useThemeColors();

  // State management
  const [statusFilters, setStatusFilters] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // Mock data - 30 orders with varied dates and statuses
  const [orders] = useState([
    // Today's orders (Jan 11, 2026)
    { id: 'ORD-1070', customer: 'Sarah Mitchell', email: 'sarah.m@email.com', items: 3, total: 89.97, status: 'pending', date: new Date('2026-01-11T15:30:00'), time: '1 hour ago' },
    { id: 'ORD-1069', customer: 'Mike Rodriguez', email: 'mike.r@email.com', items: 1, total: 49.99, status: 'processing', date: new Date('2026-01-11T14:15:00'), time: '2 hours ago' },
    { id: 'ORD-1068', customer: 'Emma Thompson', email: 'emma.t@email.com', items: 5, total: 234.50, status: 'processing', date: new Date('2026-01-11T12:45:00'), time: '4 hours ago' },
    { id: 'ORD-1067', customer: 'James Wilson', email: 'james.w@email.com', items: 2, total: 74.98, status: 'shipped', date: new Date('2026-01-11T10:20:00'), time: '6 hours ago' },
    { id: 'ORD-1066', customer: 'Lisa Parker', email: 'lisa.p@email.com', items: 4, total: 159.96, status: 'completed', date: new Date('2026-01-11T08:30:00'), time: '8 hours ago' },
    { id: 'ORD-1065', customer: 'David Chen', email: 'david.c@email.com', items: 1, total: 29.99, status: 'pending', date: new Date('2026-01-11T07:10:00'), time: '9 hours ago' },

    // This week (last 7 days)
    { id: 'ORD-1064', customer: 'Rachel Green', email: 'rachel.g@email.com', items: 3, total: 119.97, status: 'completed', date: new Date('2026-01-10T16:30:00'), time: '1 day ago' },
    { id: 'ORD-1063', customer: 'Tom Harris', email: 'tom.h@email.com', items: 2, total: 99.98, status: 'shipped', date: new Date('2026-01-10T11:20:00'), time: '1 day ago' },
    { id: 'ORD-1062', customer: 'Anna Lee', email: 'anna.l@email.com', items: 6, total: 289.94, status: 'completed', date: new Date('2026-01-09T14:45:00'), time: '2 days ago' },
    { id: 'ORD-1061', customer: 'Chris Martin', email: 'chris.m@email.com', items: 1, total: 39.99, status: 'processing', date: new Date('2026-01-09T09:15:00'), time: '2 days ago' },
    { id: 'ORD-1060', customer: 'Nicole Brown', email: 'nicole.b@email.com', items: 4, total: 179.96, status: 'shipped', date: new Date('2026-01-08T17:30:00'), time: '3 days ago' },
    { id: 'ORD-1059', customer: 'Peter Johnson', email: 'peter.j@email.com', items: 2, total: 84.98, status: 'completed', date: new Date('2026-01-08T13:20:00'), time: '3 days ago' },
    { id: 'ORD-1058', customer: 'Maya Patel', email: 'maya.p@email.com', items: 3, total: 134.97, status: 'pending', date: new Date('2026-01-07T15:40:00'), time: '4 days ago' },
    { id: 'ORD-1057', customer: 'Kevin White', email: 'kevin.w@email.com', items: 1, total: 59.99, status: 'shipped', date: new Date('2026-01-06T10:25:00'), time: '5 days ago' },
    { id: 'ORD-1056', customer: 'Sophia Garcia', email: 'sophia.g@email.com', items: 5, total: 249.95, status: 'completed', date: new Date('2026-01-05T14:50:00'), time: '6 days ago' },

    // This month (last 30 days)
    { id: 'ORD-1055', customer: 'Ryan Cooper', email: 'ryan.c@email.com', items: 2, total: 109.98, status: 'completed', date: new Date('2026-01-04T11:30:00'), time: '1 week ago' },
    { id: 'ORD-1054', customer: 'Olivia Davis', email: 'olivia.d@email.com', items: 4, total: 199.96, status: 'shipped', date: new Date('2026-01-03T16:15:00'), time: '1 week ago' },
    { id: 'ORD-1053', customer: 'Daniel Kim', email: 'daniel.k@email.com', items: 1, total: 44.99, status: 'completed', date: new Date('2026-01-02T09:40:00'), time: '1 week ago' },
    { id: 'ORD-1052', customer: 'Jennifer Lee', email: 'jennifer.l@email.com', items: 3, total: 149.97, status: 'processing', date: new Date('2025-12-31T14:20:00'), time: '2 weeks ago' },
    { id: 'ORD-1051', customer: 'Michael Scott', email: 'michael.s@email.com', items: 2, total: 94.98, status: 'completed', date: new Date('2025-12-28T10:30:00'), time: '2 weeks ago' },
    { id: 'ORD-1050', customer: 'Amanda Taylor', email: 'amanda.t@email.com', items: 6, total: 319.94, status: 'shipped', date: new Date('2025-12-26T15:45:00'), time: '2 weeks ago' },
    { id: 'ORD-1049', customer: 'Brian Miller', email: 'brian.m@email.com', items: 1, total: 34.99, status: 'completed', date: new Date('2025-12-23T11:20:00'), time: '3 weeks ago' },
    { id: 'ORD-1048', customer: 'Catherine Wu', email: 'catherine.w@email.com', items: 4, total: 189.96, status: 'pending', date: new Date('2025-12-20T13:30:00'), time: '3 weeks ago' },
    { id: 'ORD-1047', customer: 'Eric Anderson', email: 'eric.a@email.com', items: 3, total: 129.97, status: 'completed', date: new Date('2025-12-18T16:40:00'), time: '3 weeks ago' },

    // Older orders
    { id: 'ORD-1046', customer: 'Laura Martinez', email: 'laura.m@email.com', items: 2, total: 79.98, status: 'completed', date: new Date('2025-12-10T10:15:00'), time: '1 month ago' },
    { id: 'ORD-1045', customer: 'Steven Yang', email: 'steven.y@email.com', items: 5, total: 269.95, status: 'shipped', date: new Date('2025-12-05T14:25:00'), time: '1 month ago' },
    { id: 'ORD-1044', customer: 'Monica Lewis', email: 'monica.l@email.com', items: 1, total: 54.99, status: 'completed', date: new Date('2025-11-28T09:30:00'), time: '1 month ago' },
    { id: 'ORD-1043', customer: 'Patrick Hughes', email: 'patrick.h@email.com', items: 3, total: 164.97, status: 'completed', date: new Date('2025-11-20T15:50:00'), time: '2 months ago' },
    { id: 'ORD-1042', customer: 'Jessica Wang', email: 'jessica.w@email.com', items: 2, total: 89.98, status: 'shipped', date: new Date('2025-11-15T11:40:00'), time: '2 months ago' },
    { id: 'ORD-1041', customer: 'Robert Singh', email: 'robert.s@email.com', items: 4, total: 219.96, status: 'completed', date: new Date('2025-11-08T13:20:00'), time: '2 months ago' },
  ]);

  // Read URL parameters on mount
  useEffect(() => {
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    if (status) {
      setStatusFilters(status.split(','));
    }

    if (date && ['today', 'week', 'month', 'all'].includes(date)) {
      setDateFilter(date);
    }
  }, [searchParams]);

  // Update URL when filters change
  const updateURLParams = (newStatusFilters, newDateFilter) => {
    const params = new URLSearchParams();

    if (newStatusFilters.length > 0) {
      params.set('status', newStatusFilters.join(','));
    }

    if (newDateFilter && newDateFilter !== 'all') {
      params.set('date', newDateFilter);
    }

    setSearchParams(params, { replace: true });
  };

  // Filtering logic
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Apply status filters
    if (statusFilters.length > 0) {
      result = result.filter(order => statusFilters.includes(order.status));
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      result = result.filter(order => {
        const orderDate = new Date(order.date);

        switch(dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setDate(today.getDate() - 30);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query)
      );
    }

    return result;
  }, [orders, statusFilters, dateFilter, searchQuery]);

  // Sorting logic
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];

    sorted.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Special handling for date
      if (sortConfig.key === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredOrders, sortConfig]);

  // Helper functions
  const handleLogout = async () => {
    await logout();
    navigate('/merchant/login');
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>;
    }
    return <span style={{ marginLeft: '4px' }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const getStatusStyle = (status) => {
    const styles = {
      completed: {
        background: colors.status.success.bg,
        color: colors.status.success.text
      },
      processing: {
        background: colors.status.warning.bg,
        color: colors.status.warning.text
      },
      shipped: {
        background: colors.status.info.bg,
        color: colors.status.info.text
      },
      pending: {
        background: colors.status.pending.bg,
        color: colors.status.pending.text
      }
    };
    return styles[status] || styles.pending;
  };

  const formatDate = (dateValue) => {
    const date = new Date(dateValue);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStatusFilterChange = (status) => {
    const newFilters = statusFilters.includes(status)
      ? statusFilters.filter(s => s !== status)
      : [...statusFilters, status];
    setStatusFilters(newFilters);
    updateURLParams(newFilters, dateFilter);
  };

  const handleDateFilterChange = (newDateFilter) => {
    setDateFilter(newDateFilter);
    setIsDateDropdownOpen(false);
    updateURLParams(statusFilters, newDateFilter);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilters([]);
    setDateFilter('all');
    setIsStatusDropdownOpen(false);
    setIsDateDropdownOpen(false);
    setSearchParams({}, { replace: true });
  };

  const DATE_LABELS = {
    'today': 'Today',
    'week': 'This Week',
    'month': 'This Month',
    'all': 'All Time'
  };

  const STATUSES = ['pending', 'processing', 'shipped', 'completed'];

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
          <ThemeToggle style={{ display: 'none' }} />
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
      <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px' }}>
          <span onClick={() => navigate('/merchant')} style={{ color: colors.primary.blue, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
          </span>
          <span style={{ color: colors.border.color }}>/</span>
          <span style={{ color: colors.text.primary, fontWeight: '500' }}>Orders</span>
        </nav>

        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.text.primary, margin: '0 0 8px' }}>
            Orders
          </h1>
          <p style={{ fontSize: '14px', color: colors.text.secondary, margin: 0 }}>
            Showing {sortedOrders.length} order{sortedOrders.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.text.muted }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by order ID, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 40px', fontSize: '14px', border: `1px solid ${colors.border.color}`, borderRadius: '8px', background: colors.card.background, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Date Filter Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              style={{ padding: '10px 36px 10px 12px', fontSize: '14px', border: `1px solid ${colors.border.color}`, borderRadius: '8px', background: colors.card.background, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', position: 'relative' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.text.secondary} strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span style={{ color: dateFilter !== 'all' ? colors.text.primary : colors.text.secondary }}>{DATE_LABELS[dateFilter]}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.text.secondary} strokeWidth="2" style={{ position: 'absolute', right: '10px', transform: isDateDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {isDateDropdownOpen && (
              <>
                <div onClick={() => setIsDateDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', width: '200px', background: colors.card.background, borderRadius: '10px', border: `1px solid ${colors.border.color}`, boxShadow: colors.shadow.md, zIndex: 50, overflow: 'hidden' }}>
                  {Object.entries(DATE_LABELS).map(([key, label]) => (
                    <div
                      key={key}
                      onClick={() => handleDateFilterChange(key)}
                      style={{
                        padding: '10px 12px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: dateFilter === key ? colors.icon.bgBlue : colors.card.background,
                        color: dateFilter === key ? colors.primary.blue : colors.text.tertiary,
                        fontWeight: dateFilter === key ? '500' : '400'
                      }}
                    >
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: dateFilter === key ? 'none' : `2px solid ${colors.border.color}`, background: dateFilter === key ? colors.primary.blue : colors.card.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {dateFilter === key && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                      </div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              style={{ padding: '10px 36px 10px 12px', fontSize: '14px', border: `1px solid ${colors.border.color}`, borderRadius: '8px', background: colors.card.background, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px', position: 'relative' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.text.secondary} strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span style={{ color: statusFilters.length > 0 ? colors.text.primary : colors.text.secondary }}>
                {statusFilters.length === 0 ? 'Filter by Status' : `${statusFilters.length} status${statusFilters.length > 1 ? 'es' : ''} selected`}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.text.secondary} strokeWidth="2" style={{ position: 'absolute', right: '10px', transform: isStatusDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {isStatusDropdownOpen && (
              <>
                <div onClick={() => setIsStatusDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', width: '280px', background: colors.card.background, borderRadius: '10px', border: `1px solid ${colors.border.color}`, boxShadow: colors.shadow.md, zIndex: 50, overflow: 'hidden' }}>
                  {statusFilters.length > 0 && (
                    <div style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.border.color}`, background: colors.card.backgroundAlt }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: colors.text.tertiary, textTransform: 'uppercase' }}>
                          Selected ({statusFilters.length})
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setStatusFilters([]); updateURLParams([], dateFilter); }}
                          style={{ fontSize: '12px', color: colors.primary.blue, background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Clear all
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {statusFilters.map(status => (
                          <span key={status} style={{ padding: '4px 8px', fontSize: '12px', ...getStatusStyle(status), borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusFilterChange(status); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit' }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {STATUSES.map(status => {
                      const isSelected = statusFilters.includes(status);
                      const count = orders.filter(order => order.status === status).length;
                      return (
                        <div
                          key={status}
                          onClick={() => handleStatusFilterChange(status)}
                          style={{
                            padding: '10px 12px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: isSelected ? colors.icon.bgBlue : colors.card.background
                          }}
                        >
                          <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: isSelected ? 'none' : `2px solid ${colors.border.color}`, background: isSelected ? colors.primary.blue : colors.card.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <span style={{ color: isSelected ? colors.primary.blueDark : colors.text.tertiary, fontWeight: isSelected ? '500' : '400' }}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                          <span style={{ marginLeft: 'auto', fontSize: '12px', color: colors.text.muted }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || statusFilters.length > 0 || dateFilter !== 'all') && (
            <button
              onClick={handleClearFilters}
              style={{ padding: '10px 16px', fontSize: '14px', color: colors.text.secondary, background: colors.card.background, border: `1px solid ${colors.border.color}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear filters
            </button>
          )}
        </div>

        {/* Orders Table */}
        <div style={{ background: colors.card.background, borderRadius: '12px', border: `1px solid ${colors.border.color}`, overflow: 'hidden' }}>
          {sortedOrders.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.text.muted} strokeWidth="2" style={{ margin: '0 auto 16px' }}>
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.text.primary, margin: '0 0 8px' }}>No orders found</h3>
              <p style={{ fontSize: '14px', color: colors.text.secondary, margin: 0 }}>Try adjusting your filters to see more results</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: colors.card.backgroundAlt }}>
                  <th
                    onClick={() => handleSort('id')}
                    style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.text.tertiary, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Order ID <SortIcon column="id" />
                  </th>
                  <th
                    onClick={() => handleSort('customer')}
                    style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.text.tertiary, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Customer <SortIcon column="customer" />
                  </th>
                  <th
                    onClick={() => handleSort('items')}
                    style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: colors.text.tertiary, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', width: '80px' }}
                  >
                    Items <SortIcon column="items" />
                  </th>
                  <th
                    onClick={() => handleSort('total')}
                    style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: colors.text.tertiary, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', width: '100px' }}
                  >
                    Total <SortIcon column="total" />
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: colors.text.tertiary, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', width: '120px' }}
                  >
                    Status <SortIcon column="status" />
                  </th>
                  <th
                    onClick={() => handleSort('date')}
                    style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: colors.text.tertiary, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', width: '120px' }}
                  >
                    Date <SortIcon column="date" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => (
                  <tr key={order.id} style={{ borderTop: `1px solid ${colors.border.color}` }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: colors.text.primary }}>{order.id}</div>
                      <div style={{ fontSize: '12px', color: colors.text.muted }}>{order.time}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: '14px', color: colors.text.primary }}>{order.customer}</div>
                      <div style={{ fontSize: '12px', color: colors.text.muted }}>{order.email}</div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: colors.text.tertiary, textAlign: 'center' }}>
                      {order.items}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '600', color: colors.text.primary, textAlign: 'right' }}>
                      ${order.total.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: '500',
                        borderRadius: '12px',
                        ...getStatusStyle(order.status)
                      }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: colors.text.tertiary, textAlign: 'right' }}>
                      {formatDate(order.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}
