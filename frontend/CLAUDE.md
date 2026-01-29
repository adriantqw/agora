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
5. ✅ `src/pages/JourneysPage.jsx` - Saved journeys listing and management
6. ✅ `src/pages/InventoryPage.jsx` - Consumer wishlist and saved items (requires auth)
7. ✅ `src/pages/SharedWishlistPage.jsx` - Shared wishlist view (public with token)
8. ✅ `src/pages/FittingRoomPage.jsx` - Virtual fitting room
9. ✅ `src/pages/BrowsePage.jsx` - Browse products by category
10. ✅ `src/pages/SearchResultsPage.jsx` - Product search results
11. ✅ `src/pages/QuizPage.jsx` - Shopping quiz

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

## Consumer Homepage Design

**Journey-Based Architecture:**
The consumer homepage follows a journey-centric design pattern:
- **Hero Section**: AI-powered search with typewriter placeholder effect
- **Journey Sections**: Three pre-curated journeys (Valentine's Day, Office Edit, Girls' Night Out)
- **Outfit Cards**: 4 cards per journey with 3:4 aspect ratio, hover effects
- **AI Integration**: FAB (floating action button) for future AI chat functionality

**Key Components:**
- `JourneyHero`: Search bar with animated typewriter placeholders, status pills
- `JourneySection`: Grid of outfit cards with journey title and status badge
- `OutfitCard`: Product card with icon placeholder, AI Pick badge, price, add button
- `Header` (journey variant): Navigation buttons (Journeys, My Inventory, Account) with Lucide icons
- `Mascot` (fab variant): Simple 60px circular button with Sparkles icon
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
  pages/ (16 pages total)
    # Consumer Pages
    ConsumerLandingPage.jsx    # Journey-based homepage with AI stylist
    ConsumerLoginPage.jsx      # Consumer authentication
    ConsumerProfilePage.jsx    # User profile management
    ShoppingConciergePage.jsx  # Chat-based AI styling
    JourneysPage.jsx          # Saved journeys management
    InventoryPage.jsx         # Wishlist and saved items
    FittingRoomPage.jsx       # Virtual fitting room
    BrowsePage.jsx            # Browse by category
    SearchResultsPage.jsx     # Search results
    QuizPage.jsx              # Shopping quiz
    SharedWishlistPage.jsx    # Shared wishlist view

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
      JourneyHero/            # Hero section with AI search
      JourneySection/         # Journey section with outfit cards
      OutfitCard/             # Individual outfit card
    common/
      Header/                 # Header with variants (landing, journey, full, compact)
      Mascot/                 # Mascot with variants (default, fab)
      SearchBar/              # Reusable search bar
      ShareModal/             # Share wishlist modal
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

  services/ (9 services)
    productService.js         # Merchant inventory CRUD
    authService.js            # Merchant authentication
    consumerAuthService.js    # Consumer authentication
    conciergeService.js       # Shopping concierge logic
    journeyService.js         # Journey management
    quizService.js            # Quiz logic
    fittingRoomService.js     # Virtual fitting room
    mockPDFService.js         # PDF handling
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
- `/shared-wishlist/:id` - SharedWishlistPage (view shared wishlist)
- `/journey` - ShoppingConciergePage (chat-based AI styling)
- `/fitting-room` - FittingRoomPage (virtual fitting room)
- `/browse` - BrowsePage (browse products by category)
- `/browse/:category` - BrowsePage with category filter
- `/search` - SearchResultsPage (search results)
- `/quiz` - QuizPage (shopping quiz)

**Protected Consumer Routes (requires authentication):**
- `/profile` - ConsumerProfilePage (user profile, requires auth)
- `/journeys` - JourneysPage (saved journeys list, requires auth)
- `/inventory` - InventoryPage (wishlist, requires auth)

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
- ⚠️ Uncommitted changes on `misc-pages` branch (wishlist, orders, settings pages)

**Current Branch:** `misc-pages` (active development)
- Recent work: Consumer profile, wishlist, shared wishlist, orders page
- New components: ShareModal, SearchContext
- Theme system enhancements with dark/light mode toggle

## Recent Updates & Progress

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

**Catalogue Ingestion UI (HIGH PRIORITY):**
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

**Infrastructure:**
- Set up CI/CD pipeline (GitHub Actions)
- Configure production environment variables
- Implement error tracking (Sentry)
- Add performance monitoring (Web Vitals)
