/**
 * Fitting Room Helper Utilities
 *
 * Transforms backend FittingSetObjects to frontend format and wraps individual products.
 * CRITICAL: Fixes field name mismatch (backend snake_case → frontend camelCase)
 */

/**
 * Transform a single backend FittingSetObject to frontend format.
 *
 * Backend format:
 * {
 *   title: string,
 *   description: string,
 *   product_ids: string[],
 *   image_path: string,  ← SNAKE_CASE (single string)
 * }
 *
 * Frontend format:
 * {
 *   title: string,
 *   description: string,
 *   productIds: string[],
 *   imagePath: string,  ← CAMEL_CASE (single string)
 *   isTemporary: boolean
 * }
 *
 * @param {Object} backendSet - Backend FittingSetObject
 * @returns {Object|null} - Frontend FittingSetObject or null if invalid
 */
export const transformFittingSet = (backendSet) => {
  if (!backendSet?.title || !backendSet?.product_ids) {
    console.error('Invalid FittingSetObject:', backendSet);
    return null;
  }

  return {
    title: backendSet.title,
    description: backendSet.description || '',
    productIds: backendSet.product_ids,
    imagePath: backendSet.image_path || '',  // Fix field name: image_path → imagePath (single string)
    isTemporary: false,
  };
};

/**
 * Transform an array of backend FittingSetObjects.
 * Filters out null results from invalid sets.
 *
 * @param {Array} backendSets - Array of backend FittingSetObjects
 * @returns {Array} - Array of frontend FittingSetObjects
 */
export const transformFittingSets = (backendSets) => {
  if (!Array.isArray(backendSets)) {
    console.warn('transformFittingSets: expected array, got:', typeof backendSets);
    return [];
  }

  return backendSets
    .map(transformFittingSet)
    .filter(Boolean);  // Remove null results
};

/**
 * Wrap an individual Product as a single-item FittingSetObject.
 * Used when adding products from FindTheLook or ProductStrip.
 *
 * Product format:
 * {
 *   id: string,
 *   name: string,
 *   brand: string,
 *   image: string,
 *   description: string,
 *   price: number
 * }
 *
 * @param {Object} product - Product object
 * @returns {Object} - Frontend FittingSetObject with isTemporary: true
 */
export const wrapProductAsSet = (product) => {
  if (!product?.id) {
    console.error('wrapProductAsSet: invalid product', product);
    return null;
  }

  return {
    title: product.name || 'Unnamed Product',
    description: product.description || `${product.brand || ''} - ${product.name || ''}`.trim(),
    productIds: [product.id],
    imagePath: product.image || '',
    isTemporary: true,  // Flag to distinguish user-added items from AI sets
  };
};

/**
 * Unwrap a FittingSetObject to extract product IDs.
 * Used when flattening sets for cart or virtual model rendering.
 *
 * Note: This function only returns product IDs.
 * Full product objects should be looked up from a product cache/state if needed.
 *
 * @param {Object} set - Frontend FittingSetObject
 * @returns {Array} - Array of product IDs
 */
export const unwrapSetToProductIds = (set) => {
  if (!set?.productIds) {
    console.warn('unwrapSetToProductIds: invalid set', set);
    return [];
  }

  return set.productIds;
};

/**
 * Unwrap a FittingSetObject to extract full Product objects.
 * Requires a product lookup function or cache.
 *
 * @param {Object} set - Frontend FittingSetObject
 * @param {Function} productLookup - Function (id) => Product | null
 * @returns {Array} - Array of Product objects
 */
export const unwrapSetToProducts = (set, productLookup) => {
  if (!set?.productIds || !productLookup) {
    console.warn('unwrapSetToProducts: invalid arguments', { set, productLookup });
    return [];
  }

  return set.productIds
    .map(id => productLookup(id))
    .filter(Boolean);  // Remove null lookups
};
