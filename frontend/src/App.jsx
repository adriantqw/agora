import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import StorefrontLandingPage from './pages/StorefrontLandingPage'
import LoginPage from './pages/MerchantLoginPage'
import DashboardPage from './pages/MerchantDashboardPage'
import BulkImportPage from './pages/MerchantBulkImportPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
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
            ? <Navigate to="/merchant/dashboard" replace />
            : <LoginPage onLogin={handleLogin} />
        }
      />
      <Route
        path="/merchant"
        element={<Navigate to="/merchant/dashboard" replace />}
      />
      <Route
        path="/merchant/dashboard"
        element={
          isAuthenticated
            ? <DashboardPage onLogout={handleLogout} />
            : <Navigate to="/merchant/login" replace />
        }
      />
      <Route
        path="/merchant/import"
        element={
          isAuthenticated
            ? <BulkImportPage onLogout={handleLogout} />
            : <Navigate to="/merchant/login" replace />
        }
      />
    </Routes>
  )
}

export default App
