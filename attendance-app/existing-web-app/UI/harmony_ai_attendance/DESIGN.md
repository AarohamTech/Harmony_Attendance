---
name: Harmony AI Attendance
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#525657'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b6e70'
  on-tertiary-container: '#eff1f3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  edge_margin: 16px
  gutter: 12px
---

## Brand & Style
The design system is engineered for a high-performance HRMS environment, prioritizing clarity, trust, and professional efficiency. The brand personality is "Human-Centric Enterprise"—it feels authoritative yet approachable, minimizing cognitive load for employees managing their daily work-life balance.

The visual style follows a **Modern Corporate** aesthetic, heavily influenced by Material Design 3 principles but refined with custom elevation and spacing to feel more bespoke. It utilizes clean white surfaces, generous negative space, and a primary blue accent to signal reliability. The interface avoids unnecessary ornamentation, focusing instead on data legibility and effortless task completion.

## Colors
The palette is rooted in a professional "Enterprise Blue." 

- **Primary (#2563EB):** Used for key actions, active states in bottom navigation, and branded elements.
- **Surface & Background:** The main background is a very light gray (`#F8FAFC`) to reduce screen glare, while cards and primary containers use pure white (`#FFFFFF`) to create a clear "layered" hierarchy.
- **Semantic Colors:** Success (Green), Warning (Orange), and Error (Red) are used strictly for status indicators like attendance confirmation, late clock-ins, or rejected leave requests. 
- **Typography Colors:** Primary text uses a deep slate (`#1E293B`) for high contrast, while secondary text uses a softer gray (`#64748B`) for metadata and labels.

## Typography
The system utilizes **Inter** for its exceptional legibility on mobile screens and its neutral, professional tone. 

- **Hierarchy:** We use a tight scale where headlines are distinguished by weight (SemiBold/Bold) rather than extreme size differences to maintain an information-dense enterprise feel.
- **Body Text:** Standard interaction text is set at 16px to ensure accessibility across different age demographics in a corporate workforce.
- **Labels:** Uppercase styling is reserved for small utility labels or status badges to provide visual variety without compromising readability.

## Layout & Spacing
This design system follows a strictly 4px/8px incremental grid system optimized for Android’s 360dp-412dp standard widths.

- **Grid:** A 4-column fluid grid is used for mobile. 
- **Margins:** Screen edges have a mandatory 16px (md) margin to prevent content from feeling cramped against the device bezel.
- **Padding:** Vertical spacing between cards is standardized at 12px to allow more information to be visible on the screen at once compared to standard Material Design spacing.
- **Navigation:** A fixed Bottom Navigation bar (56px-64px height) hosts the four primary destinations: Home, Attendance, Requests, and Profile.

## Elevation & Depth
Elevation is handled through **Tonal Layers** and **Soft Ambient Shadows** rather than heavy shadows, keeping the UI light and modern.

- **Level 0 (Background):** `#F8FAFC` - The base canvas.
- **Level 1 (Cards/Containers):** White background with a subtle 1px border (`#E2E8F0`) and a very soft shadow (Y: 2px, Blur: 4px, 4% Opacity Black).
- **Level 2 (Floating/Active):** Used for active elements or "Clock In" buttons, featuring a more pronounced shadow (Y: 4px, Blur: 8px, 8% Opacity Primary Color) to draw immediate attention.
- **Level 3 (Modals/Sheets):** High-blur backdrop (12px) with a centered or bottom-anchored container to focus user attention on specific inputs.

## Shapes
The shape language is "Approachable Geometric." 

- **Cards:** Use a 16px corner radius (`rounded-lg`) to soften the professional aesthetic and make the enterprise software feel more like a consumer app.
- **Buttons:** Primary action buttons use a 14px radius to provide a distinct look that differs slightly from the card radius, making them feel more interactive and "clickable."
- **Input Fields:** Follow the 8px (`rounded`) standard for a sturdy, reliable feel.
- **Status Chips:** Use a full pill shape (100px) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid #2563EB with White text. 14px rounded corners. Min-height of 48px for touch targets.
- **Secondary/Ghost:** Outlined with 1px #E2E8F0. Used for "Cancel" or "View History" actions.

### Cards (Attendance & Info)
- **Clock-In Card:** Features a large, centered time display with a Primary button. 16px padding inside the card.
- **Stats Card:** Uses a 2-column layout inside the card to show "Hours Worked" and "Overtime" side-by-side.

### Bottom Navigation
- **Active State:** Icon and Label tinted in #2563EB. A subtle pill-shaped background highlight (10% primary opacity) sits behind the icon.
- **Inactive State:** Tinted in #64748B.

### Input Fields
- Outlined style with a 1px border. Label moves to the top border on focus (Material 3 style). 
- Error states change the border and helper text to #EF4444.

### Chips & Badges
- **Status Badges:** Small, pill-shaped backgrounds with 10% opacity of the status color (e.g., 10% Green for "On Time"). Text is 100% opacity of the same color.

### List Items
- 72px height for standard items. Left-aligned icon (24px), Title (16px), and Subtitle (14px). Right-aligned chevron or timestamp.