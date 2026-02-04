import consumerAuthService from './consumerAuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Curate My Fit API Service
 * Integrates with backend curate-my-fit endpoints
 */

/**
 * Start a new batch session with search query and images.
 *
 * @param {string} searchQuery - User's search query
 * @param {File[]} images - Array of image files (max 5)
 * @returns {Promise<object>} Response with threadId, blurb, questions, summaryUpdates, imageUrls
 */
export const startBatch = async (searchQuery, images = []) => {
  // Get token if available (guest mode support)
  const token = consumerAuthService.getToken();

  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append('searchQuery', searchQuery);

  // Append images to FormData
  images.forEach((image) => {
    formData.append('images', image);
  });

  try {
    const headers = {};
    // Only add Authorization header if token exists (guest mode support)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/curate-my-fit/start`, {
      method: 'POST',
      headers: headers,
      // Note: Do NOT set Content-Type for FormData - browser sets it automatically with boundary
      body: formData
    });

    // Handle 401 responses (only if token was provided)
    if (response.status === 401 && token) {
      consumerAuthService.clearTokens();
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    // Handle errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `Request failed with status ${response.status}`
      }));
      throw new Error(error.detail || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Return the nested data object
  } catch (error) {
    console.error('Start batch error:', error);
    throw error;
  }
};

/**
 * Submit batch answers to PersonalStylist agent.
 *
 * @param {string} threadId - Thread ID from startBatch
 * @param {object} answers - Dictionary of questionId -> AnswerData
 * @returns {Promise<object>} Response with hasMore flag and either next batch or final journey
 */
export const submitBatchAnswers = async (threadId, answers) => {
  // Get token if available (guest mode support)
  const token = consumerAuthService.getToken();

  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    // Only add Authorization header if token exists (guest mode support)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/curate-my-fit/submit`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ threadId, answers })
    });

    // Handle 401 responses (only if token was provided)
    if (response.status === 401 && token) {
      consumerAuthService.clearTokens();
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    // Handle errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `Request failed with status ${response.status}`
      }));
      throw new Error(error.detail || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Return the nested data object
  } catch (error) {
    console.error('Submit batch answers error:', error);
    throw error;
  }
};

/**
 * Get session state for autosave/resume (PLACEHOLDER - not yet implemented).
 *
 * @param {string} threadId - Thread ID from startBatch
 * @returns {Promise<object>} Response with threadId, answers, lastUpdated, expiresAt
 */
export const getState = async (threadId) => {
  // TODO: This endpoint is not yet implemented in the backend
  // Return a placeholder response for now
  throw new Error('Autosave functionality not yet implemented');

  // Future implementation:
  // await consumerAuthService.ensureValidToken();
  // const token = consumerAuthService.getToken();
  //
  // const response = await fetch(`${API_BASE_URL}/api/curate-my-fit/state/${threadId}`, {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${token}`
  //   }
  // });
  //
  // if (!response.ok) {
  //   throw new Error('Failed to get state');
  // }
  //
  // const data = await response.json();
  // return data.data;
};

export default {
  startBatch,
  submitBatchAnswers,
  getState
};
