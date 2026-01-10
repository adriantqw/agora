# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is the **Agora MerchantHub** - a merchant inventory management platform built with React + Vite.

**Current State:**
- ✅ Vite project scaffolded with React 18
- ✅ All merchant pages implemented (Login, Home, Inventory, Bulk Import)
- ✅ React Router configured with authentication flow
- ✅ Dependencies installed
- ✅ Docker configuration complete (development & production)
- ✅ Nginx with basic authentication configured
- ✅ Production deployment scripts ready
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
1. ✅ `src/pages/StorefrontLandingPage.jsx` - Customer-facing storefront (public)
2. ✅ `src/pages/MerchantLoginPage.jsx` - Login with demo credentials
3. ✅ `src/pages/MerchantHomePage.jsx` - Dashboard home with metrics and quick actions
4. ✅ `src/pages/MerchantDashboardPage.jsx` - Inventory list with search, filter, sort, pagination, and full-page edit view
5. ✅ Bulk Delete Confirmation Dialog (in Dashboard)
6. ✅ `src/pages/MerchantBulkImportPage.jsx` - 4-step import wizard

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
4. Results with success/skip counts

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
  pages/
    StorefrontLandingPage.jsx  # Customer storefront
    MerchantHomePage.jsx       # Merchant dashboard home with metrics
    MerchantLoginPage.jsx      # Merchant login page
    MerchantDashboardPage.jsx  # Inventory dashboard with full-page edit view
    MerchantBulkImportPage.jsx # Bulk import wizard
  App.jsx                      # Main app with routing & auth
  main.jsx                     # App entry point
  index.css                    # Global styles
wireframe/                     # Original wireframe components (reference)
public/                        # Static assets
  favicon.svg                  # SVG favicon (primary)
  favicon.png                  # PNG favicon fallback (32×32)
  apple-touch-icon.png         # Apple touch icon (180×180)
scripts/
  favicon-generator.html       # Tool to generate PNG favicons from SVG
BACKEND_INTEGRATION.md         # API integration requirements
```

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
- **State:** Local useState (no global state library yet)
- **Auth:** Simple boolean state in App.jsx

## Routes

**Public Routes:**
- `/` - Customer storefront landing page (public)

**Merchant Routes:**
- `/merchant/login` - Merchant login (redirects to home if authenticated)
- `/merchant` - Merchant home page with dashboard metrics (requires authentication)
- `/merchant/inventory` - Inventory management (requires authentication)
- `/merchant/import` - Bulk import wizard (requires authentication)

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

## Demo Credentials

- **Email:** demo@merchant.com
- **Password:** Any password ≥6 characters

## Recent Updates & Progress

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

### Next Steps

**Backend Integration:**
- Implement service layer (`src/services/`) with API calls
- Add JWT authentication service
- Implement SSE for bulk import progress
- Add WebSocket service for real-time inventory updates

**Enhanced Features:**
- Product image upload and management
- Advanced filtering and search
- Export functionality (CSV, Excel)
- Inventory analytics and reporting

**Infrastructure:**
- Set up CI/CD pipeline
- Configure production environment variables
- Implement error tracking (Sentry, etc.)
- Add monitoring and logging
