import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import consumerAuthService from '../services/consumerAuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'merchant' | 'consumer'
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUserType = localStorage.getItem('userType') || 'merchant';
      const service = storedUserType === 'consumer' ? consumerAuthService : authService;

      if (service.isAuthenticated()) {
        try {
          // Fetch user profile if token exists
          const userData = await service.getMe();
          setUser(userData);
          setUserType(storedUserType);
          setIsAuthenticated(true);
        } catch (error) {
          console.error(`Failed to fetch ${storedUserType} profile:`, error);
          service.clearTokens();
          setUser(null);
          setUserType(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    // Default login (Merchant) - preserving backward compatibility
    return loginMerchant(email, password);
  };

  const loginMerchant = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('userType', 'merchant');
    setUser(data.user);
    setUserType('merchant');
    setIsAuthenticated(true);
    return data;
  };

  const loginConsumer = async (email, password) => {
    const data = await consumerAuthService.login(email, password);
    // userType is set in service, but we set state here
    setUser(data.user);
    setUserType('consumer');
    setIsAuthenticated(true);
    return data;
  };

  const logout = async () => {
    const service = userType === 'consumer' ? consumerAuthService : authService;
    await service.logout();
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    try {
      const service = userType === 'consumer' ? consumerAuthService : authService;
      const userData = await service.getMe();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  const value = {
    user,
    userType,
    isAuthenticated,
    loading,
    login, // Merchant login (legacy)
    loginMerchant,
    loginConsumer,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}