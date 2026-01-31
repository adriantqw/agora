import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SearchProvider } from './contexts/SearchContext'
import { FittingRoomProvider } from './contexts/FittingRoomContext'
import ConsumerLandingPage from './pages/ConsumerLandingPage'
import ShoppingConciergePage from './pages/ShoppingConciergePage'
import SearchResultsPage from './pages/SearchResultsPage'
import FittingRoomPage from './pages/FittingRoomPage'
import BrowsePage from './pages/BrowsePage'
import ConsumerLoginPage from './pages/ConsumerLoginPage'
import ConsumerProfilePage from './pages/ConsumerProfilePage'
import JourneysPage from './pages/JourneysPage'
import InventoryPage from './pages/InventoryPage'
import WishlistPage from './pages/WishlistPage'
import ConsumerSettingsPage from './pages/ConsumerSettingsPage'
import ConsumerOrdersPage from './pages/ConsumerOrdersPage'
import SharedWishlistPage from './pages/SharedWishlistPage'
import RecommendationPage from './pages/RecommendationPage'
import StyleProfilePage from './pages/StyleProfilePage'
import MerchantHomePage from './pages/MerchantHomePage'
import LoginPage from './pages/MerchantLoginPage'
import DashboardPage from './pages/MerchantDashboardPage'
import OrdersPage from './pages/MerchantOrdersPage'
import BulkImportPage from './pages/MerchantBulkImportPage'

function AppRoutes() {
  const { isAuthenticated, userType, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f8f9fb'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#718096'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<ConsumerLandingPage />} />
      <Route path="/journey" element={<ShoppingConciergePage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/fitting-room" element={<FittingRoomPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/browse/:category" element={<BrowsePage />} />
      
      <Route 
        path="/login" 
        element={
          isAuthenticated && userType === 'consumer' 
            ? <Navigate to="/profile" replace /> 
            : <ConsumerLoginPage />
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          isAuthenticated 
            ? <ConsumerProfilePage /> 
            : <Navigate to="/login" replace />
        } 
      />

      <Route path="/journeys" element={<JourneysPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/shared-wishlist/:token" element={<SharedWishlistPage />} />
      <Route path="/settings" element={<ConsumerSettingsPage />} />
      <Route path="/orders" element={<ConsumerOrdersPage />} />
      <Route path="/recommendations" element={<RecommendationPage />} />
      <Route path="/style-profile" element={<StyleProfilePage />} />

      {/* Merchant Routes */}
      <Route
        path="/merchant/login"
        element={
          isAuthenticated && userType === 'merchant'
            ? <Navigate to="/merchant" replace />
            : <LoginPage />
        }
      />
      <Route
        path="/merchant"
        element={
          isAuthenticated && userType === 'merchant'
            ? <MerchantHomePage />
            : <Navigate to="/merchant/login" replace />
        }
      />
      <Route
        path="/merchant/inventory"
        element={
          isAuthenticated && userType === 'merchant'
            ? <DashboardPage />
            : <Navigate to="/merchant/login" replace />
        }
      />
      <Route
        path="/merchant/orders"
        element={
          isAuthenticated && userType === 'merchant'
            ? <OrdersPage />
            : <Navigate to="/merchant/login" replace />
        }
      />
      <Route
        path="/merchant/import"
        element={
          isAuthenticated && userType === 'merchant'
            ? <BulkImportPage />
            : <Navigate to="/merchant/login" replace />
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <FittingRoomProvider>
            <AppRoutes />
          </FittingRoomProvider>
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App