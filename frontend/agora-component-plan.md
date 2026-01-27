# React Component Architecture Plan for Agora Fashion App

## Overview

This document outlines the component architecture for a 3-page fashion shopping/styling application:

1. **Home/Browse Page** - Recommendations and event-based browsing
2. **Quiz/Search Flow Page** - Guided search with preference selection
3. **Results/Fitting Room Page** - Product browsing with virtual try-on

---

## 🗂️ Folder Structure

```
src/
├── components/
│   ├── common/                    # Shared across all pages
│   │   ├── Header/
│   │   │   ├── Header.jsx
│   │   │   ├── Header.css
│   │   │   └── index.js
│   │   ├── SearchBar/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── SearchBar.css
│   │   │   └── index.js
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.css
│   │   │   └── index.js
│   │   ├── Card/
│   │   │   ├── Card.jsx
│   │   │   ├── Card.css
│   │   │   └── index.js
│   │   ├── Tag/
│   │   │   ├── Tag.jsx
│   │   │   ├── Tag.css
│   │   │   └── index.js
│   │   ├── Mascot/
│   │   │   ├── Mascot.jsx
│   │   │   ├── Mascot.css
│   │   │   └── index.js
│   │   └── Icons/
│   │       └── index.js
│   │
│   ├── home/                      # Page 1 components
│   │   ├── EventDatePicker/
│   │   │   ├── EventDatePicker.jsx
│   │   │   ├── EventDatePicker.css
│   │   │   └── index.js
│   │   ├── RecommendationSection/
│   │   │   ├── RecommendationSection.jsx
│   │   │   ├── RecommendationSection.css
│   │   │   └── index.js
│   │   └── RecommendationCard/
│   │       ├── RecommendationCard.jsx
│   │       ├── RecommendationCard.css
│   │       └── index.js
│   │
│   ├── quiz/                      # Page 2 components
│   │   ├── QuizProgress/
│   │   │   ├── QuizProgress.jsx
│   │   │   ├── QuizProgress.css
│   │   │   └── index.js
│   │   ├── QuizQuestion/
│   │   │   ├── QuizQuestion.jsx
│   │   │   ├── QuizQuestion.css
│   │   │   └── index.js
│   │   ├── OptionButton/
│   │   │   ├── OptionButton.jsx
│   │   │   ├── OptionButton.css
│   │   │   └── index.js
│   │   ├── SearchSummaryPanel/
│   │   │   ├── SearchSummaryPanel.jsx
│   │   │   ├── SearchSummaryPanel.css
│   │   │   └── index.js
│   │   └── FilterTag/
│   │       ├── FilterTag.jsx
│   │       ├── FilterTag.css
│   │       └── index.js
│   │
│   └── fitting-room/              # Page 3 components
│       ├── CategoryTabs/
│       │   ├── CategoryTabs.jsx
│       │   ├── CategoryTabs.css
│       │   └── index.js
│       ├── ProductGrid/
│       │   ├── ProductGrid.jsx
│       │   ├── ProductGrid.css
│       │   └── index.js
│       ├── ProductCard/
│       │   ├── ProductCard.jsx
│       │   ├── ProductCard.css
│       │   └── index.js
│       ├── TryOnQueue/
│       │   ├── TryOnQueue.jsx
│       │   ├── TryOnQueue.css
│       │   └── index.js
│       ├── TryOnSlot/
│       │   ├── TryOnSlot.jsx
│       │   ├── TryOnSlot.css
│       │   └── index.js
│       ├── FittingRoomPanel/
│       │   ├── FittingRoomPanel.jsx
│       │   ├── FittingRoomPanel.css
│       │   └── index.js
│       ├── VirtualModel/
│       │   ├── VirtualModel.jsx
│       │   ├── VirtualModel.css
│       │   └── index.js
│       └── AIChat/
│           ├── AIChat.jsx
│           ├── AIChat.css
│           └── index.js
│
├── pages/
│   ├── HomePage.jsx
│   ├── QuizPage.jsx
│   └── FittingRoomPage.jsx
│
├── layouts/
│   └── MainLayout.jsx             # Wraps all pages with Header + Mascot
│
├── hooks/
│   ├── useSearch.js
│   ├── useQuiz.js
│   ├── useTryOn.js
│   └── usePreferences.js
│
├── context/
│   ├── SearchContext.jsx
│   ├── UserPreferencesContext.jsx
│   └── CartContext.jsx
│
├── styles/
│   ├── variables.css              # CSS custom properties / design tokens
│   ├── global.css                 # Global styles and resets
│   └── animations.css             # Shared animations
│
├── data/
│   ├── quizQuestions.js
│   └── mockProducts.js
│
└── utils/
    ├── formatPrice.js
    └── filterProducts.js
```

---

## 📦 Component Specifications

### Common Components

#### Header
```jsx
// Props
{
  variant: 'full' | 'compact',  // 'full' shows nav links, 'compact' just logo + icons
  showNav: boolean,
  onQuizClick: () => void
}

// Nav items: Wardrobe, Kitchen, Office, Bedroom
// Right side: "Take the quiz" link, calendar icon, user icon
```

#### SearchBar
```jsx
// Props
{
  value: string,
  onChange: (value: string) => void,
  onSearch: () => void,
  placeholder: string,
  showMenuButton: boolean,
  showJustBrowsing: boolean
}

// Features: 
// - Rounded pill shape
// - Hamburger menu button inside
// - Pink search button with magnifying glass
// - "just browsing" link below (optional)
```

#### Button
```jsx
// Props
{
  variant: 'primary' | 'secondary' | 'outline' | 'ghost',
  size: 'sm' | 'md' | 'lg',
  children: ReactNode,
  onClick: () => void,
  disabled: boolean,
  fullWidth: boolean
}

// Primary: Pink background, white text
// Secondary: White background, pink text/border
// Outline: Transparent, pink border
```

#### Tag
```jsx
// Props
{
  label: string,
  selected: boolean,
  onClick: () => void,
  removable: boolean,
  onRemove: () => void,
  size: 'sm' | 'md'
}

// Pill-shaped, pink when selected, white/outline when not
```

#### Card
```jsx
// Props
{
  children: ReactNode,
  hoverable: boolean,
  onClick: () => void,
  padding: 'none' | 'sm' | 'md' | 'lg'
}

// Base card wrapper with shadow and border-radius
```

#### Mascot
```jsx
// Props
{
  message: string,           // Text shown in speech bubble (optional)
  isSearching: boolean,      // Shows "Searching the racks..." animation
  position: 'bottom-right' | 'inline'
}

// Animated egg character with pink cap
// Bounces/wobbles when searching
```

---

### Page 1: Home Page Components

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                      │
├─────────────────────────────────────────────────────────────┤
│  SearchBar                                                   │
├─────────────────────────────────────────────────────────────┤
│  EventDatePicker                                             │
├─────────────────────────────────────────────────────────────┤
│  RecommendationSection (Valentines Day Date)                 │
│    └── RecommendationCard (x4)                               │
├─────────────────────────────────────────────────────────────┤
│  RecommendationSection (Room Decorating Project)             │
│    └── RecommendationCard (x4)                               │
├─────────────────────────────────────────────────────────────┤
│                                          Mascot (floating)   │
└─────────────────────────────────────────────────────────────┘
```

#### EventDatePicker
```jsx
// Props
{
  selectedDate: Date | null,
  eventName: string,
  onDateChange: (date: Date) => void,
  onEventNameChange: (name: string) => void
}

// Displays: Calendar icon + underlined event name (e.g., "xxx")
// Clicking opens date picker modal
```

#### RecommendationSection
```jsx
// Props
{
  title: string,              // e.g., "Valentines Day Date"
  eventLink: string,          // Link destination
  recommendations: Array<{
    id: string,
    style: string,            // "Casual", "Chill", "Fancy", "Bold"
    tags: string[]            // ["Date Night", "Date Night"]
  }>,
  onSeeMore: () => void
}

// Section with title link and horizontal scrolling cards
```

#### RecommendationCard
```jsx
// Props
{
  style: string,
  tags: string[],
  imageUrl: string | null,    // null shows grey placeholder
  onClick: () => void
}

// Grey placeholder box with style name and tag list below
```

---

### Page 2: Quiz Page Components

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                      │
├─────────────────────────────────────────────────────────────┤
│  SearchBar (with user query)                                 │
├──────────────────────────┬──────────────────────────────────┤
│  QuizContainer           │  SearchSummaryPanel               │
│  ├── BackButton          │  ├── Date/Time Tags               │
│  ├── QuizProgress        │  ├── Style Tags                   │
│  ├── QuizQuestion #1     │  ├── Preferences Checkbox         │
│  │   └── OptionButton x3 │  ├── Price Tag                    │
│  └── QuizQuestion #2     │  └── Add-ons Tags                 │
│      └── OptionButton x2 │                                   │
├──────────────────────────┴──────────────────────────────────┤
│                                          Mascot (floating)   │
└─────────────────────────────────────────────────────────────┘
```

#### QuizProgress
```jsx
// Props
{
  totalSteps: number,         // e.g., 3
  currentStep: number,        // e.g., 1
  onStepClick: (step: number) => void
}

// Three dots, filled for current/completed steps
```

#### QuizQuestion
```jsx
// Props
{
  questionNumber: number,
  questionText: string,
  subtitle: string,           // e.g., "(select all that apply)"
  children: ReactNode         // OptionButton components
}

// Numbered question card with options inside
```

#### OptionButton
```jsx
// Props
{
  label: string,
  selected: boolean,
  onClick: () => void,
  disabled: boolean
}

// Toggle button - pink when selected, white outline when not
// Examples: "Evening", "Day time", "Morning"
```

#### SearchSummaryPanel
```jsx
// Props
{
  title: string,              // "So far, this is what I'm searching for!"
  filters: {
    dateTime: string[],
    style: string[],
    existingPreferences: {
      enabled: boolean,
      link: string,
      values: string[]
    },
    price: string,
    addOns: string[]
  }
}

// Right-side panel showing all selected search criteria
// Groups filters by category with pink tags
```

#### FilterTag
```jsx
// Extends Tag component
// Props
{
  label: string,
  category: 'dateTime' | 'style' | 'price' | 'addOn',
  onRemove: () => void
}
```

---

### Page 3: Fitting Room Page Components

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Header (compact)                                            │
├─────────────────────────────────────────────────────────────┤
│  CategoryTabs                                                │
├──────────────────┬─────────────┬────────────────────────────┤
│  ProductGrid     │ TryOnQueue  │  FittingRoomPanel           │
│  ├── ProductCard │ ├── Slot 1  │  ├── ResetButton            │
│  ├── ProductCard │ ├── Slot 2  │  ├── BuyButton              │
│  ├── ProductCard │ ├── Slot 3  │  ├── VirtualModel           │
│  ├── ProductCard │ ├── Slot 4  │  └── AIChat                 │
│  └── ProductCard │ └── Slot 5  │      ├── BotMessage         │
│                  │             │      └── UserInput          │
├──────────────────┴─────────────┴────────────────────────────┤
│         UpdateSearchButton                   Mascot          │
└─────────────────────────────────────────────────────────────┘
```

#### CategoryTabs
```jsx
// Props
{
  categories: Array<{
    id: string,
    label: string,
    icon: ReactNode
  }>,
  activeCategory: string,
  onCategoryChange: (id: string) => void
}

// Tabs: Current (pink), Outfits, Tops, Bottoms, Accessories
// Each tab has an icon
```

#### ProductGrid
```jsx
// Props
{
  products: Product[],
  columns: number,            // default 3
  onProductClick: (product: Product) => void,
  onAddToQueue: (product: Product) => void,
  onToggleFavorite: (product: Product) => void,
  onRemove: (product: Product) => void
}

// CSS Grid layout for product cards
```

#### ProductCard
```jsx
// Props
{
  product: {
    id: string,
    name: string,
    brand: string,
    price: number,
    size: string,
    imageUrl: string,
    category: 'dress' | 'top' | 'bottom' | 'accessory' | 'shoes'
  },
  showActions: boolean,
  onAddToQueue: () => void,
  onToggleFavorite: () => void,
  onRemove: () => void
}

// Card with image, product info, and action icons (heart, trash)
// Category icon in top-left corner
```

#### TryOnQueue
```jsx
// Props
{
  slots: Array<{
    id: string,
    product: Product | null,
    position: number
  }>,
  maxSlots: number,           // default 5
  onReorder: (fromIndex: number, toIndex: number) => void,
  onRemove: (slotId: string) => void,
  onToggleFavorite: (slotId: string) => void
}

// Vertical list of 5 slots for building an outfit
```

#### TryOnSlot
```jsx
// Props
{
  product: Product | null,
  position: number,
  onMoveUp: () => void,
  onMoveDown: () => void,
  onToggleFavorite: () => void,
  onRemove: () => void
}

// Individual slot with product thumbnail and controls
// Shows reorder arrows, heart, and trash icons
```

#### FittingRoomPanel
```jsx
// Props
{
  outfit: Product[],
  onReset: () => void,
  onBuyOutfit: () => void,
  modelImage: string
}

// Container for the virtual try-on experience
// Pink/coral gradient background with arch frame
```

#### VirtualModel
```jsx
// Props
{
  baseModelImage: string,
  outfit: Array<{
    product: Product,
    layerPosition: number
  }>,
  onLoad: () => void
}

// Displays model wearing selected outfit items
// Handles layering of clothing items
```

#### AIChat
```jsx
// Props
{
  messages: Array<{
    role: 'assistant' | 'user',
    content: string
  }>,
  onSendMessage: (message: string) => void,
  isTyping: boolean
}

// Chat interface for AI styling feedback
// Pink bubble for AI messages
// Input field for user responses
```

---

## 🔄 State Management

### UserPreferencesContext
```javascript
const UserPreferencesContext = createContext({
  // User's saved preferences
  favoriteColor: "green",
  weddingPreferences: {
    color: "green",
    length: "tea-length",
    neckline: "sweet-heart"
  },
  savedEvents: [
    { id: "1", name: "Valentines Day Date", date: "2024-02-14" },
    { id: "2", name: "Room Decorating Project", date: null }
  ],
  size: {
    dress: "M / 10",
    shoes: "7 / 38",
    top: "M",
    bottom: "10"
  },
  
  // Actions
  updatePreference: (key, value) => {},
  saveEvent: (event) => {},
  removeEvent: (eventId) => {}
});
```

### SearchContext
```javascript
const SearchContext = createContext({
  // Search state
  query: "",
  filters: {
    dateTime: [],           // ["June 16", "Evening", "Day time"]
    style: [],              // ["Wedding guest", "Floral patterns"]
    price: null,            // "Under $300"
    addOns: []              // ["Jacket", "Shoes", "Accessories"]
  },
  useExistingPreferences: false,
  
  // Quiz state
  currentStep: 1,
  answers: {},
  
  // Actions
  setQuery: (query) => {},
  updateFilter: (category, values) => {},
  togglePreferences: () => {},
  nextStep: () => {},
  previousStep: () => {},
  resetSearch: () => {}
});
```

### FittingRoomContext
```javascript
const FittingRoomContext = createContext({
  // Try-on queue (5 slots)
  queue: [
    { slot: 1, product: null },
    { slot: 2, product: null },
    { slot: 3, product: null },
    { slot: 4, product: null },
    { slot: 5, product: null }
  ],
  
  // Currently displayed outfit on model
  activeOutfit: [],
  
  // AI conversation
  chatMessages: [
    {
      role: "assistant",
      content: "This outfit compliments your skintone! The flowy fabric is perfect for the day time ceremony, paired with the formal jacket at night and you won't get cold in the outdoor venue."
    }
  ],
  
  // Actions
  addToQueue: (product, slot) => {},
  removeFromQueue: (slot) => {},
  reorderQueue: (fromSlot, toSlot) => {},
  toggleFavorite: (slot) => {},
  sendChatMessage: (message) => {},
  resetOutfit: () => {},
  buyOutfit: () => {}
});
```

---

## 🎨 Design Tokens

### CSS Variables (variables.css)
```css
:root {
  /* Colors */
  --color-primary: #F5A5B8;
  --color-primary-dark: #E8879C;
  --color-primary-light: #FDD5DD;
  --color-secondary: #FFB6C1;
  
  --color-background: #FFFFFF;
  --color-surface: #F9F9F9;
  --color-surface-elevated: #FFFFFF;
  
  --color-text-primary: #333333;
  --color-text-secondary: #666666;
  --color-text-muted: #888888;
  --color-text-on-primary: #FFFFFF;
  
  --color-border: #EEEEEE;
  --color-border-light: #F5F5F5;
  
  --color-success: #4CAF50;
  --color-error: #F44336;
  
  /* Gradients */
  --gradient-fitting-room: linear-gradient(180deg, #FFB6C1 0%, #FFA07A 100%);
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-md: 1rem;       /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Spacing */
  --spacing-xs: 0.25rem;      /* 4px */
  --spacing-sm: 0.5rem;       /* 8px */
  --spacing-md: 1rem;         /* 16px */
  --spacing-lg: 1.5rem;       /* 24px */
  --spacing-xl: 2rem;         /* 32px */
  --spacing-2xl: 3rem;        /* 48px */
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 50px;
  --radius-circle: 50%;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
  
  /* Z-index layers */
  --z-dropdown: 100;
  --z-modal: 200;
  --z-mascot: 50;
  --z-tooltip: 300;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

### Layout Adjustments
- **Mobile (< 768px)**: Single column, stacked layout
- **Tablet (768px - 1024px)**: Two column on fitting room page
- **Desktop (> 1024px)**: Full three-column layout on fitting room page

---

## 📋 Implementation Phases

### Phase 1: Foundation (2 days)
- [ ] Set up project with Vite + React
- [ ] Configure CSS variables and global styles
- [ ] Create common components: Button, Tag, Card
- [ ] Create Header component with navigation
- [ ] Create SearchBar component
- [ ] Create Mascot component with basic animation

### Phase 2: Home Page (1 day)
- [ ] Create EventDatePicker component
- [ ] Create RecommendationSection component
- [ ] Create RecommendationCard component
- [ ] Assemble HomePage with mock data
- [ ] Add routing setup (React Router)

### Phase 3: Quiz Page (2 days)
- [ ] Create QuizProgress component
- [ ] Create QuizQuestion component
- [ ] Create OptionButton component
- [ ] Create SearchSummaryPanel component
- [ ] Create SearchContext for state management
- [ ] Assemble QuizPage with quiz flow logic

### Phase 4: Fitting Room - Products (2 days)
- [ ] Create CategoryTabs component
- [ ] Create ProductCard component
- [ ] Create ProductGrid component
- [ ] Create TryOnQueue component
- [ ] Create TryOnSlot component
- [ ] Create FittingRoomContext

### Phase 5: Fitting Room - Virtual Try-On (2 days)
- [ ] Create FittingRoomPanel component
- [ ] Create VirtualModel component
- [ ] Create AIChat component
- [ ] Integrate outfit building logic
- [ ] Add drag-and-drop for queue reordering

### Phase 6: Polish & Integration (1 day)
- [ ] Add page transitions and animations
- [ ] Mascot state integration (searching animation)
- [ ] Responsive design adjustments
- [ ] Error states and loading states
- [ ] Final testing and bug fixes

---

## 🧪 Mock Data Structure

### Products (mockProducts.js)
```javascript
export const mockProducts = [
  {
    id: "1",
    name: "Green Floral Midi Dress",
    brand: "Blossom & Bloom",
    price: 99,
    size: "M / 10",
    imageUrl: "/images/products/green-floral-dress.jpg",
    category: "dress",
    tags: ["floral", "midi", "wedding-guest"],
    colors: ["green"]
  },
  {
    id: "2",
    name: "Beige Blazer",
    brand: "Chic Threads",
    price: 80,
    size: "M / 10",
    imageUrl: "/images/products/beige-blazer.jpg",
    category: "top",
    tags: ["formal", "layering"],
    colors: ["beige", "cream"]
  },
  // ... more products
];
```

### Quiz Questions (quizQuestions.js)
```javascript
export const quizQuestions = [
  {
    id: 1,
    question: "What time and date is the garden wedding?",
    subtitle: "(select all that apply)",
    options: [
      { id: "evening", label: "Evening" },
      { id: "daytime", label: "Day time" },
      { id: "morning", label: "Morning" }
    ],
    multiSelect: true
  },
  {
    id: 2,
    question: "Would you like to use your existing wedding preferences as inspiration for this look?",
    options: [
      { id: "existing", label: "Existing Preferences" },
      { id: "new", label: "New Look" }
    ],
    multiSelect: false
  },
  // ... more questions
];
```

---

## 🚀 Getting Started

```bash
# Create new Vite React project
npm create vite@latest agora-fashion -- --template react

# Install dependencies
cd agora-fashion
npm install react-router-dom

# Start development server
npm run dev
```

---

## Notes for Development

1. **Component Isolation**: Build and test each component in isolation before integrating
2. **Mobile-First**: Start with mobile styles, then add breakpoints for larger screens
3. **Accessibility**: Ensure all interactive elements are keyboard accessible
4. **Performance**: Lazy load page components and optimize images
5. **Testing**: Add unit tests for utility functions and integration tests for user flows
