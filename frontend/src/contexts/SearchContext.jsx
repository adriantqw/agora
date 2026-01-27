import { createContext, useContext, useState } from 'react';

// Consumer theme colors (pink)
export const CONSUMER_THEME = {
  primary: '#F5A5B8',
  primaryDark: '#E8879C',
  primaryLight: '#FDD5DD',
  primaryGlow: 'rgba(245, 165, 184, 0.3)',
  gradient: 'linear-gradient(135deg, #F5A5B8 0%, #E8879C 100%)',
  gradientHover: 'linear-gradient(135deg, #E8879C 0%, #D67A8A 100%)',
};

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    dateTime: [],
    style: [],
    price: null,
    addOns: [],
    preferences: []
  });
  const [useExistingPreferences, setUseExistingPreferences] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(3);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateFilter = (category, values) => {
    setFilters(prev => ({
      ...prev,
      [category]: values
    }));
  };

  const removeFilter = (category, value) => {
    setFilters(prev => {
      const currentValues = prev[category];

      // Handle single value (price)
      if (!Array.isArray(currentValues)) {
        return {
          ...prev,
          [category]: null
        };
      }

      // Handle array values
      return {
        ...prev,
        [category]: currentValues.filter(v => v !== value)
      };
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const saveAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const toggleExistingPreferences = () => {
    setUseExistingPreferences(prev => !prev);
  };

  const resetSearch = () => {
    setQuery('');
    setFilters({
      dateTime: [],
      style: [],
      price: null,
      addOns: [],
      preferences: []
    });
    setUseExistingPreferences(false);
    setCurrentStep(0);
    setAnswers({});
    setError(null);
  };

  const submitSearch = () => {
    // This will be called when user clicks "See Results"
    // Returns the current state for navigation
    return {
      query,
      filters,
      useExistingPreferences,
      answers
    };
  };

  const value = {
    query,
    setQuery,
    filters,
    updateFilter,
    removeFilter,
    useExistingPreferences,
    toggleExistingPreferences,
    currentStep,
    setCurrentStep,
    totalSteps,
    setTotalSteps,
    answers,
    saveAnswer,
    isLoading,
    setIsLoading,
    error,
    setError,
    nextStep,
    previousStep,
    resetSearch,
    submitSearch
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}
