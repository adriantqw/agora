# 🥚 Eggora Journey Builder - UI/UX Development Plan

**Project Status:** Ready for Dev  
**Objective:** Build a responsive, split-screen "Journey Creation" flow where user inputs on the left real-time update the summary sidebar on the right.  
**Team Structure:** Designed for 2-3 Developers working in parallel.

---

## 🎨 1. Design System & Global Styles
*To be established by the Lead Developer before component work begins.*

### Color Palette
*Based on visual analysis of the prototype.*

| Usage | Color Name | Hex Code (Approx) | Context |
| :--- | :--- | :--- | :--- |
| **Primary** | Eggora Pink | `#F94C85` | Main CTA buttons, Mascot, Highlights |
| **Secondary** | Deep Purple | `#2A2345` | Headings, Primary Text, Active States |
| **Background** | Soft Lavender | `#FDFBFD` | Main Page Background |
| **Surface** | Pure White | `#FFFFFF` | Cards, Sidebar, Input fields |
| **Borders** | Muted Lilac | `#E5D9E8` | Input borders, Dividers |
| **Text** | Charcoal | `#4A4A4A` | Body text, Labels |
| **Alert/Error** | Coral Red | `#FF6B6B` | "Not set" warnings |

### Typography
* **Font Family:** Rounded Sans-serif (e.g., *Nunito, Quicksand, or Poppins*).
* **Hierarchy:**
    * `H1`: Journey Titles (Bold, 24px)
    * `H2`: Section Headers (Semi-Bold, 18px)
    * `Body`: Inputs & Chat (Regular, 16px)
    * `Labels`: Small Caps (Bold, 12px, Tracking +1px)

### UI Component Library (Base)
* **Buttons:** * *Primary:* Pill-shape, Pink Background, White Text, Drop Shadow.
    * *Secondary:* Transparent Background, Pink Text.
* **Tags/Chips:** * *Default:* White bg, Purple border.
    * *Selected:* Light Purple bg, Dark Purple text.
* **Cards:** White bg, `border-radius: 16px`, soft box-shadow `0 4px 12px rgba(0,0,0,0.05)`.

---

## 🏗 2. Architecture & State Management
*Crucial for keeping the Left and Right columns in sync.*

**Shared State Store (e.g., Context API, Redux, or Zustand)**
The app requires a central store that both `LeftColumn` and `RightSidebar` can access.

```javascript
// Mock State Structure
const journeyState = {
  // Foundations (Step 1)
  foundations: {
    location: ["Outdoor", "Winery"],
    time: ["Daytime"],
    department: "Women's",
    ageRange: null, // If null, Sidebar shows "Not set"
    sizing: null    // If null, Sidebar shows "Not set"
  },
  // Style DNA (Step 2)
  styleDNA: {
    selectedVibeId: null,
    budget: { min: 100, max: 500 },
    preferences: ""
  },
  // App Logic
  currentStep: 1, // 1 = Foundations, 2 = Personal Style
  isReady: false  // Toggles the final "Let's Go" button
}

🚀 3. Phased Development Breakdown
Phase 1: The Shell (Developer A)
Set up the grid and responsive container.

Layout: CSS Grid/Flexbox.

Left Column (65%): Scrollable container for the chat/form.

Right Column (35%): Sticky/Fixed container for the Summary Sidebar.

Header: Minimal navigation (Logo Left, User Profile Right).

Mascot: Fixed position asset (Bottom Right of viewport), z-indexed above content.

Phase 2: Parallel Component Development
👨‍💻 Track A: The Sidebar (Developer B)
The "Output" display. Depends on Shared State.

Sticky Card: Create the main white container with shadow.

Summary Header: "Current Journey Summary" + Dynamic Title (e.g., "Wedding Guest").

Foundations List:

Map through foundations state.

Logic: If value is present → Show formatted tag.

Logic: If value is null → Show "Not set" text with Edit (Pencil) icon.

Hover Effects: Hovering "Time" reveals extra details (popover).

Style DNA Section:

Placeholder state (Skeleton loader or empty state) until Step 2 is active.

Once active: Displays selected "Vibe" image thumbnail + Price range text.

Action Buttons:

"Quick Match" (Secondary).

"Let's Goooo!" (Primary - Disabled until isReady === true).

👩‍💻 Track B: The Input Flow (Developer C)
The "Input" controls. Writes to Shared State.

Part 1: Foundations (Top Section)

Chat Bubble: Large text display "Oh, how lovely! To make sure I find things...".

Tag Selectors: * Clickable chips for Location/Time.

Toggle logic (Active/Inactive styling).

Validation Inputs:

"Age Range" & "Sizing" buttons.

Interaction: On click, open a small modal or dropdown to select value.

Confirm Button: Validates inputs → Scrolls to Part 2.

Part 2: Personal Style (Bottom Section) Initially hidden or collapsed.

Vibe Selector: Grid of 4 images. Single-select logic.

Price Slider: Dual-handle range slider (min to max). Updates sidebar numbers in real-time.

Text Area: "Any specific preferences?" (e.g., sleeve length).

Final CTA: "I'm Ready" button. Triggers isReady = true in state.

Phase 3: Polish & Integration (All Developers)
Animations:

Smooth scroll when clicking "Confirm" in Part 1.

Fade-in effect for Part 2 components.

Bobbing animation for the Mascot.

Responsiveness:

Mobile View: Hide Right Sidebar. Convert it to a "Drawer" or "Modal" accessible via a floating "View Summary" button.

Asset Implementation:

Add final SVG icons (Sun, Flower, Ruler, Pencil).

Add final Vibe images.

✅ Definition of Done (Checklist)
[ ] User can toggle tags (Outdoor/Indoor) and see Sidebar update immediately.

[ ] Clicking "Age Range" allows data entry and removes the "Not set" warning in Sidebar.

[ ] Selecting a Vibe image updates the thumbnail in the Sidebar.

[ ] The "Let's Go" button is disabled until all required fields are filled.

[ ] Mobile view collapses the sidebar correctly.