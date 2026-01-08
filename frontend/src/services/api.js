import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Generic fetch helper with automatic authentication
 */
export async function fetchWithAuth(url, options = {}) {
  // Ensure token is valid before making request
  await authService.ensureValidToken();

  const token = authService.getToken();

  // Merge headers with Authorization
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  // Make the request
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });

  // Handle 401 responses
  if (response.status === 401) {
    authService.clearTokens();
    window.location.href = '/merchant/login';
    throw new Error('Authentication required');
  }

  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: `Request failed with status ${response.status}` }
    }));
    throw new Error(error.error?.message || `Request failed with status ${response.status}`);
  }

  // Return parsed JSON
  return response.json();
}

/**
 * Helper for GET requests
 */
export async function get(url, options = {}) {
  return fetchWithAuth(url, { ...options, method: 'GET' });
}

/**
 * Helper for POST requests
 */
export async function post(url, data, options = {}) {
  return fetchWithAuth(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Helper for PUT requests
 */
export async function put(url, data, options = {}) {
  return fetchWithAuth(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * Helper for DELETE requests
 */
export async function del(url, options = {}) {
  return fetchWithAuth(url, { ...options, method: 'DELETE' });
}
