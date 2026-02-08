import consumerAuthService from './consumerAuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const journeyService = {
  /**
   * Get all journeys for the current user
   */
  async getJourneys() {
    const token = consumerAuthService.getToken();
    
    // If no token, return null (caller can fallback to guest data)
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/journeys`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
            // Token might be expired
            return null;
        }
        throw new Error('Failed to fetch journeys');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching journeys:', error);
      return null;
    }
  },

  /**
   * Delete a journey by ID
   */
  async deleteJourney(journeyId) {
    const token = consumerAuthService.getToken();
    
    if (!token) return false;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
            // Token might be expired
            return false;
        }
        if (response.status === 403) {
            throw new Error('Not authorized to delete this journey');
        }
        if (response.status === 404) {
            throw new Error('Journey not found');
        }
        throw new Error('Failed to delete journey');
      }

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Error deleting journey:', error);
      return false;
    }
  }
};

export default journeyService;
