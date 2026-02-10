# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is the **Agora MerchantHub** - a hybrid merchant inventory + consumer shopping platform with AI-powered styling, built with React + Vite.

**Current State:**
- ✅ Vite project scaffolded with React 18
- ✅ All merchant pages implemented (Login, Home, Inventory, Bulk Import, Orders)
- ✅ Product inventory management (CRUD, bulk import, bulk delete)
- ✅ AI product tagging (dummy implementation)
- ✅ Consumer authentication system (login, profile, session management)
- ✅ Shopping concierge with chat interface
- ✅ Saved journeys management
- ✅ Consumer wishlist/inventory
- ✅ Share functionality for wishlists
- ✅ Chat-based journey creation with AI stylist
- ✅ Journey Quiz / Curate My Fit page with batch-based questions
- ✅ JourneyBuilder component suite (question cards, sidebar, mock data)
- ✅ Style Profile page with vibe/brand/color management
- ✅ Consumer orders, settings, wishlist, recommendations pages
- ✅ Growl notification system
- ✅ Modal components (ColorPicker, AddBrand, SelectVibe)
- ✅ Consumer purple theme system
- ✅ Responsive design with dark/light theme toggle
- ✅ React Router configured with dual authentication flow (merchant + consumer)
- ✅ Dependencies installed
- ✅ Docker configuration complete (development & production)
- ✅ Nginx with basic authentication configured
- ✅ Production deployment scripts ready
- 🔄 **Catalogue ingestion backend API available** (frontend UI not yet implemented)
- `merchant-frontend-overview.md` - Complete design specification (source of truth)
- `BACKEND_INTEGRATION.md` - Backend API integration guide
- `README.docker.md` - Docker setup and deployment guide

## Design Specification Reference

All UI/UX decisions must follow `merchant-frontend-overview.md`. Key specifications:

**Product Data Model:**
```typescript
interface Product {
  id: string;          // Auto-generated UUID
  name: string;        // Required, max 255 chars
  sku: string;         // Required, unique, read-only after creation
  price: number;       // Required, >= 0, 2 decimal places
  quantity: number;    // Required, >= 0, integer
  tags: string[];      // Optional
  image: string;       // Optional, URL
  description: string; // Optional, max 2000 chars
}
```

**Implemented Screens:**

**Consumer Pages:**
1. ✅ `src/pages/ConsumerLandingPage.jsx` - Journey-based consumer homepage with AI stylist (public)
2. ✅ `src/pages/ConsumerLoginPage.jsx` - Consumer authentication with email/password
3. ✅ `src/pages/ConsumerProfilePage.jsx` - User profile management (requires auth)
4. ✅ `src/pages/ShoppingConciergePage.jsx` - Chat-based AI styling interface
5. ✅ `src/pages/CurateMyLookPage.jsx` - Journey quiz with batch-based questions (public)
6. ✅ `src/pages/StyleProfilePage.jsx` - Style profile management with vibe/brand/color
7. ✅ `src/pages/JourneysPage.jsx` - Saved journeys listing and management
8. ✅ `src/pages/WishlistPage.jsx` - Consumer wishlist (replaces InventoryPage, requires auth)
9. ✅ `src/pages/SharedWishlistPage.jsx` - Shared wishlist view (public with token)
10. ✅ `src/pages/ConsumerSettingsPage.jsx` - Account settings (requires auth)
11. ✅ `src/pages/ConsumerOrdersPage.jsx` - Order history (requires auth)
12. ✅ `src/pages/RecommendationPage.jsx` - Personalized recommendations
13. ✅ `src/pages/FittingRoomPage.jsx` - Virtual fitting room
14. ✅ `src/pages/BrowsePage.jsx` - Browse products by category
15. ✅ `src/pages/SearchResultsPage.jsx` - Product search results
16. ✅ `src/pages/QuizPage.jsx` - Shopping quiz

**Merchant Pages:**
12. ✅ `src/pages/MerchantLoginPage.jsx` - Merchant login with demo credentials
13. ✅ `src/pages/MerchantHomePage.jsx` - Dashboard home with metrics and quick actions
14. ✅ `src/pages/MerchantDashboardPage.jsx` - Inventory list with search, filter, sort, pagination, and full-page edit view
15. ✅ `src/pages/MerchantBulkImportPage.jsx` - 4-step import wizard with AI tagging on success step
16. ✅ `src/pages/MerchantOrdersPage.jsx` - Order management dashboard

**Dialogs & Components:**
17. ✅ Bulk Delete Confirmation Dialog (in Dashboard)
18. ✅ AI Tagging Dialog (in Dashboard) - Shows suggested tags with apply functionality
19. ✅ Share Modal - Share wishlist functionality
20. ✅ Growl Notification System - Toast notifications with auto-dismiss
21. ✅ ColorPickerModal - Color palette editor
22. ✅ AddBrandModal - Brand management
23. ✅ SelectVibeModal - Aesthetic selection

**Key Constraints:**
- No single item add (bulk import only)
- No individual delete (bulk delete only)
- SKU is read-only after creation
- Selection resets on page navigation (POC simplicity)
- Bulk delete capped at 100 items

## Styling Patterns

From `merchant-login-page.jsx`, the established design system uses:

**Colors:**
- Primary blue: `#4299e1`, `#63b3ed`, `#3182ce`
- Dark background: `#1a2b4a`, `#0f1a2e`
- Gray scale: `#1a202c`, `#4a5568`, `#718096`, `#a0aec0`, `#e2e8f0`
- Error red: `#c53030`, `#feb2b2`, `#fff5f5`
- AI feature purple: `#667eea`, `#764ba2` (gradient for AI-related features)

**Typography:**
- Font family: "Source Sans 3" (Google Fonts)
- Headings: 28-32px, weight 700
- Body: 14-15px, weight 400-500
- Labels: 13px uppercase, weight 600

**Components:**
- Border radius: 8-10px
- Inputs: 2px border, `#e2e8f0` default, `#63b3ed` on focus
- Buttons: Gradient backgrounds, box-shadow on enabled state
- Inline styles (no CSS framework currently)

**Consumer Homepage Colors (Journey-Based Design):**
- Egg pink: `#ffb7c5`, `#ff9fb0` (primary accent for AI features and CTAs)
- Pink gradients for hero sections and interactive elements
- Inter font family for consumer-facing pages
- Icons from lucide-react package

**Consumer Purple Theme (Journey Quiz & Style Profile):**
- Consumer purple: `#793DB0` (light mode), `#a78bfa` (dark mode)
- Consumer purple light: `#F3E5F5` (backgrounds)
- Consumer gradient: `linear-gradient(135deg, #793DB0, #9F6AD6)`
- User answer gradient: `linear-gradient(135deg, #667eea, #e53e3e)` (confirmation UI)
- Used in: CurateMyLookPage, StyleProfilePage, JourneyBuilder components

## Consumer Homepage Design

**Journey-Based Architecture:**
The consumer homepage follows a journey-centric design pattern:
- **Hero Section**: AI-powered search with typewriter placeholder effect
- **Journey Sections**: Three pre-curated journeys (Valentine's Day, Office Edit, Girls' Night Out)
- **Outfit Cards**: 4 cards per journey with 3:4 aspect ratio, hover effects
- **AI Integration**: FAB (floating action button) for future AI chat functionality

**Search Bar Features:**
- **Auto-Expanding Textarea**: Grows from 24px (1 line) → 48px (2 lines) → 72px (3 lines), then scrolls
  - Container controls height with 0.15s ease transition
  - Textarea fills container with `height: 100%`
  - Shrinks back when text is deleted
- **Multiple Image Upload**: Support for up to 5 images
  - Image previews displayed at top of search form (80×80px thumbnails)
  - Individual remove buttons (× icon) on each thumbnail
  - ImagePlus icon button for uploads (disables at max capacity)
  - Accepts JPEG, PNG, WEBP formats (5MB max per file)
  - Dynamic padding: shifts from 220px to 140px top padding when images added
- **Form Submission**: Navigate to `/journey` with query text and images array
- **Glassmorphism Container**: Backdrop blur, white overlay, rounded corners

**Key Components:**
- `JourneyHero`: Search bar with animated typewriter placeholders, status pills
- `JourneySection`: Grid of outfit cards with journey title and status badge
- `OutfitCard`: Product card with icon placeholder, AI Pick badge, price, add button
- `Header` (journey variant): Navigation buttons (Journeys, My Inventory, Account) with Lucide icons
- `Mascot`: Three variants with interactive messaging
  - `variant="default"` - Full character with speech bubble (main pages)
  - `variant="avatar"` - 40px icon for sidebars and compact spaces
  - `variant="fab"` - 60px floating action button with Sparkles icon
  - Props: `message` (dynamic text), `onClick` (interactivity), `isSearching` (animation state)
- `ShareModal`: Wishlist sharing modal with copy link functionality

**Chat Interface Components:**
- `ChatFeed`: Scrollable message feed with auto-scroll to latest
- `AIMessage`: Left-aligned white bubbles with title/description/content
- `UserMessage`: Right-aligned dark message bubbles
- `AIAvatar`: 40px egg pink avatar with Sparkles icon
- `StyleCard`: Interactive aesthetic selection cards with hover effects
- `SummaryPanel`: Right sidebar (1/3 width) with journey context, scrollable content, fixed action buttons

**Responsive Breakpoints:**
- Desktop (>1280px): 4-column outfit grid
- Tablet (768-1024px): 2-column outfit grid
- Mobile (<768px): 1-column outfit grid, icon-only navigation

## Journey Quiz / Curate My Fit Architecture

**Page Overview:**
The Journey Quiz (Curate My Fit) is a structured form-based interface for collecting user preferences to create personalized shopping journeys. It replaces the conversational flow with a batch-based progression model.

- **Route:** `/curate-my-fit` (public)
- **Layout:** Two-column (2/3 questions + 1/3 summary sidebar)
- **Pattern:** Batch-based question cards with confirmation flow
- **Theme:** Consumer purple (`#793DB0`)
- **Entry Point:** ConsumerLandingPage search submission

**Architecture Diagram:**
```
ConsumerLandingPage (search query + images)
    ↓
/curate-my-fit
    ├─ Batch 1: Foundations (6 questions)
    │   ├─ Location (hybrid-select)
    │   ├─ Style (multi-select)
    │   ├─ Age Range (dual-range)
    │   ├─ Top Size (single-choice)
    │   ├─ Bottom Size (single-choice)
    │   └─ Shoe Size (single-choice)
    │   └─ Confirms → Scrolls to Batch 2
    ├─ Batch 2: Personal Style (3 questions)
    │   ├─ Budget (dual-range)
    │   ├─ Colors (multi-select)
    │   └─ Key Pieces (free-text)
    │   └─ Confirms → Enable "Let's Goooo!"
    └─ Sidebar: Live journey summary
        ├─ Editable title
        ├─ Foundation pills
        └─ Style narrative
```

**JourneyBuilder Components:**

1. **JourneyQuestionCard** (`src/components/consumer/JourneyBuilder/JourneyQuestionCard.jsx`, 387 lines)
   - Renders individual question cards with type-specific UI
   - Supports 6 question types
   - Answer validation and confirmation logic
   - Purple-themed user bubbles after confirmation

2. **JourneyBuilderSidebar** (`src/components/consumer/JourneyBuilder/JourneyBuilderSidebar.jsx`, 269 lines)
   - Right sidebar (1/3 width) with journey context
   - Editable journey title with inline editor
   - Foundation pills (location, style, age, sizing)
   - Style narrative with template substitution
   - Scrollable content + fixed action buttons

3. **journeyBuilderMock.js** (`src/components/consumer/JourneyBuilder/journeyBuilderMock.js`)
   - API mock layer for development
   - Maps to backend response schema
   - Methods: `fetchJourneyQuestions()`, `submitJourneyAnswers()`

4. **mockCurateMyLookResponse.js** (`src/data/mockCurateMyLookResponse.js`)
   - Backend response schema with 2 batches
   - Question definitions with validation rules
   - Option arrays with icons and metadata

**Question Types:**

| Type | UI | Answer Shape | Validation |
|------|----|--------------| -----------|
| `multi-select` | Chip grid (multiple selection) | `{ questionId, selectedOptions: string[], timestamp }` | Min/max selection count |
| `single-choice` | Chip grid (radio-style) | `{ questionId, selectedOptions: [string], timestamp }` | Exactly 1 selection |
| `hybrid-select` | Chips OR free text input | `{ questionId, selectedOptions?: string[], freeText?: string, timestamp }` | At least one field |
| `scale-rating` | Slider with optional chips | `{ questionId, value: number, selectedOptions?: string[], timestamp }` | Value within range |
| `free-text` | Text input field | `{ questionId, freeText: string, timestamp }` | Required field check |
| `dual-range` | Min/max range selector | `{ questionId, minValue: number, maxValue: number, timestamp }` | Min < max, within bounds |

**Question Type Details:**

**multi-select:**
```javascript
// Example: Style preferences
{
  id: "style",
  type: "multi-select",
  text: "What styles resonate with you?",
  options: [
    { value: "casual", label: "Casual", icon: "Shirt" },
    { value: "formal", label: "Formal", icon: "Briefcase" }
  ],
  validation: { minSelections: 1, maxSelections: 3 }
}
```

**single-choice:**
```javascript
// Example: Top size
{
  id: "top_size",
  type: "single-choice",
  text: "What's your top size?",
  options: [
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" }
  ]
}
```

**hybrid-select:**
```javascript
// Example: Location
{
  id: "location",
  type: "hybrid-select",
  text: "Where are you shopping from?",
  options: [
    { value: "nyc", label: "New York" },
    { value: "la", label: "Los Angeles" }
  ],
  allowFreeText: true,
  placeholder: "Or type your city..."
}
```

**scale-rating:**
```javascript
// Example: Comfort level
{
  id: "comfort",
  type: "scale-rating",
  text: "How important is comfort?",
  min: 0,
  max: 10,
  step: 1,
  defaultValue: 5,
  showLabels: true,
  minLabel: "Not Important",
  maxLabel: "Very Important"
}
```

**free-text:**
```javascript
// Example: Key pieces
{
  id: "key_pieces",
  type: "free-text",
  text: "Any specific pieces you're looking for?",
  placeholder: "E.g., leather jacket, midi dress...",
  maxLength: 200
}
```

**dual-range:**
```javascript
// Example: Budget
{
  id: "budget",
  type: "dual-range",
  text: "What's your budget range?",
  min: 0,
  max: 1000,
  step: 50,
  minGap: 50,
  prefix: "$",
  defaultMinValue: 100,
  defaultMaxValue: 500
}
```

**Answer Validation:**

Each question type has specific validation logic in `JourneyQuestionCard`:

```javascript
const validateAnswer = (question, answer) => {
  switch (question.type) {
    case 'multi-select':
      const { minSelections = 1, maxSelections } = question.validation || {};
      const count = answer.selectedOptions?.length || 0;
      return count >= minSelections && (!maxSelections || count <= maxSelections);

    case 'single-choice':
      return answer.selectedOptions?.length === 1;

    case 'hybrid-select':
      return answer.selectedOptions?.length > 0 || answer.freeText?.trim();

    case 'scale-rating':
      return typeof answer.value === 'number';

    case 'free-text':
      return answer.freeText?.trim().length > 0;

    case 'dual-range':
      return answer.minValue < answer.maxValue;

    default:
      return false;
  }
};
```

**Summary System:**

The sidebar displays a real-time summary computed from user answers using declarative source extraction:

**Source Extraction Strategies:**
```javascript
const extractSource = (question, answer) => {
  // Strategy 1: Selected labels
  if (answer.selectedOptions?.length > 0) {
    return answer.selectedOptions
      .map(val => question.options.find(opt => opt.value === val)?.label)
      .filter(Boolean)
      .join(', ');
  }

  // Strategy 2: First label
  if (answer.selectedOptions?.length === 1) {
    const option = question.options.find(opt => opt.value === answer.selectedOptions[0]);
    return option?.label;
  }

  // Strategy 3: Free text
  if (answer.freeText) {
    return answer.freeText;
  }

  // Strategy 4: Numeric value
  if (typeof answer.value === 'number') {
    return answer.value.toString();
  }

  // Strategy 5: Range (dual-range)
  if (answer.minValue !== undefined && answer.maxValue !== undefined) {
    return `$${answer.minValue} - $${answer.maxValue}`;
  }

  return null;
};
```

**Summary Sections:**

1. **Journey Title** - Computed from style + occasion
   - Template: `"${style} ${occasion} Journey"`
   - Example: "Casual Valentine's Day Journey"
   - Editable via pencil icon

2. **Foundation Pills** - Key facts displayed as chips
   - Location (from hybrid-select or free-text)
   - Style (from multi-select, comma-separated)
   - Age Range (from dual-range)
   - Sizing (combined from top/bottom/shoe sizes)

3. **Style Narrative** - Paragraph with template substitution
   - Uses answer sources to fill in blanks
   - Example: "Shopping from {location} for a {style} look. Budget: {budget}."

**Batch Confirmation Flow:**

```javascript
// State management
const [confirmedBatches, setConfirmedBatches] = useState(new Set());

// Validation
const isBatchComplete = (batch) => {
  return batch.questions.every(q => {
    const answer = answers[q.id];
    return answer && validateAnswer(q, answer);
  });
};

// Confirmation handler
const handleConfirmBatch = (batchNumber) => {
  setConfirmedBatches(prev => new Set([...prev, batchNumber]));

  // Scroll to next batch
  if (batchNumber < batches.length) {
    scrollToBatch(batchNumber + 1);
  }
};

// Enable final submit when all batches confirmed
const canSubmit = confirmedBatches.size === batches.length;
```

**Visual Design:**

- **Card Layout:** White cards with 16px padding, 12px border radius
- **Blurb Text:** Gradient purple text above cards (outside card container)
- **Chip Styling:** Rounded pills with purple border, filled on selection
- **User Bubbles:** Gradient background (`#667eea` → `#e53e3e`) after batch confirmation
- **Confirmation Button:** Purple gradient, appears at batch end when valid
- **Mascot Integration:** Avatar variant with interactive messaging

**Comparison with Shopping Concierge:**

| Feature | Shopping Concierge | Curate My Fit |
|---------|-------------------|---------------|
| **Pattern** | Chat bubbles | Form cards |
| **Flow** | Conversational, AI-driven | Structured batches, pre-defined |
| **Questions** | Dynamic, responsive | Fixed schema from backend |
| **Theme** | Egg pink (`#ffb7c5`) | Consumer purple (`#793DB0`) |
| **Layout** | 2/3 chat + 1/3 sidebar | 2/3 cards + 1/3 sidebar |
| **Entry** | From landing search | From landing search |
| **Route** | `/journey` | `/curate-my-fit` |
| **Use Case** | Open-ended styling | Structured preference collection |
| **Backend** | Real-time AI chat | Batch submit with validation |

**User Flow:**

1. User submits search query + images from ConsumerLandingPage
2. Navigate to `/curate-my-fit` with query/images passed via state
3. Load batches from `journeyBuilderMock.fetchJourneyQuestions()`
4. Display Batch 1 (Foundations) - 6 questions
5. User answers questions → Answers stored in state
6. User clicks "Confirm" when batch complete
7. Purple user bubble appears, scroll to Batch 2
8. Repeat for Batch 2 (Personal Style) - 3 questions
9. "Let's Goooo!" button enables when all batches confirmed
10. Submit answers to backend via `journeyBuilderMock.submitJourneyAnswers()`
11. Navigate to recommendations page with journey context

**Technical Implementation:**

**State Management:**
```javascript
const [batches, setBatches] = useState([]);
const [answers, setAnswers] = useState({});
const [confirmedBatches, setConfirmedBatches] = useState(new Set());
const [journeyTitle, setJourneyTitle] = useState("My Journey");
```

**Answer Storage:**
```javascript
const handleAnswerChange = (questionId, answer) => {
  setAnswers(prev => ({
    ...prev,
    [questionId]: {
      questionId,
      ...answer,
      timestamp: Date.now()
    }
  }));
};
```

**Summary Computation:**
```javascript
const computeSummary = () => {
  const location = extractSource(findQuestion('location'), answers['location']);
  const style = extractSource(findQuestion('style'), answers['style']);
  const budget = extractSource(findQuestion('budget'), answers['budget']);

  return {
    title: `${style} Journey` || "My Journey",
    foundations: { location, style, age: "...", sizing: "..." },
    narrative: `Shopping from ${location} for a ${style} look. Budget: ${budget}.`
  };
};
```

**Dual Range Slider Component:**

The `dual-range` question type renders a custom dual range slider inline:

- Two draggable handles for min/max values
- Dynamic track fill between handles
- Collision detection with configurable `minGap`
- Hover/active tooltips showing current values
- Synchronized input fields (80px width, 44px height, 22px border radius)
- Click-to-position on track
- Touch support for mobile
- GPU-accelerated transforms

See `wireframe/dual_range_slider.md` for complete HTML/CSS reference implementation.

**API Integration (Ready for Backend):**

```javascript
// Mock API (to be replaced with real endpoint)
export const journeyBuilderMock = {
  async fetchJourneyQuestions() {
    // Returns: { batches: [...], journeyId: string }
    return mockCurateMyLookResponse;
  },

  async submitJourneyAnswers(journeyId, answers) {
    // POST /api/journeys/:id/answers
    // Returns: { success: boolean, recommendationsUrl: string }
    return { success: true, recommendationsUrl: '/recommendations' };
  }
};
```

**Next Steps:**
- Replace `journeyBuilderMock` with real `/api/curate-my-fit` endpoint
- Implement dual-range slider component rendering (prepared, not yet active)
- Navigate to recommendations page with journey context
- Persist journey title changes to backend
- Add edit functionality for summary panel fields

## Consumer Authentication & Features

**Authentication System:**
- Email/password registration and login
- JWT token-based session management
- Profile management with editable fields
- Separate from merchant authentication (different tokens)
- Service: `consumerAuthService.js`
- Context: `AuthContext.jsx` (shared with merchant auth)

**Consumer Pages:**

1. **Consumer Login** (`ConsumerLoginPage.jsx`)
   - Email/password authentication
   - Session persistence with localStorage
   - Redirect to profile after successful login
   - Link to merchant login for vendors

2. **Consumer Profile** (`ConsumerProfilePage.jsx`)
   - User profile editing (name, email, preferences)
   - Saved payment methods
   - Order history view
   - Account settings
   - Requires authentication

3. **Saved Journeys** (`JourneysPage.jsx`)
   - List of all saved journeys
   - Journey status badges (active, completed, in-progress)
   - Edit journey details (rename, update preferences)
   - Delete journeys
   - Navigate to journey details

4. **Wishlist/Inventory** (`InventoryPage.jsx`)
   - Saved items and wishlist
   - Add/remove items
   - Share wishlist functionality
   - Price tracking
   - Stock availability

5. **Shared Wishlists** (`SharedWishlistPage.jsx`)
   - View shared wishlists via link
   - Read-only view for non-owners
   - Add items to own wishlist from shared list

## Navigation Pattern

Breadcrumb format: `Home / [Section] / [Detail]`
- Dashboard: `Home / Inventory`
- Edit View: `Home / Inventory / {Product Name}` (full-page view, not modal)
- Bulk Import: `Home / Inventory / Bulk Import`

## User Flows

**Inventory Management:**
- Click row (not checkbox) → Opens full-page edit view
- Click checkbox → Toggles selection
- "Delete Selected" button shows count, opens confirmation dialog

**Edit View (Full-Page):**
- Two-column layout: Image upload (left, 380px, sticky) + Form sections (right)
- Form sections: Basic Info, Pricing & Inventory, Tags & Categories, Description
- Breadcrumb navigation allows returning to dashboard
- SKU field is read-only (cannot be edited)
- Low stock warning when quantity < 20

**Bulk Import (4 steps):**
1. File upload (CSV only)
2. Preview with validation status per row
3. Confirmation summary
4. Results with success/skip counts + AI tagging option

**AI Product Tagging:**
- **Inventory Page Flow:**
  1. Select products using checkboxes
  2. Click "AI Tags" button in bulk actions bar (purple gradient)
  3. Loading state with spinner
  4. Dialog displays suggested tags per product
  5. User reviews suggestions and clicks "Apply Tags"
  6. Tags are merged with existing product tags (no duplicates)
  7. Success toast notification

- **Bulk Import Flow:**
  1. Complete import successfully (Step 4)
  2. Purple "AI-Powered Tagging" card appears
  3. Click "Generate AI Tags" button
  4. Loading state with spinner
  5. Inline display of generated tags per product
  6. Tags are displayed but not automatically applied (for review)

- **Styling:**
  - Purple gradient (`#667eea` to `#764ba2`) for all AI-related UI elements
  - Tag pills with rounded borders
  - Loading spinners for async operations
  - Modal dialogs for tag preview (inventory page)
  - Inline display for bulk import success

## Development Commands

### Local Development (npm)

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Docker Development

```bash
# Development mode with hot-reload (port 3000)
docker-compose up frontend-dev

# Production mode with nginx (port 8080)
docker-compose --profile production up frontend-prod

# Build and push to registry
./docker-deploy.sh
```

See `README.docker.md` for comprehensive Docker documentation.

## Project Structure

```
src/
  pages/ (22 pages total)
    # Consumer Pages
    ConsumerLandingPage.jsx    # Journey-based homepage with AI stylist
    ConsumerLoginPage.jsx      # Consumer authentication
    ConsumerProfilePage.jsx    # User profile management
    ShoppingConciergePage.jsx  # Chat-based AI styling
    CurateMyLookPage.jsx       # Journey quiz with batch-based questions ✨ NEW
    StyleProfilePage.jsx       # Style profile management ✨ NEW
    JourneysPage.jsx          # Saved journeys management
    WishlistPage.jsx          # Consumer wishlist ✨ NEW
    SharedWishlistPage.jsx    # Shared wishlist view
    ConsumerSettingsPage.jsx   # Account settings ✨ NEW
    ConsumerOrdersPage.jsx     # Order history ✨ NEW
    RecommendationPage.jsx     # Personalized recommendations ✨ NEW
    FittingRoomPage.jsx       # Virtual fitting room
    BrowsePage.jsx            # Browse by category
    SearchResultsPage.jsx     # Search results
    QuizPage.jsx              # Shopping quiz
    InventoryPage.jsx         # (DEPRECATED: use WishlistPage)

    # Merchant Pages
    MerchantLoginPage.jsx     # Merchant authentication
    MerchantHomePage.jsx      # Dashboard home with metrics
    MerchantDashboardPage.jsx # Inventory management
    MerchantBulkImportPage.jsx # Bulk import wizard
    MerchantOrdersPage.jsx    # Order management

  components/
    consumer/
      Chat/                   # Chat interface components
        ChatFeed/ChatFeed.jsx
        AIMessage/AIMessage.jsx
        UserMessage/UserMessage.jsx
        AIAvatar/AIAvatar.jsx
        StyleCard/StyleCard.jsx
        SummaryPanel/SummaryPanel.jsx
      JourneyBuilder/          # Journey quiz components ✨ NEW
        JourneyQuestionCard.jsx # 6 question types with validation
        JourneyBuilderSidebar.jsx # Real-time summary sidebar
        journeyBuilderMock.js  # API mock layer
      JourneyHero/            # Hero section with AI search
      JourneySection/         # Journey section with outfit cards
      OutfitCard/             # Individual outfit card
    common/
      Header/                 # Header with variants (landing, journey, full, compact)
      Mascot/                 # Mascot with variants (default, avatar, fab) ✨ ENHANCED
      SearchBar/              # Reusable search bar
      ShareModal/             # Share wishlist modal
      Growl/Growl.jsx        # Notification system ✨ NEW
      Modal.jsx               # Modal wrapper ✨ NEW
      ColorPickerModal.jsx    # Color picker ✨ NEW
      AddBrandModal.jsx       # Brand modal ✨ NEW
      SelectVibeModal.jsx     # Vibe selector ✨ NEW
    dynamic-forms/            # AI-driven question components
      QuestionRenderer.jsx
      ImageChoice.jsx, FreeText.jsx, MultiSelect.jsx
      ScaleRating.jsx, HybridSelect.jsx, ColorPalette.jsx
      ImageUpload.jsx, SingleChoice.jsx
      registry/ComponentRegistry.jsx
    fitting-room/             # Fitting room components (8 components)
    quiz/                     # Quiz components (3 components)
    home/                     # Home components (3 components)
    PDFPreviewTable.jsx       # PDF preview component
    ThemeToggle.jsx           # Dark/light theme toggle

  services/ (12 services)
    productService.js         # Merchant inventory CRUD
    authService.js            # Merchant authentication
    consumerAuthService.js    # Consumer authentication
    conciergeService.js       # Shopping concierge logic
    journeyService.js         # Journey management
    quizService.js            # Quiz logic
    fittingRoomService.js     # Virtual fitting room
    mockPDFService.js         # PDF handling
    styleProfileService.js    # Style profile CRUD ✨ NEW
    wishlistService.js        # Wishlist management ✨ NEW
    profileService.js         # User profile operations ✨ NEW
    api.js                    # API client base

  contexts/ (4 contexts)
    AuthContext.jsx           # Merchant auth context
    ThemeContext.jsx          # Theme switching (light/dark)
    FittingRoomContext.jsx    # Fitting room state
    SearchContext.jsx         # Global search state

  hooks/
    useThemeColors.js         # Centralized theme color hook

  data/
    mockJourneys.js           # Mock journey and outfit data
    guestMockData.js          # Guest user mock data
    mockCurateMyLookResponse.js # Journey quiz mock data ✨ NEW

  config/
    consumerTheme.js          # Consumer theme configuration
    styleGuide.js             # Style guide constants

  utils/
    iconMapper.js             # Icon mapping utilities
    styleHelpers.js           # Style helper functions

  App.jsx                     # Main app with routing & auth
  main.jsx                    # App entry point
  index.css                   # Global styles

wireframe/                     # Original wireframe components (reference)
  dual_range_slider.md        # Dual range slider reference ✨ NEW
public/                        # Static assets
  favicon.svg                  # SVG favicon (primary)
  favicon.png                  # PNG favicon fallback (32×32)
  apple-touch-icon.png         # Apple touch icon (180×180)
scripts/
  favicon-generator.html       # Tool to generate PNG favicons from SVG
BACKEND_INTEGRATION.md         # API integration requirements
```

**NOTE:** Duplicate `src/context/ThemeContext.jsx` exists - use only `src/contexts/ThemeContext.jsx` (cleanup needed)

## Branding & Assets

**Favicon:**
- Primary: SVG format with shopping bag icon and blue gradient (#4299e1 → #3182ce)
- Fallback: PNG versions for older browsers
- Apple touch icon: 180×180 for iOS devices
- Theme color: `#4299e1` (matches primary brand blue)

To regenerate PNG favicons:
1. Open `scripts/favicon-generator.html` in a browser
2. Download the generated PNG files
3. Save to `public/` directory

## Tech Stack

- **Build Tool:** Vite 6
- **Framework:** React 18.3
- **Routing:** React Router v6
- **Styling:** Inline styles (no CSS framework)
- **State Management:** Context API (Auth, Theme, Search, FittingRoom)
- **Icons:** lucide-react
- **Theme:** Light/dark mode with localStorage persistence
- **Auth:** JWT token-based authentication (separate for merchant + consumer)

## Routes

**Public Consumer Routes:**
- `/` - ConsumerLandingPage (journey-based homepage, public)
- `/login` - ConsumerLoginPage (consumer authentication)
- `/shared-wishlist/:token` - SharedWishlistPage (view shared wishlist)
- `/journey` - ShoppingConciergePage (chat-based AI styling)
- `/curate-my-fit` - CurateMyLookPage (journey quiz with batch questions) ✨ NEW
- `/style-profile` - StyleProfilePage (style profile management) ✨ NEW
- `/recommendations` - RecommendationPage (personalized recommendations) ✨ NEW
- `/fitting-room` - FittingRoomPage (virtual fitting room)
- `/browse` - BrowsePage (browse products by category)
- `/browse/:category` - BrowsePage with category filter
- `/search` - SearchResultsPage (search results)
- `/quiz` - QuizPage (shopping quiz)

**Protected Consumer Routes (requires authentication):**
- `/profile` - ConsumerProfilePage (user profile, requires auth)
- `/journeys` - JourneysPage (saved journeys list, requires auth)
- `/wishlist` - WishlistPage (consumer wishlist, requires auth) ✨ NEW
- `/settings` - ConsumerSettingsPage (account settings, requires auth) ✨ NEW
- `/orders` - ConsumerOrdersPage (order history, requires auth) ✨ NEW
- `/inventory` - InventoryPage (DEPRECATED: use /wishlist, requires auth)

**Merchant Routes:**
- `/merchant/login` - Merchant login (redirects to home if authenticated)
- `/merchant` - Merchant home page with dashboard metrics (requires authentication)
- `/merchant/inventory` - Inventory management (requires authentication)
- `/merchant/import` - Bulk import wizard (requires authentication)
- `/merchant/orders` - Order management (requires authentication)

## Deployment & Production

### Docker Setup

The project includes a complete Docker configuration for both development and production:

**Development:**
- Multi-stage Dockerfile with `development` target
- Hot module replacement (HMR) enabled
- Volume mounting for live code changes
- Runs on port 3000

**Production:**
- Multi-stage build with optimized nginx serving
- Gzip compression enabled
- Static asset caching (1 year for immutable assets)
- Security headers configured
- SPA routing fallback to index.html
- Basic HTTP authentication with `.htpasswd`
- Health check endpoint at `/health` (bypasses auth)
- Runs on port 80 (mapped to 8080 via docker-compose)

### Nginx Configuration

Located at `nginx.conf`, includes:
- Basic authentication with realm "Agora MerchantHub Access"
- Gzip compression for text assets
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Cache control for static assets
- SPA routing support
- Health check endpoint

### Deployment Script

`docker-deploy.sh` automates the build and deployment process:
- Builds production Docker image
- Tags with version and latest
- Pushes to container registry
- Configurable registry URL and image name

## Backend Integration

### API Connection

The frontend is designed to connect to a backend API. See `BACKEND_INTEGRATION.md` for:
- Complete API specification
- Authentication flow (JWT-based)
- Service architecture patterns
- Request/response formats
- Error handling guidelines

### Real-Time Features

**Server-Sent Events (SSE):**
- Use for one-way server-to-client streaming
- Recommended for: Bulk import progress tracking
- Browser EventSource API with automatic reconnection

**WebSocket:**
- Use for bidirectional real-time communication
- Recommended for: Real-time inventory updates, multi-user collaboration
- Custom WebSocketService class pattern (see BACKEND_INTEGRATION.md)

**Implementation Notes:**
- JWT token authentication for both SSE and WebSocket connections
- Automatic reconnection with exponential backoff
- Structured message protocol for different event types (INVENTORY_UPDATE, IMPORT_PROGRESS, NOTIFICATION)
- React hooks pattern for managing streaming connections

### Available Backend APIs (Not Yet Implemented in Frontend)

**Catalogue Ingestion API** (Added January 18, 2026):
The backend now provides AI-powered PDF catalogue extraction via 6 new endpoints:

1. `POST /api/catalogues/upload` - Upload PDF, extract items automatically
2. `GET /api/catalogues` - List uploaded catalogues with pagination
3. `GET /api/catalogues/{id}` - Get single catalogue details
4. `GET /api/catalogues/{id}/items` - Get extracted items (database staging area)
5. `POST /api/catalogues/{id}/create-products` - Convert selected items to products
6. `DELETE /api/catalogues/{id}` - Delete catalogue and cleanup storage

**Workflow:**
- Merchant uploads PDF catalogue → AI extracts items (name, description, sizes, colours, images)
- Items stored in database staging area for review (CSV-like structure)
- Merchant reviews items via API, selects which to convert
- Products created with merged tags from sizes + colours
- Items marked as converted after product creation

**Frontend Implementation TODO:**
- Add Catalogue Import page with PDF upload
- Display extracted items in table/grid for review
- Allow item selection and bulk product creation with price/quantity input
- Show extraction progress and status
- Display cropped item images from R2 storage

See backend CLAUDE.md for complete API specification and response formats.

## Demo Credentials

- **Email:** demo@merchant.com
- **Password:** Any password ≥6 characters

## Known Issues & Cleanup Tasks

**Code Organization:**
- ⚠️ Duplicate `ThemeContext.jsx` files exist in both `src/context/` and `src/contexts/` - remove the older `src/context/` version
- ⚠️ `InventoryPage.jsx` deprecated in favor of `WishlistPage.jsx` (cleanup needed)
- ⚠️ Modified files on `journey_quiz` branch: Mascot.jsx, JourneyBuilderSidebar.jsx, JourneyQuestionCard.jsx

**Current Branch:** `journey_quiz` (active development)
- Recent work: Journey quiz page, JourneyBuilder components, style profile, dual-range slider
- New pages: CurateMyLookPage, StyleProfilePage, WishlistPage, ConsumerSettingsPage, ConsumerOrdersPage, RecommendationPage
- New components: JourneyQuestionCard, JourneyBuilderSidebar, Growl, Modal suite, enhanced Mascot
- New services: styleProfileService, wishlistService, profileService
- Theme: Consumer purple system

**Previous Branch:** `misc-pages`
- Consumer profile, wishlist, shared wishlist, orders page
- ShareModal, SearchContext
- Theme system enhancements with dark/light mode toggle

## Recent Updates & Progress

### February 2, 2026

**Journey Quiz / Curate My Fit Feature (`journey_quiz` branch)**
- ✅ Implemented `CurateMyLookPage.jsx` with two-column batch-based layout (400 lines)
  - 2/3 width for question cards + 1/3 width for summary sidebar
  - Batch-based progression (Batch 1: Foundations, Batch 2: Personal Style)
  - Confirmation flow with user bubbles after each batch
  - Purple gradient theme (`#793DB0`)
  - Route: `/curate-my-fit` (public)
- ✅ Created `JourneyQuestionCard` component with 6 question types (387 lines)
  - `multi-select`: Chip grid with multiple selection
  - `single-choice`: Radio-style chip selection
  - `hybrid-select`: Chips OR free text input
  - `scale-rating`: Slider with optional discrete chips
  - `free-text`: Text input field
  - `dual-range`: Min/max range selector with dual handles
- ✅ Built `JourneyBuilderSidebar` with real-time summary computation (269 lines)
  - Editable journey title with inline pencil icon editor
  - Foundation pills (location, style, age, sizing)
  - Style narrative with template substitution
  - Scrollable content + fixed action buttons
- ✅ Implemented declarative answer validation and source extraction
  - Per-type validation logic (min/max selections, required fields)
  - Source extraction strategies (selectedLabels, firstLabel, freeText, value, range)
  - Real-time summary updates as user answers questions
- ✅ Added batch confirmation flow with user message bubbles
  - Gradient purple-to-red bubbles after batch confirmation
  - Scroll-to-batch behavior on confirmation
  - "Let's Goooo!" button enables when all batches confirmed
- ✅ Updated Mascot component with interactive messaging variants
  - `variant="avatar"` - 40px icon for sidebar
  - `variant="fab"` - 60px floating action button
  - `variant="default"` - Full character with speech bubble
  - `message` prop for dynamic text
  - `isSearching` animation state
- ✅ Integrated with ConsumerLandingPage (search query + images)
  - Form submission navigates to `/curate-my-fit` with state
  - Query and images passed to journey quiz
- ✅ Fixed blurb placement (gradient text above cards, not inside)
- ✅ Consumer purple theme system
  - CSS variables: `--consumer-purple`, `--consumer-purple-light`, `--consumer-gradient`
  - User answer gradient: `linear-gradient(135deg, #667eea, #e53e3e)`
  - Theme-aware styling for light/dark mode

**Dual Range Slider Component**
- ✅ Implemented `DualRangeSlider` sub-component in `JourneyQuestionCard.jsx`
- ✅ Supports question type `'dual-range'` for configurable min/max range selection
- ✅ Features:
  - Dual draggable handles with collision detection (configurable min gap)
  - Dynamic track fill between handles with purple theming
  - Hover/active tooltips showing current values
  - Synchronized min/max input fields (80px, 44px height, 22px border radius)
  - Click-to-position on track functionality
  - Mobile touch support with touch events
  - Smooth animations and GPU-accelerated transforms
- ✅ Configuration props:
  - `min` / `max` - Range boundaries (default: 0 / 100)
  - `step` - Step increment (default: 1)
  - `minGap` - Minimum gap between handles (default: step)
  - `prefix` - Display prefix (e.g., "$" for currency)
- ✅ Answer format: `{ questionId, minValue, maxValue, timestamp }`
- ✅ Updated mock budget question from `scale-rating` to `dual-range` in `mockCurateMyLookResponse.js`
- ✅ Budget range now displays as "$X - $Y" in journey context
- 📝 See `wireframe/dual_range_slider.md` for complete HTML/CSS reference implementation

**Style Profile & Consumer Pages**
- ✅ Implemented `StyleProfilePage.jsx` with vibe/brand/color management
  - Three-tab interface (Vibes, Brands, Colors)
  - Add/edit/delete functionality for each category
  - Visual cards with hover effects
  - Modal-based editing (SelectVibeModal, AddBrandModal, ColorPickerModal)
- ✅ Created `WishlistPage.jsx` replacing old InventoryPage
  - Product grid with wishlist items
  - Add/remove functionality
  - Share wishlist feature
  - Price tracking and stock availability
- ✅ Built `ConsumerSettingsPage.jsx` for account settings
  - Profile information editing
  - Notification preferences
  - Privacy settings
  - Account deletion
- ✅ Added `ConsumerOrdersPage.jsx` for order history
  - Order list with status filters
  - Order details with line items
  - Reorder functionality
- ✅ Implemented `RecommendationPage.jsx` for personalized recs
  - Product recommendations based on journey context
  - Filter and sort options
  - Add to wishlist functionality

**New Component Systems**
- ✅ Created Growl notification system with 4 types (`src/components/common/Growl/Growl.jsx`)
  - Types: success, error, warning, info
  - Auto-dismiss with configurable duration
  - Bottom-left positioning
  - Stacked queue management
  - Theme-aware styling
- ✅ Built modal component suite
  - `Modal.jsx` - Generic modal wrapper with overlay
  - `ColorPickerModal.jsx` - Color palette editor
  - `AddBrandModal.jsx` - Brand management dialog
  - `SelectVibeModal.jsx` - Aesthetic selection modal
- ✅ Enhanced Mascot with 3 variants and interactive messaging
  - Dynamic message prop for contextual text
  - onClick handler for interactivity
  - Animation support (isSearching state)
- ✅ Added icon mapping for foundation sections (`src/utils/iconMapper.js`)
  - Maps question IDs to Lucide icons
  - Used in JourneyBuilderSidebar for foundation pills

**Services & API Integration**
- ✅ Created `styleProfileService.js` for profile CRUD
  - `getStyleProfile()`, `updateVibes()`, `addBrand()`, `removeColor()`
  - Mock data layer ready for backend integration
- ✅ Implemented `wishlistService.js` for wishlist operations
  - `getWishlist()`, `addItem()`, `removeItem()`, `shareWishlist()`
  - Integration with backend wishlist endpoints
- ✅ Added `profileService.js` for user management
  - `getProfile()`, `updateProfile()`, `updateSettings()`
  - User preference management
- ✅ Created `journeyBuilderMock.js` as API mock layer
  - `fetchJourneyQuestions()` - Returns batches from mock data
  - `submitJourneyAnswers()` - Mock submit endpoint
  - Ready to replace with real `/api/curate-my-fit` endpoint

**Technical Implementation:**
- Batch-based state management with `Set` for confirmed batches
- Answer validation per question type with fallback logic
- Source extraction with multiple strategies (declarative pattern)
- Real-time summary computation with template substitution
- Scroll-to-batch behavior on confirmation (smooth scroll)
- Theme system with CSS variables for consumer purple palette
- Modal state management patterns with controlled components
- Growl notification queue system with auto-dismiss timers

**Architecture Highlights:**
```
CurateMyLookPage (400 lines)
├─ Batches from journeyBuilderMock
│   ├─ Batch 1: Foundations (6 questions)
│   └─ Batch 2: Personal Style (3 questions)
├─ JourneyQuestionCard (387 lines)
│   ├─ ChipRow per question type
│   ├─ Answer validation (per-type logic)
│   ├─ Confirmation button (appears when valid)
│   └─ DualRangeSlider sub-component
└─ JourneyBuilderSidebar (269 lines)
    ├─ Editable title (inline editor)
    ├─ Foundation pills (4 categories)
    ├─ Style narrative (template-based)
    └─ Action buttons (fixed at bottom)
```

**User Flow:**
```
ConsumerLandingPage (search query + images)
    ↓
/curate-my-fit
    ├─ Load batches via journeyBuilderMock.fetchJourneyQuestions()
    ├─ Display Batch 1 (6 questions)
    │   └─ User answers → Confirmation → User bubble
    ├─ Scroll to Batch 2 (3 questions)
    │   └─ User answers → Confirmation → User bubble
    ├─ "Let's Goooo!" button enables
    ├─ Submit via journeyBuilderMock.submitJourneyAnswers()
    └─ Navigate to /recommendations with journey context
```

**Next Phase - Backend Integration:**
- Replace `journeyBuilderMock.js` with real `/api/curate-my-fit` endpoint
- Implement GET `/api/curate-my-fit` for loading batches
- Implement POST `/api/curate-my-fit/answers` for submitting answers
- Persist journey title changes to backend
- Add edit functionality for summary panel fields (location, style, budget)
- Navigate to recommendations page with journey ID
- Multi-turn conversation flow integration

### January 29, 2026

**Consumer Authentication & Profile Management (misc-pages branch)**
- ✅ Implemented `ConsumerLoginPage.jsx` with email/password authentication
- ✅ Created `ConsumerProfilePage.jsx` for user profile management
- ✅ Added `consumerAuthService.js` for consumer auth flow
- ✅ Integrated consumer authentication with backend JWT tokens
- ✅ Separate consumer auth from merchant auth (different token storage)

**Consumer Wishlist & Sharing Features**
- ✅ Implemented `InventoryPage.jsx` for wishlist management
- ✅ Created `SharedWishlistPage.jsx` for viewing shared wishlists
- ✅ Added `ShareModal.jsx` component for wishlist sharing
- ✅ Wishlist persistence with backend API integration

**Merchant Orders Page**
- ✅ Implemented `MerchantOrdersPage.jsx` for order management
- ✅ Order list with status filters and search
- ✅ Order details view with line items
- ✅ Integration with backend orders API

**Saved Journeys Management**
- ✅ Implemented `JourneysPage.jsx` for saved journeys listing
- ✅ Journey cards with status badges
- ✅ Edit and delete journey functionality
- ✅ Navigate to journey details

**Search & Navigation Improvements**
- ✅ Created `SearchContext.jsx` for global search state
- ✅ Added `SearchBar` reusable component
- ✅ Implemented search results persistence across navigation

**Theme System Enhancement**
- ✅ Added dark/light theme toggle (`ThemeToggle.jsx`)
- ✅ Theme persistence with localStorage
- ✅ Unified theme context in `src/contexts/ThemeContext.jsx`
- ⚠️ Note: Older duplicate context file exists in `src/context/` (cleanup needed)

### January 30, 2026

**Consumer Landing Page Enhancements (misc-pages branch)**
- ✅ Implemented auto-expanding textarea for search input
  - Grows from 24px (1 line) → 48px (2 lines) → 72px (3 lines)
  - Enables vertical scroll when content exceeds 3 lines
  - Shrinks back when text is deleted (smooth 0.15s transition)
  - Container controls height, textarea fills with `height: 100%`
- ✅ Added multiple image upload support
  - Maximum 5 images per search query
  - Image previews displayed at top of search form (80×80px thumbnails)
  - Individual remove buttons (× icon) on each thumbnail
  - File validation: JPEG, PNG, WEBP formats (5MB max per file)
  - Smart capacity management with user feedback
- ✅ Updated upload button from Plus to ImagePlus icon
  - Disables and grays out when 5 images uploaded
  - Visual feedback with opacity and cursor changes
- ✅ Dynamic layout adjustment
  - Main padding shifts from 220px to 140px when images added
  - Prevents overlap with decorative floating bags at bottom
  - Smooth 0.3s transition between states
- ✅ Enhanced form submission
  - Navigates to `/journey` with search query and images array
  - Passes base64 encoded images to journey page

**Technical Implementation:**
- State management: `uploadedImages` array with unique IDs
- Each image object: `{ file, preview, id }`
- FileReader API for base64 preview generation
- Validation in `handleImageUpload` prevents exceeding max capacity
- Auto-resize logic in useEffect monitors `searchQuery` and `uploadedImages.length`

### January 8, 2026

**Production Deployment Setup (commits: 1a31cd6, 70e0eee, 665bab0)**
- ✅ Added comprehensive Docker configuration (Dockerfile, docker-compose.yml)
- ✅ Implemented multi-stage Docker builds (development & production targets)
- ✅ Configured nginx with basic HTTP authentication (.htpasswd)
- ✅ Added deployment automation script (docker-deploy.sh)
- ✅ Created Docker documentation (README.docker.md)
- ✅ Configured security headers and asset caching
- ✅ Added health check endpoint for monitoring

**Navigation & UX Improvements (commits: 185da6d, 51fad0e)**
- ✅ Created Merchant Home Page with business metrics dashboard
- ✅ Refactored routing structure:
  - `/merchant` now shows home page with metrics (was redirect)
  - `/merchant/inventory` renamed from `/merchant/dashboard` for clarity
- ✅ Fixed breadcrumb navigation to link back to merchant home
- ✅ Updated all page references to use new routing structure

**Backend Integration Planning**
- ✅ Defined streaming connection patterns (SSE & WebSocket)
- ✅ Documented real-time feature architecture
- ✅ Planned authentication flow for streaming connections

### January 11, 2026

**Product Inventory Management UI**
- ✅ Implemented full product inventory management interface
- ✅ Added product list with pagination, search, filter by tags, and sorting
- ✅ Created full-page edit view for products (two-column layout)
- ✅ Implemented bulk delete with confirmation dialog
- ✅ Added real-time inventory updates via productService API
- ✅ Created productService.js with all CRUD operations
- ✅ Integrated with backend product endpoints

**AI Product Tagging Feature (Dummy Implementation)**
- ✅ Added "AI Tags" button to inventory page bulk actions bar
- ✅ Implemented AI tagging dialog with suggested tags display
- ✅ Created tag application logic (merges with existing tags)
- ✅ Added AI tagging card to bulk import success step
- ✅ Implemented loading states and error handling
- ✅ Used purple gradient (`#667eea` to `#764ba2`) for AI-related UI
- ✅ Added `generateAITags()` method to productService
- ✅ Integrated with backend POST /api/products/ai-tags endpoint

**Key Features:**
- Select multiple products → Click "AI Tags" → Review suggestions → Apply
- Bulk import success → Click "Generate AI Tags" → View inline results
- Tags are merged with existing tags (no duplicates)
- Maximum 100 products per AI tagging request
- Loading spinners and success/error toast notifications

### January 18, 2026

**Backend: Catalogue Ingestion API Available**
- ✅ Backend implemented AI-powered PDF catalogue extraction
- ✅ 6 new API endpoints available for catalogue management
- ✅ Database staging area for item review (CSV-like structure)
- ✅ Automatic extraction of names, descriptions, sizes, colours, images
- ✅ Selective product creation from extracted items
- ✅ Tags automatically merged from sizes + colours
- 📝 Frontend UI not yet implemented

**Available for Frontend Integration:**
```javascript
// Example API usage (not yet implemented in frontend)
POST /api/catalogues/upload - Upload PDF
GET /api/catalogues/{id}/items - Get extracted items for review
POST /api/catalogues/{id}/create-products - Convert items to products
```

**Frontend Implementation Needed:**
- Catalogue import page with PDF upload UI
- Item review interface (table/grid view)
- Item selection and bulk product creation flow
- Price/quantity input for batch product creation
- Cropped item image display from R2 storage
- Extraction progress indicators

### January 25, 2026

**Shopping Concierge Chat Interface (Consumer Journey Flow)**
- ✅ Rebuilt `ShoppingConciergePage.jsx` from 3-step wizard to chat-based conversational interface
- ✅ Created modular Chat component architecture:
  - `AIAvatar` - 40px egg pink avatar with Sparkles icon
  - `UserMessage` - Right-aligned dark message bubbles
  - `AIMessage` - Left-aligned white bubbles with title/description
  - `StyleCard` - Interactive aesthetic selection cards
  - `SummaryPanel` - Right sidebar (responsive 1/3 width) with journey context, scrollable content, fixed action buttons
  - `ChatFeed` - Scrollable message feed with auto-scroll
- ✅ Updated `conciergeService.js` with conversation flow methods:
  - `getAestheticOptions()` - Returns 4 aesthetic choices
  - `extractOccasion(query)` - Keyword-based occasion detection
  - `extractLocation(query)` - Location/weather extraction
  - `generateConversationResponse(step)` - AI response generator
- ✅ Implemented split layout matching `wireframe/journey_v2.html` design
- ✅ Replaced STYLE_GUIDE with `useThemeColors` hook (egg pink palette)
- ✅ Added real-time journey context updates in summary panel
- ✅ Responsive design with mobile breakpoint (< 900px stacks vertically)
- ✅ Route changed from `/quiz` to `/journey` across all files
- ✅ Header component variants: `landing` (icon + text) vs `journey` (icon-only with search bar)
- ✅ Journey rename feature with inline edit popup
- ✅ Summary panel action buttons: "Save Journey" and "Return to Home"

**Current Implementation:**
- User submits query from landing page → Chat interface loads at `/journey`
- AI presents 4 aesthetic options (Romantic, Chic, Edgy, Boho)
- User selects aesthetic → User message bubble appears
- Journey context updates with occasion, weather (extracted from query)
- Status updates: "Creating Style Profile..." → "Building Your Journey..." → "Journey Complete!"
- Journey title can be renamed via pencil icon
- Header search bar allows adding new queries to chat

**Architecture:**
```
┌──────────────────────────────────────┬────────────┐
│         Chat Feed (Left)             │  Summary   │
│   - User messages (right-aligned)    │   Panel    │
│   - AI messages (left-aligned)       │  (Right)   │
│   - Interactive StyleCard grids      │  1/3 width │
│   - Header with search bar           │  Scrolls   │
│                                      │  + Fixed   │
│                                      │  Buttons   │
└──────────────────────────────────────┴────────────┘
```

**Next Phase - Full Conversation Flow:**
- Implement multi-step conversation (occasion → weather → budget → key pieces)
- Add edit functionality for summary panel fields (occasion, weather, budget)
- Navigate to results page with curated product recommendations
- Integrate with real AI backend service
- Persist journey context to database

See `IMPLEMENTATION_SUMMARY.md` for complete technical documentation.

### January 27, 2026

**AI-Powered Dynamic Forms (Hybrid Approach)**
- ✅ Implemented `src/components/dynamic-forms` architecture
- ✅ Created `QuestionRenderer` to map JSON schema to React components
- ✅ Built core component library: `ImageChoice`, `FreeText`, `MultiSelect`, `ScaleRating`, `HybridSelect`, `ColorPalette`, `ImageUpload`
- ✅ Established `StyleGuide` pattern for AI-to-UI contract
- ✅ Documented full specification in `DynamicForms.md`

**Key Architecture:**
- **Hybrid Model:** AI generates JSON data (questions/options), React renders pre-built components
- **Type Safety:** Strict TypeScript interfaces for Question/Option schemas (see `DynamicForms.md`)
- **Component Registry:** Maps string types (e.g., "image-choice") to React components

See `DynamicForms.md` for complete architectural details, schema definitions, and usage examples.

### Next Steps

**Journey Quiz - Backend Integration (HIGH PRIORITY):**
The Journey Quiz frontend is complete, ready for backend connection:
- Replace `journeyBuilderMock.js` with real `/api/curate-my-fit` endpoint
- Implement GET `/api/curate-my-fit` - Fetch batches and questions
- Implement POST `/api/curate-my-fit/answers` - Submit user answers
- Navigate to recommendations page with journey context
- Persist journey title changes to backend
- Add edit functionality for summary panel fields (location, style, budget)
- Multi-turn conversation flow integration
- Consider: Save journey as draft, resume incomplete journeys

**Dual-Range Component Enhancement:**
- Verify dual-range slider rendering in all contexts
- Add unit tests for handle collision detection
- Test touch events on mobile devices
- Add keyboard navigation support (arrow keys for handles)
- Consider accessibility improvements (ARIA labels, screen reader support)

**Style Profile Enhancements:**
- Vibe photo upload and management (image URLs or file uploads)
- Brand search and autocomplete (integration with brand database)
- Color palette themes (preset palettes vs custom colors)
- Style DNA strength calculation (based on selections)
- Integration with recommendation engine (use style profile for recs)
- Export/import style profile (JSON format for sharing)

**Catalogue Ingestion UI:**
Backend API is ready - frontend implementation needed:
- Create `src/pages/MerchantCatalogueImportPage.jsx`
- Add PDF file upload with drag-and-drop
- Display extraction progress/status
- Show extracted items in table with images
- Add item selection and bulk product creation form
- Integrate with catalogue API endpoints
- Add catalogue service to `src/services/catalogueService.js`
- Update navigation to include catalogue import link

**AI Product Tagging - Production Implementation:**
- Replace dummy implementation with actual AI service integration
- Add confidence scores for tag suggestions
- Implement user feedback mechanism for tag quality
- Add tag history and version tracking
- Consider implementing:
  - Auto-apply tags above certain confidence threshold
  - Manual tag editing before applying
  - Tag suggestions based on similar products
  - Batch processing for large imports

**Consumer Features - Recommendations & Results:**
- Build recommendations page UI (integrate with journey context)
- Product grid with filters (price, style, brand)
- Add to wishlist from recommendations
- Journey-based sorting (relevance to user answers)
- Share recommendations with friends
- Save journey for future reference

**Enhanced Features:**
- Product image upload and management (drag-and-drop, cropping)
- Advanced filtering (price range, stock levels, date ranges)
- Export functionality (CSV, Excel) for inventory reports
- Inventory analytics dashboard (sales trends, stock alerts)
- Product variants and SKU management

**Real-Time Features:**
- Implement SSE for bulk import progress streaming
- Add WebSocket service for real-time inventory updates
- Multi-user collaboration indicators
- Real-time journey collaboration (invite friends to journey)

**Infrastructure:**
- Set up CI/CD pipeline (GitHub Actions)
- Configure production environment variables
- Implement error tracking (Sentry)
- Add performance monitoring (Web Vitals)
- Add analytics tracking for journey completion rates
