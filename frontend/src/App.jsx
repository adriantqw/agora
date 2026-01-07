import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

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
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/" replace />
            : <LoginPage onLogin={handleLogin} />
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated
            ? <DashboardPage onLogout={handleLogout} />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  )
}

export default App
