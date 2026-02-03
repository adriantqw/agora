import consumerAuthService from './consumerAuthService';
 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
 
/**
 * Curate My Fit API Service
 * Integrates with backend consumer stylist endpoints (existing chat workflow)
 */
 
/**
 * Start a new session with search query and images.
 * Maps to existing /api/stylist/consumer/chat endpoint which uses chat-based workflow.
 *
 * @param {string} searchQuery - User's search query
 * @param {File[]} images - Array of image files (max 5)
 * @returns {Promise<object>} Response with threadId, uiInputs, journey
 */
export const startBatch = async (searchQuery, images = []) => {
  // Ensure token is valid before making request
  await consumerAuthService.ensureValidToken();
 
  const token = consumerAuthService.getToken();
 
  // Create FormData for multipart upload (for images)
  const formData = new FormData();
  formData.append('message', searchQuery);
 
  // Append images to FormData
  images.forEach((image) => {
    formData.append('images', image);
  });
 
  try {
    const response = await fetch(`${API_BASE_URL}/api/stylist/consumer/chat-form`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Note: Do NOT set Content-Type for FormData - browser sets it automatically with boundary
      },
      body: formData
    });
 
    // Handle 401 responses
    if (response.status === 401) {
      consumerAuthService.clearTokens();
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
 
    // Handle errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `Request failed with status ${response.status}`
      }));
      throw new Error(error.detail || `Request failed with status ${response.status}`);
    }
 
    const data = await response.json();
    
    // Convert backend response (chat format) to frontend expected format (batch format)
    // Backend returns: { threadId, journey, uiInputs: [...] }
    // Frontend expects: { threadId, blurb: string, questions: [...], summaryUpdates: {...}, imageUrls: [...] }
    const uiInputs = data.data.uiInputs || [];
    const journey = data.data.journey;
    const questions = uiInputs.map((ui) => ({
      id: ui.id,
      type: ui.type,
      question: ui.question,
      rowLabel: ui.label || ui.question,
      required: ui.required,
      options: ui.options?.map((opt) => ({
        label: opt.label || opt.value,
        value: opt.value,
        imageUrl: opt.image_url || opt.imageUrl,
        iconName: opt.icon_name || opt.iconName,
        description: opt.description
      })) || [],
      placeholder: ui.placeholder,
      minValue: ui.min_value || ui.minValue,
      maxValue: ui.max_value || ui.maxValue,
      unit: ui.unit,
      multiSelect: ui.multi_select || ui.multiSelect
    }));
    
    // Generate blurb from journey or use default
    const blurb = journey?.summary || "Let's create your perfect look! I'm here to help you find your personal style.";
    
    // Generate summary updates from journey
    const summaryUpdates = journey ? {
      title: journey.title || "Your Journey",
      foundations: {
        location: journey.location,
        style: journey.style_preferences?.join(', '),
        occasion: journey.occasion,
        season: journey.season
      },
      narrative: journey.summary || "Let's create something amazing together!"
    } : {
      title: "Your Journey",
      foundations: {},
      narrative: "Let's create something amazing together!"
    };
    
    return {
      threadId: data.data.threadId,
      blurb: blurb,
      questions: questions,
      summaryUpdates: summaryUpdates,
      imageUrls: [] // Images uploaded separately, not stored in journey yet
    };
  } catch (error) {
    console.error('Start batch error:', error);
    throw error;
  }
};
 
/**
 * Submit batch answers to PersonalStylist agent.
 * Maps to existing /api/stylist/consumer/answers endpoint.
 *
 * @param {string} threadId - Thread ID from startBatch
 * @param {object} answers - Dictionary of questionId -> AnswerData
 * @returns {Promise<object>} Response with hasMore flag and either next batch or final journey
 */
export const submitBatchAnswers = async (threadId, answers) => {
  // Ensure token is valid before making request
  await consumerAuthService.ensureValidToken();
 
  const token = consumerAuthService.getToken();
 
  try {
    // Convert frontend AnswerData format to backend UserResponse format
    const userResponses = Object.entries(answers).map(([questionId, answerData]) => ({
      question_id: questionId,
      timestamp: answerData.timestamp || Date.now(),
      selected_options: answerData.selectedOptions,
      free_text: answerData.freeText,
      min_value: answerData.minValue,
      max_value: answerData.maxValue
    }));
    
    const response = await fetch(`${API_BASE_URL}/api/stylist/consumer/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ threadId, answers: userResponses })
    });
 
    // Handle 401 responses
    if (response.status === 401) {
      consumerAuthService.clearTokens();
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
 
    // Handle errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `Request failed with status ${response.status}`
      }));
      throw new Error(error.detail || `Request failed with status ${response.status}`);
    }
 
    const data = await response.json();
    
    // Convert backend response to frontend expected format
    const journey = data.data.journey;
    const uiInputs = data.data.uiInputs || [];
    
    // Check if journey is complete (has required fields)
    const isComplete = journey?.title && journey?.occasion && journey?.season;
    
    if (isComplete) {
      // Return final journey response
      const journeyId = journey?.id || generateUUID();
      return {
        hasMore: false,
        journeyId: journeyId,
        journey: {
          id: journeyId,
          title: journey.title,
          status: "active",
          statusColor: "#10B981",
          statusLabel: "Active",
          summary: journey.summary,
          searchQuery: journey.search_query,
          imageUrls: journey.image_urls || [],
          closetUrl: `/inventory`,
          consumerId: journey.consumer_id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        nextStep: {
          action: "matchmaker",
          url: `/matchmaker?journeyId=${journeyId}`
        }
      };
    } else {
      // Return next batch response
      const questions = uiInputs.map((ui) => ({
        id: ui.id,
        type: ui.type,
        question: ui.question,
        rowLabel: ui.label || ui.question,
        required: ui.required,
        options: ui.options?.map((opt) => ({
          label: opt.label || opt.value,
          value: opt.value,
          imageUrl: opt.image_url || opt.imageUrl,
          iconName: opt.icon_name || opt.iconName,
          description: opt.description
        })) || [],
        placeholder: ui.placeholder,
        minValue: ui.min_value || ui.minValue,
        maxValue: ui.max_value || ui.maxValue,
        unit: ui.unit,
        multiSelect: ui.multi_select || ui.multiSelect
      }));
      
      const blurb = "Great! Let's learn more about your preferences.";
      const summaryUpdates = {
        title: journey?.title || "Your Journey",
        foundations: {
          location: journey?.location,
          style: journey?.style_preferences?.join(', '),
          occasion: journey?.occasion,
          season: journey?.season
        },
        narrative: journey?.summary || "Building your perfect look..."
      };
      
      return {
        hasMore: true,
        blurb: blurb,
        questions: questions,
        summaryUpdates: summaryUpdates
      };
    }
  } catch (error) {
    console.error('Submit batch answers error:', error);
    throw error;
  }
};
 
/**
 * Get session state for autosave/resume.
 * Maps to existing /api/stylist/consumer/state/{thread_id} endpoint.
 *
 * @param {string} threadId - Thread ID from startBatch
 * @returns {Promise<object>} Response with threadId, answers, lastUpdated, expiresAt
 */
export const getState = async (threadId) => {
  await consumerAuthService.ensureValidToken();
  const token = consumerAuthService.getToken();
 
  try {
    const response = await fetch(`${API_BASE_URL}/api/stylist/consumer/state/${threadId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
 
    if (!response.ok) {
      throw new Error(`Failed to get state: ${response.status}`);
    }
 
    const data = await response.json();
    const journey = data.data.journey;
    const uiInputs = data.data.uiInputs || [];
    
    // Convert backend state to frontend state format
    const answers = {};
    uiInputs.forEach((ui) => {
      if (ui.user_answers) {
        ui.user_answers.forEach((answer) => {
          answers[answer.question_id] = {
            selectedOptions: answer.selected_options,
            freeText: answer.free_text,
            minValue: answer.min_value,
            maxValue: answer.max_value,
            timestamp: answer.timestamp
          };
        });
      }
    });
    
    return {
      threadId: data.data.threadId,
      answers: answers,
      lastUpdated: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  } catch (error) {
    console.error('Get state error:', error);
    throw error;
  }
};

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default {
  startBatch,
  submitBatchAnswers,
  getState
};
