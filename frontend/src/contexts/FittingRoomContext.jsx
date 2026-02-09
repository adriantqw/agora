import React, { createContext, useContext, useState, useCallback } from 'react';
import { getAIStylingAdvice, getRandomAIResponse } from '../services/fittingRoomService';

const FittingRoomContext = createContext();

export const useFittingRoom = () => {
  const context = useContext(FittingRoomContext);
  if (!context) {
    throw new Error('useFittingRoom must be used within a FittingRoomProvider');
  }
  return context;
};

const QUEUE_SIZE = 7;

const createEmptySlots = (count) =>
  Array.from({ length: count }, (_, i) => ({ slot: i + 1, product: null, isFavorite: false }));

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
  const [fittingSets, setFittingSets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addToQueue = (product) => {
    let wasAdded = false;
    setQueue(prev => {
      const emptySlotIndex = prev.findIndex(slot => slot.product === null);
      if (emptySlotIndex === -1) return prev;
      const newQueue = [...prev];
      newQueue[emptySlotIndex] = {
        ...newQueue[emptySlotIndex],
        product: product,
        isFavorite: false
      };
      wasAdded = true;
      return newQueue;
    });
    return wasAdded;
  };

  const addMultipleToQueue = (products) => {
    let addedCount = 0;
    setQueue(prev => {
      const newQueue = [...prev];
      for (const product of products) {
        const emptySlotIndex = newQueue.findIndex(slot => slot.product === null);
        if (emptySlotIndex === -1) break;
        newQueue[emptySlotIndex] = {
          ...newQueue[emptySlotIndex],
          product: product,
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
      product: null,
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

    // Get current outfit items for context
    const outfitItems = queue.filter(s => s.product).map(s => s.product);

    try {
      const result = await getAIStylingAdvice(outfitItems, {
        threadId: fittingThreadId,
        message,
      });

      setChatMessages(prev => [...prev, { role: 'ai', content: result.message }]);

      if (result.threadId) {
        setFittingThreadId(result.threadId);
      }
      if (result.fittingSets && result.fittingSets.length > 0) {
        setFittingSets(result.fittingSets);
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
    const outfitItems = queue.filter(s => s.product).map(s => s.product);
    if (outfitItems.length === 0) return;

    setIsGenerating(true);
    try {
      const result = await getAIStylingAdvice(outfitItems, {
        threadId: fittingThreadId,
      });

      if (result.threadId) {
        setFittingThreadId(result.threadId);
      }
      if (result.fittingSets) {
        setFittingSets(result.fittingSets);
      }

      return result;
    } finally {
      setIsGenerating(false);
    }
  }, [queue, fittingThreadId]);

  const resetOutfit = () => {
    setQueue(createEmptySlots(QUEUE_SIZE));
    setFittingThreadId(null);
    setFittingSets([]);
    setChatMessages([
      { role: 'ai', content: 'Outfit reset! Let\'s start fresh and create something amazing!' }
    ]);
  };

  const buyOutfit = () => {
    const outfit = queue.filter(slot => slot.product !== null).map(slot => slot.product);
    console.log('Buy outfit:', outfit);
    alert(`Processing purchase for ${outfit.length} items!`);
  };

  const value = {
    queue,
    activeCategory,
    displayedProducts,
    chatMessages,
    isTyping,
    fittingThreadId,
    fittingSets,
    isGenerating,
    addToQueue,
    addMultipleToQueue,
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
