# Merchant Inventory Management Platform

## Design Overview Document

**Version:** 2.0  
**Last Updated:** January 2026  
**Status:** Wireframes Complete

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Target User](#target-user)
3. [Features In Scope](#features-in-scope)
4. [Product Data Model](#product-data-model)
5. [Navigation Structure](#navigation-structure)
6. [Screen Inventory](#screen-inventory)
7. [User Flows](#user-flows)
8. [UI Specifications](#ui-specifications)
9. [Interaction Behaviors](#interaction-behaviors)
10. [Design System](#design-system)
11. [Wireframe Deliverables](#wireframe-deliverables)
12. [Open Questions](#open-questions)
13. [Next Steps](#next-steps)

---

## Project Overview

A simple shopping platform that allows merchants to manage their product inventory. The platform provides essential CRUD operations with a focus on bulk operations for efficiency.

### Goals

- Enable merchants to view and manage their product inventory
- Support bulk operations (import and delete) for efficiency
- Provide a clean, intuitive interface suitable for non-technical users
- Deliver a functional POC/demo that can be extended later

### Non-Goals (Out of Scope for POC)

- Customer-facing storefront
- Order management
- Single item addition (only bulk import)
- Advanced user management / roles
- Analytics and reporting

---

## Target User

**Primary Persona: Small-to-Medium Business Merchant**

| Attribute | Description |
|-----------|-------------|
| Technical Skill | Low to moderate; may not be tech-savvy |
| Device Usage | Desktop primary, tablet secondary (e.g., iPad) |
| Key Need | Quick inventory updates without complexity |
| Pain Points | Tedious manual entry, fear of data loss |

### Design Implications

- Interface must be straightforward and forgiving
- Clear feedback for all actions (especially destructive ones)
- Responsive design for tablet support
- Non-destructive operations with confirmation dialogs

---

## Features In Scope

| Feature | Included | Priority | Notes |
|---------|----------|----------|-------|
| Login / Logout | ✅ | P0 | Email + password (simple auth) |
| View Inventory | ✅ | P0 | Table with search and filter |
| Edit Item | ✅ | P0 | Modal-based editing |
| Bulk Delete | ✅ | P0 | Checkbox selection + confirmation |
| Bulk Import | ✅ | P0 | CSV, Excel, PDF with images |
| Add Single Item | ❌ | — | Out of scope |
| Individual Delete | ❌ | — | Replaced by bulk delete |

---

## Product Data Model

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `id` | string / uuid | Yes | Auto-generated | Primary key |
| `name` | string | Yes | Max 255 chars | Product display name |
| `sku` | string | Yes | Unique | Stock keeping unit |
| `price` | number | Yes | Decimal, 2 places, ≥ 0 | Currency value |
| `quantity` | integer | Yes | ≥ 0 | Stock count |
| `tags` | string[] | No | 0 to many | For filtering/categorization |
| `image` | url / file | No | Single image | Product photo |
| `description` | text | No | Max 2000 chars | Long-form description |

### Sample Data

```json
{
  "id": "prod_abc123",
  "name": "Blue Cotton Shirt",
  "sku": "SH001",
  "price": 29.99,
  "quantity": 50,
  "tags": ["summer", "new", "cotton"],
  "image": "https://example.com/images/sh001.jpg",
  "description": "A comfortable blue cotton shirt perfect for summer wear."
}
```

---

## Navigation Structure

### Breadcrumb Pattern

The platform uses breadcrumb navigation to help users maintain context and easily return to the main dashboard.

```
Format: 🏠 Home / [Current Section] / [Current Action]
```

### Navigation States

| Current View | Breadcrumb Display |
|--------------|-------------------|
| Dashboard (Inventory List) | `Home / Inventory` |
| Edit Modal Open | `Home / Inventory / Edit Item` |
| Bulk Import Flow | `Home / Inventory / Bulk Import` |

### Breadcrumb Behavior

- Clicking "Home" always returns to the dashboard
- Clicking "Inventory" closes any open modal and returns to the list
- Breadcrumbs update dynamically based on current context
- Modal dismissal also updates breadcrumb state

---

## Screen Inventory

| # | Screen | Type | Complexity | Wireframe Status |
|---|--------|------|------------|------------------|
| 1 | Login | Page | Low | ✅ Complete |
| 2 | Dashboard / Inventory List | Page | Medium | ✅ Complete |
| 3 | Edit Item | Modal | Medium | ✅ Complete |
| 4 | Bulk Delete Confirmation | Dialog | Low | ✅ Complete |
| 5 | Bulk Import - Step 1 (Upload) | Page | Medium | ✅ Complete |
| 6 | Bulk Import - Step 2 (Preview) | Page | High | ✅ Complete |
| 7 | Bulk Import - Step 3 (Confirm) | Page | Low | ✅ Complete |
| 8 | Bulk Import - Step 4 (Results) | Page | Low | ✅ Complete |

---

## User Flows

### Flow 1: Login

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Landing   │────▶│   Enter     │────▶│  Validate   │
│    Page     │     │ Credentials │     │   Creds     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                         ┌─────────────────────┴─────────────────────┐
                         │                                           │
                         ▼                                           ▼
                  ┌─────────────┐                            ┌─────────────┐
                  │   Valid     │                            │  Invalid    │
                  │  Dashboard  │                            │ Show Error  │
                  └─────────────┘                            └──────┬──────┘
                                                                    │
                                                                    ▼
                                                             ┌─────────────┐
                                                             │   Retry     │
                                                             └─────────────┘
```

### Flow 2: View & Edit Inventory

```
┌──────────────────┐
│    Dashboard     │
│  (Inventory List)│
└────────┬─────────┘
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
   ┌───────────┐     ┌───────────┐      ┌───────────┐
   │  Search/  │     │ Click Row │      │   Check   │
   │  Filter   │     │           │      │   Boxes   │
   └─────┬─────┘     └─────┬─────┘      └─────┬─────┘
         │                 │                  │
         ▼                 ▼                  ▼
   ┌───────────┐     ┌───────────┐      ┌───────────┐
   │ Filtered  │     │   Edit    │      │  Delete   │
   │  Results  │     │   Modal   │      │  Selected │
   └───────────┘     └─────┬─────┘      └─────┬─────┘
                           │                  │
                     ┌─────┴─────┐            ▼
                     │           │      ┌───────────┐
                     ▼           ▼      │ Confirm   │
               ┌─────────┐ ┌─────────┐  │  Dialog   │
               │  Save   │ │ Cancel  │  └─────┬─────┘
               └────┬────┘ └────┬────┘        │
                    │           │             ▼
                    └─────┬─────┘       ┌───────────┐
                          │             │  Items    │
                          ▼             │  Removed  │
                    ┌───────────┐       └───────────┘
                    │ Return to │
                    │ Dashboard │
                    └───────────┘
```

### Flow 3: Bulk Import

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Step 1    │────▶│   Step 2    │────▶│   Step 3    │────▶│   Step 4    │
│   Upload    │     │  Preview &  │     │   Confirm   │     │   Results   │
│    File     │     │  Validate   │     │   Import    │     │   Summary   │
└─────────────┘     └──────┬──────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Errors?   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌─────────────┐          ┌─────────────┐
       │  Show Error │          │  Proceed to │
       │   Report    │          │   Step 3    │
       └──────┬──────┘          └─────────────┘
              │
              ▼
       ┌─────────────┐
       │  Fix & Re-  │
       │   upload    │
       └─────────────┘
```

---

## UI Specifications

### Login Page

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                      🛒 MerchantHub                    │
│                                                        │
│              ┌──────────────────────────┐              │
│              │                          │              │
│              │   Email                  │              │
│              │   [____________________] │              │
│              │                          │              │
│              │   Password               │              │
│              │   [____________________] │              │
│              │                          │              │
│              │   [      Login        ]  │              │
│              │                          │              │
│              │   Forgot password?       │              │
│              │                          │              │
│              └──────────────────────────┘              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Specifications:**
- Centered card layout
- Email field with validation
- Password field with show/hide toggle
- Login button (disabled until fields valid)
- Error message area below form
- Optional: "Forgot password?" link (can be placeholder for POC)

---

### Dashboard / Inventory List

```
┌────────────────────────────────────────────────────────────────────┐
│  🏠 Home / Inventory                                    [Logout]   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ [🔍 Search products...]    [Filter by Tag ▼]  [Bulk Import 📤]│  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  [🗑 Delete Selected (0)]  ← Shows count when items checked  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ☐  │ Name         │ SKU    │ Price   │ Qty  │ Tags         │  │
│  ├─────┼──────────────┼────────┼─────────┼──────┼──────────────┤  │
│  │  ☐  │ Blue Shirt   │ SH001  │ $29.00  │ 50   │ summer, new  │  │
│  │  ☐  │ Black Pants  │ PA002  │ $49.00  │ 30   │ formal       │  │
│  │  ☐  │ Red Dress    │ DR003  │ $79.00  │ 15   │ sale         │  │
│  │  ☐  │ White Tee    │ TE004  │ $19.00  │ 100  │ basic        │  │
│  │  ☐  │ Denim Jacket │ JK005  │ $89.00  │ 25   │ winter, new  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ☐ Select All                              « [1] [2] [3] ... »    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Table Columns:**

| Column | Width | Sortable | Notes |
|--------|-------|----------|-------|
| Checkbox | 40px | No | Bulk selection |
| Name | flex (grow) | Yes | Primary identifier |
| SKU | 100px | Yes | Unique code |
| Price | 100px | Yes | Formatted as currency |
| Quantity | 80px | Yes | Integer |
| Tags | 150px | No | Truncate with "+n" overflow |

**Key Behaviors:**
- Click anywhere on row (except checkbox) → Opens Edit Modal
- Click checkbox → Toggles item selection
- Image column removed from table (only visible in modal)
- Rows have hover state to indicate clickability
- Tags truncate with "+n more" if exceeding space

---

### Edit Item Modal

```
┌──────────────────────────────────────────────────────────┐
│  🏠 Home / Inventory / Edit Item                    [✕]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │               🖼 [Product Image]                   │  │
│  │                                                    │  │
│  │               [Change Image]                       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Product Name *                                          │
│  [Blue Cotton Shirt____________________________]         │
│                                                          │
│  SKU *                                                   │
│  [SH001_______________________________________]          │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │ Price *             │  │ Quantity *          │        │
│  │ [$] [29.99_____]    │  │ [50______________]  │        │
│  └─────────────────────┘  └─────────────────────┘        │
│                                                          │
│  Tags                                                    │
│  [summer ✕] [new ✕] [cotton ✕]  [+ Add Tag]              │
│                                                          │
│  Description                                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │ A comfortable blue cotton shirt perfect for        │  │
│  │ summer wear. Made from 100% organic cotton.        │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│                          [Cancel]    [Save Changes]      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Form Fields:**

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| Image | File upload / URL | Optional, image types only | Preview with change option |
| Name | Text input | Required, max 255 | — |
| SKU | Text input | Required, unique | May be read-only |
| Price | Number input | Required, ≥ 0, 2 decimals | Currency prefix |
| Quantity | Number input | Required, ≥ 0, integer | — |
| Tags | Tag input | Optional, 0+ | Chip-style with add/remove |
| Description | Textarea | Optional, max 2000 | — |

---

### Bulk Delete Confirmation Dialog

```
┌───────────────────────────────────────────────┐
│                                               │
│          ⚠️  Confirm Deletion                 │
│                                               │
├───────────────────────────────────────────────┤
│                                               │
│  You are about to delete 3 items:             │
│                                               │
│    • Blue Shirt (SH001)                       │
│    • Black Pants (PA002)                      │
│    • Red Dress (DR003)                        │
│                                               │
│  This action cannot be undone.                │
│                                               │
├───────────────────────────────────────────────┤
│                                               │
│            [Cancel]    [Delete 3 Items]       │
│                                               │
└───────────────────────────────────────────────┘
```

**Specifications:**
- Shows count and list of items to be deleted
- List scrollable if > 5 items
- Delete button is destructive (red styling)
- Clear warning that action is irreversible

---

### Bulk Import Flow

#### Step 1: Upload File

```
┌──────────────────────────────────────────────────────────┐
│  🏠 Home / Inventory / Bulk Import                  [✕]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Step 1 of 4: Upload File                                │
│  ● ○ ○ ○                                                 │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │                    📁                              │  │
│  │                                                    │  │
│  │        Drag and drop your file here               │  │
│  │              or click to browse                   │  │
│  │                                                    │  │
│  │        Supported: CSV, Excel (.xlsx), PDF         │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📥 Download template (CSV | Excel)                      │
│                                                          │
│                                         [Cancel]         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### Step 2: Preview & Validate

```
┌──────────────────────────────────────────────────────────┐
│  🏠 Home / Inventory / Bulk Import                  [✕]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Step 2 of 4: Preview & Validate                         │
│  ● ● ○ ○                                                 │
│                                                          │
│  📄 products.csv                          [Change File]  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ✅ 47 items ready    ⚠️ 3 warnings    ❌ 2 errors  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Row │ Name        │ SKU   │ Price │ Status         │  │
│  ├─────┼─────────────┼───────┼───────┼────────────────┤  │
│  │ 1   │ Blue Shirt  │ SH001 │ 29.00 │ ✅ Ready       │  │
│  │ 2   │ Black Pants │ PA002 │ 49.00 │ ✅ Ready       │  │
│  │ 3   │ Red Dress   │       │ 79.00 │ ❌ Missing SKU │  │
│  │ 4   │ White Tee   │ TE004 │ -5.00 │ ❌ Invalid $   │  │
│  │ 5   │ Jacket      │ JK005 │ 89.00 │ ⚠️ Duplicate   │  │
│  │ ... │             │       │       │                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ☐ Skip rows with errors (import valid rows only)        │
│                                                          │
│                          [← Back]    [Continue →]        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### Step 3: Confirm Import

```
┌──────────────────────────────────────────────────────────┐
│  🏠 Home / Inventory / Bulk Import                  [✕]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Step 3 of 4: Confirm Import                             │
│  ● ● ● ○                                                 │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │   📦 Ready to import 47 products                   │  │
│  │                                                    │  │
│  │   • 35 new products will be added                  │  │
│  │   • 12 existing products will be updated           │  │
│  │   • 2 rows will be skipped (errors)                │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│                          [← Back]    [Import Now]        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### Step 4: Results Summary

```
┌──────────────────────────────────────────────────────────┐
│  🏠 Home / Inventory / Bulk Import                  [✕]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Step 4 of 4: Import Complete                            │
│  ● ● ● ●                                                 │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │                   ✅                                │  │
│  │                                                    │  │
│  │          Import completed successfully!            │  │
│  │                                                    │  │
│  │          ✅ 35 products added                      │  │
│  │          ✅ 12 products updated                    │  │
│  │          ⏭ 2 rows skipped                         │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📥 Download error report                                │
│                                                          │
│                               [Import More]    [Done]    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Interaction Behaviors

### Row Selection (Checkbox)

| Action | Result |
|--------|--------|
| Click individual checkbox | Toggle that item's selection |
| Click "Select All" | Select all items on current page |
| Click "Select All" again | Deselect all items |
| Navigate to another page | Selection resets (POC simplicity) |

### Delete Button States

| State | Appearance | Behavior |
|-------|------------|----------|
| No items selected | Hidden or disabled, grayed out | Non-interactive |
| 1+ items selected | Enabled, shows count: "Delete Selected (n)" | Opens confirmation dialog |

### Row Interaction

| Action | Result |
|--------|--------|
| Hover on row | Background highlight + cursor pointer |
| Click row (not checkbox) | Opens Edit Modal |
| Click checkbox | Toggles selection only |

### Modal Behavior

| Trigger | Action |
|---------|--------|
| Click outside modal | Close (with unsaved changes warning if applicable) |
| Press Escape | Close modal |
| Click breadcrumb | Close modal and navigate |
| Click Save | Validate → Save → Close → Show success toast |
| Click Cancel | Close modal (with unsaved changes warning if applicable) |

### Toast Notifications

| Event | Message | Duration |
|-------|---------|----------|
| Item saved | "✅ Product updated successfully" | 3 seconds |
| Items deleted | "✅ 3 items deleted" | 3 seconds |
| Import complete | "✅ Import completed: 47 products" | 5 seconds |
| Error | "❌ [Error message]" | 5 seconds |

---

## Bulk Import: Format Handling

| Format | Parsing Approach | Image Handling | Complexity |
|--------|------------------|----------------|------------|
| CSV | Standard parse, column mapping | `image` column = URL | Low |
| Excel (.xlsx) | Same as CSV | `image` column = URL | Low |
| PDF Catalogue | OCR / AI extraction | Images extracted from PDF | High |

### CSV/Excel Template

```csv
name,sku,price,quantity,tags,image,description
Blue Shirt,SH001,29.99,50,"summer,new",https://example.com/sh001.jpg,A comfortable blue shirt
Black Pants,PA002,49.99,30,formal,https://example.com/pa002.jpg,Classic black pants
```

### PDF Handling Note

PDF with images requires OCR/AI extraction, which is significantly more complex. For POC, consider:
- Option A: Mark as "Coming Soon"
- Option B: Basic implementation with AI extraction (additional scope)

---

## Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#4299e1` | Buttons, links, active states |
| Primary Blue Dark | `#3182ce` | Button gradients, hover states |
| Success Green | `#38a169` | Success states, valid indicators |
| Warning Yellow | `#d69e2e` | Warnings, caution states |
| Error Red | `#e53e3e` | Errors, destructive actions |
| Text Primary | `#1a202c` | Headings, primary text |
| Text Secondary | `#718096` | Labels, secondary text |
| Text Muted | `#a0aec0` | Placeholders, disabled text |
| Border | `#e2e8f0` | Borders, dividers |
| Background | `#f8f9fb` | Page background |
| Surface | `#ffffff` | Cards, modals |
| Surface Secondary | `#f7fafc` | Table headers, input backgrounds |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Font Family | Source Sans 3 | — | — |
| H1 | Source Sans 3 | 28px | 700 |
| H2 | Source Sans 3 | 20px | 600 |
| Body | Source Sans 3 | 14-15px | 400 |
| Label | Source Sans 3 | 13px | 600 |
| Small / Caption | Source Sans 3 | 12-13px | 400-500 |
| Monospace (SKU) | System Monospace | 13px | 400 |

### Spacing

| Size | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight spacing, icon gaps |
| sm | 8px | Related element spacing |
| md | 12-16px | Component padding |
| lg | 20-24px | Section spacing |
| xl | 32-40px | Major section breaks |

### Border Radius

| Element | Radius |
|---------|--------|
| Buttons | 8px |
| Inputs | 8px |
| Cards / Modals | 12-16px |
| Tags / Chips | 12px (pill) |
| Avatars | 50% (circle) |

### Shadows

| Type | Value | Usage |
|------|-------|-------|
| Card | `0 2px 8px rgba(0,0,0,0.08)` | Elevated cards |
| Modal | `0 20px 40px rgba(0,0,0,0.2)` | Modal overlays |
| Button Primary | `0 2px 8px rgba(66,153,225,0.3)` | Primary buttons |
| Button Success | `0 2px 8px rgba(72,187,120,0.3)` | Success buttons |

---

## Wireframe Deliverables

### Files Produced

| File | Description | Components Included |
|------|-------------|---------------------|
| `merchant-login-page.jsx` | Login page | Split-screen layout, branding panel, login form, validation, loading states |
| `merchant-dashboard.jsx` | Main inventory dashboard | Header with merchant info, breadcrumbs, search, multi-select tag filter, data table with sorting, pagination, bulk selection, edit modal, delete confirmation, toast notifications |
| `merchant-bulk-import.jsx` | 4-step import wizard | Progress stepper, file upload with drag-drop, data preview table, validation summary, confirmation, results summary |

### Key Features Implemented

#### Login Page
- Split-screen layout with branding
- Email validation
- Password show/hide toggle
- Disabled button until form valid
- Loading state with spinner
- Error message display
- Demo credentials for testing

#### Dashboard / Inventory List
- Header with merchant name and avatar
- Breadcrumb navigation
- Search by name or SKU
- **Multi-select tag filter with search**
- Sortable table columns (Name, SKU, Price, Quantity)
- Quantity color-coding (red < 20, yellow < 50, green ≥ 50)
- Tag chips with overflow indicator
- Checkbox selection for bulk operations
- Bulk delete with confirmation dialog
- Edit modal with all product fields
- Tag management (add/remove)
- Toast notifications
- Pagination
- Empty state

#### Bulk Import Wizard
- Visual progress stepper
- **Step 1:** Drag-drop file upload, file type validation, template download links
- **Step 2:** Data preview table, validation summary (ready/warnings/errors), "skip errors" option
- **Step 3:** Import summary, warning banner, confirmation
- **Step 4:** Success screen, results breakdown, error report download

---

## Open Questions

| # | Question | Options | Decision |
|---|----------|---------|----------|
| 1 | Selection persistence across pages | Persist vs Reset | ✅ **Reset** — Implemented for POC simplicity |
| 2 | Bulk delete limit | Unlimited vs Cap | ⏳ To be determined during implementation |
| 3 | SKU editability | Editable vs Read-only | ✅ **Read-only** — Implemented in edit modal |
| 4 | PDF import scope | Include vs Defer | ⏳ Deferred — UI supports PDF selection but parsing TBD |
| 5 | Empty state design | Illustration vs Simple text | ✅ **Simple text with icon** — Implemented |
| 6 | Unsaved changes warning | Implement vs Skip | ⏳ To be implemented in development |

---

## Next Steps

### Phase 1: Wireframes ✅ COMPLETE

| Priority | Screen | Status |
|----------|--------|--------|
| 1 | Login Page | ✅ Complete |
| 2 | Dashboard / Inventory List | ✅ Complete |
| 3 | Edit Item Modal | ✅ Complete |
| 4 | Bulk Delete Confirmation | ✅ Complete |
| 5 | Bulk Import Wizard (Steps 1-4) | ✅ Complete |

### Phase 2: Development

| Task | Priority | Notes |
|------|----------|-------|
| Set up project structure | P0 | React + preferred styling solution |
| Implement authentication | P0 | Simple email/password for POC |
| Build inventory table | P0 | Core functionality |
| Implement edit modal | P0 | Form validation |
| Build bulk delete flow | P0 | Selection + confirmation |
| Build bulk import wizard | P1 | File parsing (CSV, Excel) |
| Add PDF parsing | P2 | OCR/AI extraction — may defer |

### Phase 3: Testing & Refinement

- User testing with sample merchants
- Performance optimization for large inventories
- Accessibility audit
- Mobile/tablet responsive adjustments

### Phase 4: Production Readiness

- Real authentication system
- Backend API integration
- Error handling & logging
- Documentation

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 2026 | Initial specification document |
| 2.0 | January 2026 | Wireframes complete: Added design system, wireframe deliverables, updated screen inventory, resolved open questions, updated next steps |

---

*Document End*