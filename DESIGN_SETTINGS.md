# Design Settings Summary

## Brand Identity
- **Brand**: PassportCard
- **Primary Color**: #E10514 (Official PassportCard Red)
- **Direction**: RTL (Right-to-Left) for Hebrew content

---

## Color Palette

### Primary Colors
- **Primary**: `#E10514` - Official PassportCard Red
- **Primary Hover**: `#C50412` - Darker red for hover states
- **Primary Light**: `rgba(225, 5, 20, 0.08)` - Light red tint for backgrounds
- **Primary Gradient**: `linear-gradient(328deg, #E10514 0%, #A2191C 100%)` - Used for buttons and accents

### Background Colors (Light Mode)
- **Page Background**: `#F8F6F3` - Warm, inviting page background
- **Card Background**: `#FFFFFF` - White for cards and containers
- **Cream Background**: `#F0EDE8` - Warm cream for secondary backgrounds
- **Light Background**: `#FAF8F5` - Very light background for subtle sections
- **Section Background**: `#EFEBE6` - Background for section containers

### Text Colors (Light Mode)
- **Primary Text**: `#1A1A1A` - Main text color
- **Secondary Text**: `#3D3D3D` - Secondary text color
- **Muted Text**: `#6B6B6B` - Muted/secondary information
- **Light Text**: `#9A9A9A` - Very light text for placeholders

### Border Colors
- **Border Color**: `#E5E0DA` - Standard border color
- **Border Light**: `#F0EDE8` - Lighter border for subtle separations

### Status Colors
- **Success**: `#22C55E` - Green for success states
- **Warning**: `#F59E0B` - Amber for warnings
- **Info**: `#3B82F6` - Blue for informational messages
- **Changed**: `#8B5CF6` - Purple for edited/changed items

### Dark Mode Colors
- **Page Background**: `#0D0D0D`
- **Card Background**: `#1A1A1A`
- **Cream Background**: `#252525`
- **Light Background**: `#1F1F1F`
- **Section Background**: `#151515`
- **Primary Text**: `#F0F0F0`
- **Secondary Text**: `#A0A0A0`
- **Muted Text**: `#888888`
- **Light Text**: `#666666`
- **Border Color**: `#333333`
- **Border Light**: `#2A2A2A`

---

## Typography

### Font Families
- **Hebrew/English**: `'Rubik', sans-serif` - Primary font for all text
- **Monospace**: `'Consolas', 'Monaco', 'Courier New', monospace` - For code/keys

### Font Sizes
- **Base**: `16px`
- **Small**: `0.7rem` (11.2px)
- **Medium**: `0.875rem` (14px)
- **Regular**: `1rem` (16px)
- **Large**: `1.125rem` (18px)
- **XLarge**: `1.25rem` (20px)
- **XXLarge**: `1.5rem` (24px)
- **Hero Title**: `2.25rem` (36px)
- **Summary Title**: `2.5rem` (40px)

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semi-Bold**: 600
- **Bold**: 700

### Line Height
- **Base**: `1.6` - Standard line height for readability

---

## Spacing System

All spacing uses a consistent scale based on 4px increments:

- **Space 1**: `4px`
- **Space 2**: `8px`
- **Space 3**: `12px`
- **Space 4**: `16px`
- **Space 5**: `24px`
- **Space 6**: `32px`
- **Space 7**: `48px`
- **Space 8**: `64px`

### Usage Examples
- Card padding: `var(--space-5)` (24px)
- Section gaps: `var(--space-4)` (16px)
- Button padding: `var(--space-3) var(--space-5)` (12px vertical, 24px horizontal)
- Container max-width: `1400px`

---

## Shadows

### Shadow Definitions
- **Small**: `0 1px 3px rgba(0, 0, 0, 0.04)` - Subtle elevation
- **Medium**: `0 4px 20px rgba(0, 0, 0, 0.06)` - Standard card shadow
- **Large**: `0 10px 40px rgba(0, 0, 0, 0.08)` - Elevated elements
- **Primary Shadow**: `0 4px 14px rgba(225, 5, 20, 0.25)` - Red-tinted shadow for primary buttons

### Dark Mode Shadows
- **Small**: `0 1px 3px rgba(0, 0, 0, 0.2)`
- **Medium**: `0 4px 20px rgba(0, 0, 0, 0.3)`
- **Large**: `0 10px 40px rgba(0, 0, 0, 0.4)`

---

## Border Radius

- **Small**: `8px` - Small elements, badges
- **Medium**: `12px` - Cards, inputs
- **Large**: `16px` - Large cards, containers
- **XLarge**: `24px` - Hero sections, upload areas
- **Full**: `9999px` - Fully rounded (buttons, pills)

---

## Transitions & Animations

### Transition Durations
- **Fast**: `150ms ease` - Quick interactions
- **Base**: `200ms ease` - Standard transitions
- **Slow**: `400ms cubic-bezier(0.4, 0, 0.2, 1)` - Smooth, deliberate animations

### Key Animations
- **Slide Up**: Toast notifications entrance
- **Slide In**: Content appearance
- **Bounce In**: Floating save button
- **Celebrate**: Summary screen card animation
- **Card Fall**: Confetti effect (falling PassportCard images)
- **Float**: Floating card animation (4s ease-in-out infinite)
- **Spin**: Loading spinner (0.8s linear infinite)

---

## Components

### Buttons

#### Primary Button
- Background: Primary gradient
- Color: White
- Padding: `12px 24px`
- Border Radius: Full (pill shape)
- Shadow: Primary shadow
- Hover: Darker gradient, slight lift (`translateY(-2px)`)

#### Secondary Button
- Background: Cream background
- Color: Secondary text
- Border: 1px solid border color
- Padding: `12px 24px`
- Border Radius: Full

#### Success Button
- Background: Success color (#22C55E)
- Color: White
- Hover: Brightness increase

### Cards

#### Field Card
- Background: Card background (#FFFFFF)
- Border Radius: Large (16px)
- Padding: 20px (expanded), 12px (collapsed)
- Shadow: Medium shadow
- Border: 2px transparent (changes on states)
- States:
  - **Approved**: Green background tint, green border
  - **Edited**: Purple background tint, purple border
  - **Expanded**: Primary border color, large shadow

### Inputs

#### Text Input / Textarea
- Background: Card background
- Border: 2px solid border color
- Border Radius: Medium (12px)
- Padding: `12px`
- Focus: Primary border color + 4px primary light shadow
- Font: Rubik, 1rem

### Header
- Background: Card background with gradient border
- Padding: `16px 32px`
- Position: Sticky, top: 0
- Shadow: Small shadow
- Border: 3px gradient border (bottom)

### Footer
- Background: `#1d1c1d` with SVG pattern
- Text Color: White (#FFFFFF)
- Description Color: `#A0A0A0`
- Divider: `#333333`

---

## Layout

### Container Widths
- **Max Content Width**: `1400px` - Main content container
- **Hero Container**: `1200px` - Hero section
- **Upload Container**: `600px` - Upload area
- **Summary Container**: `800px` - Summary screen

### Grid Layouts
- **Wizard Container**: `grid-template-columns: 280px 1fr` (sidebar + content)
- **Hero Container**: `grid-template-columns: 1fr 1fr` (content + visuals)

### Responsive Breakpoints
- **Mobile**: `max-width: 600px`
- **Tablet**: `max-width: 768px`
- **Desktop**: `max-width: 1024px`
- **Large Desktop**: `max-width: 1100px`

---

## Scrollbar

### Webkit Scrollbar
- **Width**: `10px` (horizontal), `8px` (vertical)
- **Track**: Light background
- **Thumb**: Primary gradient
- **Border Radius**: `5px`
- **Hover**: Darker gradient

### Firefox Scrollbar
- **Width**: Thin
- **Color**: Primary red on light background

---

## Icons

- **Icon Library**: Tabler Icons
- **CDN**: `@tabler/icons-webfont@latest`
- **Standard Size**: `18px` (buttons), `20px` (headers), `24px` (larger elements)
- **Color**: Inherits from parent or uses status colors

---

## Special Effects

### Confetti
- **Type**: Falling PassportCard images
- **Colors**: Primary red variations, white, gold
- **Animation**: Card fall with rotation (0.8-1.5s duration)
- **Trigger**: Milestones, completions, celebrations

### Floating Elements
- **Card Animation**: Float with rotation (4s ease-in-out infinite)
- **Transform**: `translateY(-20px) rotate(±deg)`

---

## Accessibility

- **Focus States**: 4px primary light shadow ring
- **Keyboard Navigation**: Full support with visual indicators
- **Color Contrast**: WCAG AA compliant
- **Screen Reader**: Semantic HTML structure

---

## Performance Optimizations

- **Will-Change**: Applied to animated elements
- **Transform**: Uses `translateZ(0)` for GPU acceleration
- **Contain**: Layout containment for field groups
- **Animation**: Hardware-accelerated transforms

---

## Notes

- All colors are defined as CSS custom properties (variables) for easy theming
- Dark mode uses the same structure with different color values
- The design follows a warm, inviting aesthetic with PassportCard's signature red
- RTL (Right-to-Left) layout optimized for Hebrew content
- Mobile-first responsive design with progressive enhancement
