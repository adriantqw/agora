import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import StorefrontLandingPage from './pages/StorefrontLandingPage'
import ShoppingConciergePage from './pages/ShoppingConciergePage'
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
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
