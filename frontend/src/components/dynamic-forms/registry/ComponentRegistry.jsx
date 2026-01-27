/**
 * Component Registry
 *
 * Maps question type strings to React components.
 * This is the central registry for all dynamic form components.
 */

import ImageChoice from '../ImageChoice.jsx';
import FreeText from '../FreeText.jsx';
import MultiSelect from '../MultiSelect.jsx';
import SingleChoice from '../SingleChoice.jsx';
import ScaleRating from '../ScaleRating.jsx';
import ColorPalette from '../ColorPalette.jsx';
import ImageUpload from '../ImageUpload.jsx';
import HybridSelect from '../HybridSelect.jsx';

/**
 * Component Registry Object
 * Maps type strings (from question.type) to React component functions
 */
export const COMPONENT_REGISTRY = {
  'image-choice': ImageChoice,
  'free-text': FreeText,
  'multi-select': MultiSelect,
  'single-choice': SingleChoice,
  'scale-rating': ScaleRating,
  'color-palette': ColorPalette,
  'hybrid-select': HybridSelect,

  // Image upload component (for inspiration photos)
  'image-upload': ImageUpload,

  // Optional components (not implemented in MVP)
  'text-with-images': null
};

/**
 * Get component by type
 *
 * @param {string} type - Question type
 * @returns {React.Component | null} Component or null if not found
 */
export const getComponentByType = (type) => {
  return COMPONENT_REGISTRY[type] || null;
};

/**
 * Check if a component type is supported
 *
 * @param {string} type - Question type
 * @returns {boolean} True if type is supported
 */
export const isComponentSupported = (type) => {
  return COMPONENT_REGISTRY[type] !== null && COMPONENT_REGISTRY[type] !== undefined;
};

/**
 * Get all supported component types
 *
 * @returns {string[]} Array of supported type strings
 */
export const getSupportedTypes = () => {
  return Object.keys(COMPONENT_REGISTRY).filter(type => COMPONENT_REGISTRY[type] !== null);
};

export default COMPONENT_REGISTRY;
