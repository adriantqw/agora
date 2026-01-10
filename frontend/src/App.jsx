import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import StorefrontLandingPage from './pages/StorefrontLandingPage'
import MerchantHomePage from './pages/MerchantHomePage'
import LoginPage from './pages/MerchantLoginPage'
import DashboardPage from './pages/MerchantDashboardPage'
import BulkImportPage from './pages/MerchantBulkImportPage'
import PDFImportPage from './pages/PDFImportPage'

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
      {/* Public Route */}
      <Route path="/" element={<StorefrontLandingPage />} />

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
        path="/merchant/import"
        element={
          isAuthenticated
            ? <BulkImportPage />
            : <Navigate to="/merchant/login" replace />
        }
      />
      <Route
        path="/merchant/pdf-import"
        element={
          isAuthenticated
            ? <PDFImportPage />
            : <Navigate to="/merchant/login" replace />
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
