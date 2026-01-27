import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const consumerAuthService = {
  /**
   * Login with email and password
   */
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/consumer/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'Login failed'
      }));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();

    // Store tokens in localStorage
    this.setToken(data.access_token, data.refresh_token);
    
    // Store user type
    localStorage.setItem('userType', 'consumer');

    return {
      user: data.user,
      access_token: data.access_token,
      refresh_token: data.refresh_token
    };
  },

  /**
   * Logout and revoke refresh token
   */
  async logout() {
    const refreshToken = this.getRefreshToken();
    const token = this.getToken();

    if (refreshToken && token) {
      try {
        await fetch(`${API_BASE_URL}/api/consumer/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }

    // Clear tokens regardless of API call success
    this.clearTokens();
  },

  /**
   * Refresh access token using refresh token
   */
  async refresh() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/consumer/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      // Refresh token is invalid or expired, clear tokens
      this.clearTokens();
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    // Update access token in localStorage
    localStorage.setItem('authToken', data.access_token);
    if (data.refresh_token) {
        localStorage.setItem('refreshToken', data.refresh_token);
    }

    return data.access_token;
  },

  /**
   * Get current user profile
   */
  async getMe() {
    // Ensure token is valid before making request
    await this.ensureValidToken();

    const token = this.getToken();

    const response = await fetch(`${API_BASE_URL}/api/consumer/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearTokens();
        throw new Error('Authentication required');
      }
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return data;
  },

  /**
   * Get access token from localStorage
   */
  getToken() {
    return localStorage.getItem('authToken');
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Store tokens in localStorage
   */
  setToken(token, refreshToken) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
  },

  /**
   * Clear all tokens from localStorage
   */
  clearTokens() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
  },

  /**
   * Check if user is authenticated (has token)
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Check if token is expired
      if (decoded.exp && decoded.exp < currentTime) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  },

  /**
   * Check if token needs refresh (expires in < 5 minutes)
   */
  needsRefresh() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const fiveMinutes = 5 * 60; // 5 minutes in seconds

      // Check if token expires in less than 5 minutes
      if (decoded.exp && (decoded.exp - currentTime) < fiveMinutes) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  },

  /**
   * Ensure token is valid, refresh if needed
   */
  async ensureValidToken() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    if (this.needsRefresh()) {
      try {
        await this.refresh();
      } catch (error) {
        this.clearTokens();
        throw new Error('Failed to refresh authentication');
      }
    }
  }
};

export default consumerAuthService;
