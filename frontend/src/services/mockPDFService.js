// Mock PDF extraction service for testing the UI flow
// TODO: Replace with real API calls when backend is implemented

// Utility to generate UUIDs
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Utility to simulate async delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock extracted products with realistic data
const MOCK_EXTRACTED_PRODUCTS = [
  {
    id: 'temp-1',
    name: 'Premium Leather Wallet',
    sku: 'WALLET-001',
    price: 49.99,
    quantity: 50,
    tags: ['accessories', 'leather', 'wallet'],
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
    description: 'Handcrafted genuine leather wallet with RFID protection and multiple card slots',
    confidence: 0.95,
    imageIndex: 0
  },
  {
    id: 'temp-2',
    name: 'Canvas Messenger Bag',
    sku: 'BAG-002',
    price: 79.99,
    quantity: 30,
    tags: ['accessories', 'bag', 'canvas'],
    image: 'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=400',
    description: 'Durable canvas messenger bag with padded laptop compartment',
    confidence: 0.92,
    imageIndex: 1
  },
  {
    id: 'temp-3',
    name: 'Classic Running Shoes',
    sku: 'SHOE-003',
    price: 89.99,
    quantity: 100,
    tags: ['footwear', 'athletic', 'running'],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    description: 'Lightweight running shoes with cushioned sole and breathable mesh upper',
    confidence: 0.88,
    imageIndex: 2
  },
  {
    id: 'temp-4',
    name: 'Stainless Steel Watch',
    sku: 'WATCH-004',
    price: 199.99,
    quantity: 25,
    tags: ['accessories', 'watch', 'steel'],
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    description: 'Elegant stainless steel watch with automatic movement and sapphire crystal',
    confidence: 0.96,
    imageIndex: 3
  },
  {
    id: 'temp-5',
    name: 'Wireless Headphones',
    sku: 'AUDIO-005',
    price: 129.99,
    quantity: 60,
    tags: ['electronics', 'audio', 'wireless'],
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery',
    confidence: 0.91,
    imageIndex: 4
  },
  {
    id: 'temp-6',
    name: 'Cotton T-Shirt',
    sku: 'SHIRT-006',
    price: 24.99,
    quantity: 150,
    tags: ['clothing', 'casual', 'cotton'],
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    description: '100% organic cotton t-shirt with comfortable fit and durable construction',
    confidence: 0.87,
    imageIndex: 5
  },
  {
    id: 'temp-7',
    name: 'Denim Jeans',
    sku: 'JEANS-007',
    price: 69.99,
    quantity: 80,
    tags: ['clothing', 'denim', 'pants'],
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    description: 'Classic fit denim jeans with stretch fabric for comfort and mobility',
    confidence: 0.93,
    imageIndex: 6
  },
  {
    id: 'temp-8',
    name: 'Sunglasses',
    sku: 'SUNGLASS-008',
    price: 119.99,
    quantity: 45,
    tags: ['accessories', 'eyewear', 'sunglasses'],
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
    description: 'UV400 protection sunglasses with polarized lenses and stylish frame',
    confidence: 0.89,
    imageIndex: 7
  },
  {
    id: 'temp-9',
    name: 'Laptop Backpack',
    sku: 'BACKPACK-009',
    price: 54.99,
    quantity: 70,
    tags: ['accessories', 'bag', 'backpack'],
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    description: 'Water-resistant laptop backpack with multiple compartments and USB charging port',
    confidence: 0.94,
    imageIndex: 8
  },
  {
    id: 'temp-10',
    name: 'Fitness Tracker',
    sku: 'FITNESS-010',
    price: 79.99,
    quantity: 55,
    tags: ['electronics', 'fitness', 'wearable'],
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400',
    description: 'Smart fitness tracker with heart rate monitoring and sleep tracking',
    confidence: 0.90,
    imageIndex: 9
  },
  {
    id: 'temp-11',
    name: 'Bluetooth Speaker',
    sku: 'SPEAKER-011',
    price: 59.99,
    quantity: 65,
    tags: ['electronics', 'audio', 'speaker'],
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    description: 'Portable Bluetooth speaker with 360-degree sound and waterproof design',
    confidence: 0.85,
    imageIndex: 10
  },
  {
    id: 'temp-12',
    name: 'Leather Belt',
    sku: 'BELT-012',
    price: 39.99,
    quantity: 90,
    tags: ['accessories', 'leather', 'belt'],
    image: 'https://images.unsplash.com/photo-1624222247344-70e4c8e9c47a?w=400',
    description: 'Genuine leather belt with classic buckle and reversible design',
    confidence: 0.92,
    imageIndex: 11
  }
];

// In-memory job storage
const jobs = new Map();

// Progress simulation
const jobProgress = new Map();

// Initialize progress for a job
const initializeJobProgress = (jobId) => {
  jobProgress.set(jobId, {
    progress: 0,
    startTime: Date.now(),
    messages: [
      { progress: 0, message: 'Starting PDF analysis...' },
      { progress: 25, message: 'Analyzing PDF structure...' },
      { progress: 50, message: 'Extracting images from PDF...' },
      { progress: 75, message: 'Identifying products with AI...' },
      { progress: 100, message: 'Extraction complete!' }
    ]
  });
};

// Get current progress for a job
const getJobProgress = (jobId) => {
  const jobData = jobProgress.get(jobId);
  if (!jobData) return 100;

  const elapsed = Date.now() - jobData.startTime;
  const totalDuration = 4000; // 4 seconds total
  const progress = Math.min(100, Math.floor((elapsed / totalDuration) * 100));

  return progress;
};

// Get progress message for current progress
const getProgressMessage = (jobId, progress) => {
  const jobData = jobProgress.get(jobId);
  if (!jobData) return 'Processing...';

  const messages = jobData.messages;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (progress >= messages[i].progress) {
      return messages[i].message;
    }
  }
  return messages[0].message;
};

// Mock PDF Service
export const mockPDFService = {
  /**
   * Simulate PDF file upload and start extraction
   * @param {File} file - PDF file to upload
   * @returns {Promise<Object>} Job information
   */
  async uploadPDF(file) {
    // Simulate upload delay
    await delay(800);

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file type. Please upload a PDF file.');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit.');
    }

    // Generate job ID
    const jobId = generateUUID();

    // Initialize job
    jobs.set(jobId, {
      jobId,
      status: 'processing',
      fileName: file.name,
      fileSize: file.size,
      createdAt: new Date().toISOString()
    });

    // Initialize progress tracking
    initializeJobProgress(jobId);

    return {
      jobId,
      status: 'processing',
      message: 'PDF extraction in progress'
    };
  },

  /**
   * Get extraction status and results
   * @param {string} jobId - Job ID to check
   * @returns {Promise<Object>} Job status and results
   */
  async getPDFExtractionStatus(jobId) {
    // Simulate network delay
    await delay(100);

    const job = jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const progress = getJobProgress(jobId);

    if (progress < 100) {
      return {
        jobId,
        status: 'processing',
        progress,
        message: getProgressMessage(jobId, progress)
      };
    }

    // Extraction complete - return products
    return {
      jobId,
      status: 'completed',
      products: MOCK_EXTRACTED_PRODUCTS,
      metadata: {
        totalPages: 3,
        productsFound: MOCK_EXTRACTED_PRODUCTS.length,
        imagesExtracted: MOCK_EXTRACTED_PRODUCTS.length
      }
    };
  },

  /**
   * Import products after user review and editing
   * @param {string} jobId - Job ID
   * @param {Array} products - Edited products to import
   * @param {boolean} skipDuplicates - Whether to skip duplicate SKUs
   * @returns {Promise<Object>} Import results
   */
  async importPDFProducts(jobId, products, skipDuplicates = false) {
    // Simulate import delay
    await delay(1500);

    const job = jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Simulate some validation errors (5% chance per product)
    const errors = [];
    products.forEach((product, index) => {
      if (Math.random() < 0.05) {
        errors.push({
          row: index + 1,
          sku: product.sku,
          error: 'Mock error: Product validation failed'
        });
      }
    });

    const successCount = products.length - errors.length;

    // Clean up job after import
    jobs.delete(jobId);
    jobProgress.delete(jobId);

    return {
      created: successCount,
      updated: 0,
      skipped: 0,
      errors
    };
  },

  /**
   * Cancel extraction and cleanup
   * @param {string} jobId - Job ID to cancel
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelPDFExtraction(jobId) {
    await delay(300);

    const job = jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Clean up
    jobs.delete(jobId);
    jobProgress.delete(jobId);

    return {
      success: true,
      message: 'Extraction job cancelled and cleaned up'
    };
  }
};

export default mockPDFService;
