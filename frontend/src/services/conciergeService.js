/**
 * Shopping Concierge Service
 *
 * This service handles AI-powered question generation and product matching
 * for the shopping concierge feature.
 *
 * Current Implementation: Dummy version with keyword-based question selection
 * Future: Will integrate with real AI backend API
 */

import STYLE_GUIDE from '../config/styleGuide.js';

const { constraints } = STYLE_GUIDE;

/**
 * Fallback Questions Database
 * Pre-defined question sets for different product categories
 */
const FALLBACK_QUESTIONS = {
  DRESS_QUESTIONS: [
    {
      id: 'dress-q1',
      type: 'image-choice',
      question: 'What style appeals to you for this wedding?',
      layout: 'grid',
      columns: 2,
      required: true,
      options: [
        {
          id: 'opt1',
          label: 'Classic & Elegant',
          description: 'Timeless, sophisticated styles',
          imageUrl: null,
          imagePrompt: 'elegant formal dress',
          metadata: { tags: ['elegant', 'formal', 'classic'] }
        },
        {
          id: 'opt2',
          label: 'Bohemian & Flowy',
          description: 'Relaxed, romantic vibes',
          imageUrl: null,
          imagePrompt: 'bohemian flowy dress',
          metadata: { tags: ['bohemian', 'casual', 'romantic'] }
        },
        {
          id: 'opt3',
          label: 'Modern & Chic',
          description: 'Contemporary, fashion-forward',
          imageUrl: null,
          imagePrompt: 'modern chic dress',
          metadata: { tags: ['modern', 'trendy', 'chic'] }
        },
        {
          id: 'opt4',
          label: 'Vintage Inspired',
          description: 'Retro charm with modern updates',
          imageUrl: null,
          imagePrompt: 'vintage inspired dress',
          metadata: { tags: ['vintage', 'retro', 'classic'] }
        }
      ]
    },
    {
      id: 'dress-q2',
      type: 'color-palette',
      question: 'Which color palette do you prefer?',
      layout: 'grid',
      columns: 2,
      required: true,
      options: [
        {
          id: 'palette1',
          label: 'Warm Tones',
          description: 'Reds, oranges, yellows',
          colors: ['#E53E3E', '#ED8936', '#F6E05E'],
          metadata: { tags: ['warm', 'bold', 'vibrant'] }
        },
        {
          id: 'palette2',
          label: 'Cool Tones',
          description: 'Blues, greens, purples',
          colors: ['#4299E1', '#48BB78', '#9F7AEA'],
          metadata: { tags: ['cool', 'calm', 'elegant'] }
        },
        {
          id: 'palette3',
          label: 'Neutrals',
          description: 'Beige, cream, taupe',
          colors: ['#CBD5E0', '#D6BCFA', '#FEB2B2'],
          metadata: { tags: ['neutral', 'soft', 'classic'] }
        },
        {
          id: 'palette4',
          label: 'Pastels',
          description: 'Soft, muted colors',
          colors: ['#FED7D7', '#C6F6D5', '#E9D8FD'],
          metadata: { tags: ['pastel', 'soft', 'romantic'] }
        }
      ]
    },
    {
      id: 'dress-q3',
      type: 'single-choice',
      question: 'What length are you looking for?',
      required: true,
      options: [
        {
          id: 'length1',
          label: 'Floor Length',
          description: 'Full, formal gown',
          metadata: { tags: ['long', 'formal'] }
        },
        {
          id: 'length2',
          label: 'Midi',
          description: 'Mid-calf length',
          metadata: { tags: ['midi', 'versatile'] }
        },
        {
          id: 'length3',
          label: 'Knee Length',
          description: 'Classic cocktail length',
          metadata: { tags: ['short', 'cocktail'] }
        },
        {
          id: 'length4',
          label: 'Mini',
          description: 'Above the knee',
          metadata: { tags: ['short', 'playful'] }
        }
      ]
    },
    {
      id: 'dress-q4',
      type: 'multi-select',
      question: 'What features are important to you?',
      required: false,
      options: [
        { id: 'feat1', label: 'Sleeves', metadata: { tags: ['sleeved'] } },
        { id: 'feat2', label: 'Pockets', metadata: { tags: ['pockets'] } },
        { id: 'feat3', label: 'Adjustable Straps', metadata: { tags: ['adjustable'] } },
        { id: 'feat4', label: 'Lined Interior', metadata: { tags: ['lined'] } },
        { id: 'feat5', label: 'Zipper Back', metadata: { tags: ['zipper'] } }
      ]
    },
    {
      id: 'dress-q5',
      type: 'scale-rating',
      question: 'What is your budget comfort level?',
      min: 0,
      max: 5,
      minLabel: 'Budget-Friendly',
      maxLabel: 'Premium',
      required: true
    }
  ],

  SHOES_QUESTIONS: [
    {
      id: 'shoes-q1',
      type: 'image-choice',
      question: 'What type of shoes are you looking for?',
      layout: 'grid',
      columns: 3,
      required: true,
      options: [
        {
          id: 'opt1',
          label: 'Sneakers',
          description: 'Casual, comfortable',
          imageUrl: null,
          imagePrompt: 'stylish sneakers',
          metadata: { tags: ['sneakers', 'casual', 'comfortable'] }
        },
        {
          id: 'opt2',
          label: 'Boots',
          description: 'Stylish, versatile',
          imageUrl: null,
          imagePrompt: 'fashion boots',
          metadata: { tags: ['boots', 'versatile'] }
        },
        {
          id: 'opt3',
          label: 'Sandals',
          description: 'Light, breathable',
          imageUrl: null,
          imagePrompt: 'summer sandals',
          metadata: { tags: ['sandals', 'summer'] }
        },
        {
          id: 'opt4',
          label: 'Formal Shoes',
          description: 'Elegant, professional',
          imageUrl: null,
          imagePrompt: 'formal dress shoes',
          metadata: { tags: ['formal', 'elegant'] }
        }
      ]
    },
    {
      id: 'shoes-q2',
      type: 'multi-select',
      question: 'What activities will you use these shoes for?',
      required: true,
      options: [
        { id: 'act1', label: 'Daily Wear', metadata: { tags: ['daily', 'casual'] } },
        { id: 'act2', label: 'Running/Sports', metadata: { tags: ['athletic', 'sports'] } },
        { id: 'act3', label: 'Work/Office', metadata: { tags: ['professional', 'work'] } },
        { id: 'act4', label: 'Special Occasions', metadata: { tags: ['formal', 'special'] } },
        { id: 'act5', label: 'Outdoor Activities', metadata: { tags: ['outdoor', 'active'] } }
      ]
    },
    {
      id: 'shoes-q3',
      type: 'color-palette',
      question: 'What color scheme do you prefer?',
      layout: 'grid',
      columns: 2,
      required: true,
      options: [
        {
          id: 'palette1',
          label: 'Classic Neutrals',
          description: 'Black, white, brown',
          colors: ['#1A202C', '#FFFFFF', '#744210'],
          metadata: { tags: ['neutral', 'classic'] }
        },
        {
          id: 'palette2',
          label: 'Bold Colors',
          description: 'Red, blue, green',
          colors: ['#E53E3E', '#4299E1', '#48BB78'],
          metadata: { tags: ['bold', 'colorful'] }
        }
      ]
    },
    {
      id: 'shoes-q4',
      type: 'scale-rating',
      question: 'How important is comfort vs. style?',
      min: 0,
      max: 5,
      minLabel: 'Comfort First',
      maxLabel: 'Style First',
      required: true
    },
    {
      id: 'shoes-q5',
      type: 'free-text',
      question: 'Any specific brands or features you prefer?',
      multiline: false,
      maxLength: 200,
      placeholder: 'e.g., Nike, cushioned sole, waterproof',
      required: false
    }
  ],

  GIFT_QUESTIONS: [
    {
      id: 'gift-q1',
      type: 'single-choice',
      question: 'Who is this gift for?',
      required: true,
      options: [
        { id: 'who1', label: 'Partner/Spouse', metadata: { tags: ['romantic', 'personal'] } },
        { id: 'who2', label: 'Family Member', metadata: { tags: ['family', 'traditional'] } },
        { id: 'who3', label: 'Friend', metadata: { tags: ['friendship', 'fun'] } },
        { id: 'who4', label: 'Colleague', metadata: { tags: ['professional', 'appropriate'] } },
        { id: 'who5', label: 'Child', metadata: { tags: ['playful', 'young'] } }
      ]
    },
    {
      id: 'gift-q2',
      type: 'multi-select',
      question: 'What are their interests?',
      required: true,
      options: [
        { id: 'int1', label: 'Fashion & Style', metadata: { tags: ['fashion', 'clothing'] } },
        { id: 'int2', label: 'Tech & Gadgets', metadata: { tags: ['tech', 'electronics'] } },
        { id: 'int3', label: 'Home & Decor', metadata: { tags: ['home', 'decor'] } },
        { id: 'int4', label: 'Sports & Fitness', metadata: { tags: ['sports', 'fitness'] } },
        { id: 'int5', label: 'Books & Learning', metadata: { tags: ['books', 'education'] } },
        { id: 'int6', label: 'Art & Crafts', metadata: { tags: ['art', 'creative'] } }
      ]
    },
    {
      id: 'gift-q3',
      type: 'scale-rating',
      question: 'What is your budget range?',
      min: 0,
      max: 5,
      minLabel: 'Under $25',
      maxLabel: '$100+',
      required: true
    },
    {
      id: 'gift-q4',
      type: 'single-choice',
      question: 'What is the occasion?',
      required: true,
      options: [
        { id: 'occ1', label: 'Birthday', metadata: { tags: ['birthday'] } },
        { id: 'occ2', label: 'Holiday', metadata: { tags: ['holiday'] } },
        { id: 'occ3', label: 'Anniversary', metadata: { tags: ['anniversary'] } },
        { id: 'occ4', label: 'Just Because', metadata: { tags: ['thoughtful'] } }
      ]
    },
    {
      id: 'gift-q5',
      type: 'free-text',
      question: 'Anything else we should know?',
      multiline: true,
      maxLength: 300,
      placeholder: 'Any specific preferences, allergies, or additional details...',
      required: false
    }
  ],

  DEFAULT_QUESTIONS: [
    {
      id: 'default-q1',
      type: 'image-choice',
      question: 'What type of product are you looking for?',
      layout: 'grid',
      columns: 4,
      required: true,
      options: [
        {
          id: 'cat1',
          label: 'Clothing',
          description: 'Shirts, pants, dresses',
          imageUrl: null,
          imagePrompt: 'clothing items',
          metadata: { tags: ['clothing'] }
        },
        {
          id: 'cat2',
          label: 'Footwear',
          description: 'Shoes, boots, sandals',
          imageUrl: null,
          imagePrompt: 'footwear collection',
          metadata: { tags: ['footwear'] }
        },
        {
          id: 'cat3',
          label: 'Accessories',
          description: 'Bags, jewelry, watches',
          imageUrl: null,
          imagePrompt: 'fashion accessories',
          metadata: { tags: ['accessories'] }
        },
        {
          id: 'cat4',
          label: 'Home Goods',
          description: 'Decor, furniture, textiles',
          imageUrl: null,
          imagePrompt: 'home goods',
          metadata: { tags: ['home'] }
        }
      ]
    },
    {
      id: 'default-q2',
      type: 'single-choice',
      question: 'What is your style preference?',
      required: true,
      options: [
        { id: 'style1', label: 'Classic', metadata: { tags: ['classic', 'timeless'] } },
        { id: 'style2', label: 'Modern', metadata: { tags: ['modern', 'contemporary'] } },
        { id: 'style3', label: 'Bohemian', metadata: { tags: ['bohemian', 'eclectic'] } },
        { id: 'style4', label: 'Minimalist', metadata: { tags: ['minimalist', 'simple'] } }
      ]
    },
    {
      id: 'default-q3',
      type: 'multi-select',
      question: 'What features are most important to you?',
      required: false,
      options: [
        { id: 'feat1', label: 'Quality Materials', metadata: { tags: ['quality'] } },
        { id: 'feat2', label: 'Sustainable', metadata: { tags: ['sustainable', 'eco-friendly'] } },
        { id: 'feat3', label: 'Affordable', metadata: { tags: ['budget', 'affordable'] } },
        { id: 'feat4', label: 'Brand Name', metadata: { tags: ['brand', 'designer'] } },
        { id: 'feat5', label: 'Unique Design', metadata: { tags: ['unique', 'distinctive'] } }
      ]
    },
    {
      id: 'default-q4',
      type: 'color-palette',
      question: 'What color scheme appeals to you?',
      layout: 'grid',
      columns: 2,
      required: true,
      options: [
        {
          id: 'pal1',
          label: 'Warm',
          description: 'Reds, oranges, yellows',
          colors: ['#E53E3E', '#ED8936', '#F6E05E'],
          metadata: { tags: ['warm', 'bold'] }
        },
        {
          id: 'pal2',
          label: 'Cool',
          description: 'Blues, greens, purples',
          colors: ['#4299E1', '#48BB78', '#9F7AEA'],
          metadata: { tags: ['cool', 'calm'] }
        },
        {
          id: 'pal3',
          label: 'Neutrals',
          description: 'Grays, beiges, whites',
          colors: ['#4A5568', '#CBD5E0', '#FFFFFF'],
          metadata: { tags: ['neutral', 'versatile'] }
        }
      ]
    },
    {
      id: 'default-q5',
      type: 'scale-rating',
      question: 'What is your budget comfort level?',
      min: 0,
      max: 5,
      minLabel: 'Budget Conscious',
      maxLabel: 'Premium Quality',
      required: true
    }
  ]
};

/**
 * Keyword to Question Set Mapping
 */
const KEYWORD_QUESTION_MAP = {
  dress: 'DRESS_QUESTIONS',
  dresses: 'DRESS_QUESTIONS',
  gown: 'DRESS_QUESTIONS',
  wedding: 'DRESS_QUESTIONS',
  formal: 'DRESS_QUESTIONS',

  shoe: 'SHOES_QUESTIONS',
  shoes: 'SHOES_QUESTIONS',
  sneaker: 'SHOES_QUESTIONS',
  sneakers: 'SHOES_QUESTIONS',
  boot: 'SHOES_QUESTIONS',
  boots: 'SHOES_QUESTIONS',
  sandal: 'SHOES_QUESTIONS',
  sandals: 'SHOES_QUESTIONS',
  footwear: 'SHOES_QUESTIONS',

  gift: 'GIFT_QUESTIONS',
  present: 'GIFT_QUESTIONS',
  birthday: 'GIFT_QUESTIONS',
  anniversary: 'GIFT_QUESTIONS'
};

/**
 * Validate question structure
 *
 * @param {Object} question - Question object to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateQuestion = (question) => {
  const errors = [];

  // Required fields
  if (!question.id) errors.push('Missing question ID');
  if (!question.type) errors.push('Missing question type');
  if (!question.question) errors.push('Missing question text');

  // Type validation
  if (!STYLE_GUIDE.componentTypes.includes(question.type)) {
    errors.push(`Invalid question type: ${question.type}`);
  }

  // Component-specific validation
  if (['image-choice', 'multi-select', 'single-choice', 'color-palette'].includes(question.type)) {
    if (!question.options || !Array.isArray(question.options)) {
      errors.push('Missing or invalid options array');
    } else {
      const minOptions = constraints[question.type]?.minOptions || 2;
      if (question.options.length < minOptions) {
        errors.push(`Insufficient options (minimum ${minOptions})`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Generate personalized questions based on user input
 *
 * @param {string} userInput - User's search query
 * @returns {Promise<Array>} Array of question objects
 */
export const generateQuestions = async (userInput) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Keyword detection
  const keywords = userInput.toLowerCase().split(' ');
  let questionSet = 'DEFAULT_QUESTIONS';

  for (const keyword of keywords) {
    if (KEYWORD_QUESTION_MAP[keyword]) {
      questionSet = KEYWORD_QUESTION_MAP[keyword];
      break;
    }
  }

  // Return the selected question set
  const questions = FALLBACK_QUESTIONS[questionSet];

  // Validate all questions
  questions.forEach(question => {
    const validation = validateQuestion(question);
    if (!validation.valid) {
      console.warn('Invalid question:', question.id, validation.errors);
    }
  });

  return questions;
};

/**
 * Submit answers and get product recommendations
 *
 * @param {Array} answers - Array of user answers
 * @returns {Promise<Object>} Object with products array and metadata
 */
export const submitAnswers = async (answers) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Extract tags from all answers
  const allTags = [];
  answers.forEach(answer => {
    if (answer.selectedOptions && Array.isArray(answer.selectedOptions)) {
      // For multi-select and single-choice
      answer.selectedOptions.forEach(optionId => {
        const question = FALLBACK_QUESTIONS.DEFAULT_QUESTIONS.find(q => q.id === answer.questionId);
        if (question?.options) {
          const option = question.options.find(opt => opt.id === optionId);
          if (option?.metadata?.tags) {
            allTags.push(...option.metadata.tags);
          }
        }
      });
    }
  });

  // Mock product matching (in real implementation, this would query backend)
  const mockProducts = [
    { id: 1, name: 'Blue Cotton Shirt', price: 29.99, image: null, tag: 'New', category: 'Clothing', tags: ['classic', 'casual'] },
    { id: 2, name: 'Black Slim Pants', price: 49.99, image: null, tag: 'Bestseller', category: 'Clothing', tags: ['modern', 'formal'] },
    { id: 3, name: 'Red Summer Dress', price: 79.99, image: null, tag: 'Sale', category: 'Clothing', tags: ['romantic', 'summer'] },
    { id: 4, name: 'Leather Wallet', price: 34.99, image: null, tag: null, category: 'Accessories', tags: ['classic', 'quality'] },
    { id: 5, name: 'Canvas Backpack', price: 59.99, image: null, tag: 'New', category: 'Bags', tags: ['casual', 'sustainable'] },
    { id: 6, name: 'Running Shoes', price: 89.99, image: null, tag: null, category: 'Footwear', tags: ['athletic', 'comfortable'] },
    { id: 7, name: 'Denim Jacket', price: 89.99, image: null, tag: 'Popular', category: 'Clothing', tags: ['casual', 'classic'] },
    { id: 8, name: 'Silk Scarf', price: 54.99, image: null, tag: null, category: 'Accessories', tags: ['elegant', 'unique'] }
  ];

  // Simple tag matching (in real implementation, would use AI-powered similarity)
  const rankedProducts = mockProducts.map(product => {
    const matchingTags = product.tags.filter(tag => allTags.includes(tag));
    return {
      ...product,
      matchScore: matchingTags.length
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  return {
    products: rankedProducts.slice(0, 8), // Top 8 matches
    totalMatches: rankedProducts.length,
    metadata: {
      answersProcessed: answers.length,
      tagsExtracted: allTags.length,
      matchingAlgorithm: 'tag-based-dummy'
    }
  };
};

/**
 * Get suggestion chips for the input screen
 *
 * @returns {Array<string>} Array of suggestion strings
 */
export const getSuggestionChips = () => {
  return [
    'Summer dress for wedding',
    'Running shoes for daily wear',
    'Gift for tech-loving friend',
    'Minimalist home decor',
    'Casual work outfit',
    'Sustainable accessories'
  ];
};

/**
 * Get aesthetic options for chat-based journey flow (DEPRECATED - Use getAestheticQuestion)
 *
 * @returns {Array<Object>} Array of aesthetic option objects
 */
export const getAestheticOptions = () => [
  {
    id: 'romantic',
    label: 'Romantic & Soft',
    icon: 'Heart',
    iconColor: '#ffb7c5',
    bgColor: '#fff0f3'
  },
  {
    id: 'chic',
    label: 'Chic & Modern',
    icon: 'Gem',
    iconColor: '#94a3b8',
    bgColor: '#f8fafc'
  },
  {
    id: 'edgy',
    label: 'Edgy & Bold',
    icon: 'Flame',
    iconColor: '#1a1a1a',
    bgColor: '#fafafa'
  },
  {
    id: 'boho',
    label: 'Boho & Relaxed',
    icon: 'Sun',
    iconColor: '#fb923c',
    bgColor: '#fff7ed'
  }
];

/**
 * Get aesthetic question configuration (Image Choice)
 *
 * @returns {Object} Question object compatible with QuestionRenderer
 */
export const getAestheticQuestion = () => ({
  id: 'aesthetic-visual-mood',
  type: 'image-choice',
  question: 'Which of these styles resonates with you?',
  layout: 'grid',
  columns: 2,
  required: true,
  options: [
    {
      id: 'romantic',
      label: 'Romantic',
      description: 'Soft & dreamy aesthetics',
      imageUrl: '/vibe_photos.png',
      imagePrompt: 'Romantic style with soft colors',
      metadata: { tags: ['romantic', 'soft', 'feminine'], objectPosition: '0% 0%' }
    },
    {
      id: 'chic',
      label: 'Chic',
      description: 'Modern & polished looks',
      imageUrl: '/vibe_photos.png',
      imagePrompt: 'Chic modern style',
      metadata: { tags: ['chic', 'modern', 'elegant'], objectPosition: '100% 0%' }
    },
    {
      id: 'edgy',
      label: 'Edgy',
      description: 'Bold & daring style',
      imageUrl: '/vibe_photos.png',
      imagePrompt: 'Edgy bold style',
      metadata: { tags: ['edgy', 'bold', 'dramatic'], objectPosition: '0% 100%' }
    },
    {
      id: 'boho',
      label: 'Boho',
      description: 'Relaxed & free-spirited vibes',
      imageUrl: '/vibe_photos.png',
      imagePrompt: 'Boho relaxed style',
      metadata: { tags: ['boho', 'relaxed', 'eclectic'], objectPosition: '100% 100%' }
    }
  ]
});

/**
 * Get risk tolerance question configuration (Scale Rating)
 *
 * @returns {Object} Question object compatible with QuestionRenderer
 */
export const getRiskToleranceQuestion = () => ({
  id: 'risk-tolerance-scale',
  type: 'scale-rating',
  question: 'How far should I push the boundaries of your current style?',
  min: 1,
  max: 10,
  step: 0.5,
  minLabel: 'Safe & Classic',
  maxLabel: 'Bold & Experimental',
  required: true
});

/**
 * Get attributes question configuration (Multi-Select)
 *
 * @returns {Object} Question object compatible with QuestionRenderer
 */
export const getAttributesQuestion = () => ({
  id: 'style-attributes',
  type: 'multi-select',
  question: 'What style attributes are important to you?',
  required: false,
  options: [
    { id: 'sustainable', label: 'Sustainable', metadata: { tags: ['eco-friendly', 'ethical'] } },
    { id: 'luxury', label: 'Luxury', metadata: { tags: ['premium', 'high-end'] } },
    { id: 'versatile', label: 'Versatile', metadata: { tags: ['flexible', 'multi-purpose'] } },
    { id: 'handmade', label: 'Hand-made', metadata: { tags: ['artisan', 'crafted'] } },
    { id: 'vintage', label: 'Vintage', metadata: { tags: ['retro', 'classic'] } },
    { id: 'waterproof', label: 'Waterproof', metadata: { tags: ['weather-resistant', 'durable'] } }
  ]
});

/**
 * Get image upload question configuration (Image Upload)
 *
 * @returns {Object} Question object compatible with QuestionRenderer
 */
export const getImageUploadQuestion = () => ({
  id: 'inspiration-image',
  type: 'image-upload',
  question: 'Upload a photo of an outfit you love or a screenshot of your moodboard',
  maxFileSize: 5000000, // 5MB
  required: false
});

/**
 * Get additional context question configuration (Free Text)
 *
 * @returns {Object} Question object compatible with QuestionRenderer
 */
export const getContextQuestion = () => ({
  id: 'additional-context',
  type: 'free-text',
  question: 'Tell me a little more about the specific event or goals for this journey',
  multiline: true,
  maxLength: 500,
  placeholder: 'I\'m looking for...',
  required: false
});

/**
 * Get greeting question configuration (Free Text)
 *
 * @returns {Object} Question object compatible with QuestionRenderer
 */
export const getGreetingQuestion = () => ({
  id: 'greeting-query',
  type: 'free-text',
  question: 'What are we looking for today?',
  multiline: false,
  maxLength: 100,
  placeholder: 'e.g. A dress for a summer wedding, sneakers for running...',
  required: true
});

/**
 * Generate Greeting Batch: Initial Prompt
 *
 * @returns {Object} Batch configuration with title, description, questions array
 */
export const generateGreetingBatch = () => {
  const greetings = [
    'Welcome back!',
    'Hello! Ready to style?',
    'Hi there! What\'s the occasion?',
    'Welcome! Let\'s find your look.'
  ];
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  return {
    title: randomGreeting,
    description: 'I\'m your personal AI stylist. I can help you find the perfect outfit for any occasion.',
    questions: [
      getGreetingQuestion()
    ],
    submitLabel: 'Start Journey'
  };
};

/**
 * Extract occasion from user query using keyword matching
 *
 * @param {string} query - User's search query
 * @returns {string|null} Extracted occasion or null
 */
export const extractOccasion = (query) => {
  const lowerQuery = query.toLowerCase();

  // Occasion keyword mapping
  const occasionMap = {
    'valentine': 'Valentine\'s Day Dinner Date',
    'date': 'Dinner Date',
    'dinner': 'Dinner Date',
    'wedding': 'Wedding Guest',
    'office': 'Office Event',
    'work': 'Work Event',
    'party': 'Party',
    'girls night': 'Girls\' Night Out',
    'casual': 'Casual Outing',
    'beach': 'Beach Day',
    'brunch': 'Brunch',
    'interview': 'Job Interview',
    'meeting': 'Professional Meeting'
  };

  for (const [keyword, occasion] of Object.entries(occasionMap)) {
    if (lowerQuery.includes(keyword)) {
      return occasion;
    }
  }

  return null;
};

/**
 * Extract location/weather from user query
 *
 * @param {string} query - User's search query
 * @returns {string|null} Extracted location or null
 */
export const extractLocation = (query) => {
  const lowerQuery = query.toLowerCase();

  // Simple location detection (can be enhanced with geocoding API)
  const locationMap = {
    'london': 'London, 8°C',
    'paris': 'Paris, 10°C',
    'new york': 'New York, 5°C',
    'los angeles': 'Los Angeles, 18°C',
    'tokyo': 'Tokyo, 12°C',
    'sydney': 'Sydney, 22°C'
  };

  for (const [keyword, location] of Object.entries(locationMap)) {
    if (lowerQuery.includes(keyword)) {
      return location;
    }
  }

  return null;
};

/**
 * Generate conversational AI response based on conversation step (NEW VERSION)
 *
 * @param {string} step - Current conversation step
 * @param {Object} previousAnswer - Previous answer from user (optional)
 * @returns {Object} AI response with title, description, question object
 */
export const generateConversationResponse = (step, previousAnswer = null) => {
  const responses = {
    aesthetic: {
      title: 'Perfect choice. Let\'s set the vibe.',
      description: 'Since it\'s a special occasion, which of these aesthetics resonates most with how you want to feel? I\'ll use this to filter our curated merchant catalog.',
      question: getAestheticQuestion()
    },
    risk: {
      title: 'How adventurous are you feeling?',
      description: 'This helps me understand whether to play it safe or push you out of your comfort zone.',
      question: getRiskToleranceQuestion()
    },
    attributes: {
      title: 'What matters most to you?',
      description: 'Select any attributes that are important for this journey.',
      question: getAttributesQuestion()
    },
    inspiration: {
      title: 'Show me your inspiration',
      description: 'Upload a photo of an outfit you love, a screenshot from Pinterest, or any visual reference.',
      question: getImageUploadQuestion()
    },
    context: {
      title: 'Any final details?',
      description: 'Tell me anything else I should know about this journey or the event.',
      question: getContextQuestion()
    },

    // Legacy responses (kept for backwards compatibility)
    occasion: {
      title: 'Tell me about the occasion',
      description: 'What type of event are you attending? This helps me understand the dress code and context.',
      questionType: 'occasion',
      options: [
        { id: 'dinner-date', label: 'Dinner Date', icon: 'CalendarHeart' },
        { id: 'wedding', label: 'Wedding Guest', icon: 'Users' },
        { id: 'office', label: 'Office Event', icon: 'Briefcase' },
        { id: 'party', label: 'Party/Night Out', icon: 'Music' },
        { id: 'casual', label: 'Casual Outing', icon: 'Coffee' }
      ]
    },
    weather: {
      title: 'What\'s the weather like?',
      description: 'Where and when is this happening? I\'ll make sure you\'re dressed appropriately for the climate.',
      questionType: 'weather',
      options: [
        { id: 'cold', label: 'Cold (< 10°C)', icon: 'CloudSnow' },
        { id: 'mild', label: 'Mild (10-20°C)', icon: 'Cloud' },
        { id: 'warm', label: 'Warm (> 20°C)', icon: 'Sun' }
      ]
    },
    budget: {
      title: 'What\'s your budget?',
      description: 'This helps me show you options within your price range.',
      questionType: 'budget',
      options: [
        { id: 'budget', label: 'Under $100', icon: 'DollarSign' },
        { id: 'moderate', label: '$100 - $250', icon: 'DollarSign' },
        { id: 'premium', label: '$250+', icon: 'DollarSign' }
      ]
    },
    keyPieces: {
      title: 'Any must-have pieces?',
      description: 'Are there specific items you\'d like to include in your outfit? (e.g., dress, heels, jacket)',
      questionType: 'keyPieces',
      options: [] // Free text or multi-select
    }
  };

  return responses[step] || responses.aesthetic;
};

/**
 * Format answer for display in user message bubble
 *
 * @param {Object} question - Question object
 * @param {Object} answer - Answer object from QuestionRenderer
 * @returns {string} Formatted text for user message
 */
export const formatAnswerForDisplay = (question, answer) => {
  if (!answer || !answer.value) {
    return 'Skipped';
  }

  switch (question.type) {
    case 'image-choice':
      const selectedOption = question.options?.find(opt => opt.id === answer.value);
      return `I chose ${selectedOption?.label || 'a style'}`;

    case 'scale-rating':
      const value = parseFloat(answer.value).toFixed(1);
      const label = value <= 3.5 ? 'Safe' : value <= 7 ? 'Moderate' : 'Bold';
      return `Risk tolerance: ${value}/10 (${label})`;

    case 'multi-select':
      if (!answer.selectedOptions || answer.selectedOptions.length === 0) {
        return 'No attributes selected';
      }
      const selectedLabels = answer.selectedOptions
        .map(optId => question.options?.find(opt => opt.id === optId)?.label)
        .filter(Boolean);
      return selectedLabels.join(', ');

    case 'image-upload':
      return answer.fileName ? `Uploaded inspiration photo: ${answer.fileName}` : 'Uploaded inspiration photo';

    case 'free-text':
      return answer.value.length > 100 ? `${answer.value.substring(0, 100)}...` : answer.value;

    default:
      return String(answer.value);
  }
};

/**
 * Process aesthetic answer
 *
 * @param {Object} answer - Answer object
 * @returns {string} Selected aesthetic ID
 */
export const processAestheticAnswer = (answer) => {
  return answer?.value || null;
};

/**
 * Process risk tolerance answer
 *
 * @param {Object} answer - Answer object
 * @returns {number} Risk value (1-10)
 */
export const processRiskAnswer = (answer) => {
  return answer?.value ? parseFloat(answer.value) : 5.0;
};

/**
 * Process attributes answer
 *
 * @param {Object} answer - Answer object
 * @returns {Array<string>} Selected attribute IDs
 */
export const processAttributesAnswer = (answer) => {
  return answer?.selectedOptions || [];
};

/**
 * Process image upload answer
 *
 * @param {Object} answer - Answer object
 * @returns {Object} Image data { fileName, base64URL }
 */
export const processImageAnswer = (answer) => {
  return {
    fileName: answer?.fileName || null,
    base64URL: answer?.value || null,
    fileSize: answer?.fileSize || null
  };
};

/**
 * Process context answer
 *
 * @param {Object} answer - Answer object
 * @returns {string} Free text context
 */
export const processContextAnswer = (answer) => {
  return answer?.value || '';
};

/**
 * Get Time of Day question configuration (Multi-Select)
 *
 * @returns {Object} Question object
 */
export const getTimeOfDayQuestion = () => ({
  id: 'time-of-day',
  type: 'multi-select',
  question: 'What time of day is this for?',
  subtext: '(Select all that apply)',
  required: true,
  options: [
    { id: 'daytime', label: 'Daytime', metadata: { tags: ['day', 'morning', 'brunch', 'work'] } },
    { id: 'golden-hour', label: 'Golden Hour / Sunset', metadata: { tags: ['sunset', 'evening', 'cocktail'] } },
    { id: 'evening', label: 'Evening', metadata: { tags: ['evening', 'dinner', 'date'] } },
    { id: 'late-night', label: 'Late Night', metadata: { tags: ['night', 'party', 'club'] } }
  ]
});

/**
 * Get Season question configuration (Multi-Select)
 *
 * @returns {Object} Question object
 */
export const getSeasonQuestion = () => ({
  id: 'season',
  type: 'multi-select',
  question: 'What is the weather like?',
  subtext: '(Select all that apply)',
  required: true,
  options: [
    { id: 'spring', label: 'Spring (Mild)', metadata: { tags: ['spring', 'mild', 'light-layers'] } },
    { id: 'summer', label: 'Summer (Hot)', metadata: { tags: ['summer', 'hot', 'breathable', 'linen'] } },
    { id: 'autumn', label: 'Autumn (Crisp)', metadata: { tags: ['autumn', 'cool', 'crisp', 'knits'] } },
    { id: 'winter', label: 'Winter (Cold)', metadata: { tags: ['winter', 'cold', 'insulating', 'coats'] } }
  ]
});

/**
 * Get Location question configuration (Hybrid Select)
 *
 * @returns {Object} Question object
 */
export const getLocationQuestion = () => ({
  id: 'location-hybrid',
  type: 'hybrid-select',
  question: 'Where will you be?',
  subtext: 'Select from the list or add specific details below.',
  required: true,
  multiSelect: false, // Force single selection for main location type
  placeholder: 'Specific location details (e.g. Garden wedding in London)',
  options: [
    { id: 'indoors', label: 'Indoors', metadata: { tags: ['indoor'] } },
    { id: 'outdoors', label: 'Outdoors', metadata: { tags: ['outdoor'] } },
    { id: 'beach', label: 'At the Beach', metadata: { tags: ['beach'] } },
    { id: 'office', label: 'Office/Professional', metadata: { tags: ['office'] } }
  ]
});

/**
 * Get Budget question configuration (Scale Rating) — legacy fallback
 *
 * @returns {Object} Question object
 */
export const getBudgetScaleQuestion = () => ({
  id: 'budget-scale',
  type: 'scale-rating',
  question: 'What is your budget comfort level?',
  min: 1,
  max: 5,
  step: 1,
  minLabel: '$',
  maxLabel: '$$$$$',
  required: true
});

/**
 * Get Budget question configuration (Dual-Handle Range Slider)
 *
 * @returns {Object} Question object compatible with QuestionRenderer
 */
export const getBudgetRangeQuestion = () => ({
  id: 'budget-range',
  type: 'range-slider',
  question: 'What is your budget range?',
  min: 0,
  max: 1000,
  step: 50,
  defaultMin: 100,
  defaultMax: 500,
  minLabel: '$0',
  maxLabel: '$1,000',
  required: true
});

/**
 * Get Style Leaning question configuration (Hybrid Select)
 *
 * @returns {Object} Question object
 */
export const getStyleLeaningQuestion = () => ({
  id: 'style-leaning',
  type: 'hybrid-select',
  question: 'Which style lane should we look in?',
  subtext: 'This helps us filter for Men\'s vs Women\'s sizing and cuts.',
  required: true,
  multiSelect: false,
  placeholder: 'Or describe your specific style preference...',
  options: [
    { id: 'feminine', label: 'Feminine', metadata: { tags: ['womens', 'feminine'] } },
    { id: 'masculine', label: 'Masculine', metadata: { tags: ['mens', 'masculine'] } },
    { id: 'unisex', label: 'No Preference / Unisex', metadata: { tags: ['unisex'] } }
  ]
});

/**
 * Get Age Range question configuration (Hybrid Select)
 *
 * @returns {Object} Question object
 */
export const getAgeRangeQuestion = () => ({
  id: 'age-range',
  type: 'hybrid-select',
  question: 'Who are we shopping for?',
  required: true,
  multiSelect: false,
  placeholder: 'Or enter a specific age/group...',
  options: [
    { id: 'teen', label: 'Teen (13-19)', metadata: { tags: ['teen'] } },
    { id: 'young-adult', label: 'Young Adult (20-29)', metadata: { tags: ['young-adult', '20s'] } },
    { id: 'adult', label: 'Adult (30-49)', metadata: { tags: ['adult', '30s', '40s'] } },
    { id: 'mature', label: 'Mature (50+)', metadata: { tags: ['senior', '50s'] } }
  ]
});

/**
 * Generate Batch 1: Occasion & Context
 *
 * @returns {Object} Batch configuration
 */
export const generateBatch1 = () => ({
  title: 'Let\'s set the scene',
  description: 'First, I need to know the context of your journey.',
  questions: [
    getSeasonQuestion(),
    getTimeOfDayQuestion(),
    getLocationQuestion(),
    getBudgetRangeQuestion(),
    getStyleLeaningQuestion(),
    getAgeRangeQuestion()
  ]
});

/**
 * Generate Batch 2: Style & Preferences
 *
 * @returns {Object} Batch configuration
 */
export const generateBatch2 = () => ({
  title: 'Now for the style',
  description: 'Help me understand your aesthetic and risk preferences.',
  questions: [
    getAestheticQuestion(),
    getRiskToleranceQuestion()
  ]
});

/**
 * Generate Batch 3: Final Details
 *
 * @returns {Object} Batch configuration
 */
export const generateBatch3 = () => ({
  title: 'Finishing touches',
  description: 'Any final details to perfect your curated collection?',
  questions: [
    getAttributesQuestion(),
    getImageUploadQuestion(),
    getContextQuestion()
  ]
});

/**
 * Generate completion message
 *
 * @returns {Object} Completion message configuration
 */
export const generateCompletionMessage = () => ({
  title: 'Perfect! I have everything I need.',
  description: 'I think I have enough information to search for the perfect outfits for you! Give me a moment to curate your personalized collection.',
  questions: []  // No questions, just a message
});

/**
 * Format answer for display in batch summary (concise version)
 *
 * @param {Object} question - Question object
 * @param {Object} answer - Answer object from QuestionRenderer
 * @returns {string|null} Formatted text for batch summary (null if skipped)
 */
export const formatAnswerForBatchSummary = (question, answer) => {
  if (!answer || !answer.value) {
    return null;  // Return null instead of "Skipped" for batch summaries
  }

  switch (question.type) {
    case 'image-choice':
      const selectedOption = question.options?.find(opt => opt.id === answer.value);
      return selectedOption?.label || answer.value;  // Just the label

    case 'scale-rating':
      const value = parseFloat(answer.value).toFixed(1);
      const labelShort = question.question.split(' ').slice(0, 2).join(' ');
      return `${labelShort}: ${value}/${question.max}`;

    case 'multi-select':
      if (!answer.selectedOptions || answer.selectedOptions.length === 0) {
        return null;
      }
      const labels = answer.selectedOptions
        .map(optId => question.options?.find(opt => opt.id === optId)?.label)
        .filter(Boolean);
      return labels.join(', ');

    case 'single-choice':
      if (!answer.value) return null;
      const choiceOption = question.options?.find(opt => opt.id === answer.value);
      return choiceOption?.label || answer.value;

    case 'image-upload':
      return answer.fileName ? '📷 Photo uploaded' : null;

    case 'free-text':
      if (!answer.value || !answer.value.trim()) return null;
      return answer.value.length > 50
        ? `${answer.value.substring(0, 50)}...`
        : answer.value;

    default:
      return String(answer.value);
  }
};

export default {
  generateQuestions,
  submitAnswers,
  validateQuestion,
  getSuggestionChips,
  getAestheticOptions,
  extractOccasion,
  extractLocation,
  generateConversationResponse,

  // New question configuration functions
  getAestheticQuestion,
  getRiskToleranceQuestion,
  getAttributesQuestion,
  getImageUploadQuestion,
  getContextQuestion,
  getGreetingQuestion,
  getStyleLeaningQuestion,
  getAgeRangeQuestion,
  getTimeOfDayQuestion,
  getSeasonQuestion,
  getLocationQuestion,
  getBudgetScaleQuestion,
  getBudgetRangeQuestion,

  // Batch generation functions
  generateBatch1,
  generateBatch2,
  generateBatch3,
  generateGreetingBatch,
  generateCompletionMessage,

  // Answer processing functions
  formatAnswerForDisplay,
  formatAnswerForBatchSummary,
  processAestheticAnswer,
  processRiskAnswer,
  processAttributesAnswer,
  processImageAnswer,
  processContextAnswer
};
