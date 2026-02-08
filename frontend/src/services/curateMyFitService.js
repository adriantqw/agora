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

/**
 * Pre-upload images for streaming start batch.
 * SSE doesn't support multipart FormData, so images are uploaded separately.
 *
 * @param {File[]} images - Array of image files
 * @returns {Promise<{imageUrls: string[], imageTypes: string[]}>}
 */
export const uploadImages = async (images) => {
  const token = consumerAuthService.getToken();

  const formData = new FormData();
  images.forEach((image) => formData.append('images', image));

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/curate-my-fit/upload-images`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `Upload failed with status ${response.status}`,
    }));
    throw new Error(error.detail || `Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.data;
};

/**
 * Parse SSE stream from a fetch Response.
 * Buffers chunks, splits on double-newline, parses "data: " prefixed JSON lines.
 *
 * @param {Response} response - fetch Response with streaming body
 * @param {object} callbacks - Event handlers: {onThinkingStart, onThinking, onThinkingEnd, onMessage, onProcessing, onComplete, onError}
 * @param {AbortController} controller - For cancellation
 */
const consumeSSEStream = async (response, callbacks, controller) => {
  console.log('[SSE] Starting to consume stream');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('[SSE] Stream done');
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      console.log('[SSE] Received chunk:', chunk.substring(0, 100));
      buffer += chunk;

      // Split on double newline (SSE event boundary)
      const parts = buffer.split('\n\n');
      buffer = parts.pop(); // Keep incomplete chunk in buffer

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data: ')) continue;

        try {
          const event = JSON.parse(line.slice(6));
          console.log('[SSE] Event:', event.type);

          switch (event.type) {
            case 'thinking_start':
              callbacks.onThinkingStart?.();
              break;
            case 'thinking':
              callbacks.onThinking?.(event.content);
              break;
            case 'thinking_end':
              callbacks.onThinkingEnd?.();
              break;
            case 'journey_field':
              callbacks.onJourneyField?.(event.data);
              break;
            case 'message':
              callbacks.onMessage?.(event.content);
              break;
            case 'questions':
              callbacks.onQuestions?.(event.data);
              break;
            case 'processing':
              callbacks.onProcessing?.(event.message);
              break;
            case 'complete':
              callbacks.onComplete?.(event.data);
              break;
            case 'error':
              callbacks.onError?.(event.message);
              break;
          }
        } catch (parseErr) {
          console.warn('[SSE] Failed to parse event:', line, parseErr);
        }
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('[SSE] Stream error:', err);
      callbacks.onError?.(err.message);
    }
  }
};

/**
 * Start a batch session with streaming SSE responses.
 *
 * @param {string} searchQuery - User's search query
 * @param {string[]} imageUrls - Pre-uploaded image URLs
 * @param {string[]} imageTypes - MIME types for each image
 * @param {object} callbacks - {onThinkingStart, onThinking, onThinkingEnd, onMessage, onProcessing, onComplete, onError}
 * @returns {() => void} Cleanup function to abort the stream
 */
export const startBatchStream = (searchQuery, imageUrls, imageTypes, callbacks) => {
  const controller = new AbortController();
  const token = consumerAuthService.getToken();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  console.log('[startBatchStream] Sending POST to /start/stream', { searchQuery, imageUrls, imageTypes });

  fetch(`${API_BASE_URL}/api/curate-my-fit/start/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ searchQuery, imageUrls, imageTypes }),
    signal: controller.signal,
  })
    .then((response) => {
      console.log('[startBatchStream] Response received:', response.status, response.headers.get('content-type'));
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.detail || `Request failed with status ${response.status}`);
        });
      }
      return consumeSSEStream(response, callbacks, controller);
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        console.error('[startBatchStream] Error:', err);
        callbacks.onError?.(err.message);
      }
    });

  return () => controller.abort();
};

/**
 * Submit batch answers with streaming SSE responses.
 *
 * @param {string} threadId - Thread ID from startBatch
 * @param {object} answers - Dictionary of questionId -> AnswerData
 * @param {object} callbacks - {onThinkingStart, onThinking, onThinkingEnd, onMessage, onProcessing, onComplete, onError}
 * @returns {() => void} Cleanup function to abort the stream
 */
export const submitBatchAnswersStream = (threadId, answers, callbacks) => {
  const controller = new AbortController();
  const token = consumerAuthService.getToken();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  console.log('[submitBatchAnswersStream] Sending POST to /submit/stream', { threadId });

  fetch(`${API_BASE_URL}/api/curate-my-fit/submit/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ threadId, answers }),
    signal: controller.signal,
  })
    .then((response) => {
      console.log('[submitBatchAnswersStream] Response received:', response.status, response.headers.get('content-type'));
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.detail || `Request failed with status ${response.status}`);
        });
      }
      return consumeSSEStream(response, callbacks, controller);
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        console.error('[submitBatchAnswersStream] Error:', err);
        callbacks.onError?.(err.message);
      }
    });

  return () => controller.abort();
};

export default {
  startBatch,
  submitBatchAnswers,
  getState,
  uploadImages,
  startBatchStream,
  submitBatchAnswersStream,
};
