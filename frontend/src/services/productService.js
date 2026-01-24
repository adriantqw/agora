import { get, post, put, del, uploadFile } from './api';

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
   * @returns {Promise<{jobId: string, catalogueId: string, status: string, message: string}>}
   */
  async uploadPDF(file) {
    try {
      // Upload PDF to backend (returns immediately, processing happens in background)
      const response = await uploadFile('/api/catalogues/upload', file);

      if (!response.success) {
        throw new Error(response.error?.message || 'Upload failed');
      }

      const catalogue = response.data;

      // Return job-like response for polling UI
      return {
        jobId: catalogue.id,  // Use catalogue ID as jobId
        catalogueId: catalogue.id,
        status: catalogue.status,  // Will be 'processing'
        message: 'Upload successful, processing started...'
      };
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  },

  /**
   * Get PDF extraction status and results
   * @param {string} jobId - Job ID to check (actually catalogueId)
   * @returns {Promise<{jobId: string, status: string, progress?: number, products?: Array, metadata?: Object}>}
   */
  async getPDFExtractionStatus(jobId) {
    try {
      // First, check processing status
      const statusResponse = await get(`/api/catalogues/${jobId}/status`);

      if (!statusResponse.success) {
        throw new Error('Failed to fetch catalogue status');
      }

      const statusData = statusResponse.data;

      // If still processing, return progress
      if (statusData.status === 'processing') {
        return {
          jobId,
          status: 'processing',
          progress: statusData.progress || 50,
          message: statusData.message || 'Processing catalogue...'
        };
      }

      // If failed, throw error
      if (statusData.status === 'failed') {
        throw new Error(statusData.message || 'Processing failed');
      }

      // If completed, fetch items
      const itemsResponse = await get(`/api/catalogues/${jobId}/items`, {
        params: { page: 1, limit: 100 }  // Fetch all items
      });

      if (!itemsResponse.success) {
        throw new Error('Failed to fetch catalogue items');
      }

      const { items } = itemsResponse.data;

      // Transform catalogue items to match expected product format
      const products = items.map((item, index) => ({
        id: item.id,
        name: item.name,
        sku: '',  // User must provide
        price: 29.99,  // Default price
        quantity: 100,  // Default quantity
        tags: [...(item.sizes || []), ...(item.colours || [])],  // Merge sizes + colours
        image: item.imageUrl,
        description: item.description || '',
        confidence: 0.85,  // Default confidence since backend doesn't provide
        page: item.page,
        // Backend-specific fields for later conversion
        _catalogueItemId: item.id,
        _sizes: item.sizes,
        _colours: item.colours
      }));

      return {
        jobId,
        status: 'completed',
        products,
        metadata: {
          totalPages: Math.max(...items.map(i => i.page || 0), 0),
          productsFound: items.length,
          imagesExtracted: items.length
        }
      };
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  },

  /**
   * Import products from PDF extraction (convert catalogue items to products)
   * @param {string} jobId - Job ID (catalogueId)
   * @param {Array} products - Edited products to import
   * @param {boolean} skipDuplicates - Skip existing SKUs instead of updating
   * @returns {Promise<{created: number, updated: number, skipped: number, errors: Array}>}
   */
  async importPDFProducts(jobId, products, skipDuplicates = false) {
    try {
      // map items
      const items = products
        .filter(p => p._catalogueItemId)
        .map(p => ({
          id: p._catalogueItemId,
          name: p.name,
          sku: p.sku,
          price: parseFloat(p.price),
          quantity: parseInt(p.quantity, 10),
          description: p.description,
          tags: p.tags
        }));

      if (items.length === 0) {
        throw new Error('No valid catalogue items to convert');
      }

      // Calculate default price/quantity from edited products (fallback)
      const defaultPrice = products[0]?.price || 29.99;
      const defaultQuantity = products[0]?.quantity || 100;

      // Call backend to create products from items
      const response = await post(`/api/catalogues/${jobId}/create-products`, {
        items,
        defaultPrice,
        defaultQuantity,
        generateSku: true,
        skuPrefix: 'CAT-'
      });

      if (!response.success) {
        throw new Error('Failed to create products');
      }

      const result = response.data;

      return {
        created: result.created,
        updated: 0,  // Backend doesn't update, only creates
        skipped: 0,
        errors: result.errors || []
      };
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || error.message);
    }
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
