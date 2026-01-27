/**
 * Quiz Service
 *
 * Manages quiz questions and transforms answers to search filters
 */

// Garden Wedding Quiz Questions (compatible with QuestionRenderer)
export const GARDEN_WEDDING_QUIZ = [
  {
    id: 'wedding-datetime',
    type: 'multi-select',
    question: 'What time and date is the garden wedding?',
    subtext: '(select all that apply)',
    filterCategory: 'dateTime',
    required: true,
    options: [
      { id: 'evening', label: 'Evening' },
      { id: 'daytime', label: 'Day time' },
      { id: 'morning', label: 'Morning' }
    ]
  },
  {
    id: 'wedding-style',
    type: 'multi-select',
    question: 'What style preferences do you have?',
    subtext: '(select all that apply)',
    filterCategory: 'style',
    required: true,
    maxSelections: 5,
    options: [
      { id: 'wedding-guest', label: 'Wedding guest' },
      { id: 'floral-patterns', label: 'Floral patterns' },
      { id: 'bohemian', label: 'Bohemian' },
      { id: 'classic-elegant', label: 'Classic & Elegant' },
      { id: 'modern-chic', label: 'Modern & Chic' },
      { id: 'vintage', label: 'Vintage' }
    ]
  },
  {
    id: 'budget-price',
    type: 'single-choice',
    question: 'What\'s your budget for this outfit?',
    filterCategory: 'price',
    required: true,
    options: [
      {
        id: 'under-100',
        label: 'Under $100',
        description: 'Budget-friendly options'
      },
      {
        id: 'under-300',
        label: 'Under $300',
        description: 'Mid-range quality pieces'
      },
      {
        id: 'under-500',
        label: 'Under $500',
        description: 'Premium designer options'
      },
      {
        id: 'luxury',
        label: '$500+',
        description: 'Luxury and high-end'
      }
    ]
  }
];

// Additional quiz type for future expansion
export const QUIZ_TYPES = {
  GARDEN_WEDDING: 'garden-wedding',
  OFFICE_WEAR: 'office-wear',
  DATE_NIGHT: 'date-night',
  CASUAL_WEEKEND: 'casual-weekend'
};

/**
 * Load quiz questions for a given category
 * @param {string} category - Quiz category (defaults to garden-wedding)
 * @returns {Promise<Array>} Array of question objects
 */
export async function loadQuizQuestions(category = QUIZ_TYPES.GARDEN_WEDDING) {
  // Mock implementation - returns garden wedding quiz
  // In production, this could fetch from an API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(GARDEN_WEDDING_QUIZ);
    }, 300);
  });
}

/**
 * Transform a single question answer to filter format
 * @param {string} questionId - Question identifier
 * @param {Object} answer - Answer object from QuestionRenderer
 * @param {Array} questions - All quiz questions
 * @returns {Object|null} Filter result with category and values
 */
export function answerToFilter(questionId, answer, questions) {
  if (!answer || !answer.selectedOptions || answer.selectedOptions.length === 0) {
    return null;
  }

  const question = questions.find(q => q.id === questionId);
  if (!question || !question.filterCategory) {
    return null;
  }

  const { filterCategory, type, options } = question;

  // Get human-readable labels from option IDs
  const labels = answer.selectedOptions.map(optionId => {
    const option = options.find(opt => opt.id === optionId);
    return option ? option.label : optionId;
  });

  // For single-choice, return single value instead of array
  if (type === 'single-choice') {
    return {
      category: filterCategory,
      values: labels[0]
    };
  }

  // For multi-select, return array
  return {
    category: filterCategory,
    values: labels
  };
}

/**
 * Aggregate all filters from answers object
 * @param {Object} answers - Object mapping questionId to answer
 * @param {Array} questions - All quiz questions
 * @returns {Object} Filters object with all categories
 */
export function getAllFilters(answers, questions) {
  const filters = {
    dateTime: [],
    style: [],
    price: null,
    addOns: [],
    preferences: []
  };

  Object.keys(answers).forEach(questionId => {
    const filterResult = answerToFilter(questionId, answers[questionId], questions);
    if (filterResult) {
      filters[filterResult.category] = filterResult.values;
    }
  });

  return filters;
}

/**
 * Get filter count for display
 * @param {Object} filters - Filters object
 * @returns {number} Total number of active filters
 */
export function getFilterCount(filters) {
  let count = 0;

  Object.keys(filters).forEach(category => {
    const value = filters[category];
    if (Array.isArray(value)) {
      count += value.length;
    } else if (value !== null && value !== undefined && value !== '') {
      count += 1;
    }
  });

  return count;
}

export default {
  loadQuizQuestions,
  answerToFilter,
  getAllFilters,
  getFilterCount,
  QUIZ_TYPES,
  GARDEN_WEDDING_QUIZ
};
