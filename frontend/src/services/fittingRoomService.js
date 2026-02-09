// Fitting Room Service — backend integration with mock fallback
import { post, get } from './api';
import consumerAuthService from './consumerAuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ── Mock data (fallback when backend is unavailable) ──────────────────────────

const mockFittingRoomProducts = [
  // Dresses
  { id: 'fr-1', name: 'Floral Summer Dress', brand: 'Garden Party', price: 89.99, size: 'M', category: 'dress', image: 'https://picsum.photos/seed/fr1/300/400' },
  { id: 'fr-2', name: 'Elegant Evening Gown', brand: 'Luxe Collection', price: 159.99, size: 'S', category: 'dress', image: 'https://picsum.photos/seed/fr2/300/400' },
  { id: 'fr-3', name: 'Casual Day Dress', brand: 'Everyday Chic', price: 49.99, size: 'L', category: 'dress', image: 'https://picsum.photos/seed/fr3/300/400' },
  { id: 'fr-4', name: 'Midi Cocktail Dress', brand: 'Night Out', price: 119.99, size: 'M', category: 'dress', image: 'https://picsum.photos/seed/fr4/300/400' },
  // Tops
  { id: 'fr-5', name: 'Classic White Blouse', brand: 'Office Essentials', price: 39.99, size: 'M', category: 'top', image: 'https://picsum.photos/seed/fr5/300/400' },
  { id: 'fr-6', name: 'Silk Camisole', brand: 'Luxe Basics', price: 54.99, size: 'S', category: 'top', image: 'https://picsum.photos/seed/fr6/300/400' },
  { id: 'fr-7', name: 'Striped Tee', brand: 'Casual Comfort', price: 24.99, size: 'L', category: 'top', image: 'https://picsum.photos/seed/fr7/300/400' },
  { id: 'fr-8', name: 'Embroidered Tunic', brand: 'Boho Style', price: 64.99, size: 'M', category: 'top', image: 'https://picsum.photos/seed/fr8/300/400' },
  { id: 'fr-9', name: 'Fitted Crop Top', brand: 'Trendy Teen', price: 29.99, size: 'S', category: 'top', image: 'https://picsum.photos/seed/fr9/300/400' },
  { id: 'fr-10', name: 'Oversized Sweater', brand: 'Cozy Knits', price: 69.99, size: 'L', category: 'top', image: 'https://picsum.photos/seed/fr10/300/400' },
  // Bottoms
  { id: 'fr-11', name: 'High-Waisted Jeans', brand: 'Denim Dreams', price: 79.99, size: '28', category: 'bottom', image: 'https://picsum.photos/seed/fr11/300/400' },
  { id: 'fr-12', name: 'Pleated Midi Skirt', brand: 'Feminine Flair', price: 59.99, size: 'M', category: 'bottom', image: 'https://picsum.photos/seed/fr12/300/400' },
  { id: 'fr-13', name: 'Tailored Trousers', brand: 'Office Chic', price: 89.99, size: '30', category: 'bottom', image: 'https://picsum.photos/seed/fr13/300/400' },
  { id: 'fr-14', name: 'Flowy Maxi Skirt', brand: 'Boho Style', price: 69.99, size: 'L', category: 'bottom', image: 'https://picsum.photos/seed/fr14/300/400' },
  { id: 'fr-15', name: 'Black Leggings', brand: 'Active Basics', price: 34.99, size: 'M', category: 'bottom', image: 'https://picsum.photos/seed/fr15/300/400' },
  { id: 'fr-16', name: 'Denim Shorts', brand: 'Summer Vibes', price: 44.99, size: '26', category: 'bottom', image: 'https://picsum.photos/seed/fr16/300/400' },
  // Accessories
  { id: 'fr-17', name: 'Leather Crossbody Bag', brand: 'Urban Chic', price: 129.99, size: 'One Size', category: 'accessories', image: 'https://picsum.photos/seed/fr17/300/400' },
  { id: 'fr-18', name: 'Gold Statement Necklace', brand: 'Shine Bright', price: 49.99, size: 'One Size', category: 'accessories', image: 'https://picsum.photos/seed/fr18/300/400' },
  { id: 'fr-19', name: 'Silk Scarf', brand: 'Luxe Accessories', price: 39.99, size: 'One Size', category: 'accessories', image: 'https://picsum.photos/seed/fr19/300/400' },
  { id: 'fr-20', name: 'Wide Brim Hat', brand: 'Sun Style', price: 44.99, size: 'One Size', category: 'accessories', image: 'https://picsum.photos/seed/fr20/300/400' },
  { id: 'fr-21', name: 'Leather Belt', brand: 'Classic Details', price: 34.99, size: 'M', category: 'accessories', image: 'https://picsum.photos/seed/fr21/300/400' },
  { id: 'fr-22', name: 'Pearl Earrings', brand: 'Elegant Touches', price: 59.99, size: 'One Size', category: 'accessories', image: 'https://picsum.photos/seed/fr22/300/400' },
  // Shoes
  { id: 'fr-23', name: 'Strappy Heels', brand: 'Evening Glam', price: 99.99, size: '8', category: 'shoes', image: 'https://picsum.photos/seed/fr23/300/400' },
  { id: 'fr-24', name: 'White Sneakers', brand: 'Casual Kicks', price: 79.99, size: '7.5', category: 'shoes', image: 'https://picsum.photos/seed/fr24/300/400' },
  { id: 'fr-25', name: 'Ankle Boots', brand: 'Urban Edge', price: 139.99, size: '9', category: 'shoes', image: 'https://picsum.photos/seed/fr25/300/400' },
  { id: 'fr-26', name: 'Ballet Flats', brand: 'Comfort Chic', price: 64.99, size: '8.5', category: 'shoes', image: 'https://picsum.photos/seed/fr26/300/400' },
];

const mockAIResponses = [
  "Great choice! This outfit works well together.",
  "I love the color combination!",
  "Have you considered adding a jacket?",
  "This would be perfect for a garden wedding!",
  "That top pairs beautifully with those bottoms!",
  "Adding accessories would complete this look nicely.",
  "Very elegant! This outfit has a sophisticated vibe.",
  "Bold choice! I like your style.",
  "This combination is very trendy right now!",
  "Perfect for a casual day out!",
  "The proportions of this outfit are spot-on!",
  "This has a great balance of dressy and casual.",
  "I'd recommend some statement earrings with this.",
  "Have you thought about trying a different shoe?",
  "This color palette is very flattering!",
  "Love the mix of textures here!",
  "This outfit screams confidence!",
  "A belt would really cinch this look together.",
  "This is ready for a night on the town!",
  "Simple, chic, and timeless!"
];

// ── Product fetching ──────────────────────────────────────────────────────────

/**
 * Fetch products for the fitting room.
 * Uses mock data (no consumer product browsing endpoint exists yet).
 * @param {string} category - Filter by category: 'all', 'dress', 'top', 'bottom', 'accessories', 'shoes'
 * @returns {Promise<Array>} Array of products
 */
export const fetchFittingRoomProducts = async (category = 'all') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (category === 'all' || category === 'current') {
    return mockFittingRoomProducts;
  }

  const categoryMap = {
    'outfits': 'all',
    'tops': 'top',
    'bottoms': 'bottom',
    'accessories': 'accessories',
  };

  const filterCategory = categoryMap[category] || category;

  if (filterCategory === 'all') {
    return mockFittingRoomProducts;
  }

  return mockFittingRoomProducts.filter(product => product.category === filterCategory);
};

// ── AI Styling (quick responses) ──────────────────────────────────────────────

/**
 * Get a random AI styling response (local, no API call).
 * @returns {string} Random AI response
 */
export const getRandomAIResponse = () => {
  return mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
};

// ── Fitting Assistant Backend API ─────────────────────────────────────────────

/**
 * Generate lookbooks via the FittingAssistant agent (synchronous).
 *
 * @param {Object} params
 * @param {Array<{id: string}>} params.productSelections - Products to fit
 * @param {string} [params.journeyId] - Journey ID for user preferences
 * @param {string} [params.stylistThreadId] - Stylist thread for journey reconstruction
 * @param {string} [params.threadId] - Existing thread for multi-turn
 * @param {string} [params.message] - Optional refinement message
 * @param {string} [params.personality] - Agent personality (default: 'friendly')
 * @returns {Promise<{threadId: string, fittingSets: Array, message: string}>}
 */
export const generateLookbook = async ({
  productSelections,
  journeyId = null,
  stylistThreadId = null,
  threadId = null,
  message = null,
  personality = 'friendly',
}) => {
  const response = await post('/api/fitting-assistant/fit', {
    productSelections: productSelections.map(p => ({ id: p.id })),
    journeyId,
    stylistThreadId,
    threadId,
    message,
    personality,
  });
  return response.data;
};

/**
 * Stream lookbook generation via SSE.
 *
 * @param {Object} params - Same as generateLookbook
 * @param {function} onThinking - Called with thinking content tokens
 * @param {function} onComplete - Called with final {threadId, fittingSets, message}
 * @param {function} onError - Called with error message string
 * @returns {function} abort - Call to cancel the stream
 */
export const generateLookbookStream = ({
  productSelections,
  journeyId = null,
  stylistThreadId = null,
  threadId = null,
  message = null,
  personality = 'friendly',
  onThinking = () => {},
  onComplete = () => {},
  onError = () => {},
}) => {
  const controller = new AbortController();

  (async () => {
    try {
      await consumerAuthService.ensureValidToken();
      const token = consumerAuthService.getToken();

      const response = await fetch(`${API_BASE_URL}/api/fitting-assistant/fit/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productSelections: productSelections.map(p => ({ id: p.id })),
          journeyId,
          stylistThreadId,
          threadId,
          message,
          personality,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.detail || `Request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            switch (event.type) {
              case 'thinking':
                onThinking(event.content);
                break;
              case 'complete':
                onComplete(event.data);
                break;
              case 'error':
                onError(event.message);
                break;
              // thinking_start, thinking_end, processing — ignored
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        onError(err.message);
      }
    }
  })();

  return () => controller.abort();
};

/**
 * Get AI styling advice for an outfit.
 * Calls the backend if the user is authenticated; falls back to mock.
 *
 * @param {Array} outfit - Array of products in the outfit
 * @param {Object} [options]
 * @param {string} [options.journeyId] - Journey ID for context
 * @param {string} [options.threadId] - Existing thread for multi-turn
 * @param {string} [options.message] - Refinement message
 * @returns {Promise<{message: string, fittingSets: Array, threadId: string|null}>}
 */
export const getAIStylingAdvice = async (outfit, options = {}) => {
  // If no outfit items, return a default message
  if (!outfit || outfit.length === 0) {
    return {
      message: 'Add items to start styling!',
      fittingSets: [],
      threadId: null,
    };
  }

  // Try backend if user is authenticated
  const token = consumerAuthService.getToken();
  if (token) {
    try {
      const result = await generateLookbook({
        productSelections: outfit,
        journeyId: options.journeyId,
        threadId: options.threadId,
        message: options.message,
      });
      return result;
    } catch (err) {
      console.warn('Fitting assistant API unavailable, using mock:', err.message);
    }
  }

  // Fallback to mock
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    message: getRandomAIResponse(),
    fittingSets: [],
    threadId: null,
  };
};

/**
 * Get session state for a fitting assistant thread.
 * @param {string} threadId
 * @returns {Promise<Object>}
 */
export const getFittingState = async (threadId) => {
  const response = await get(`/api/fitting-assistant/state/${threadId}`);
  return response.data;
};

export default {
  fetchFittingRoomProducts,
  getRandomAIResponse,
  getAIStylingAdvice,
  generateLookbook,
  generateLookbookStream,
  getFittingState,
};
