import { get, post, put, del, uploadFile } from './api';
import mockPDFService from './mockPDFService';

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
  },

  /**
   * Upload a product image
   * @param {File} file - Image file to upload
   * @returns {Promise<{url: string, filename: string}>}
   */
  async uploadImage(file) {
    const response = await uploadFile('/api/products/upload-image', file);
    return response.data;
  },

  /**
   * Generate AI tags for products
   * @param {string[]} productIds - Array of product IDs to generate tags for
   * @returns {Promise<{processed: number, results: Array<{productId: string, suggestedTags: string[], applied: boolean}>}>}
   */
  async generateAITags(productIds) {
    const response = await post('/api/products/ai-tags', {
      productIds
    });
    return response.data;
  },

  // ========== PDF Import Methods ==========

  /**
   * Upload PDF catalogue and start extraction
   * @param {File} file - PDF file to upload
   * @returns {Promise<{jobId: string, status: string, message: string}>}
   */
  async uploadPDF(file) {
    // TODO: Replace with real API call when backend is implemented
    // const response = await uploadFile('/api/products/pdf-extract', file);
    // return response.data;
    return mockPDFService.uploadPDF(file);
  },

  /**
   * Get PDF extraction status and results
   * @param {string} jobId - Job ID to check
   * @returns {Promise<{jobId: string, status: string, progress?: number, products?: Array, metadata?: Object}>}
   */
  async getPDFExtractionStatus(jobId) {
    // TODO: Replace with real API call when backend is implemented
    // const response = await get(`/api/products/pdf-extract/${jobId}`);
    // return response.data;
    return mockPDFService.getPDFExtractionStatus(jobId);
  },

  /**
   * Import products from PDF extraction
   * @param {string} jobId - Job ID
   * @param {Array} products - Edited products to import
   * @param {boolean} skipDuplicates - Skip existing SKUs instead of updating
   * @returns {Promise<{created: number, updated: number, skipped: number, errors: Array}>}
   */
  async importPDFProducts(jobId, products, skipDuplicates = false) {
    // TODO: Replace with real API call when backend is implemented
    // const response = await post('/api/products/pdf-import', {
    //   jobId,
    //   products,
    //   skipDuplicates
    // });
    // return response.data;
    return mockPDFService.importPDFProducts(jobId, products, skipDuplicates);
  },

  /**
   * Cancel PDF extraction and cleanup
   * @param {string} jobId - Job ID to cancel
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async cancelPDFExtraction(jobId) {
    // TODO: Replace with real API call when backend is implemented
    // const response = await del(`/api/products/pdf-extract/${jobId}`);
    // return response.data;
    return mockPDFService.cancelPDFExtraction(jobId);
  }
};

export default productService;
