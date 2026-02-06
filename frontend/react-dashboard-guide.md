# Eggora Fashion Dashboard - React Development Guide

> A comprehensive guide for junior developers to build the "Find the Look" fashion shopping dashboard.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack Recommendations](#2-tech-stack-recommendations)
3. [Project Structure](#3-project-structure)
4. [Component Breakdown](#4-component-breakdown)
5. [Data Structure Design](#5-data-structure-design)
6. [Step-by-Step Implementation](#6-step-by-step-implementation)
7. [Key Features Explained](#7-key-features-explained)
8. [Common Pitfalls & Tips](#8-common-pitfalls--tips)

---

## 1. Project Overview

### What We're Building

A fashion discovery dashboard that helps users find complete outfits ("looks") for specific occasions. The app features:

- **Look Carousel**: Browse curated outfit combinations
- **Item Grid**: View individual items from each look
- **AI Assistant**: Chat-style fashion advice
- **Fitting Room Queue**: Save items to try on later
- **Product Detail Modal**: View item details and add to queue
- **Filter Sidebar**: Refine search by various criteria

### Key User Flows

1. User browses looks via carousel
2. Clicks a look to see its items
3. Clicks an item to view details
4. Adds items to fitting room queue
5. Gets AI-powered fashion advice

---

## 2. Tech Stack Recommendations

### Core Stack

```
- React 18+ (with TypeScript recommended)
- Tailwind CSS (for styling)
- React Router (for navigation)
- Lucide React (for icons)
```

### Optional but Helpful

```
- Zustand or Redux Toolkit (state management)
- Framer Motion (for smooth carousel animations)
- React Query (if fetching from API)
```

### Why These Choices?

| Technology | Purpose |
|------------|---------|
| Tailwind CSS | Rapid UI development, consistent styling |
| Lucide React | Clean, modern icons that match the design |
| Framer Motion | Smooth carousel transitions |
| Zustand | Simple state management for fitting room queue |

---

## 3. Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Top navigation bar
│   │   ├── Sidebar.tsx          # Filter sidebar
│   │   └── MainLayout.tsx       # Overall page layout
│   ├── looks/
│   │   ├── LookCarousel.tsx     # Main carousel container
│   │   ├── LookCard.tsx         # Individual look card
│   │   └── CarouselDots.tsx     # Pagination dots
│   ├── items/
│   │   ├── ItemGrid.tsx         # Items container
│   │   ├── ItemCard.tsx         # Individual item card
│   │   └── FitAllButton.tsx     # "Fit all" action button
│   ├── fitting-room/
│   │   ├── FittingRoomQueue.tsx # Right sidebar panel
│   │   └── QueueItem.tsx        # Item in queue
│   ├── chat/
│   │   ├── AIChatBubble.tsx     # Assistant message bubble
│   │   └── Avatar.tsx           # Pink blob avatar
│   └── modals/
│       └── ProductDetailModal.tsx # Full product view
├── hooks/
│   ├── useCarousel.ts           # Carousel logic
│   ├── useFittingRoom.ts        # Queue management
│   └── useProductSelection.ts   # Selected item state
├── store/
│   └── fittingRoomStore.ts      # Global state (Zustand)
├── types/
│   └── index.ts                 # TypeScript interfaces
├── data/
│   └── mockData.ts              # Sample data
├── utils/
│   └── formatters.ts            # Price formatting, etc.
└── App.tsx
```

---

## 4. Component Breakdown

### 4.1 Header Component

**Props Interface:**
```typescript
interface HeaderProps {
  logo: string;
  navItems: Array<{
    label: string;
    icon: React.ReactNode;
    href: string;
  }>;
}
```

**Key Elements:**
- Logo (left): Pink egg/blob icon + "Eggora" text
- Navigation (right): Journeys, My Inventory, Account with icons

**Implementation Notes:**
```tsx
// Use flexbox for layout
// Logo should be clickable (links to home)
// Navigation items should highlight on hover
```

---

### 4.2 LookCarousel Component

**Props Interface:**
```typescript
interface LookCarouselProps {
  looks: Look[];
  activeIndex: number;
  onSelectLook: (index: number) => void;
}

interface Look {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  items: Item[];
}
```

**Key Features:**
- Horizontal scrolling carousel
- Previous/Next navigation arrows
- Pagination dots (3 dots shown)
- Active look is centered and slightly larger
- Side looks are partially visible (peek effect)

**Implementation Strategy:**
```tsx
// Use state to track activeIndex
// Calculate transform/translateX based on activeIndex
// Show 3 cards: previous (partial), current (full), next (partial)
// Use CSS transform for smooth sliding
```

---

### 4.3 LookCard Component

**Props Interface:**
```typescript
interface LookCardProps {
  look: Look;
  isActive: boolean;
  onClick: () => void;
}
```

**Visual States:**
- **Active**: Full opacity, larger scale (1.0), white background
- **Inactive**: Lower opacity, smaller scale (0.9), grayed out

**Structure:**
```
┌─────────────────────────┐
│  Look X: Name           │  ← Title at top
│  ┌─────────────────┐    │
│  │                 │    │  ← Main outfit image
│  │    [Image]      │    │
│  │                 │    │
│  └─────────────────┘    │
│  Brand Name    $Price   │  ← Bottom info
└─────────────────────────┘
```

---

### 4.4 ItemGrid Component

**Props Interface:**
```typescript
interface ItemGridProps {
  items: Item[];
  onAddToQueue: (item: Item) => void;
  onItemClick: (item: Item) => void;
}

interface Item {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
}
```

**Layout:**
- White rounded container
- "Items" title (left) + "Fit all" button (right)
- Horizontal scrollable grid of ItemCards

---

### 4.5 ItemCard Component

**Visual Design:**
```
┌──────────────────┐
│  ┌────────────┐  │
│  │   [Img]    │  │  ← Square image
│  │            │  │
│  └────────────┘  │
│  +               │  ← Add button (top-right of image)
│  brand name      │
│  $price          │
└──────────────────┘
```

**Interactions:**
- Click image → Open ProductDetailModal
- Click "+" → Add to FittingRoomQueue

---

### 4.6 AIChatBubble Component

**Props Interface:**
```typescript
interface AIChatBubbleProps {
  message: string;
  avatarSrc: string;
}
```

**Design Notes:**
- Rounded white bubble with subtle shadow
- Pink blob avatar on left
- Message text inside bubble
- Positioned at bottom of main content area

---

### 4.7 FittingRoomQueue Component

**Props Interface:**
```typescript
interface FittingRoomQueueProps {
  items: Item[];
  onRemoveItem: (itemId: string) => void;
}
```

**Visual Design:**
- Purple/pink gradient background
- "Fitting Room Queue" title
- Empty state: Dashed border box with "+" icon
- Items appear as small cards when added

---

### 4.8 ProductDetailModal Component

**Props Interface:**
```typescript
interface ProductDetailModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToQueue: (item: Item) => void;
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│  ┌──────────┐  ┌─────────────────────┐  │
│  │ Thumb 1  │  │                     │  │
│  │ Thumb 2  │  │    Main Image       │  │
│  │ Thumb 3  │  │                     │  │
│  │ Thumb 4  │  │                     │  │
│  └──────────┘  └─────────────────────┘  │
│                Brand Name               │
│                PRODUCT NAME             │
│                $Price                   │
│                Colour: [swatch]         │
│                [Size Dropdown]          │
│                Description...           │
└─────────────────────────────────────────┘
```

---

## 5. Data Structure Design

### Main Types

```typescript
// types/index.ts

export interface Item {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: 'dress' | 'shoes' | 'bag' | 'accessories' | 'jewelry';
  color?: string;
  size?: string;
  description?: string;
  images?: string[]; // For product detail gallery
}

export interface Look {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string; // Main look image
  items: Item[]; // Items that make up this look
  occasion: string;
  style: string;
}

export interface AIRecommendation {
  lookId: string;
  message: string;
  reasoning: string;
}

export interface FittingRoomItem extends Item {
  addedAt: Date;
}
```

### Mock Data Structure

```typescript
// data/mockData.ts

export const mockLooks: Look[] = [
  {
    id: '1',
    name: 'Enchanted Garden',
    brand: 'H&M',
    price: 100,
    image: '/looks/look1.jpg',
    occasion: 'Wedding Guest',
    style: 'Romantic',
    items: [
      {
        id: 'item1',
        name: 'Sage Midi Dress',
        brand: 'belle and bloom',
        price: 100,
        image: '/items/dress1.jpg',
        category: 'dress',
        color: 'Sage',
        description: 'Linen fabric perfect for garden events'
      },
      // ... more items
    ]
  },
  {
    id: '2',
    name: 'Whimsical Light',
    brand: 'Belle & Blossom',
    price: 199,
    image: '/looks/look2.jpg',
    occasion: 'Wedding Guest',
    style: 'Elegant',
    items: [
      // ... items
    ]
  },
  // ... more looks
];

export const aiRecommendations: Record<string, AIRecommendation> = {
  '1': {
    lookId: '1',
    message: "I chose this Sage Midi because the linen fabric is perfect for a 1 PM garden start, and the block heel won't sink into the grass!",
    reasoning: 'Fabric and heel type for outdoor event'
  },
  '2': {
    lookId: '2',
    message: "This one's a bit more 'Modern Chic' than the last one. And it's a liiittle over your budget range. What do you think?",
    reasoning: 'Style comparison and budget consideration'
  }
};
```

---

## 6. Step-by-Step Implementation

### Step 1: Project Setup

```bash
# Create new React project with TypeScript
npx create-react-app eggora-dashboard --template typescript

# Or with Vite (recommended)
npm create vite@latest eggora-dashboard -- --template react-ts

# Install dependencies
cd eggora-dashboard
npm install

# Install additional packages
npm install lucide-react framer-motion tailwindcss
npm install -D @types/node

# Initialize Tailwind
npx tailwindcss init -p
```

### Step 2: Configure Tailwind

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors from the design
        'egg-pink': '#FFB6C1',
        'egg-purple': '#E6E6FA',
        'primary-purple': '#8B5CF6',
        'soft-pink': '#FFE4E9',
      },
      backgroundImage: {
        'gradient-fitting': 'linear-gradient(135deg, #E6E6FA 0%, #FFB6C1 100%)',
        'page-gradient': 'linear-gradient(180deg, #FFE4E9 0%, #FFF5F7 100%)',
      }
    },
  },
  plugins: [],
}
```

### Step 3: Build Layout Components

Start with the shell:

```tsx
// components/layout/MainLayout.tsx
import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { FittingRoomQueue } from '../fitting-room/FittingRoomQueue';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-page-gradient">
      <Header />
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 px-8 py-6">
          {children}
        </main>
        
        {/* Right Sidebar - Fitting Room */}
        <aside className="w-80">
          <FittingRoomQueue />
        </aside>
        
        {/* Far Right - Filters */}
        <Sidebar />
      </div>
    </div>
  );
};
```

### Step 4: Implement the Carousel

```tsx
// components/looks/LookCarousel.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LookCard } from './LookCard';
import { CarouselDots } from './CarouselDots';
import { Look } from '../../types';

interface LookCarouselProps {
  looks: Look[];
  onSelectLook: (look: Look) => void;
}

export const LookCarousel: React.FC<LookCarouselProps> = ({ 
  looks, 
  onSelectLook 
}) => {
  const [activeIndex, setActiveIndex] = useState(1); // Start with middle item

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < looks.length - 1 ? prev + 1 : prev));
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    onSelectLook(looks[index]);
  };

  return (
    <div className="relative w-full">
      {/* Navigation Arrows */}
      <button
        onClick={handlePrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
                   w-10 h-10 rounded-full bg-white shadow-md 
                   flex items-center justify-center
                   hover:bg-gray-50 transition-colors"
        disabled={activeIndex === 0}
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 
                   w-10 h-10 rounded-full bg-white shadow-md 
                   flex items-center justify-center
                   hover:bg-gray-50 transition-colors"
        disabled={activeIndex === looks.length - 1}
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>

      {/* Carousel Container */}
      <div className="overflow-hidden px-12">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ 
            transform: `translateX(calc(-${activeIndex * 100}% / 3 + 33.33%))` 
          }}
        >
          {looks.map((look, index) => (
            <div 
              key={look.id}
              className="w-1/3 flex-shrink-0 px-2"
            >
              <LookCard
                look={look}
                isActive={index === activeIndex}
                onClick={() => handleDotClick(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <CarouselDots 
        total={looks.length}
        active={activeIndex}
        onChange={handleDotClick}
      />
    </div>
  );
};
```

### Step 5: Create State Management

```tsx
// store/fittingRoomStore.ts
import { create } from 'zustand';
import { Item } from '../types';

interface FittingRoomState {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  clearAll: () => void;
  isInQueue: (itemId: string) => boolean;
}

export const useFittingRoomStore = create<FittingRoomState>((set, get) => ({
  items: [],
  
  addItem: (item) => {
    const { items } = get();
    if (!items.find((i) => i.id === item.id)) {
      set({ items: [...items, item] });
    }
  },
  
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId)
    }));
  },
  
  clearAll: () => set({ items: [] }),
  
  isInQueue: (itemId) => {
    return !!get().items.find((i) => i.id === itemId);
  }
}));
```

### Step 6: Build Main Page

```tsx
// pages/FindTheLookPage.tsx
import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { LookCarousel } from '../components/looks/LookCarousel';
import { ItemGrid } from '../components/items/ItemGrid';
import { AIChatBubble } from '../components/chat/AIChatBubble';
import { ProductDetailModal } from '../components/modals/ProductDetailModal';
import { mockLooks, aiRecommendations } from '../data/mockData';
import { Look, Item } from '../types';
import { useFittingRoomStore } from '../store/fittingRoomStore';

export const FindTheLookPage: React.FC = () => {
  const [selectedLook, setSelectedLook] = useState<Look>(mockLooks[1]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { addItem } = useFittingRoomStore();

  const handleSelectLook = (look: Look) => {
    setSelectedLook(look);
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddToQueue = (item: Item) => {
    addItem(item);
  };

  const currentRecommendation = aiRecommendations[selectedLook.id];

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <span className="font-medium">Journeys</span>
          <span className="mx-2">|</span>
          <span>Wedding Guest</span>
        </span>
      </nav>

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-purple-800 mb-8">
        Find the Look
      </h1>

      {/* Look Carousel */}
      <section className="mb-8">
        <LookCarousel 
          looks={mockLooks}
          onSelectLook={handleSelectLook}
        />
      </section>

      {/* Items Grid */}
      <section className="mb-8">
        <ItemGrid 
          items={selectedLook.items}
          onItemClick={handleItemClick}
          onAddToQueue={handleAddToQueue}
        />
      </section>

      {/* AI Chat Bubble */}
      <section className="mb-8">
        <AIChatBubble 
          message={currentRecommendation?.message || ''}
          avatarSrc="/avatars/ai-blob.png"
        />
      </section>

      {/* Refine Search Button */}
      <div className="flex justify-center items-center gap-3">
        <span className="text-gray-600 text-sm">
          Not quite right? Refine your search
        </span>
        <button className="w-10 h-10 rounded-full border-2 border-purple-400 
                          flex items-center justify-center
                          hover:bg-purple-50 transition-colors">
          <span className="text-purple-600">Q</span>
        </button>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToQueue={handleAddToQueue}
      />
    </MainLayout>
  );
};
```

---

## 7. Key Features Explained

### 7.1 Carousel Logic

The carousel shows 3 items at a time with the active one centered:

```
[Partial Previous] [Full Active] [Partial Next]
```

**Key Implementation Points:**

1. **Transform Calculation**: 
   - Each item takes 33.33% width
   - Translate by `-(activeIndex * 33.33%) + 33.33%` to center

2. **Visual States**:
   - Active: `scale(1)`, `opacity(1)`, white background
   - Inactive: `scale(0.9)`, `opacity(0.7)`, gray background

3. **Smooth Transitions**:
   - Use `transition-transform duration-500 ease-out`
   - Consider Framer Motion for more complex animations

### 7.2 Fitting Room Queue State

The fitting room needs to persist across the app:

```tsx
// Best practice: Use a global state manager
// Zustand is lightweight and perfect for this

// Adding items
const handleAddItem = (item: Item) => {
  // Check if already exists to prevent duplicates
  if (!isInQueue(item.id)) {
    addItem(item);
  }
};

// Visual feedback when added
// Show toast notification or animate the queue
```

### 7.3 Modal Implementation

For the product detail modal:

```tsx
// Key considerations:
// 1. Portal the modal to body (prevents z-index issues)
// 2. Lock body scroll when open
// 3. Close on escape key
// 4. Close on backdrop click

useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
  
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => {
    document.removeEventListener('keydown', handleEscape);
    document.body.style.overflow = 'unset';
  };
}, [isOpen, onClose]);
```

### 7.4 Responsive Considerations

```css
/* Mobile adjustments */
@media (max-width: 768px) {
  /* Stack layout vertically */
  /* Hide sidebar */
  /* Show single carousel item */
  /* Full-width cards */
}
```

---

## 8. Common Pitfalls & Tips

### Pitfall 1: Carousel State Management

❌ **Don't**: Store carousel position as pixel values
```tsx
// Bad - hard to maintain
const [offset, setOffset] = useState(0);
```

✅ **Do**: Store as index and calculate transform
```tsx
// Good - clean and predictable
const [activeIndex, setActiveIndex] = useState(0);
const offset = -(activeIndex * 100) / 3 + 33.33;
```

### Pitfall 2: Image Loading

❌ **Don't**: Assume images load instantly
```tsx
// Bad - layout shift when images load
<img src={look.image} />
```

✅ **Do**: Use aspect ratios and placeholders
```tsx
// Good - consistent layout
<div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
  <img 
    src={look.image} 
    className="w-full h-full object-cover"
    loading="lazy"
  />
</div>
```

### Pitfall 3: Modal Accessibility

❌ **Don't**: Forget keyboard navigation
```tsx
// Bad - mouse only
<div onClick={onClose}>...</div>
```

✅ **Do**: Support keyboard and screen readers
```tsx
// Good - accessible
<div 
  role="dialog"
  aria-modal="true"
  onClick={onBackdropClick}
>
  <button 
    onClick={onClose}
    aria-label="Close modal"
  >
    ×
  </button>
</div>
```

### Pitfall 4: State Synchronization

❌ **Don't**: Duplicate state in multiple places
```tsx
// Bad - look items and selected items out of sync
const [items, setItems] = useState(look.items);
```

✅ **Do**: Derive from props or use single source of truth
```tsx
// Good - always in sync
const items = selectedLook.items;
```

---

## Quick Reference: Component Checklist

| Component | Key Props | Key Features |
|-----------|-----------|--------------|
| Header | `navItems` | Logo, navigation, responsive |
| LookCarousel | `looks`, `onSelectLook` | Transform-based, 3 visible |
| LookCard | `look`, `isActive` | Scale/opacity transitions |
| ItemGrid | `items`, `onItemClick` | Horizontal scroll |
| ItemCard | `item`, `onAddToQueue` | Image, info, add button |
| AIChatBubble | `message` | Avatar, styled bubble |
| FittingRoomQueue | `items` | Gradient bg, empty state |
| ProductDetailModal | `item`, `isOpen` | Gallery, info, overlay |

---

## Next Steps

1. **Set up the project** with recommended tech stack
2. **Create the type definitions** first (guides everything else)
3. **Build layout components** (Header, MainLayout)
4. **Implement the carousel** (most complex component)
5. **Add item grid** and interactivity
6. **Connect fitting room** state management
7. **Add polish** - animations, transitions, loading states
8. **Test thoroughly** - especially carousel edge cases

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [Framer Motion Carousel Examples](https://www.framer.com/motion/)

---

*Happy coding! Remember: Start simple, build incrementally, and test often.*
