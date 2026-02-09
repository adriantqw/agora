import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getAIStylingAdvice, generateLookbookStream, getRandomAIResponse } from '../services/fittingRoomService';
import consumerAuthService from '../services/consumerAuthService';
import { transformFittingSets, wrapProductAsSet } from '../utils/fittingRoomHelpers';

const FittingRoomContext = createContext();

export const useFittingRoom = () => {
  const context = useContext(FittingRoomContext);
  if (!context) {
    throw new Error('useFittingRoom must be used within a FittingRoomProvider');
  }
  return context;
};

const QUEUE_SIZE = 5;  // Changed from 7 to 5 (sets take more visual space)

const createEmptySlots = (count) =>
  Array.from({ length: count }, (_, i) => ({ slot: i + 1, fittingSet: null, isFavorite: false }));

export const FittingRoomProvider = ({ children }) => {
  const [queue, setQueue] = useState(createEmptySlots(QUEUE_SIZE));

  const [activeCategory, setActiveCategory] = useState('current');
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: 'Hi! I\'m your AI stylist. Add items to your try-on queue and I\'ll help you create the perfect outfit!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Fitting assistant state
  const [fittingThreadId, setFittingThreadId] = useState(null);
  // REMOVED: const [fittingSets, setFittingSets] = useState([]);
  // Queue becomes single source of truth for fitting sets
  const [isGenerating, setIsGenerating] = useState(false);
  const [thinkingText, setThinkingText] = useState('');
  const abortStreamRef = useRef(null);

  // Journey context from Find The Look
  const [journeyId, setJourneyId] = useState(null);
  const [stylistThreadId, setStylistThreadId] = useState(null);

  // ────────────────────────────────────────────────────────────────────────────
  // Product-based operations (wrap products as temporary sets)
  // ────────────────────────────────────────────────────────────────────────────

  const addProductToQueue = (product) => {
    const tempSet = wrapProductAsSet(product);
    if (!tempSet) return false;
    return addSetToQueue(tempSet);
  };

  const addProductsToQueue = (products) => {
    const tempSets = products.map(wrapProductAsSet).filter(Boolean);
    return addMultipleSetsToQueue(tempSets);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Set-based operations (work with FittingSetObjects directly)
  // ────────────────────────────────────────────────────────────────────────────

  const addSetToQueue = (fittingSet) => {
    let wasAdded = false;
    setQueue(prev => {
      const emptySlotIndex = prev.findIndex(slot => slot.fittingSet === null);
      if (emptySlotIndex === -1) return prev;

      const newQueue = [...prev];
      newQueue[emptySlotIndex] = {
        ...newQueue[emptySlotIndex],
        fittingSet: fittingSet,
        isFavorite: false
      };
      wasAdded = true;
      return newQueue;
    });
    return wasAdded;
  };

  const addMultipleSetsToQueue = (fittingSets) => {
    let addedCount = 0;
    setQueue(prev => {
      const newQueue = [...prev];
      for (const set of fittingSets) {
        const emptySlotIndex = newQueue.findIndex(slot => slot.fittingSet === null);
        if (emptySlotIndex === -1) break;

        newQueue[emptySlotIndex] = {
          ...newQueue[emptySlotIndex],
          fittingSet: set,
          isFavorite: false
        };
        addedCount++;
      }
      return newQueue;
    });
    return addedCount;
  };

  const removeFromQueue = (slotIndex) => {
    const newQueue = [...queue];
    newQueue[slotIndex] = {
      slot: slotIndex + 1,
      fittingSet: null,  // Changed from product: null
      isFavorite: false
    };
    setQueue(newQueue);
  };

  const reorderQueue = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const newQueue = [...queue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);

    // Update slot numbers to maintain 1-7
    newQueue.forEach((item, index) => {
      item.slot = index + 1;
    });

    setQueue(newQueue);
  };

  const toggleFavorite = (slotIndex) => {
    const newQueue = [...queue];
    newQueue[slotIndex].isFavorite = !newQueue[slotIndex].isFavorite;
    setQueue(newQueue);
  };

  const sendChatMessage = useCallback(async (message) => {
    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsTyping(true);

    // Extract product selections from queue (supports sets and individuals)
    const productSelections = queue
      .filter(slot => slot.fittingSet !== null)
      .flatMap(slot => slot.fittingSet.productIds.map(id => ({ id })));

    try {
      const result = await getAIStylingAdvice(productSelections, {
        threadId: fittingThreadId,
        message,
      });

      setChatMessages(prev => [...prev, { role: 'ai', content: result.message }]);

      if (result.threadId) {
        setFittingThreadId(result.threadId);
      }

      // Transform and replace queue with backend sets if provided
      if (result.fittingSets && result.fittingSets.length > 0) {
        const transformedSets = transformFittingSets(result.fittingSets);
        setQueue(prev => {
          const newQueue = createEmptySlots(QUEUE_SIZE);
          transformedSets.slice(0, QUEUE_SIZE).forEach((set, index) => {
            newQueue[index] = {
              slot: index + 1,
              fittingSet: set,
              isFavorite: false
            };
          });
          return newQueue;
        });
      }
    } catch (err) {
      // Fallback to local mock
      const fallback = getRandomAIResponse();
      setChatMessages(prev => [...prev, { role: 'ai', content: fallback }]);
    } finally {
      setIsTyping(false);
    }
  }, [queue, fittingThreadId]);

  const generateLookbook = useCallback(async () => {
    // Extract product selections from queue (supports sets and individuals)
    const productSelections = queue
      .filter(slot => slot.fittingSet !== null)
      .map(slot => {
        const set = slot.fittingSet;
        if (set.isTemporary) {
          // Individual product - send as ProductSelected
          return { id: set.productIds[0] };
        } else {
          // Full set - send as ProductSelectedSet
          return {
            title: set.title,
            description: set.description,
            product_set: set.productIds.map(id => ({ id }))
          };
        }
      });

    if (productSelections.length === 0) return;

    setIsGenerating(true);
    setThinkingText('');

    // If user is authenticated, use streaming endpoint
    const token = consumerAuthService.getToken();
    if (token) {
      const abort = generateLookbookStream({
        productSelections,
        journeyId: journeyId,
        stylistThreadId: stylistThreadId,
        threadId: fittingThreadId,
        onThinking: (content) => {
          setThinkingText(prev => prev + content);
        },
        onComplete: (data) => {
          if (data.threadId) setFittingThreadId(data.threadId);

          // Transform and REPLACE queue with backend sets
          if (data.fittingSets) {
            const transformedSets = transformFittingSets(data.fittingSets);
            setQueue(prev => {
              const newQueue = createEmptySlots(QUEUE_SIZE);
              transformedSets.slice(0, QUEUE_SIZE).forEach((set, index) => {
                newQueue[index] = {
                  slot: index + 1,
                  fittingSet: set,
                  isFavorite: false
                };
              });
              return newQueue;
            });
          }

          if (data.message) {
            setChatMessages(prev => [...prev, { role: 'ai', content: data.message }]);
          }
          setIsGenerating(false);
          setThinkingText('');
          abortStreamRef.current = null;
        },
        onError: (msg) => {
          console.error('Stream error:', msg);
          // Fallback to mock
          const fallback = getRandomAIResponse();
          setChatMessages(prev => [...prev, { role: 'ai', content: fallback }]);
          setIsGenerating(false);
          setThinkingText('');
          abortStreamRef.current = null;
        },
      });
      abortStreamRef.current = abort;
      return;
    }

    // Fallback: sync endpoint (unauthenticated / no token)
    try {
      const result = await getAIStylingAdvice(productSelections, {
        threadId: fittingThreadId,
      });

      if (result.threadId) setFittingThreadId(result.threadId);

      // Transform and replace queue with backend sets
      if (result.fittingSets) {
        const transformedSets = transformFittingSets(result.fittingSets);
        setQueue(prev => {
          const newQueue = createEmptySlots(QUEUE_SIZE);
          transformedSets.slice(0, QUEUE_SIZE).forEach((set, index) => {
            newQueue[index] = {
              slot: index + 1,
              fittingSet: set,
              isFavorite: false
            };
          });
          return newQueue;
        });
      }

      return result;
    } finally {
      setIsGenerating(false);
    }
  }, [queue, fittingThreadId, journeyId, stylistThreadId]);

  const resetOutfit = () => {
    if (abortStreamRef.current) {
      abortStreamRef.current();
      abortStreamRef.current = null;
    }
    setQueue(createEmptySlots(QUEUE_SIZE));
    setFittingThreadId(null);
    setThinkingText('');
    setChatMessages([
      { role: 'ai', content: 'Outfit reset! Let\'s start fresh and create something amazing!' }
    ]);
  };

  const buyOutfit = () => {
    // Flatten all sets to individual product IDs
    const productIds = queue
      .filter(slot => slot.fittingSet !== null)
      .flatMap(slot => slot.fittingSet.productIds);

    console.log('Buy outfit - Product IDs:', productIds);
    alert(`Processing purchase for ${productIds.length} items!`);
  };

  const value = {
    queue,  // Now contains FittingSetObjects
    activeCategory,
    displayedProducts,
    chatMessages,
    isTyping,
    fittingThreadId,
    // REMOVED: fittingSets (queue is now single source of truth)
    isGenerating,
    thinkingText,
    journeyId,
    stylistThreadId,
    setJourneyId,
    setStylistThreadId,
    // Product-based operations (wrap as temporary sets)
    addProductToQueue,        // Renamed from addToQueue
    addProductsToQueue,       // Renamed from addMultipleToQueue
    // Set-based operations (work with FittingSetObjects directly)
    addSetToQueue,            // NEW
    addMultipleSetsToQueue,   // NEW
    removeFromQueue,
    reorderQueue,
    toggleFavorite,
    setActiveCategory,
    setDisplayedProducts,
    sendChatMessage,
    generateLookbook,
    resetOutfit,
    buyOutfit
  };

  return (
    <FittingRoomContext.Provider value={value}>
      {children}
    </FittingRoomContext.Provider>
  );
};
