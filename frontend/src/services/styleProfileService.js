import consumerAuthService from './consumerAuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const styleProfileService = {
  async getStyleProfile() {
    const token = consumerAuthService.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/style-profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 404) return null; // No profile yet
        throw new Error('Failed to fetch style profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching style profile:', error);
      return null;
    }
  },

  async createStyleProfile(profileData) {
    const token = consumerAuthService.getToken();

    const response = await fetch(`${API_BASE_URL}/api/style-profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create style profile');
    }

    return await response.json();
  },

  async updateStyleProfile(profileData) {
    const token = consumerAuthService.getToken();

    const response = await fetch(`${API_BASE_URL}/api/style-profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update style profile');
    }

    return await response.json();
  },

  async deleteStyleProfile() {
    const token = consumerAuthService.getToken();

    const response = await fetch(`${API_BASE_URL}/api/style-profile`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to delete style profile');
  }
};

export default styleProfileService;
