import consumerAuthService from './consumerAuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Find The Look SSE Streaming Service
 * Integrates with backend MatchMaker streaming endpoint
 */

/**
 * Parse SSE stream from a fetch Response.
 * Buffers chunks, splits on double-newline, parses "data: " prefixed JSON lines.
 *
 * @param {Response} response - fetch Response with streaming body
 * @param {object} callbacks - Event handlers
 * @param {AbortController} controller - For cancellation
 */
const consumeSSEStream = async (response, callbacks, controller) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Split on double newline (SSE event boundary)
      const parts = buffer.split('\n\n');
      buffer = parts.pop(); // Keep incomplete chunk in buffer

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data: ')) continue;

        try {
          const event = JSON.parse(line.slice(6));

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
          console.warn('[FindTheLook SSE] Failed to parse event:', line, parseErr);
        }
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('[FindTheLook SSE] Stream error:', err);
      callbacks.onError?.(err.message);
    }
  }
};

/**
 * Start a match stream for a journey.
 *
 * @param {string} journeyId - Journey ID from curate-my-fit (DB record)
 * @param {string} stylistThreadId - Stylist thread ID (fallback for quick match before journey is saved)
 * @param {object} callbacks - {onThinkingStart, onThinking, onThinkingEnd, onProcessing, onComplete, onError}
 * @returns {() => void} Cleanup function to abort the stream
 */
export const startMatchStream = (journeyId, stylistThreadId, callbacks) => {
  const controller = new AbortController();
  const token = consumerAuthService.getToken();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  fetch(`${API_BASE_URL}/api/matchmaker/match/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ journeyId: journeyId || undefined, stylistThreadId: stylistThreadId || undefined }),
    signal: controller.signal,
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.detail || `Request failed with status ${response.status}`);
        });
      }
      return consumeSSEStream(response, callbacks, controller);
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        console.error('[startMatchStream] Error:', err);
        callbacks.onError?.(err.message);
      }
    });

  return () => controller.abort();
};

/**
 * Refine matches with user feedback (multi-turn).
 *
 * @param {string} journeyId - Journey ID (DB record)
 * @param {string} stylistThreadId - Stylist thread ID (fallback)
 * @param {string} threadId - Matchmaker thread ID from previous match stream
 * @param {string} message - User's refinement message
 * @param {object} callbacks - Same callbacks as startMatchStream
 * @returns {() => void} Cleanup function to abort the stream
 */
export const refineMatchStream = (journeyId, stylistThreadId, threadId, message, callbacks) => {
  const controller = new AbortController();
  const token = consumerAuthService.getToken();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  fetch(`${API_BASE_URL}/api/matchmaker/match/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ journeyId: journeyId || undefined, stylistThreadId: stylistThreadId || undefined, threadId, message }),
    signal: controller.signal,
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.detail || `Request failed with status ${response.status}`);
        });
      }
      return consumeSSEStream(response, callbacks, controller);
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        console.error('[refineMatchStream] Error:', err);
        callbacks.onError?.(err.message);
      }
    });

  return () => controller.abort();
};

export default {
  startMatchStream,
  refineMatchStream,
};
