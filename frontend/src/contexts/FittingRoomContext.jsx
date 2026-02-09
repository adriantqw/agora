import React, { createContext, useContext, useState } from 'react';

const FittingRoomContext = createContext();

export const useFittingRoom = () => {
  const context = useContext(FittingRoomContext);
  if (!context) {
    throw new Error('useFittingRoom must be used within a FittingRoomProvider');
  }
  return context;
};

const QUEUE_SIZE = 10;

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

  // Mock AI responses
  const mockAIResponses = [
    "Great choice! This outfit works well together.",
    "I love the color combination!",
    "Have you considered adding a jacket?",
    "This would be perfect for a garden wedding!",
    "That top pairs beautifully with those bottoms!",
    "Adding accessories would complete this look nicely.",
    "Very elegant! This outfit has a sophisticated vibe.",
    "Bold choice! I like your style.",
    "This combination is very trendy right now!",
    "Perfect for a casual day out!"
  ];

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

    // Update slot numbers to maintain 1-5
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

  const sendChatMessage = (message) => {
    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
      setChatMessages(prev => [...prev, { role: 'ai', content: randomResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const resetOutfit = () => {
    setQueue(createEmptySlots(QUEUE_SIZE));
    setChatMessages([
      { role: 'ai', content: 'Outfit reset! Let\'s start fresh and create something amazing!' }
    ]);
  };

  const buyOutfit = () => {
    const outfit = queue.filter(slot => slot.product !== null).map(slot => slot.product);
    console.log('Buy outfit:', outfit);
    alert(`Processing purchase for ${outfit.length} items!`);
    // Future: Navigate to checkout with outfit items
  };

  const value = {
    queue,
    activeCategory,
    displayedProducts,
    chatMessages,
    isTyping,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    toggleFavorite,
    setActiveCategory,
    setDisplayedProducts,
    sendChatMessage,
    resetOutfit,
    buyOutfit
  };

  return (
    <FittingRoomContext.Provider value={value}>
      {children}
    </FittingRoomContext.Provider>
  );
};
