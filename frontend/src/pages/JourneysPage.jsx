import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Compass, Archive, CheckCircle, ChevronLeft, ChevronRight, LogIn, Trash2 } from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header/Header';
import CollapsibleJourneySection from '../components/consumer/JourneySection/CollapsibleJourneySection';
import { mockJourneys } from '../data/mockJourneys';
import journeyService from '../services/journeyService';
import { getIconByName } from '../utils/iconMapper';

const ITEMS_PER_PAGE = 3;

const JourneysPage = () => {
  const colors = useThemeColors();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'
  const [currentPage, setCurrentPage] = useState(1);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data transformation functions
  const mapDatabaseJourneyToFrontend = (dbJourney) => {
    const statusMap = {
      'ideation': 'in_progress',
      'in-progress': 'in_progress',
      'active': 'completed'
    };
    
    const generateSummaryContext = (journey) => {
      const title = journey.title || '';
      const searchQuery = journey.search_query || '';
      
      const getOccasion = () => {
        const keywords = {
          'wedding': 'Wedding Guest',
          'gala': 'Gala Dinner',
          'office': 'Work Event',
          'night out': 'Night Out',
          'summer': 'Beach Day',
          'beach': 'Beach Day',
          'date': 'Date Night',
          'club': 'Clubbing',
          'dinner': 'Dinner Event'
        };
        const text = (title + ' ' + searchQuery).toLowerCase();
        for (const [key, value] of Object.entries(keywords)) {
          if (text.includes(key)) return value;
        }
        return 'General Shopping';
      };
      
      const getStyle = () => {
        const keywords = {
          'chic': 'Chic',
          'professional': 'Professional',
          'formal': 'Formal',
          'casual': 'Casual',
          'edgy': 'Edgy',
          'romantic': 'Romantic',
          'bold': 'Bold'
        };
        const text = title.toLowerCase();
        for (const [key, value] of Object.entries(keywords)) {
          if (text.includes(key)) return value;
        }
        return 'Personal Style';
      };
      
      return {
        occasion: getOccasion(),
        style: getStyle(),
        budget: 'Flexible',
        weather: 'TBD'
      };
    };
    
    const mapDatabaseOutfitToFrontend = (dbOutfit) => ({
      id: dbOutfit.id,
      label: dbOutfit.label,
      subtext: dbOutfit.subtext,
      price: dbOutfit.price,
      imageUrl: dbOutfit.image_url,
      icon: getIconByName(dbOutfit.icon_name) || getIconByName('Shirt'),
      iconColor: dbOutfit.icon_color,
      backgroundColor: dbOutfit.background_color,
      isAIPick: dbOutfit.is_ai_pick
    });
    
    return {
      id: dbJourney.id,
      title: dbJourney.title,
      status: statusMap[dbJourney.status] || 'in_progress',
      statusColor: dbJourney.status_color || '#4299e1',
      statusLabel: dbJourney.status_label || 'Active',
      closetUrl: dbJourney.closet_url || `/curate-my-fit?journey=${dbJourney.id}`,
      summaryContext: generateSummaryContext(dbJourney),
      outfits: (dbJourney.outfits || []).map(mapDatabaseOutfitToFrontend)
    };
  };

  // Fetch journeys from API or use mock data
  useEffect(() => {
    const fetchJourneys = async () => {
      setLoading(true);
      setError(null);
      
      if (isAuthenticated) {
        try {
          const data = await journeyService.getJourneys();
          if (data && Array.isArray(data)) {
            const transformedJourneys = data.map(mapDatabaseJourneyToFrontend);
            setJourneys(transformedJourneys);
          } else {
            setJourneys([]);
          }
        } catch (err) {
          console.error('Failed to fetch journeys:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback to mock data for unauthenticated users
        setJourneys(mockJourneys);
        setLoading(false);
      }
    };
    
    fetchJourneys();
  }, [isAuthenticated]);

  // Filter journeys based on active tab
  const filteredJourneys = journeys.filter(j => 
    activeTab === 'active' 
      ? j.status === 'in_progress'
      : j.status === 'completed'
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredJourneys.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentJourneys = filteredJourneys.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleOutfitAdd = (outfit, journey) => {
    // Logic to add to closet/cart
    console.log(`Added ${outfit.label} from ${journey.title}`);
  };

  const handleDeleteJourney = async (journeyId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this journey?')) {
      return;
    }
    
    try {
      const success = await journeyService.deleteJourney(journeyId);
      if (success) {
        setJourneys(prev => prev.filter(j => j.id !== journeyId));
        // Reset page if needed
        const newFiltered = journeys.filter(j => j.id !== journeyId && 
          (activeTab === 'active' ? j.status === 'in_progress' : j.status === 'completed'));
        const newTotalPages = Math.ceil(newFiltered.length / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        alert('Failed to delete journey');
      }
    } catch (err) {
      console.error('Error deleting journey:', err);
      alert('Error deleting journey: ' + err.message);
    }
  };

  const handleStartNewJourney = () => {
    navigate('/curate-my-fit');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header variant="full" showNav={true} />
        <main style={{ 
          flexGrow: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '40px 20px'
        }}>
          <div style={{ textAlign: 'center', color: colors.text.secondary }}>
            <p>Loading your journeys...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header variant="full" showNav={true} />
        <main style={{ 
          flexGrow: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '40px 20px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h2 style={{ color: colors.text.primary, marginBottom: '16px' }}>Failed to Load Journeys</h2>
            <p style={{ color: colors.text.secondary, marginBottom: '24px' }}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: colors.primary.eggPink,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header variant="full" showNav={true} />

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
            background: colors.card.background,
            borderRadius: '32px',
            boxShadow: colors.shadow.md,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            border: `1px solid ${colors.border.subtle}`
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
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 21V4C5 4 5 3 7 3C9 3 10 4 12 4C14 4 15 3 17 3C19 3 19 4 19 4V14C19 14 19 15 17 15C15 15 14 14 12 14C10 14 9 15 7 15C5 15 5 14 5 14" fill="currentColor" opacity="0.8"/>
                <path d="M7 14V21H5V14H7Z" fill="currentColor"/>
              </svg>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.text.primary, margin: 0 }}>No Journeys Yet</h1>
            <p style={{ color: colors.text.secondary, fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
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
                  boxShadow: `0 4px 14px ${colors.primary.pink}66`,
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
                  color: colors.text.secondary,
                  border: `1px solid ${colors.border.color}`,
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
                  e.currentTarget.style.borderColor = colors.border.color;
                  e.currentTarget.style.color = colors.text.secondary;
                }}
              >
                <span>Back to Home</span>
              </button>
            </div>
          </div>
              </main>
            </div>    );
  }

  return (
    <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header variant="full" showNav={true} />

      <main style={{ 
        flexGrow: 1, 
        padding: '40px 6%',
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Page Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '800', 
              color: colors.text.primary,
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              My Journeys
            </h1>
            <p style={{ color: colors.text.secondary, fontSize: '16px' }}>
              Track your active style explorations and curated collections.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
             <button
                onClick={handleStartNewJourney}
                style={{
                  padding: '12px 24px',
                  background: colors.primary.eggPink,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 12px ${colors.primary.eggPink}60`,
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Plus size={20} strokeWidth={3} />
                <span>Start New Journey</span>
              </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '40px',
            borderBottom: `1px solid ${colors.border.divider}`,
            paddingBottom: '16px'
        }}>
            <button
                onClick={() => setActiveTab('active')}
                style={{
                    padding: '8px 16px',
                    borderRadius: '99px',
                    border: 'none',
                    background: activeTab === 'active' ? colors.primary.eggPinkLight : 'transparent',
                    color: activeTab === 'active' ? colors.text.primary : colors.text.secondary,
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }}
            >
                <Compass size={16} />
                In Progress
                <span style={{ 
                    background: activeTab === 'active' ? '#FFF' : colors.card.backgroundAlt,
                    color: activeTab === 'active' ? '#1A202C' : 'inherit',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    opacity: 0.8
                }}>
                    {journeys.filter(j => j.status === 'in_progress').length}
                </span>
            </button>

            <button
                onClick={() => setActiveTab('completed')}
                style={{
                    padding: '8px 16px',
                    borderRadius: '99px',
                    border: 'none',
                    background: activeTab === 'completed' ? colors.status.success.bg + '40' : 'transparent',
                    color: activeTab === 'completed' ? colors.status.success.text : colors.text.secondary,
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }}
            >
                <CheckCircle size={16} />
                Completed
                <span style={{ 
                    background: activeTab === 'completed' ? '#FFF' : colors.card.backgroundAlt,
                    color: activeTab === 'completed' ? '#1A202C' : 'inherit',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    opacity: 0.8
                }}>
                    {journeys.filter(j => j.status === 'completed').length}
                </span>
            </button>
        </div>

        {/* Journeys List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {currentJourneys.map((journey, index) => (
            <React.Fragment key={journey.id}>
              <div style={{ position: 'relative' }}>
                <CollapsibleJourneySection
                  journey={journey}
                  onOutfitAdd={handleOutfitAdd}
                />
                <button
                  onClick={(e) => handleDeleteJourney(journey.id, e)}
                  style={{
                    position: 'absolute',
                    top: '24px',
                    right: '16px',
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: colors.text.tertiary,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${colors.status.error.text}15`;
                    e.currentTarget.style.color = colors.status.error.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = colors.text.tertiary;
                  }}
                  title="Delete journey"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              {index < currentJourneys.length - 1 && (
                <div style={{
                  height: '2px',
                  background: colors.border.divider,
                  margin: '48px 0',
                  width: '100%',
                  opacity: 0.8
                }} />
              )}
            </React.Fragment>
          ))}

          {filteredJourneys.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: colors.card.background,
              borderRadius: '24px',
              border: `1px dashed ${colors.border.subtle}`
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: colors.card.backgroundAlt,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                color: colors.text.tertiary
              }}>
                {activeTab === 'active' ? <Compass size={32} /> : <Archive size={32} />}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text.primary, marginBottom: '8px' }}>
                No {activeTab === 'active' ? 'active' : 'completed'} journeys found
              </h3>
              <p style={{ color: colors.text.secondary, marginBottom: '24px' }}>
                {activeTab === 'active' 
                    ? "Start a new conversation with your AI stylist to create your first collection."
                    : "Your completed style journeys will be archived here."}
              </p>
              {activeTab === 'active' && (
                  <button
                    onClick={handleStartNewJourney}
                    style={{
                      color: colors.primary.eggPink,
                      fontWeight: '600',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    Start Styling Now &rarr;
                  </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '64px',
                gap: '16px'
            }}>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: `1px solid ${colors.border.subtle}`,
                        background: colors.card.background,
                        color: currentPage === 1 ? colors.text.muted : colors.text.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <ChevronLeft size={20} />
                </button>

                <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text.secondary }}>
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: `1px solid ${colors.border.subtle}`,
                        background: colors.card.background,
                        color: currentPage === totalPages ? colors.text.muted : colors.text.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}
      </main>
    </div>
  );
};

export default JourneysPage;
