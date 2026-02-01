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
   * Save a new journey
   * Falls back to local ID on 404/501 so UI doesn't break if endpoint is missing
   */
  async saveJourney(journeyData) {
    const token = consumerAuthService.getToken();

    try {
      const response = await fetch(`${API_BASE_URL}/api/journeys`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(journeyData),
      });

      if (response.status === 404 || response.status === 501) {
        console.warn('Journey save endpoint not available — using local fallback');
        return { ...journeyData, id: `local-${Date.now()}` };
      }

      if (!response.ok) {
        throw new Error(`Failed to save journey: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Journey save failed — using local fallback:', error.message);
      return { ...journeyData, id: `local-${Date.now()}` };
    }
  },

  /**
   * Update an existing journey
   * Falls back gracefully on 404/501
   */
  async updateJourney(id, data) {
    const token = consumerAuthService.getToken();

    try {
      const response = await fetch(`${API_BASE_URL}/api/journeys/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 404 || response.status === 501) {
        console.warn('Journey update endpoint not available — using local fallback');
        return { id, ...data };
      }

      if (!response.ok) {
        throw new Error(`Failed to update journey: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Journey update failed — using local fallback:', error.message);
      return { id, ...data };
    }
  },

  /**
   * Delete a journey by ID
   * Returns true on success, false on failure
   */
  async deleteJourney(id) {
    const token = consumerAuthService.getToken();

    try {
      const response = await fetch(`${API_BASE_URL}/api/journeys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting journey:', error);
      return false;
    }
  },
};

export default journeyService;
