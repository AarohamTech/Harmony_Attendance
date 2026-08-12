---
name: Precision HR
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
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
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
  margin-mobile: 16px
  gutter-mobile: 12px
---

## Brand & Style
The design system is engineered for high-trust enterprise environments, specifically tailored for mobile HRMS workflows. The aesthetic is rooted in **Material Design 3 (MD3)** principles, emphasizing clarity, efficiency, and a sense of institutional stability.

The style is **Corporate / Modern**, utilizing a "Clean White" philosophy to reduce cognitive load during attendance tracking and administrative tasks. It leverages a structured hierarchy of surfaces and precise iconography to evoke a professional and reliable emotional response. Every interaction is designed to feel intentional and secure, ensuring employees and managers interact with data-driven interfaces that feel authoritative yet accessible.

## Colors
The color palette is anchored by a high-calibration Blue (#2563EB), symbolizing trust and enterprise intelligence. 

- **Primary**: Used for key actions (Clock-in/out), active states, and critical navigation.
- **Surface**: The background remains a pristine white (#FFFFFF) to maintain the clean HRMS aesthetic.
- **Functional States**: Success, Warning, and Error colors follow industry standards to ensure immediate recognition of status updates (e.g., "Attendance Logged" or "Overtime Alert").
- **Neutral/Secondary**: A range of cool grays provides subtle contrast for secondary text and borders without cluttering the visual field.

## Typography
This design system utilizes **Inter** exclusively to achieve a systematic, utilitarian, and neutral tone. The typographic scale is optimized for high legibility on mobile devices.

- **Headlines**: Semi-bold weights are used for screen titles and card headings to establish immediate hierarchy.
- **Body Text**: Standard 16px (lg) and 14px (md) sizes ensure comfortable reading of policy text and log details.
- **Labels**: Uppercase or semi-bold small-caps are utilized for metadata (e.g., timestamps, status badges) to distinguish them from actionable content.
- **Mobile Adjustments**: Display sizes are capped at 32px to prevent excessive wrapping on smaller Android handsets.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a focus on safe margins for mobile ergonomics. 

- **Grid**: A standard 4-column mobile grid.
- **Margins**: A consistent 16px outer margin ensures content does not bleed into device edges or interfere with system gestures.
- **Rhythm**: All spacing is based on a 4px baseline grid. 16px (md) is the standard padding for containers and cards, while 8px (sm) is used for related elements within a group.
- **Verticality**: Components are stacked vertically to support the scrolling nature of HR feeds and attendance logs.

## Elevation & Depth
In alignment with Material Design 3, depth is communicated through **Ambient Shadows** and tonal shifts rather than heavy borders.

- **Surface Tiers**: The base background is Level 0 (White). Interaction cards and input containers sit at Level 1, using a very soft, diffused shadow (Blur: 8px, Y: 2px, Opacity: 4% Black) to suggest lift without looking dated.
- **Active Elevation**: Floating Action Buttons (FAB) for "Clock In" use a higher elevation (Level 2) with a slightly more pronounced shadow to signify primary importance.
- **No Borders**: Avoid harsh outlines. Use subtle tonal changes or soft shadows to define boundaries.

## Shapes
The shape language is modern and approachable, utilizing consistent rounding to soften the corporate aesthetic.

- **Cards**: Large containers use a 16px (1rem) corner radius to create a distinct, modular appearance.
- **Buttons**: All primary and secondary buttons use a 14px radius, creating a near-pill shape that feels ergonomic for thumb interaction.
- **Inputs & Chips**: Small components follow a 8px radius to maintain consistency with the larger containers while saving internal space.

## Components
- **Buttons**: Primary buttons are solid Blue (#2563EB) with white text. Secondary buttons use a tonal grey background or a 1px stroke. The "Clock In" button should be oversized for accessibility.
- **Cards**: Cards are the primary organizational unit. They feature 16px padding and 16px corner radius. Use them for "Daily Summary," "Shift Details," and "Leave Balance."
- **Input Fields**: Follow MD3 "Outlined" style with a 8px corner radius. The label should float to the top border on focus.
- **Chips**: Use for status indicators (e.g., "Present", "Late", "On Leave"). Chips use 8px rounding and low-saturation background tints of the status colors (Success/Warning/Error).
- **Lists**: Attendance logs should be presented in clean lists with 1px light gray dividers and 16px vertical padding per item.
- **Progress Indicators**: Circular indicators for "Hours Worked" should use the primary blue, emphasizing the data-driven nature of the app.