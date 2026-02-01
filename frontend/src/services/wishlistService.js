import consumerAuthService from './consumerAuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const wishlistService = {
  async getWishlist(page = 1, limit = 20) {
    const token = consumerAuthService.getToken();
    if (!token) return null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/wishlist?page=${page}&limit=${limit}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error('Failed to fetch wishlist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return null;
    }
  },

  async addItem(productId, notes = null) {
    const token = consumerAuthService.getToken();

    const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product_id: productId, notes })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add item');
    }

    return await response.json();
  },

  async removeItem(itemId) {
    const token = consumerAuthService.getToken();

    const response = await fetch(`${API_BASE_URL}/api/wishlist/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to remove item');
  },

  async createShareLink(title = null, expiresInDays = null) {
    const token = consumerAuthService.getToken();

    const response = await fetch(`${API_BASE_URL}/api/wishlist/share`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, expires_in_days: expiresInDays })
    });

    if (!response.ok) throw new Error('Failed to create share link');
    return await response.json();
  },

  async getSharedWishlist(token) {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/share/${token}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch shared wishlist');
    }

    return await response.json();
  }
};

export default wishlistService;
