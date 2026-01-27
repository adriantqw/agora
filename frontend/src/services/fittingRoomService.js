// Mock data service for Fitting Room

const mockFittingRoomProducts = [
  // Dresses
  { id: 'fr-1', name: 'Floral Summer Dress', brand: 'Garden Party', price: 89.99, size: 'M', category: 'dress' },
  { id: 'fr-2', name: 'Elegant Evening Gown', brand: 'Luxe Collection', price: 159.99, size: 'S', category: 'dress' },
  { id: 'fr-3', name: 'Casual Day Dress', brand: 'Everyday Chic', price: 49.99, size: 'L', category: 'dress' },
  { id: 'fr-4', name: 'Midi Cocktail Dress', brand: 'Night Out', price: 119.99, size: 'M', category: 'dress' },

  // Tops
  { id: 'fr-5', name: 'Classic White Blouse', brand: 'Office Essentials', price: 39.99, size: 'M', category: 'top' },
  { id: 'fr-6', name: 'Silk Camisole', brand: 'Luxe Basics', price: 54.99, size: 'S', category: 'top' },
  { id: 'fr-7', name: 'Striped Tee', brand: 'Casual Comfort', price: 24.99, size: 'L', category: 'top' },
  { id: 'fr-8', name: 'Embroidered Tunic', brand: 'Boho Style', price: 64.99, size: 'M', category: 'top' },
  { id: 'fr-9', name: 'Fitted Crop Top', brand: 'Trendy Teen', price: 29.99, size: 'S', category: 'top' },
  { id: 'fr-10', name: 'Oversized Sweater', brand: 'Cozy Knits', price: 69.99, size: 'L', category: 'top' },

  // Bottoms
  { id: 'fr-11', name: 'High-Waisted Jeans', brand: 'Denim Dreams', price: 79.99, size: '28', category: 'bottom' },
  { id: 'fr-12', name: 'Pleated Midi Skirt', brand: 'Feminine Flair', price: 59.99, size: 'M', category: 'bottom' },
  { id: 'fr-13', name: 'Tailored Trousers', brand: 'Office Chic', price: 89.99, size: '30', category: 'bottom' },
  { id: 'fr-14', name: 'Flowy Maxi Skirt', brand: 'Boho Style', price: 69.99, size: 'L', category: 'bottom' },
  { id: 'fr-15', name: 'Black Leggings', brand: 'Active Basics', price: 34.99, size: 'M', category: 'bottom' },
  { id: 'fr-16', name: 'Denim Shorts', brand: 'Summer Vibes', price: 44.99, size: '26', category: 'bottom' },

  // Accessories
  { id: 'fr-17', name: 'Leather Crossbody Bag', brand: 'Urban Chic', price: 129.99, size: 'One Size', category: 'accessories' },
  { id: 'fr-18', name: 'Gold Statement Necklace', brand: 'Shine Bright', price: 49.99, size: 'One Size', category: 'accessories' },
  { id: 'fr-19', name: 'Silk Scarf', brand: 'Luxe Accessories', price: 39.99, size: 'One Size', category: 'accessories' },
  { id: 'fr-20', name: 'Wide Brim Hat', brand: 'Sun Style', price: 44.99, size: 'One Size', category: 'accessories' },
  { id: 'fr-21', name: 'Leather Belt', brand: 'Classic Details', price: 34.99, size: 'M', category: 'accessories' },
  { id: 'fr-22', name: 'Pearl Earrings', brand: 'Elegant Touches', price: 59.99, size: 'One Size', category: 'accessories' },

  // Shoes
  { id: 'fr-23', name: 'Strappy Heels', brand: 'Evening Glam', price: 99.99, size: '8', category: 'shoes' },
  { id: 'fr-24', name: 'White Sneakers', brand: 'Casual Kicks', price: 79.99, size: '7.5', category: 'shoes' },
  { id: 'fr-25', name: 'Ankle Boots', brand: 'Urban Edge', price: 139.99, size: '9', category: 'shoes' },
  { id: 'fr-26', name: 'Ballet Flats', brand: 'Comfort Chic', price: 64.99, size: '8.5', category: 'shoes' },
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

/**
 * Fetch products for the fitting room
 * @param {string} category - Filter by category: 'all', 'dress', 'top', 'bottom', 'accessories', 'shoes'
 * @returns {Promise<Array>} Array of products
 */
export const fetchFittingRoomProducts = async (category = 'all') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (category === 'all' || category === 'current') {
    return mockFittingRoomProducts;
  }

  // Map category IDs to product categories
  const categoryMap = {
    'outfits': 'all', // Show all for outfits
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

/**
 * Get a random AI styling response
 * @returns {string} Random AI response
 */
export const getRandomAIResponse = () => {
  return mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
};

/**
 * Get AI styling advice based on outfit
 * @param {Array} outfit - Array of products in the outfit
 * @returns {Promise<string>} AI response
 */
export const getAIStylingAdvice = async (outfit) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real implementation, this would call an AI API
  // For now, return a random response
  return getRandomAIResponse();
};

export default {
  fetchFittingRoomProducts,
  getRandomAIResponse,
  getAIStylingAdvice,
};
