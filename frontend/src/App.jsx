import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SearchProvider } from './contexts/SearchContext'
import { FittingRoomProvider } from './contexts/FittingRoomContext'
import StorefrontLandingPage from './pages/StorefrontLandingPage'
import ShoppingConciergePage from './pages/ShoppingConciergePage'
import QuizPage from './pages/QuizPage'
import SearchResultsPage from './pages/SearchResultsPage'
import FittingRoomPage from './pages/FittingRoomPage'
import BrowsePage from './pages/BrowsePage'
import MerchantHomePage from './pages/MerchantHomePage'
import LoginPage from './pages/MerchantLoginPage'
import DashboardPage from './pages/MerchantDashboardPage'
import OrdersPage from './pages/MerchantOrdersPage'
import BulkImportPage from './pages/MerchantBulkImportPage'

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

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
      <Route path="/" element={<StorefrontLandingPage />} />
      <Route path="/concierge" element={<ShoppingConciergePage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/fitting-room" element={<FittingRoomPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/browse/:category" element={<BrowsePage />} />

      {/* Merchant Routes */}
      <Route
        path="/merchant/login"
        element={
          isAuthenticated
            ? <Navigate to="/merchant" replace />
            : <LoginPage />
        }
      />
      <Route
        path="/merchant"
        element={
          isAuthenticated
            ? <MerchantHomePage />
            : <Navigate to="/merchant/login" replace />
        }
      />
      <Route
        path="/merchant/inventory"
        element={
          isAuthenticated
            ? <DashboardPage />
            : <Navigate to="/merchant/login" replace />
        }
      />
      <Route
        path="/merchant/orders"
        element={
          isAuthenticated
            ? <OrdersPage />
            : <Navigate to="/merchant/login" replace />
        }
      />
      <Route
        path="/merchant/import"
        element={
          isAuthenticated
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
