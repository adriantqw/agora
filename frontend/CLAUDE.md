# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is the **Agora MerchantHub** - a merchant inventory management platform built with React + Vite.

**Current State:**
- ✅ Vite project scaffolded with React 18
- ✅ All merchant pages implemented (Login, Dashboard, Bulk Import)
- ✅ React Router configured with authentication flow
- ✅ Dependencies installed
- `merchant-frontend-overview.md` - Complete design specification (source of truth)

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
1. ✅ `src/pages/MerchantLoginPage.jsx` - Login with demo credentials
2. ✅ `src/pages/MerchantDashboardPage.jsx` - Inventory list with search, filter, sort, pagination, and full-page edit view
3. ✅ Bulk Delete Confirmation Dialog (in Dashboard)
4. ✅ `src/pages/MerchantBulkImportPage.jsx` - 4-step import wizard

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
1. File upload (CSV, Excel; PDF deferred)
2. Preview with validation status per row
3. Confirmation summary
4. Results with success/skip counts

## Development Commands

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

## Project Structure

```
src/
  pages/
    MerchantLoginPage.jsx      # Login page (demo: demo@merchant.com)
    MerchantDashboardPage.jsx  # Inventory dashboard with full-page edit view
    MerchantBulkImportPage.jsx # Bulk import wizard
  App.jsx                      # Main app with routing & auth
  main.jsx                     # App entry point
  index.css                    # Global styles
wireframe/                     # Original wireframe components (reference)
public/                        # Static assets
BACKEND_INTEGRATION.md         # API integration requirements
```

## Tech Stack

- **Build Tool:** Vite 6
- **Framework:** React 18.3
- **Routing:** React Router v6
- **Styling:** Inline styles (no CSS framework)
- **State:** Local useState (no global state library yet)
- **Auth:** Simple boolean state in App.jsx

## Routes

- `/login` - Login page (redirects to `/` if authenticated)
- `/` - Dashboard (requires authentication)
- `/import` - Bulk import wizard (requires authentication)

## Demo Credentials

- **Email:** demo@merchant.com
- **Password:** Any password ≥6 characters
