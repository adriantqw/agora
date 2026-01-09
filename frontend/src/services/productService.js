import { get, post, put, del } from './api';

const productService = {
  /**
   * List products with pagination and filters
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-indexed)
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search query
   * @param {string[]} options.tags - Tag filters
   * @param {string} options.sortBy - Sort field
   * @param {string} options.sortOrder - Sort direction (asc/desc)
   * @returns {Promise<{items: Array, pagination: Object}>}
   */
  async list({ page = 1, limit = 20, search = '', tags = [], sortBy = 'name', sortOrder = 'asc' } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });

    if (search) params.append('search', search);
    if (tags.length > 0) params.append('tags', tags.join(','));

    const response = await get(`/api/products?${params.toString()}`);
    return response.data;
  },

  /**
   * Get single product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getById(id) {
    const response = await get(`/api/products/${id}`);
    return response.data;
  },

  /**
   * Create a new product
   * @param {Object} productData - Product creation data
   * @returns {Promise<Object>} Created product
   */
  async create(productData) {
    const response = await post('/api/products', productData);
    return response.data;
  },

  /**
   * Update an existing product
   * @param {string} id - Product ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated product
   */
  async update(id, updateData) {
    const response = await put(`/api/products/${id}`, updateData);
    return response.data;
  },

  /**
   * Bulk import products
   * @param {Array} products - Array of products to import
   * @param {boolean} skipDuplicates - Skip existing SKUs instead of updating
   * @returns {Promise<{created: number, updated: number, skipped: number, errors: Array}>}
   */
  async bulkImport(products, skipDuplicates = false) {
    const response = await post('/api/products/bulk', {
      products,
      skipDuplicates
    });
    return response.data;
  },

  /**
   * Bulk delete products
   * @param {string[]} ids - Array of product IDs to delete
   * @returns {Promise<{deleted: number}>}
   */
  async bulkDelete(ids) {
    const response = await del('/api/products/bulk', { ids });
    return response.data;
  }
};

export default productService;
