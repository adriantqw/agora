import React, { createContext, useContext, useState } from 'react';

const FittingRoomContext = createContext();

export const useFittingRoom = () => {
  const context = useContext(FittingRoomContext);
  if (!context) {
    throw new Error('useFittingRoom must be used within a FittingRoomProvider');
  }
  return context;
};

export const FittingRoomProvider = ({ children }) => {
  // Initialize 5 empty slots
  const [queue, setQueue] = useState([
    { slot: 1, product: null, isFavorite: false },
    { slot: 2, product: null, isFavorite: false },
    { slot: 3, product: null, isFavorite: false },
    { slot: 4, product: null, isFavorite: false },
    { slot: 5, product: null, isFavorite: false },
  ]);

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
    // Find first empty slot
    const emptySlotIndex = queue.findIndex(slot => slot.product === null);
    if (emptySlotIndex !== -1) {
      const newQueue = [...queue];
      newQueue[emptySlotIndex] = {
        ...newQueue[emptySlotIndex],
        product: product,
        isFavorite: false
      };
      setQueue(newQueue);
      return true;
    }
    return false; // Queue is full
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
    setQueue([
      { slot: 1, product: null, isFavorite: false },
      { slot: 2, product: null, isFavorite: false },
      { slot: 3, product: null, isFavorite: false },
      { slot: 4, product: null, isFavorite: false },
      { slot: 5, product: null, isFavorite: false },
    ]);
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
