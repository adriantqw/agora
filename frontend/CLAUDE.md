# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is the **Merchant Inventory Management Platform** (MerchantHub) - currently in early development with design specifications complete but project scaffolding not yet set up.

**Current State:**
- `merchant-frontend-overview.md` - Complete design specification (source of truth)
- `login-page.js` - Reference implementation for styling patterns
- No package.json or build system yet

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

**Screens to Implement:**
1. Login Page (exists as reference in `login-page.js`)
2. Dashboard / Inventory List - Table with search, filter, sort
3. Edit Item Modal - Form for product modification
4. Bulk Delete Confirmation Dialog
5. Bulk Import Wizard (4 steps: Upload → Preview → Confirm → Results)

**Key Constraints:**
- No single item add (bulk import only)
- No individual delete (bulk delete only)
- SKU is read-only after creation
- Selection resets on page navigation (POC simplicity)
- Bulk delete capped at 100 items

## Styling Patterns

From `login-page.js`, the established design system uses:

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

Breadcrumb format: `Home / [Section] / [Action]`
- Dashboard: `Home / Inventory`
- Edit Modal: `Home / Inventory / Edit Item`
- Bulk Import: `Home / Inventory / Bulk Import`

## User Flows

**Inventory Management:**
- Click row (not checkbox) → Opens Edit Modal
- Click checkbox → Toggles selection
- "Delete Selected" button shows count, opens confirmation dialog

**Bulk Import (4 steps):**
1. File upload (CSV, Excel; PDF deferred)
2. Preview with validation status per row
3. Confirmation summary
4. Results with success/skip counts

## Project Setup (When Scaffolding)

Recommended stack based on existing patterns:
- React 18+ with Vite
- React Router for navigation
- Context API for auth state
- React Hook Form for forms
- papaparse for CSV, xlsx for Excel
- Jest + React Testing Library

## File Structure (Planned)

```
src/
  components/     # Reusable UI components
  pages/          # Route-level components
  contexts/       # React Context providers
  hooks/          # Custom hooks
  services/       # API calls
  types/          # TypeScript interfaces
```
