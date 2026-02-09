# Eggora Fashion Dashboard - Junior Developer Guide

> A comprehensive, beginner-friendly guide for building the "Find the Look" fashion shopping dashboard. This version includes extra explanations, examples, and step-by-step instructions.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack Recommendations](#2-tech-stack-recommendations)
3. [Project Structure](#3-project-structure)
4. [Understanding React Fundamentals](#4-understanding-react-fundamentals)
5. [Component Breakdown](#5-component-breakdown)
6. [Data Structure Design](#6-data-structure-design)
7. [Step-by-Step Implementation](#7-step-by-step-implementation)
8. [Key Features Explained](#8-key-features-explained)
9. [Common Pitfalls & Tips](#9-common-pitfalls--tips)
10. [Testing & Debugging](#10-testing--debugging)
11. [Resources & Learning Materials](#11-resources--learning-materials)

---

## 1. Project Overview

### What We're Building

A fashion discovery dashboard that helps users find complete outfits ("looks") for specific occasions. Think of it as a personal stylist in app form!

**Key Features:**
- **Look Carousel**: Swipe through curated outfit combinations (like Instagram Stories)
- **Item Grid**: See individual items from each outfit (dress, shoes, bag, etc.)
- **AI Assistant**: Get fashion advice in a chat-style interface
- **Fitting Room Queue**: Save items you want to try on later (like a shopping cart)
- **Product Detail Modal**: View detailed information about any item
- **Filter Sidebar**: Narrow down your search by price, style, color, etc.

### Key User Flows

Let's walk through how a user interacts with the app:

1. **Browse Phase**: User swipes through looks via the carousel
2. **Explore Phase**: User clicks a look to see its individual items
3. **Detail Phase**: User clicks an item to view full details (size, color, price)
4. **Collection Phase**: User adds items to fitting room queue
5. **Advice Phase**: User asks AI for fashion advice

**Example User Journey:**
```
User lands on page
  ↓
Sees "Wedding Guest" looks
  ↓
Swipes to "Enchanted Garden" look
  ↓
Clicks on the sage dress
  ↓
Views details (size, price, materials)
  ↓
Adds to fitting room queue
  ↓
AI suggests matching accessories
```

### Why This Project is Great for Learning

- **Real-world patterns**: Carousel, modals, state management
- **Modern React**: Hooks, context, functional components
- **UI/UX skills**: Animations, responsive design, accessibility
- **Data flow**: Props, state, lifting state up
- **API integration**: (Optional) Connect to real backend later

---

## 2. Tech Stack Recommendations

### Core Stack (Required)

```
- React 18+ (with TypeScript recommended)
- Tailwind CSS (for styling)
- React Router (for navigation)
- Lucide React (for icons)
```

#### Why These Technologies?

**React 18+**
- Industry standard for building user interfaces
- Large community = lots of learning resources
- Component-based = reusable, maintainable code
- Virtual DOM = fast updates

**TypeScript** (Recommended but Optional)
- Catches errors before runtime
- Better autocomplete in your code editor
- Self-documenting code (types show what data looks like)
- If you're new: Start with JavaScript, add TypeScript later

**Tailwind CSS**
- Write styles directly in HTML/JSX (no separate CSS files)
- Pre-built utility classes (like `bg-blue-500`, `rounded-lg`)
- Faster development once you learn the class names
- Consistent design system built-in

**React Router**
- Handles navigation between pages
- Browser back/forward button support
- URL-based routing (e.g., `/products/123`)

**Lucide React**
- Beautiful, consistent icon set
- Tree-shakable (only includes icons you use)
- Easy to customize size and color

### Optional but Helpful

```
- Zustand or Redux Toolkit (state management)
- Framer Motion (for smooth animations)
- React Query (if fetching from API)
```

#### When Do You Need These?

**Zustand/Redux Toolkit** (State Management)
- **Use when**: You have data that multiple components need to access (like fitting room queue)
- **Don't use when**: You can just pass props or use React Context
- **Beginner tip**: Start with React's built-in `useState` and `Context`. Add these only when passing props gets messy.

**Framer Motion** (Animations)
- **Use when**: You want smooth, professional animations
- **Don't use when**: Basic CSS transitions are enough
- **Beginner tip**: Build the app first without animations. Add them at the end as polish.

**React Query** (API Data Fetching)
- **Use when**: You're fetching data from an API and need caching/retries
- **Don't use when**: You're using mock data or simple fetch calls
- **Beginner tip**: Start with basic `fetch()` and `useEffect()`. Switch to React Query when you need advanced features.

### Technology Comparison Table

| Technology | Purpose | Learning Curve | When to Use |
|------------|---------|----------------|-------------|
| Tailwind CSS | Rapid UI development, consistent styling | Medium | Always (speeds up styling) |
| Lucide React | Clean, modern icons | Easy | Always (free, lightweight) |
| Framer Motion | Smooth carousel transitions | Medium | When basic CSS animations aren't enough |
| Zustand | Simple state management | Easy | When props become messy |
| Redux Toolkit | Complex state management | Hard | Large apps with complex state |

---

## 3. Project Structure

Here's how to organize your files:

```
src/
├── components/              # All React components
│   ├── layout/             # Page layout components
│   │   ├── Header.tsx           # Top navigation bar
│   │   ├── Sidebar.tsx          # Filter sidebar
│   │   └── MainLayout.tsx       # Overall page structure
│   ├── looks/              # Carousel-related components
│   │   ├── LookCarousel.tsx     # Main carousel container
│   │   ├── LookCard.tsx         # Individual look card
│   │   └── CarouselDots.tsx     # Pagination dots below carousel
│   ├── items/              # Product item components
│   │   ├── ItemGrid.tsx         # Container for item cards
│   │   ├── ItemCard.tsx         # Individual product card
│   │   └── FitAllButton.tsx     # "Add all to queue" button
│   ├── fitting-room/       # Fitting room sidebar
│   │   ├── FittingRoomQueue.tsx # Right sidebar panel
│   │   └── QueueItem.tsx        # Individual item in queue
│   ├── chat/               # AI chat components
│   │   ├── AIChatBubble.tsx     # AI message bubble
│   │   └── Avatar.tsx           # Pink mascot avatar
│   └── modals/             # Popup windows
│       └── ProductDetailModal.tsx # Full product detail view
├── hooks/                  # Custom React hooks (reusable logic)
│   ├── useCarousel.ts           # Carousel navigation logic
│   ├── useFittingRoom.ts        # Queue management logic
│   └── useProductSelection.ts   # Selected product state
├── store/                  # Global state (Zustand)
│   └── fittingRoomStore.ts      # Fitting room state
├── types/                  # TypeScript type definitions
│   └── index.ts                 # Interface definitions
├── data/                   # Mock/sample data
│   └── mockData.ts              # Sample products and looks
├── utils/                  # Helper functions
│   └── formatters.ts            # Price formatting, etc.
└── App.tsx                 # Main app component
```

### Understanding the Folder Structure

**Why organize by feature?**
- Easier to find related files
- Easier to delete/refactor features
- Team members can work on different features without conflicts

**What goes in each folder?**

| Folder | What goes here | Example |
|--------|----------------|---------|
| `components/` | React components (UI building blocks) | `<Button>`, `<Header>` |
| `hooks/` | Reusable React logic | `useCarousel()`, `useAuth()` |
| `store/` | Global state (data shared across components) | Fitting room items, user data |
| `types/` | TypeScript interfaces | `interface Product { ... }` |
| `data/` | Mock data for development | Sample products, test users |
| `utils/` | Helper functions (non-React) | `formatPrice()`, `validateEmail()` |

**Naming Conventions:**
- **Components**: PascalCase (`LookCard.tsx`)
- **Hooks**: camelCase starting with "use" (`useCarousel.ts`)
- **Utilities**: camelCase (`formatters.ts`)
- **Types**: PascalCase (`types/index.ts`)

---

## 4. Understanding React Fundamentals

Before diving into components, let's review key React concepts you'll use:

### 4.1 Components

Components are reusable UI building blocks. Think of them like LEGO pieces.

```tsx
// Simple component
function WelcomeMessage() {
  return <h1>Welcome to Eggora!</h1>;
}

// Component with props (inputs)
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Using the component
<Greeting name="Alice" />  // Renders: Hello, Alice!
```

**Two ways to create components:**

1. **Function components** (Modern way - use this!)
```tsx
function MyComponent() {
  return <div>Hello</div>;
}
```

2. **Class components** (Old way - avoid in new code)
```tsx
class MyComponent extends React.Component {
  render() {
    return <div>Hello</div>;
  }
}
```

### 4.2 Props (Properties)

Props are how you pass data from parent to child components.

```tsx
// Parent component
function App() {
  return <ProductCard name="Dress" price={100} />;
}

// Child component
function ProductCard({ name, price }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>${price}</p>
    </div>
  );
}
```

**Props are read-only!** You cannot modify props inside a component.

```tsx
// ❌ DON'T DO THIS
function ProductCard({ price }) {
  price = price * 2;  // ERROR: Can't modify props
  return <p>${price}</p>;
}

// ✅ DO THIS INSTEAD
function ProductCard({ price }) {
  const discountedPrice = price * 0.8;  // Create a new variable
  return <p>${discountedPrice}</p>;
}
```

### 4.3 State

State is data that can change over time. Use `useState` hook.

```tsx
import { useState } from 'react';

function Counter() {
  // Declare state variable
  const [count, setCount] = useState(0);
  //     ↑        ↑            ↑
  //   current  updater    initial
  //   value    function   value

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

**Key rules:**
1. Always use the setter function to update state
2. State updates are asynchronous
3. React re-renders the component when state changes

### 4.4 useEffect Hook

`useEffect` runs code after the component renders. Use it for side effects like fetching data, subscriptions, or DOM manipulation.

```tsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // This runs after the component renders
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);  // Re-run when userId changes
  //   ↑
  // Dependency array

  return <div>{user?.name}</div>;
}
```

**Dependency array rules:**
- `[]` - Run once when component mounts
- `[userId]` - Run when `userId` changes
- No array - Run after every render (usually wrong!)

### 4.5 Event Handling

Handle user interactions like clicks, form submissions, etc.

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');

  // Event handler function
  const handleSubmit = (event) => {
    event.preventDefault();  // Prevent page reload
    console.log('Submitted:', email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

**Common events:**
- `onClick` - Button clicks
- `onChange` - Input changes
- `onSubmit` - Form submission
- `onMouseEnter` / `onMouseLeave` - Hover effects

### 4.6 Conditional Rendering

Show different UI based on conditions.

```tsx
function WelcomeBanner({ isLoggedIn, username }) {
  // Method 1: if/else
  if (isLoggedIn) {
    return <h1>Welcome back, {username}!</h1>;
  } else {
    return <h1>Please log in</h1>;
  }

  // Method 2: Ternary operator (inline)
  return (
    <h1>
      {isLoggedIn ? `Welcome, ${username}!` : 'Please log in'}
    </h1>
  );

  // Method 3: && operator (show or nothing)
  return (
    <div>
      {isLoggedIn && <h1>Welcome, {username}!</h1>}
    </div>
  );
}
```

### 4.7 Lists and Keys

Render arrays of data.

```tsx
function ProductList({ products }) {
  return (
    <div>
      {products.map((product) => (
        <ProductCard
          key={product.id}  // IMPORTANT: Unique key for each item
          name={product.name}
          price={product.price}
        />
      ))}
    </div>
  );
}
```

**Why keys matter:**
- Helps React identify which items changed
- Improves performance
- Prevents weird bugs with component state

**Key rules:**
- Must be unique among siblings
- Should be stable (don't use array index if list can change)
- Best practice: Use `id` from your data

---

## 5. Component Breakdown

Now let's break down each component in detail.

### 5.1 Header Component

The navigation bar at the top of the page.

**What it does:**
- Shows the Eggora logo (left side)
- Shows navigation links (right side)
- Provides global navigation

**Props Interface:**
```typescript
interface HeaderProps {
  logo: string;           // URL or path to logo image
  navItems: Array<{       // Array of navigation items
    label: string;        // Text to display
    icon: React.ReactNode; // Icon component
    href: string;         // URL to navigate to
  }>;
}
```

**Visual Layout:**
```
┌─────────────────────────────────────────────────────┐
│  🥚 Eggora         Journeys  My Inventory  Account  │
│  (logo)            (navigation links with icons)    │
└─────────────────────────────────────────────────────┘
```

**Implementation Example:**
```tsx
// components/layout/Header.tsx
import { Link } from 'react-router-dom';

interface HeaderProps {
  logo: string;
  navItems: Array<{
    label: string;
    icon: React.ReactNode;
    href: string;
  }>;
}

export function Header({ logo, navItems }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
      {/* Logo Section (Left) */}
      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="Eggora" className="h-8 w-8" />
        <span className="text-xl font-bold text-purple-600">Eggora</span>
      </Link>

      {/* Navigation Section (Right) */}
      <nav className="flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
```

**Usage Example:**
```tsx
import { Header } from './components/layout/Header';
import { Compass, ShoppingBag, User } from 'lucide-react';

function App() {
  const navItems = [
    { label: 'Journeys', icon: <Compass />, href: '/journeys' },
    { label: 'My Inventory', icon: <ShoppingBag />, href: '/inventory' },
    { label: 'Account', icon: <User />, href: '/account' },
  ];

  return <Header logo="/logo.png" navItems={navItems} />;
}
```

**Tailwind Classes Explained:**
- `flex` - Use flexbox layout
- `items-center` - Vertically center items
- `justify-between` - Space items apart (logo left, nav right)
- `px-8` - Horizontal padding (8 * 4px = 32px)
- `py-4` - Vertical padding (4 * 4px = 16px)
- `gap-2` - Space between items (2 * 4px = 8px)
- `hover:text-purple-600` - Change text color on hover
- `transition-colors` - Smooth color change animation

**Common Customizations:**
- Make header sticky: Add `sticky top-0 z-50`
- Add search bar: Insert between logo and nav
- Mobile menu: Hide nav on small screens, show hamburger icon

---

### 5.2 LookCarousel Component

The main carousel that displays outfit looks.

**What it does:**
- Shows 3 looks at once (previous, current, next)
- Allows navigation via arrow buttons
- Shows pagination dots
- Centers the active look with a zoom effect

**Props Interface:**
```typescript
interface LookCarouselProps {
  looks: Look[];              // Array of look objects
  activeIndex: number;        // Index of currently active look
  onSelectLook: (index: number) => void;  // Callback when user selects a look
}

interface Look {
  id: string;          // Unique identifier
  name: string;        // Look name (e.g., "Enchanted Garden")
  brand: string;       // Brand name (e.g., "H&M")
  price: number;       // Total price of look
  image: string;       // Main look image URL
  items: Item[];       // Individual items in this look
}
```

**Visual Concept:**
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  [Partial]  [   Full Active   ]  [Partial]      │
│  Previous   Current (centered)   Next            │
│                                                  │
│              ● ● ○                               │
│           (pagination dots)                      │
└──────────────────────────────────────────────────┘
```

**How the Carousel Works:**

1. **Display Logic**: Show 3 items at a time
   - Item at `activeIndex - 1` (partially visible on left)
   - Item at `activeIndex` (fully visible in center, larger)
   - Item at `activeIndex + 1` (partially visible on right)

2. **Transform Calculation**: Use CSS `translateX` to slide
   - Each item is 33.33% wide (1/3 of container)
   - Translate by `-(activeIndex * 33.33%) + 33.33%` to center active item
   - Example: If activeIndex = 1, translate = -33.33% + 33.33% = 0%

3. **Visual States**:
   - **Active**: `scale(1)`, `opacity(1)`, white background, larger
   - **Inactive**: `scale(0.9)`, `opacity(0.7)`, gray tint, smaller

**Implementation Strategy:**

```tsx
// components/looks/LookCarousel.tsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LookCard } from './LookCard';
import { CarouselDots } from './CarouselDots';

interface LookCarouselProps {
  looks: Look[];
  onSelectLook: (look: Look) => void;
}

export function LookCarousel({ looks, onSelectLook }: LookCarouselProps) {
  // State to track which look is currently active
  const [activeIndex, setActiveIndex] = useState(1); // Start with middle item

  // Navigate to previous look
  const handlePrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  // Navigate to next look
  const handleNext = () => {
    if (activeIndex < looks.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  // Jump to specific look when dot clicked
  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    onSelectLook(looks[index]);
  };

  return (
    <div className="relative w-full">
      {/* Previous Arrow Button */}
      <button
        onClick={handlePrevious}
        disabled={activeIndex === 0}  // Disable at start
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10
                   w-10 h-10 rounded-full bg-white shadow-md
                   flex items-center justify-center
                   hover:bg-gray-50 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      {/* Next Arrow Button */}
      <button
        onClick={handleNext}
        disabled={activeIndex === looks.length - 1}  // Disable at end
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                   w-10 h-10 rounded-full bg-white shadow-md
                   flex items-center justify-center
                   hover:bg-gray-50 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>

      {/* Carousel Container */}
      <div className="overflow-hidden px-12">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            // Calculate how far to slide based on activeIndex
            transform: `translateX(calc(-${activeIndex * 100}% / 3 + 33.33%))`
          }}
        >
          {/* Render all looks */}
          {looks.map((look, index) => (
            <div
              key={look.id}
              className="w-1/3 flex-shrink-0 px-2"  // Each takes 1/3 width
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
}
```

**Breaking Down the Transform Math:**

Let's say we have 5 looks, and activeIndex = 2 (showing look #3):

```
Looks:    [ 0 ]  [ 1 ]  [ 2 ]  [ 3 ]  [ 4 ]
Position:  33%    0%   -33%   -66%   -99%
                        ↑
                    Active (centered)
```

Transform calculation:
```javascript
activeIndex = 2
transform = -(2 * 100%) / 3 + 33.33%
         = -66.67% + 33.33%
         = -33.33%
```

This shifts the entire carousel left by 33.33%, bringing look #2 to the center.

**Tailwind Classes Explained:**
- `absolute` - Position relative to nearest parent
- `top-1/2` - Position 50% from top
- `-translate-y-1/2` - Shift up by half its height (centers vertically)
- `z-10` - Stack above other elements
- `overflow-hidden` - Hide anything outside container
- `flex-shrink-0` - Don't let items shrink
- `transition-transform` - Smooth sliding animation
- `duration-500` - Animation takes 500ms
- `ease-out` - Slow down at end of animation

---

### 5.3 LookCard Component

Individual card displaying a single outfit look.

**What it does:**
- Shows an outfit image
- Displays look name, brand, and price
- Changes appearance when active/inactive
- Clickable to select the look

**Props Interface:**
```typescript
interface LookCardProps {
  look: Look;           // Look data
  isActive: boolean;    // Whether this is the active card
  onClick: () => void;  // Callback when clicked
}
```

**Visual Structure:**
```
┌─────────────────────────┐
│  Look 2: Whimsical Light│  ← Title at top
│  ┌─────────────────┐    │
│  │                 │    │  ← Main outfit image
│  │    [Image]      │    │
│  │                 │    │
│  └─────────────────┘    │
│  H&M           $199     │  ← Brand and price
└─────────────────────────┘
```

**Active vs Inactive States:**

| State | Scale | Opacity | Background | Border |
|-------|-------|---------|------------|--------|
| Active | 1.0 | 1.0 | White | Purple (2px) |
| Inactive | 0.9 | 0.7 | Light gray | Gray (1px) |

**Implementation Example:**
```tsx
// components/looks/LookCard.tsx
import { Look } from '../../types';

interface LookCardProps {
  look: Look;
  isActive: boolean;
  onClick: () => void;
}

export function LookCard({ look, isActive, onClick }: LookCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg overflow-hidden cursor-pointer
        transition-all duration-300 ease-out
        ${isActive
          ? 'scale-100 opacity-100 bg-white border-2 border-purple-500 shadow-lg'
          : 'scale-90 opacity-70 bg-gray-100 border border-gray-300 shadow-sm'
        }
      `}
    >
      {/* Title */}
      <div className="px-4 pt-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Look {look.id}: {look.name}
        </h3>
      </div>

      {/* Image */}
      <div className="aspect-[3/4] p-4">
        <img
          src={look.image}
          alt={look.name}
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      {/* Brand and Price */}
      <div className="flex justify-between items-center px-4 pb-4">
        <span className="text-sm text-gray-600">{look.brand}</span>
        <span className="text-lg font-bold text-purple-600">
          ${look.price}
        </span>
      </div>
    </div>
  );
}
```

**Tailwind Classes Explained:**
- `aspect-[3/4]` - Maintain 3:4 aspect ratio (portrait orientation)
- `object-cover` - Fill container while maintaining aspect ratio
- `cursor-pointer` - Show hand cursor on hover
- `transition-all` - Animate all property changes
- `scale-90` - Shrink to 90% size
- `${condition ? 'class-a' : 'class-b'}` - Conditional classes

**Common Enhancements:**
- Add loading skeleton while image loads
- Add "Featured" badge for special looks
- Add hover effect (slight lift or glow)
- Show number of items in look

---

### 5.4 ItemGrid Component

Container for displaying individual items from a look.

**What it does:**
- Shows a grid of items (dress, shoes, bag, etc.)
- Provides "Fit all" button to add all items to queue
- Horizontally scrollable on small screens

**Props Interface:**
```typescript
interface ItemGridProps {
  items: Item[];                      // Array of items to display
  onAddToQueue: (item: Item) => void; // Callback when adding item
  onItemClick: (item: Item) => void;  // Callback when item clicked
}

interface Item {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;  // 'dress', 'shoes', 'bag', etc.
}
```

**Visual Layout:**
```
┌──────────────────────────────────────────────────┐
│  Items                            [Fit all ✓]    │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐ │
│  │ [Img]  │  │ [Img]  │  │ [Img]  │  │ [Img]  │ │
│  │  +     │  │  +     │  │  +     │  │  +     │ │
│  │ brand  │  │ brand  │  │ brand  │  │ brand  │ │
│  │ $price │  │ $price │  │ $price │  │ $price │ │
│  └────────┘  └────────┘  └────────┘  └────────┘ │
└──────────────────────────────────────────────────┘
```

**Implementation Example:**
```tsx
// components/items/ItemGrid.tsx
import { ItemCard } from './ItemCard';
import { Item } from '../../types';
import { Check } from 'lucide-react';

interface ItemGridProps {
  items: Item[];
  onAddToQueue: (item: Item) => void;
  onItemClick: (item: Item) => void;
}

export function ItemGrid({ items, onAddToQueue, onItemClick }: ItemGridProps) {
  // Add all items to queue at once
  const handleFitAll = () => {
    items.forEach(item => onAddToQueue(item));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Items</h2>

        {/* Fit All Button */}
        <button
          onClick={handleFitAll}
          className="flex items-center gap-2 px-4 py-2
                     bg-purple-600 text-white rounded-lg
                     hover:bg-purple-700 transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Fit all</span>
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4
                      overflow-x-auto">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onAddToQueue={() => onAddToQueue(item)}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    </div>
  );
}
```

**Responsive Grid Explained:**
- `grid-cols-2` - 2 columns on mobile (< 768px)
- `md:grid-cols-3` - 3 columns on tablet (768px - 1024px)
- `lg:grid-cols-4` - 4 columns on desktop (> 1024px)

```
Mobile:      Tablet:        Desktop:
┌────┬────┐  ┌────┬────┬────┐  ┌────┬────┬────┬────┐
│ A  │ B  │  │ A  │ B  │ C  │  │ A  │ B  │ C  │ D  │
├────┼────┤  ├────┼────┼────┤  ├────┼────┼────┼────┤
│ C  │ D  │  │ D  │ E  │ F  │  │ E  │ F  │ G  │ H  │
└────┴────┘  └────┴────┴────┘  └────┴────┴────┴────┘
```

---

### 5.5 ItemCard Component

Individual product card within the item grid.

**What it does:**
- Displays product image
- Shows brand name and price
- Has "+" button to add to queue
- Clickable to view full details

**Visual Design:**
```
┌──────────────────┐
│  ┌────────────┐  │
│  │   [Img]    │  │  ← Square product image
│  │            │  │
│  └────────────┘  │
│         [+]      │  ← Add button (top-right of image)
│  belle & bloom   │  ← Brand name
│  $100           │  ← Price
└──────────────────┘
```

**Implementation Example:**
```tsx
// components/items/ItemCard.tsx
import { Plus } from 'lucide-react';
import { Item } from '../../types';

interface ItemCardProps {
  item: Item;
  onAddToQueue: () => void;
  onClick: () => void;
}

export function ItemCard({ item, onAddToQueue, onClick }: ItemCardProps) {
  return (
    <div className="group relative cursor-pointer">
      {/* Image Container */}
      <div
        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3"
        onClick={onClick}
      >
        {/* Product Image */}
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover
                     group-hover:scale-105 transition-transform duration-300"
        />

        {/* Add to Queue Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();  // Prevent triggering parent onClick
            onAddToQueue();
          }}
          className="absolute top-2 right-2
                     w-8 h-8 rounded-full bg-white shadow-md
                     flex items-center justify-center
                     hover:bg-purple-600 hover:text-white
                     transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Brand Name */}
      <p className="text-sm text-gray-600 mb-1">{item.brand}</p>

      {/* Price */}
      <p className="text-lg font-bold text-purple-600">${item.price}</p>
    </div>
  );
}
```

**Event Handling Explained:**

```tsx
onClick={(e) => {
  e.stopPropagation();  // Why do we need this?
  onAddToQueue();
}}
```

**Problem:** The "+" button is inside a clickable card. Without `stopPropagation`, clicking "+" would:
1. Trigger `onAddToQueue()` (add to queue)
2. Trigger `onClick()` (open modal)

**Solution:** `e.stopPropagation()` stops the event from bubbling up to parent.

**Result:** Clicking "+" only adds to queue. Clicking image opens modal.

**Hover Effect:**
- `group` - Define group for hover states
- `group-hover:scale-105` - Zoom image when hovering card
- Image zooms slightly when you hover anywhere on card

---

### 5.6 AIChatBubble Component

The AI assistant message bubble at the bottom of the page.

**What it does:**
- Displays AI fashion advice
- Shows pink mascot avatar
- Animates in from bottom

**Props Interface:**
```typescript
interface AIChatBubbleProps {
  message: string;      // AI's message text
  avatarSrc: string;    // Avatar image URL
}
```

**Visual Design:**
```
┌──────────────────────────────────────┐
│  🎀  "I chose this Sage Midi because │
│      the linen fabric is perfect..." │
└──────────────────────────────────────┘
(Pink avatar on left, white speech bubble)
```

**Implementation Example:**
```tsx
// components/chat/AIChatBubble.tsx
interface AIChatBubbleProps {
  message: string;
  avatarSrc: string;
}

export function AIChatBubble({ message, avatarSrc }: AIChatBubbleProps) {
  return (
    <div className="flex items-start gap-4 max-w-2xl">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-pink-200 flex-shrink-0 overflow-hidden">
        <img
          src={avatarSrc}
          alt="AI Assistant"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Message Bubble */}
      <div className="flex-1 bg-white rounded-2xl rounded-tl-none px-6 py-4 shadow-md">
        <p className="text-gray-800 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
```

**Styling Notes:**
- `rounded-tl-none` - Remove top-left corner radius (points to avatar)
- `flex-shrink-0` - Avatar won't shrink if space is tight
- `leading-relaxed` - More line height for easier reading

**Animation Enhancement:**
```tsx
// Add entrance animation
<div className="animate-slide-up">
  <AIChatBubble ... />
</div>

// In tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out',
      },
    },
  },
};
```

---

### 5.7 FittingRoomQueue Component

The sidebar showing saved items to try on.

**What it does:**
- Displays items added to fitting room
- Shows empty state when no items
- Allows removing items
- Persists across page navigation

**Props Interface:**
```typescript
interface FittingRoomQueueProps {
  items: Item[];                     // Items in queue
  onRemoveItem: (itemId: string) => void;  // Remove callback
}
```

**Visual States:**

**Empty State:**
```
┌────────────────────────┐
│  Fitting Room Queue    │
│  ┌──────────────────┐  │
│  │                  │  │
│  │       [+]        │  │  ← Dashed box
│  │                  │  │
│  └──────────────────┘  │
│  Add items to try on   │
└────────────────────────┘
```

**With Items:**
```
┌────────────────────────┐
│  Fitting Room Queue    │
│  ┌────────┐            │
│  │ [Img]  │  Item 1  X │
│  └────────┘            │
│  ┌────────┐            │
│  │ [Img]  │  Item 2  X │
│  └────────┘            │
└────────────────────────┘
```

**Implementation Example:**
```tsx
// components/fitting-room/FittingRoomQueue.tsx
import { Plus, X } from 'lucide-react';
import { Item } from '../../types';
import { QueueItem } from './QueueItem';

interface FittingRoomQueueProps {
  items: Item[];
  onRemoveItem: (itemId: string) => void;
}

export function FittingRoomQueue({ items, onRemoveItem }: FittingRoomQueueProps) {
  return (
    <div
      className="h-screen sticky top-0 w-80 p-6"
      style={{
        background: 'linear-gradient(135deg, #E6E6FA 0%, #FFB6C1 100%)',
      }}
    >
      {/* Title */}
      <h2 className="text-xl font-bold text-purple-800 mb-6">
        Fitting Room Queue
      </h2>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="border-2 border-dashed border-white rounded-lg p-8 text-center">
          <Plus className="w-12 h-12 mx-auto mb-4 text-white" />
          <p className="text-white text-sm">
            Add items to try on
          </p>
        </div>
      ) : (
        /* Items List */
        <div className="space-y-4">
          {items.map((item) => (
            <QueueItem
              key={item.id}
              item={item}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Sticky Sidebar Explained:**
```tsx
className="sticky top-0"
```
- `sticky` - Element sticks when scrolling
- `top-0` - Stick to top of viewport
- Sidebar stays visible while you scroll main content

---

### 5.8 ProductDetailModal Component

Full-screen modal showing complete product details.

**What it does:**
- Shows product images (thumbnails + main)
- Displays name, brand, price
- Shows color options
- Provides size dropdown
- Has "Add to Queue" button

**Props Interface:**
```typescript
interface ProductDetailModalProps {
  item: Item | null;              // Product to display (null = closed)
  isOpen: boolean;                // Whether modal is open
  onClose: () => void;            // Close callback
  onAddToQueue: (item: Item) => void;  // Add to queue callback
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│  [X]                              Close │  ← Close button
│  ┌──────────┐  ┌─────────────────────┐  │
│  │ Thumb 1  │  │                     │  │
│  │ Thumb 2  │  │    Main Image       │  │
│  │ Thumb 3  │  │                     │  │
│  │ Thumb 4  │  │                     │  │
│  └──────────┘  └─────────────────────┘  │
│                Belle & Bloom            │
│                SAGE MIDI DRESS          │
│                $100                     │
│                Colour: [●] [●] [●]      │
│                Size: [Dropdown ▼]       │
│                Description...           │
│                [Add to Fitting Room]    │
└─────────────────────────────────────────┘
```

**Implementation Example:**
```tsx
// components/modals/ProductDetailModal.tsx
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Item } from '../../types';

interface ProductDetailModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToQueue: (item: Item) => void;
}

export function ProductDetailModal({
  item,
  isOpen,
  onClose,
  onAddToQueue,
}: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop (click to close) */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100
                     flex items-center justify-center hover:bg-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-6 p-8">
          {/* Left: Image Gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-2">
              {item.images?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2
                    ${index === selectedImage ? 'border-purple-600' : 'border-gray-200'}`}
                >
                  <img
                    src={img}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="w-96 h-[500px] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={item.images?.[selectedImage] || item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex-1">
            {/* Brand */}
            <p className="text-sm text-gray-600 mb-2">{item.brand}</p>

            {/* Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.name}</h1>

            {/* Price */}
            <p className="text-2xl font-bold text-purple-600 mb-6">${item.price}</p>

            {/* Color Options */}
            {item.color && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colour
                </label>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-green-300 border-2 border-purple-600" />
                  <button className="w-8 h-8 rounded-full bg-blue-300 border-2 border-gray-300" />
                  <button className="w-8 h-8 rounded-full bg-pink-300 border-2 border-gray-300" />
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select size</option>
                <option value="xs">XS</option>
                <option value="s">S</option>
                <option value="m">M</option>
                <option value="l">L</option>
                <option value="xl">XL</option>
              </select>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8">{item.description}</p>

            {/* Add to Queue Button */}
            <button
              onClick={() => {
                onAddToQueue(item);
                onClose();
              }}
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg
                         hover:bg-purple-700 transition-colors"
            >
              Add to Fitting Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Key Implementation Details:**

**1. Body Scroll Lock:**
```tsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';  // Disable scrolling
  } else {
    document.body.style.overflow = 'unset';   // Restore scrolling
  }

  return () => {
    document.body.style.overflow = 'unset';   // Cleanup
  };
}, [isOpen]);
```

**Why?** When modal is open, we don't want the background page to scroll.

**2. Keyboard Support:**
```tsx
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

**Why?** Users expect ESC key to close modals (accessibility).

**3. Click Outside to Close:**
```tsx
<div className="backdrop" onClick={onClose} />  {/* Backdrop */}
<div onClick={(e) => e.stopPropagation()}>      {/* Content */}
  {/* Modal content */}
</div>
```

**Why?** Clicking outside modal should close it, but clicking inside shouldn't.

---

## 6. Data Structure Design

Let's define the shape of our data.

### Main Types

```typescript
// types/index.ts

/**
 * Individual product item
 */
export interface Item {
  id: string;              // Unique identifier (e.g., "item-001")
  name: string;            // Product name (e.g., "Sage Midi Dress")
  brand: string;           // Brand name (e.g., "Belle & Bloom")
  price: number;           // Price in dollars (e.g., 100)
  image: string;           // Main image URL
  category: 'dress' | 'shoes' | 'bag' | 'accessories' | 'jewelry';
  color?: string;          // Optional color name
  size?: string;           // Optional size
  description?: string;    // Optional description
  images?: string[];       // Optional array of images for gallery
}

/**
 * Complete outfit look
 */
export interface Look {
  id: string;              // Unique identifier (e.g., "look-001")
  name: string;            // Look name (e.g., "Enchanted Garden")
  brand: string;           // Primary brand
  price: number;           // Total price of all items
  image: string;           // Main look image showing full outfit
  items: Item[];           // Array of items that make up this look
  occasion: string;        // Occasion (e.g., "Wedding Guest")
  style: string;           // Style category (e.g., "Romantic")
}

/**
 * AI recommendation for a look
 */
export interface AIRecommendation {
  lookId: string;          // ID of the look this recommendation is for
  message: string;         // AI's message text
  reasoning: string;       // Why AI chose this look
}

/**
 * Item in fitting room queue (extends Item with metadata)
 */
export interface FittingRoomItem extends Item {
  addedAt: Date;           // When item was added to queue
}
```

### Why Use TypeScript Interfaces?

**Benefits:**
1. **Auto-completion**: Your editor knows what properties exist
2. **Error catching**: Catches typos and wrong types before runtime
3. **Documentation**: Types show what data looks like
4. **Refactoring**: Easier to update data structures

**Example Without TypeScript:**
```javascript
// JavaScript - No type checking
function formatPrice(item) {
  return `$${item.pric}`;  // Typo! No error until runtime
}
```

**Example With TypeScript:**
```typescript
// TypeScript - Catches error immediately
function formatPrice(item: Item) {
  return `$${item.pric}`;  // Error: Property 'pric' does not exist
  //                         Did you mean 'price'?
}
```

### Mock Data Structure

Create sample data for development:

```typescript
// data/mockData.ts

export const mockLooks: Look[] = [
  {
    id: '1',
    name: 'Enchanted Garden',
    brand: 'H&M',
    price: 350,
    image: '/looks/look1.jpg',
    occasion: 'Wedding Guest',
    style: 'Romantic',
    items: [
      {
        id: 'item-1',
        name: 'Sage Midi Dress',
        brand: 'Belle & Bloom',
        price: 100,
        image: '/items/dress1.jpg',
        category: 'dress',
        color: 'Sage',
        description: 'Linen fabric perfect for garden events. Features flutter sleeves and a flattering A-line silhouette.',
        images: [
          '/items/dress1.jpg',
          '/items/dress1-side.jpg',
          '/items/dress1-back.jpg',
        ],
      },
      {
        id: 'item-2',
        name: 'Block Heel Sandals',
        brand: 'Steve Madden',
        price: 80,
        image: '/items/shoes1.jpg',
        category: 'shoes',
        color: 'Nude',
        description: 'Comfortable block heel, perfect for outdoor events. 2.5 inch heel height.',
      },
      {
        id: 'item-3',
        name: 'Woven Crossbody Bag',
        brand: 'Cult Gaia',
        price: 150,
        image: '/items/bag1.jpg',
        category: 'bag',
        color: 'Natural',
        description: 'Handwoven rattan bag with adjustable strap.',
      },
      {
        id: 'item-4',
        name: 'Pearl Drop Earrings',
        brand: 'Mejuri',
        price: 20,
        image: '/items/jewelry1.jpg',
        category: 'jewelry',
        description: 'Delicate pearl earrings, gold vermeil.',
      },
    ],
  },
  {
    id: '2',
    name: 'Whimsical Light',
    brand: 'Belle & Blossom',
    price: 420,
    image: '/looks/look2.jpg',
    occasion: 'Wedding Guest',
    style: 'Elegant',
    items: [
      {
        id: 'item-5',
        name: 'Chiffon Maxi Dress',
        brand: 'Zimmermann',
        price: 250,
        image: '/items/dress2.jpg',
        category: 'dress',
        color: 'Blush',
        description: 'Flowing chiffon with delicate floral print.',
      },
      {
        id: 'item-6',
        name: 'Strappy Heels',
        brand: 'Sam Edelman',
        price: 120,
        image: '/items/shoes2.jpg',
        category: 'shoes',
        color: 'Gold',
        description: 'Metallic gold strappy heels, 3 inch heel.',
      },
      {
        id: 'item-7',
        name: 'Clutch Bag',
        brand: 'Ted Baker',
        price: 50,
        image: '/items/bag2.jpg',
        category: 'bag',
        color: 'Blush',
        description: 'Compact clutch with chain strap.',
      },
    ],
  },
];

export const aiRecommendations: Record<string, AIRecommendation> = {
  '1': {
    lookId: '1',
    message: "I chose this Sage Midi because the linen fabric is perfect for a 1 PM garden start, and the block heel won't sink into the grass!",
    reasoning: 'Fabric and heel type suitable for outdoor garden event',
  },
  '2': {
    lookId: '2',
    message: "This one's a bit more 'Modern Chic' than the last one. And it's a liiittle over your budget range. What do you think?",
    reasoning: 'Style comparison and budget consideration',
  },
};
```

**Tips for Mock Data:**
- Use realistic names and prices
- Include variety (different brands, styles, price points)
- Add enough items to test scrolling and pagination
- Include edge cases (very long names, missing images)

---

## 7. Step-by-Step Implementation

Now let's build the app from scratch!

### Step 1: Project Setup

**Option A: Create React App (CRA)**
```bash
# Create new React project with TypeScript
npx create-react-app eggora-dashboard --template typescript

cd eggora-dashboard
```

**Option B: Vite (Recommended - Faster)**
```bash
# Create with Vite
npm create vite@latest eggora-dashboard -- --template react-ts

cd eggora-dashboard
npm install
```

**Why Vite?**
- Faster development server (instant start)
- Faster builds
- Better dev experience
- Modern tooling

**Install Dependencies:**
```bash
# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install icon library
npm install lucide-react

# Install routing
npm install react-router-dom

# (Optional) Install state management
npm install zustand

# (Optional) Install animation library
npm install framer-motion
```

### Step 2: Configure Tailwind CSS

**1. Update `tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // Scan these files for classes
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
        // Custom gradients
        'gradient-fitting': 'linear-gradient(135deg, #E6E6FA 0%, #FFB6C1 100%)',
        'page-gradient': 'linear-gradient(180deg, #FFE4E9 0%, #FFF5F7 100%)',
      },
    },
  },
  plugins: [],
};
```

**2. Update `src/index.css`:**
```css
/* Import Tailwind base styles */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles */
@layer base {
  body {
    @apply antialiased;  /* Smoother text rendering */
  }
}
```

**What is `@layer`?**
- Organizes your CSS into Tailwind's layers
- `@layer base` - Global resets and base styles
- `@layer components` - Component classes
- `@layer utilities` - Utility classes

### Step 3: Project Structure Setup

Create the folder structure:

```bash
mkdir -p src/{components/{layout,looks,items,fitting-room,chat,modals},hooks,store,types,data,utils}

touch src/types/index.ts
touch src/data/mockData.ts
touch src/utils/formatters.ts
```

**On Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Path src/components/layout,src/components/looks,src/components/items,src/components/fitting-room,src/components/chat,src/components/modals,src/hooks,src/store,src/types,src/data,src/utils -Force

New-Item -ItemType File -Path src/types/index.ts,src/data/mockData.ts,src/utils/formatters.ts
```

### Step 4: Define TypeScript Types

**Create `src/types/index.ts`:**
```typescript
// Item interface
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
  images?: string[];
}

// Look interface
export interface Look {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  items: Item[];
  occasion: string;
  style: string;
}

// AI Recommendation interface
export interface AIRecommendation {
  lookId: string;
  message: string;
  reasoning: string;
}

// Fitting Room Item (with timestamp)
export interface FittingRoomItem extends Item {
  addedAt: Date;
}
```

### Step 5: Create Mock Data

**Create `src/data/mockData.ts`:**
```typescript
import { Look, AIRecommendation } from '../types';

// Use the mock data structure from section 6
export const mockLooks: Look[] = [
  // ... (copy from section 6)
];

export const aiRecommendations: Record<string, AIRecommendation> = {
  // ... (copy from section 6)
};
```

### Step 6: Create Utility Functions

**Create `src/utils/formatters.ts`:**
```typescript
/**
 * Format price with currency symbol
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Truncate text to max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
```

### Step 7: Build Layout Components

Start with the overall page structure.

**Create `src/components/layout/MainLayout.tsx`:**
```tsx
import React from 'react';
import { Header } from './Header';
import { FittingRoomQueue } from '../fitting-room/FittingRoomQueue';
import { useFittingRoomStore } from '../../store/fittingRoomStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { items, removeItem } = useFittingRoomStore();

  return (
    <div className="min-h-screen bg-page-gradient">
      <Header
        logo="/logo.png"
        navItems={[
          { label: 'Journeys', icon: '🧭', href: '/journeys' },
          { label: 'My Inventory', icon: '🛍️', href: '/inventory' },
          { label: 'Account', icon: '👤', href: '/account' },
        ]}
      />

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 px-8 py-6">
          {children}
        </main>

        {/* Right Sidebar - Fitting Room */}
        <aside className="w-80">
          <FittingRoomQueue
            items={items}
            onRemoveItem={removeItem}
          />
        </aside>
      </div>
    </div>
  );
}
```

**Create `src/components/layout/Header.tsx`:**
```tsx
// Use the implementation from section 5.1
```

### Step 8: Create State Management

**Create `src/store/fittingRoomStore.ts`:**
```typescript
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
  // Initial state
  items: [],

  // Add item (prevent duplicates)
  addItem: (item) => {
    const { items } = get();
    if (!items.find((i) => i.id === item.id)) {
      set({ items: [...items, item] });
    }
  },

  // Remove item by ID
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    }));
  },

  // Clear all items
  clearAll: () => set({ items: [] }),

  // Check if item is in queue
  isInQueue: (itemId) => {
    return !!get().items.find((i) => i.id === itemId);
  },
}));
```

**What is Zustand?**
- Lightweight state management library
- Similar to Redux but simpler
- No boilerplate code
- Direct state access with hooks

**Using the store:**
```tsx
function MyComponent() {
  // Subscribe to specific state
  const items = useFittingRoomStore((state) => state.items);
  const addItem = useFittingRoomStore((state) => state.addItem);

  // Or get everything
  const { items, addItem, removeItem } = useFittingRoomStore();

  return (
    <button onClick={() => addItem(someItem)}>
      Add to Queue ({items.length})
    </button>
  );
}
```

### Step 9: Build Carousel Components

This is the most complex component. Let's break it down.

**Create `src/components/looks/LookCarousel.tsx`:**
```tsx
// Use the implementation from section 5.2
```

**Create `src/components/looks/LookCard.tsx`:**
```tsx
// Use the implementation from section 5.3
```

**Create `src/components/looks/CarouselDots.tsx`:**
```tsx
interface CarouselDotsProps {
  total: number;        // Total number of dots
  active: number;       // Active dot index
  onChange: (index: number) => void;  // Click handler
}

export function CarouselDots({ total, active, onChange }: CarouselDotsProps) {
  return (
    <div className="flex justify-center gap-2 mt-6">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onChange(index)}
          className={`
            w-2 h-2 rounded-full transition-all
            ${index === active
              ? 'bg-purple-600 w-8'  // Active: wider, purple
              : 'bg-gray-300'        // Inactive: small, gray
            }
          `}
        />
      ))}
    </div>
  );
}
```

**How `Array.from()` works:**
```javascript
// Create array of length 5
Array.from({ length: 5 })
// Result: [undefined, undefined, undefined, undefined, undefined]

// Map to create dot buttons
Array.from({ length: 5 }).map((_, index) => (
  <button key={index}>Dot {index}</button>
))
// Result: 5 buttons with keys 0, 1, 2, 3, 4
```

### Step 10: Build Item Components

**Create `src/components/items/ItemGrid.tsx`:**
```tsx
// Use the implementation from section 5.4
```

**Create `src/components/items/ItemCard.tsx`:**
```tsx
// Use the implementation from section 5.5
```

### Step 11: Build Fitting Room Components

**Create `src/components/fitting-room/FittingRoomQueue.tsx`:**
```tsx
// Use the implementation from section 5.7
```

**Create `src/components/fitting-room/QueueItem.tsx`:**
```tsx
import { X } from 'lucide-react';
import { Item } from '../../types';

interface QueueItemProps {
  item: Item;
  onRemove: () => void;
}

export function QueueItem({ item, onRemove }: QueueItemProps) {
  return (
    <div className="flex gap-3 bg-white bg-opacity-50 rounded-lg p-3">
      {/* Thumbnail */}
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 object-cover rounded"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {item.name}
        </p>
        <p className="text-xs text-gray-600">{item.brand}</p>
        <p className="text-sm font-bold text-purple-800">${item.price}</p>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="w-6 h-6 flex items-center justify-center
                   rounded-full hover:bg-white transition-colors"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
```

**Styling Trick:**
```tsx
className="min-w-0"  // Why do we need this?
```

**Problem:** Flexbox items don't shrink below their content size by default.

**Solution:** `min-w-0` allows the element to shrink, enabling `truncate` to work.

### Step 12: Build Modal Components

**Create `src/components/modals/ProductDetailModal.tsx`:**
```tsx
// Use the implementation from section 5.8
```

**Tips for Modals:**
1. **Use React Portal** (optional, advanced):
```tsx
import { createPortal } from 'react-dom';

export function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.body  // Render at body level
  );
}
```

2. **Focus Management** (accessibility):
```tsx
useEffect(() => {
  if (isOpen) {
    const previousFocus = document.activeElement;
    modalRef.current?.focus();

    return () => {
      previousFocus?.focus();  // Restore focus on close
    };
  }
}, [isOpen]);
```

### Step 13: Build Main Page

**Create `src/pages/FindTheLookPage.tsx`:**
```tsx
import { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { LookCarousel } from '../components/looks/LookCarousel';
import { ItemGrid } from '../components/items/ItemGrid';
import { AIChatBubble } from '../components/chat/AIChatBubble';
import { ProductDetailModal } from '../components/modals/ProductDetailModal';
import { mockLooks, aiRecommendations } from '../data/mockData';
import { useFittingRoomStore } from '../store/fittingRoomStore';
import type { Look, Item } from '../types';

export function FindTheLookPage() {
  // State
  const [selectedLook, setSelectedLook] = useState<Look>(mockLooks[1]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Store
  const { addItem } = useFittingRoomStore();

  // Handlers
  const handleSelectLook = (look: Look) => {
    setSelectedLook(look);
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddToQueue = (item: Item) => {
    addItem(item);
    // Optional: Show success toast
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
      {currentRecommendation && (
        <section className="mb-8">
          <AIChatBubble
            message={currentRecommendation.message}
            avatarSrc="/avatars/ai-blob.png"
          />
        </section>
      )}

      {/* Refine Search */}
      <div className="flex justify-center items-center gap-3">
        <span className="text-gray-600 text-sm">
          Not quite right? Refine your search
        </span>
        <button
          className="w-10 h-10 rounded-full border-2 border-purple-400
                     flex items-center justify-center
                     hover:bg-purple-50 transition-colors"
        >
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
}
```

### Step 14: Setup Routing

**Update `src/App.tsx`:**
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FindTheLookPage } from './pages/FindTheLookPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FindTheLookPage />} />
        {/* Add more routes here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Step 15: Test Your App

**Run development server:**
```bash
npm run dev
```

**Open browser:**
- Navigate to `http://localhost:5173` (Vite)
- Or `http://localhost:3000` (CRA)

**Test checklist:**
- [ ] Page loads without errors
- [ ] Carousel navigation works (arrows + dots)
- [ ] Clicking look updates items grid
- [ ] Clicking item opens modal
- [ ] Adding to queue updates sidebar
- [ ] Removing from queue works
- [ ] Responsive on mobile

---

## 8. Key Features Explained

Let's dive deep into the complex features.

### 8.1 Carousel Transform Math

The carousel shows 3 items at once with smooth sliding.

**The Math:**

Given:
- Container width = 100%
- Each item width = 33.33% (1/3 of container)
- `activeIndex` = index of centered item

Transform formula:
```javascript
translateX = -(activeIndex * 33.33%) + 33.33%
```

**Why this works:**

1. **`-(activeIndex * 33.33%)`** - Shifts items left by index amount
2. **`+ 33.33%`** - Compensates to center the active item

**Visual Example:**

```
activeIndex = 0 (first item):
  translateX = -(0 * 33.33%) + 33.33% = 33.33%
  Items shift RIGHT, centering item 0

activeIndex = 1 (second item):
  translateX = -(1 * 33.33%) + 33.33% = 0%
  Items stay in place, item 1 is centered

activeIndex = 2 (third item):
  translateX = -(2 * 33.33%) + 33.33% = -33.33%
  Items shift LEFT, centering item 2
```

**In Code:**
```tsx
<div
  style={{
    transform: `translateX(calc(-${activeIndex * 100}% / 3 + 33.33%))`
  }}
>
  {/* Items */}
</div>
```

**Alternative: Using Framer Motion**

For smoother animations with physics-based motion:

```tsx
import { motion } from 'framer-motion';

<motion.div
  animate={{
    x: `calc(-${activeIndex * 100}% / 3 + 33.33%)`
  }}
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 30,
  }}
>
  {/* Items */}
</motion.div>
```

### 8.2 Fitting Room State Management

The fitting room needs to persist across page navigation.

**Why Use Global State?**

**Problem with Local State:**
```tsx
// ❌ BAD: State resets when page changes
function MyPage() {
  const [queueItems, setQueueItems] = useState([]);
  // State lost when navigating away!
}
```

**Solution: Zustand Store:**
```tsx
// ✅ GOOD: State persists across pages
const useFittingRoomStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
}));

// Access from any component
function AnyPage() {
  const items = useFittingRoomStore((state) => state.items);
}
```

**Adding Items with Duplicate Prevention:**
```typescript
addItem: (item) => {
  const { items } = get();

  // Check if item already exists
  if (!items.find((i) => i.id === item.id)) {
    set({ items: [...items, item] });
  }
}
```

**Visual Feedback:**

Show a toast notification when item is added:

```tsx
import { toast } from 'react-hot-toast';  // Install: npm i react-hot-toast

const handleAddToQueue = (item: Item) => {
  addItem(item);
  toast.success(`Added ${item.name} to fitting room!`);
};
```

**Persisting to LocalStorage (Optional):**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFittingRoomStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => {
        set((state) => ({
          items: [...state.items, item],
        }));
      },
    }),
    {
      name: 'fitting-room',  // LocalStorage key
    }
  )
);
```

Now items persist even after page refresh!

### 8.3 Modal Implementation Best Practices

**1. Lock Body Scroll**

Prevent background scrolling when modal is open:

```tsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  // Cleanup on unmount
  return () => {
    document.body.style.overflow = 'unset';
  };
}, [isOpen]);
```

**2. Keyboard Support**

Close modal on Escape key:

```tsx
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };

  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

**3. Click Outside to Close**

```tsx
<div
  className="backdrop"
  onClick={onClose}  // Close when clicking backdrop
>
  <div
    className="modal-content"
    onClick={(e) => e.stopPropagation()}  // Don't close when clicking content
  >
    {/* Modal content */}
  </div>
</div>
```

**4. Focus Management (Accessibility)**

Trap focus inside modal:

```tsx
import { useRef, useEffect } from 'react';

function Modal({ isOpen, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      const previousFocus = document.activeElement as HTMLElement;

      // Focus modal
      modalRef.current?.focus();

      // Restore focus on close
      return () => {
        previousFocus?.focus();
      };
    }
  }, [isOpen]);

  return (
    <div
      ref={modalRef}
      tabIndex={-1}  // Make focusable
      role="dialog"
      aria-modal="true"
    >
      {/* Modal content */}
    </div>
  );
}
```

**5. Portal Rendering (Advanced)**

Render modal at body level to avoid z-index issues:

```tsx
import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(
    <div className="modal-container">
      {children}
    </div>,
    document.body  // Render as child of body
  );
}
```

**Why portals?**
- Avoids z-index conflicts with parent containers
- Ensures modal always appears on top
- Cleaner DOM structure

### 8.4 Responsive Design Strategy

**Mobile-First Approach:**

Start with mobile styles, add desktop overrides:

```tsx
<div className="
  grid-cols-1           // Mobile: 1 column
  md:grid-cols-2        // Tablet: 2 columns
  lg:grid-cols-4        // Desktop: 4 columns
  gap-4                 // Consistent gap
">
  {/* Items */}
</div>
```

**Breakpoints:**
| Prefix | Min Width | Target Device |
|--------|-----------|---------------|
| (none) | 0px | Mobile (default) |
| `sm:` | 640px | Large mobile |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Large desktop |

**Responsive Carousel:**

```tsx
<div className="
  overflow-x-auto       // Scroll on mobile
  md:overflow-hidden    // No scroll on tablet+
">
  <div className="
    flex
    gap-4
    md:justify-center   // Center on larger screens
  ">
    {/* Carousel items */}
  </div>
</div>
```

**Responsive Sidebar:**

```tsx
<aside className="
  w-full                 // Full width on mobile
  lg:w-80                // Fixed width on desktop
  lg:sticky              // Sticky only on desktop
  lg:top-0
">
  <FittingRoomQueue />
</aside>
```

**Mobile Navigation:**

```tsx
function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header>
      {/* Desktop Nav */}
      <nav className="hidden md:flex">
        {navItems.map(item => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Menu />
      </button>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <nav className="md:hidden">
          {navItems.map(item => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      )}
    </header>
  );
}
```

**Testing Responsive Design:**

1. **In Browser:**
   - Open DevTools (F12)
   - Click device toolbar (Ctrl+Shift+M)
   - Test different screen sizes

2. **Breakpoint Preview:**
   - iPhone SE: 375x667
   - iPad: 768x1024
   - Desktop: 1920x1080

3. **Test Checklist:**
   - [ ] Text is readable (not too small)
   - [ ] Buttons are tappable (min 44x44px)
   - [ ] No horizontal scrolling
   - [ ] Images scale properly
   - [ ] Navigation is accessible

---

## 9. Common Pitfalls & Tips

### Pitfall 1: Carousel State Management

**❌ DON'T:** Store position as pixel values
```tsx
// BAD - breaks on window resize
const [offset, setOffset] = useState(0);

<div style={{ transform: `translateX(${offset}px)` }}>
```

**✅ DO:** Store as index, calculate transform
```tsx
// GOOD - responsive and predictable
const [activeIndex, setActiveIndex] = useState(0);

<div style={{
  transform: `translateX(calc(-${activeIndex * 100}% / 3 + 33.33%))`
}}>
```

**Why?**
- Pixel values break on different screen sizes
- Index-based calculation adapts to container width
- Easier to test and debug

### Pitfall 2: Image Loading

**❌ DON'T:** Assume images load instantly
```tsx
// BAD - causes layout shift
<img src={product.image} alt={product.name} />
```

**Layout shift example:**
```
Before image loads:  After image loads:
┌──────────┐         ┌──────────┐
│          │         │  [Image] │
│          │         │          │  ← Content shifts down
└──────────┘         │          │
Text here            └──────────┘
                     Text here (shifted)
```

**✅ DO:** Use aspect ratios and placeholders
```tsx
// GOOD - consistent layout
<div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
  <img
    src={product.image}
    alt={product.name}
    className="w-full h-full object-cover"
    loading="lazy"  // Lazy load off-screen images
  />
</div>
```

**Even Better: Add Loading State**
```tsx
function ProductImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
```

### Pitfall 3: Modal Accessibility

**❌ DON'T:** Forget keyboard navigation
```tsx
// BAD - mouse only, not accessible
<div onClick={onClose}>×</div>
```

**✅ DO:** Support keyboard and screen readers
```tsx
// GOOD - accessible
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Product Details</h2>
  <button
    onClick={onClose}
    aria-label="Close modal"
    className="..."
  >
    <X />
  </button>
</div>
```

**Full Accessibility Checklist:**
- [ ] `role="dialog"` on modal container
- [ ] `aria-modal="true"` to indicate modal
- [ ] `aria-labelledby` or `aria-label` for title
- [ ] Close button has `aria-label`
- [ ] Escape key closes modal
- [ ] Focus trapped inside modal
- [ ] Focus restored on close

### Pitfall 4: State Synchronization

**❌ DON'T:** Duplicate state in multiple places
```tsx
// BAD - items and selectedLook.items can get out of sync
const [items, setItems] = useState(selectedLook.items);
const [selectedLook, setSelectedLook] = useState(mockLooks[0]);

// Problem: If selectedLook changes, items doesn't update
```

**✅ DO:** Derive from props or use single source of truth
```tsx
// GOOD - always in sync
const [selectedLook, setSelectedLook] = useState(mockLooks[0]);
const items = selectedLook.items;  // Always up-to-date
```

**When to derive vs store:**

**Derive if:**
- Value can be calculated from existing state
- Value changes when parent state changes
- Example: `const total = items.reduce((sum, item) => sum + item.price, 0)`

**Store if:**
- Value can change independently
- Value is user input
- Value persists across renders
- Example: `const [selectedSize, setSelectedSize] = useState('')`

### Pitfall 5: Event Handler Performance

**❌ DON'T:** Create new functions on every render
```tsx
// BAD - new function created on every render
{items.map(item => (
  <ItemCard
    key={item.id}
    item={item}
    onClick={() => handleClick(item)}  // New function each render
  />
))}
```

**Why is this bad?**
- React thinks props changed every render
- Causes unnecessary re-renders
- Poor performance with many items

**✅ DO:** Use useCallback or pass IDs
```tsx
// Option 1: Pass ID, handle lookup inside
{items.map(item => (
  <ItemCard
    key={item.id}
    itemId={item.id}
    onClick={handleClick}  // Same function reference
  />
))}

function handleClick(itemId: string) {
  const item = items.find(i => i.id === itemId);
  // Handle click
}

// Option 2: Use useCallback (for complex cases)
const handleClick = useCallback((item: Item) => {
  // Handle click
}, [/* dependencies */]);
```

### Pitfall 6: Infinite Loops in useEffect

**❌ DON'T:** Forget dependency array or use wrong dependencies
```tsx
// BAD - runs after every render (infinite loop if setting state)
useEffect(() => {
  fetchData();
});

// BAD - missing dependency (React warning)
useEffect(() => {
  console.log(userId);
}, []);  // Should include userId
```

**✅ DO:** Include all dependencies
```tsx
// GOOD - runs only when userId changes
useEffect(() => {
  fetchData(userId);
}, [userId]);

// GOOD - runs once on mount
useEffect(() => {
  fetchInitialData();
}, []);
```

**Debugging useEffect:**
```tsx
useEffect(() => {
  console.log('Effect running');
  console.log('Dependencies:', { userId, page });

  fetchData(userId, page);
}, [userId, page]);
```

### Pitfall 7: Not Handling Loading and Error States

**❌ DON'T:** Only handle success case
```tsx
// BAD - no loading or error handling
function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

**✅ DO:** Handle all states
```tsx
// GOOD - loading, error, and success states
function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

**State Diagram:**
```
Initial → Loading → Success → Display
                 ↘ Error → Show error
```

---

## 10. Testing & Debugging

### 10.1 Console Logging Best Practices

**❌ BAD:**
```tsx
console.log('data', data);  // No context
console.log(data);          // Hard to find in logs
```

**✅ GOOD:**
```tsx
console.log('[ProductList] Fetched data:', data);
console.log('[Carousel] Active index changed:', { prev, next });
```

**Use Console Methods:**
```tsx
console.log('Info');      // Regular message
console.warn('Warning'); // Yellow warning
console.error('Error');  // Red error
console.table(array);    // Table view for arrays
console.group('Group');  // Group related logs
console.log('Item 1');
console.log('Item 2');
console.groupEnd();
```

### 10.2 React DevTools

**Install:**
- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Firefox: Search "React DevTools" in Add-ons

**Features:**
1. **Components Tab**: Inspect component tree and props
2. **Profiler Tab**: Measure performance
3. **Highlight Updates**: See what re-renders

**Debugging State:**
```
1. Open DevTools (F12)
2. Click "Components" tab
3. Select your component
4. View props and state in right panel
5. Edit values to test different states
```

### 10.3 Common Errors & Solutions

**Error: "Can't perform a React state update on an unmounted component"**

**Cause:** Setting state after component unmounts

```tsx
// BAD
useEffect(() => {
  fetchData().then(data => {
    setState(data);  // Component might unmount before this runs
  });
}, []);
```

**Fix:** Cancel async operations on unmount
```tsx
// GOOD
useEffect(() => {
  let cancelled = false;

  fetchData().then(data => {
    if (!cancelled) {
      setState(data);
    }
  });

  return () => {
    cancelled = true;
  };
}, []);
```

**Error: "Each child in a list should have a unique 'key' prop"**

**Cause:** Missing or duplicate keys in list

```tsx
// BAD
{items.map((item, index) => (
  <div key={index}>  // Don't use index as key
    {item.name}
  </div>
))}
```

**Fix:** Use unique IDs
```tsx
// GOOD
{items.map(item => (
  <div key={item.id}>  // Use unique ID
    {item.name}
  </div>
))}
```

**Error: "Maximum update depth exceeded"**

**Cause:** Infinite loop in state update

```tsx
// BAD
function Component() {
  const [count, setCount] = useState(0);

  setCount(count + 1);  // Runs on every render → infinite loop

  return <div>{count}</div>;
}
```

**Fix:** Move to event handler or useEffect
```tsx
// GOOD
function Component() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);  // Only runs on click
  };

  return <button onClick={handleClick}>{count}</button>;
}
```

### 10.4 Performance Debugging

**Identify Slow Renders:**

1. Open React DevTools
2. Go to Profiler tab
3. Click record button
4. Interact with your app
5. Stop recording
6. View flame graph of render times

**Optimize Slow Components:**

**Use React.memo:**
```tsx
// Only re-renders if props change
const ProductCard = React.memo(({ product }) => {
  return <div>{product.name}</div>;
});
```

**Use useMemo for expensive calculations:**
```tsx
function ProductList({ products, filter }) {
  // Only recalculates when products or filter changes
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === filter);
  }, [products, filter]);

  return (
    <div>
      {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

**Use useCallback for stable functions:**
```tsx
function Parent() {
  const [count, setCount] = useState(0);

  // Stable function reference
  const handleClick = useCallback((id) => {
    console.log('Clicked:', id);
  }, []);  // No dependencies = never changes

  return <Child onClick={handleClick} />;
}
```

### 10.5 Network Debugging

**View API Calls:**

1. Open DevTools (F12)
2. Go to Network tab
3. Interact with app
4. View requests in list
5. Click request to see details (headers, response, timing)

**Simulate Slow Network:**

1. Network tab → Throttling dropdown
2. Select "Slow 3G" or "Fast 3G"
3. Test loading states

**Test with Mock Data:**

```tsx
// Development: Use mock data
const useMockData = process.env.NODE_ENV === 'development';

function fetchProducts() {
  if (useMockData) {
    return Promise.resolve(mockProducts);
  }
  return fetch('/api/products').then(r => r.json());
}
```

---

## 11. Resources & Learning Materials

### Official Documentation

**React:**
- [React Documentation](https://react.dev/) - Official docs (new beta site)
- [React Tutorial](https://react.dev/learn) - Interactive tutorial
- [React API Reference](https://react.dev/reference/react) - Hook and component reference

**TypeScript:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Official guide
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/) - Quick reference

**Tailwind CSS:**
- [Tailwind Documentation](https://tailwindcss.com/docs) - Complete class reference
- [Tailwind Playground](https://play.tailwindcss.com/) - Test Tailwind online
- [Tailwind UI](https://tailwindui.com/) - Component examples

**Zustand:**
- [Zustand Docs](https://github.com/pmndrs/zustand) - State management
- [Zustand DevTools](https://github.com/pmndrs/zustand#devtools) - Debug state

**Framer Motion:**
- [Framer Motion Docs](https://www.framer.com/motion/) - Animation library
- [Framer Motion Examples](https://www.framer.com/motion/examples/) - Gallery

### Video Tutorials

**React Basics:**
- [React Course for Beginners](https://www.youtube.com/watch?v=bMknfKXIFA8) - FreeCodeCamp (12 hours)
- [React Tutorial](https://www.youtube.com/watch?v=SqcY0GlETPk) - Programming with Mosh (1 hour)

**Project Tutorials:**
- [Build a Shopping Cart](https://www.youtube.com/watch?v=lATafp15HWA) - Web Dev Simplified
- [React E-Commerce](https://www.youtube.com/watch?v=377AQ0y6LPA) - JavaScript Mastery

**Tailwind CSS:**
- [Tailwind Crash Course](https://www.youtube.com/watch?v=UBOj6rqRUME) - Traversy Media
- [Tailwind Tutorial](https://www.youtube.com/watch?v=pfaSUYaSgRo) - Net Ninja

### Interactive Learning

**Platforms:**
- [Codecademy - Learn React](https://www.codecademy.com/learn/react-101)
- [Scrimba - Learn React](https://scrimba.com/learn/learnreact)
- [React Challenge](https://react-challenge.vercel.app/) - Practice exercises

**Playgrounds:**
- [CodeSandbox](https://codesandbox.io/) - Online editor
- [StackBlitz](https://stackblitz.com/) - Online IDE
- [TypeScript Playground](https://www.typescriptlang.org/play) - Test TypeScript

### Communities

**Discord:**
- [Reactiflux](https://www.reactiflux.com/) - React community
- [Tailwind CSS Discord](https://discord.gg/tailwindcss)

**Reddit:**
- [r/reactjs](https://www.reddit.com/r/reactjs/)
- [r/webdev](https://www.reddit.com/r/webdev/)

**Forums:**
- [Stack Overflow - React Tag](https://stackoverflow.com/questions/tagged/reactjs)
- [Dev.to - React](https://dev.to/t/react)

### Code Examples & Inspiration

**Component Libraries:**
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [Headless UI](https://headlessui.com/) - Unstyled components
- [Radix UI](https://www.radix-ui.com/) - Accessible primitives

**Design Systems:**
- [Tailwind UI](https://tailwindui.com/) - Professional components
- [Material UI](https://mui.com/) - Google's Material Design
- [Chakra UI](https://chakra-ui.com/) - Modular components

**Real Projects to Study:**
- [GitHub - React Projects](https://github.com/topics/react-project)
- [Frontend Mentor](https://www.frontendmentor.io/) - Design challenges

### Books

**Beginner:**
- "Learning React" by Alex Banks & Eve Porcello
- "React Explained" by Zac Gordon

**Intermediate:**
- "React Design Patterns and Best Practices" by Michele Bertoli
- "Full-Stack React" by Anthony Accomazzo

### Blogs & Newsletters

**Blogs:**
- [Dan Abramov's Blog](https://overreacted.io/) - React core team
- [Kent C. Dodds Blog](https://kentcdodds.com/blog) - React expert
- [Josh Comeau](https://www.joshwcomeau.com/) - CSS and React

**Newsletters:**
- [React Status](https://react.statuscode.com/) - Weekly React news
- [This Week in React](https://thisweekinreact.com/) - Curated articles

---

## Quick Reference: Component Checklist

### Header Component
- [x] Props: `logo`, `navItems`
- [x] Features: Logo (left), navigation (right), responsive
- [x] Styling: Flexbox, sticky optional
- [x] Icons: Lucide React

### LookCarousel Component
- [x] Props: `looks`, `onSelectLook`
- [x] Features: 3 visible items, transform-based sliding
- [x] Navigation: Arrow buttons, pagination dots
- [x] State: `activeIndex`
- [x] Animation: CSS transitions (500ms ease-out)

### LookCard Component
- [x] Props: `look`, `isActive`, `onClick`
- [x] States: Active (scale 1.0, full opacity), Inactive (scale 0.9, reduced opacity)
- [x] Layout: Title, image (3:4 ratio), brand, price
- [x] Styling: Conditional classes, transitions

### ItemGrid Component
- [x] Props: `items`, `onItemClick`, `onAddToQueue`
- [x] Features: Responsive grid, "Fit all" button
- [x] Grid: 2 cols (mobile), 3 cols (tablet), 4 cols (desktop)
- [x] Container: White background, rounded corners

### ItemCard Component
- [x] Props: `item`, `onAddToQueue`, `onClick`
- [x] Features: Image, "+" button, brand, price
- [x] Interactions: Click image → modal, Click "+" → add to queue
- [x] Styling: Hover effects, square aspect ratio

### AIChatBubble Component
- [x] Props: `message`, `avatarSrc`
- [x] Layout: Avatar (left), message bubble (right)
- [x] Styling: Rounded corners, shadow, no top-left radius

### FittingRoomQueue Component
- [x] Props: `items`, `onRemoveItem`
- [x] States: Empty (dashed box), Filled (item list)
- [x] Features: Sticky sidebar, gradient background
- [x] Items: Thumbnail, name, price, remove button

### ProductDetailModal Component
- [x] Props: `item`, `isOpen`, `onClose`, `onAddToQueue`
- [x] Layout: Image gallery (left), info (right)
- [x] Features: Close button, ESC key, click outside
- [x] Interactions: Select size, choose color, add to queue
- [x] Accessibility: Focus trap, body scroll lock, ARIA labels

---

## Development Workflow Checklist

### Initial Setup
- [ ] Create React app (CRA or Vite)
- [ ] Install dependencies (Tailwind, Lucide, Router)
- [ ] Configure Tailwind (colors, gradients)
- [ ] Set up project structure (folders)

### Define Data
- [ ] Create TypeScript interfaces
- [ ] Create mock data
- [ ] Create utility functions

### Build Layout
- [ ] Create MainLayout component
- [ ] Create Header component
- [ ] Create Sidebar structure

### Build Core Features
- [ ] Build LookCarousel with navigation
- [ ] Build LookCard with states
- [ ] Build CarouselDots
- [ ] Build ItemGrid
- [ ] Build ItemCard with interactions
- [ ] Build FittingRoomQueue
- [ ] Build QueueItem

### State Management
- [ ] Set up Zustand store
- [ ] Implement add/remove logic
- [ ] Test state persistence

### Modals & Interactions
- [ ] Build ProductDetailModal
- [ ] Implement keyboard support (ESC)
- [ ] Implement click outside to close
- [ ] Lock body scroll when open

### Polish & Testing
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test responsive design
- [ ] Test accessibility
- [ ] Add animations
- [ ] Optimize performance

### Deployment
- [ ] Build for production
- [ ] Test production build
- [ ] Deploy to hosting (Vercel, Netlify, etc.)

---

## Next Steps

### Once You've Built the Basics:

1. **Add Real API Integration**
   - Replace mock data with API calls
   - Implement loading and error states
   - Add pagination for large datasets

2. **Enhance User Experience**
   - Add item favoriting
   - Implement search and filtering
   - Add shopping cart functionality
   - Create user authentication

3. **Improve Performance**
   - Implement image lazy loading
   - Add route-based code splitting
   - Optimize re-renders with React.memo

4. **Add Advanced Features**
   - Multi-image gallery in modal
   - Product comparison
   - Share wishlist functionality
   - Email notifications

5. **Testing**
   - Write unit tests (Jest)
   - Write integration tests (React Testing Library)
   - Add E2E tests (Cypress or Playwright)

6. **Deploy**
   - Set up CI/CD pipeline
   - Deploy to Vercel, Netlify, or AWS
   - Set up analytics and monitoring

---

## Conclusion

You now have a complete guide to building the Eggora Fashion Dashboard! Remember:

**Learning Tips:**
- Build one component at a time
- Test frequently as you go
- Use console.log liberally while learning
- Read error messages carefully
- Google errors - you're not the first to encounter them
- Ask questions in communities (Stack Overflow, Discord)

**Best Practices:**
- Write clean, readable code
- Add comments for complex logic
- Use TypeScript for type safety
- Follow accessibility guidelines
- Test on different devices
- Commit code frequently (Git)

**When You Get Stuck:**
1. Read the error message
2. Check component props and state
3. Use React DevTools
4. Console.log key values
5. Search error message online
6. Ask for help with specific questions

**Remember:** Everyone was a beginner once. Take it step by step, and you'll build amazing things!

Happy coding! 🚀
