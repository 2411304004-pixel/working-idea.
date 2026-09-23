---
name: Artisanal Mobile Rostrum
colors:
  surface: '#fdf9f4'
  surface-dim: '#ddd9d5'
  surface-bright: '#fdf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ee'
  surface-container: '#f1ede8'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e6e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#58413b'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f4f0eb'
  outline: '#8c716a'
  outline-variant: '#e0bfb7'
  surface-tint: '#aa3614'
  primary: '#a73412'
  on-primary: '#ffffff'
  primary-container: '#c94b28'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb5a1'
  secondary: '#35675a'
  on-secondary: '#ffffff'
  secondary-container: '#b8eedc'
  on-secondary-container: '#3b6d60'
  tertiary: '#615b55'
  on-tertiary: '#ffffff'
  tertiary-container: '#7a736d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a1'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#882000'
  secondary-fixed: '#b8eedc'
  secondary-fixed-dim: '#9dd1c1'
  on-secondary-fixed: '#002019'
  on-secondary-fixed-variant: '#1b4f43'
  tertiary-fixed: '#eae1d9'
  tertiary-fixed-dim: '#cdc5be'
  on-tertiary-fixed: '#1f1b16'
  on-tertiary-fixed-variant: '#4b4640'
  background: '#fdf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e6e2dd'
typography:
  headline-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 54px
    letterSpacing: -0.03em
  headline-display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses the character of an artisanal, boutique mobile cafe housed within a curated vintage caravan. The visual language blends modern editorial minimalism with artisanal warmth. The experience should feel sun-drenched, tactile, approachable, and meticulously crafted. 

We avoid the sterile, clinical tropes of generic tech apps and the overly rustic cliches of vintage food trucks. Instead, the interface balances generous, deliberate whitespace with structured, confidence-inspiring typography, subtle warm-tinted surfaces, and gentle physical depths that mimic high-end hospitality editorial print. The user should feel relaxed, unhurried, and delighted—as if stepping up to a wooden espresso bar on a warm morning.

## Colors

The palette grounds itself in natural, warm materials reminiscent of linen, terracotta tiles, and sage flora:

- **Canvas Background (`#FAF6F1`)**: A warm oat/soft cream backdrop that establishes organic baseline tone without harsh glare.
- **Card & Surface Tiers (`#FFFDFB` / `#FFFFFF`)**: Pure warm-tinted white for elevated interactive modules and order panels.
- **Primary CTA Accent (`#E8623D`)**: Energetic terracotta coral for key conversion paths, instant order triggers, and vibrant highlights.
- **Secondary Accent (`#4A7C6E`)**: Earthy sage teal indicating freshness, plant-based or dietary tags, botanical syrups, and verified status.
- **Primary Text & High Contrast Elements (`#1A1A1A`)**: Deep charcoal rather than pure black, providing punchy editorial contrast without synthetic sharpness.
- **Muted Elements & Body Nuance (`#6B655F`)**: Grounded pebble gray for secondary metadata, preparation times, and origin notes.
- **Subtle Borders & Outlines (`#E8E3DC`)**: Soft sand tone defining card bounds and dividers quietly.

## Typography

Typography relies uniformly on Plus Jakarta Sans to maintain a clean, contemporary aesthetic with human warmth. 

Headings carry tighter letter-spacing and heavy weights (`700` and `800`) to create confident editorial anchors on the page. Body text stays open with a neutral tracking, prioritizing ease of reading for drink ingredients, tasting notes, and route stops. Labels and micro-copy leverage crisp medium-to-bold weights with slight positive tracking to ensure fast legibility on small surfaces, tags, and pricing badges.

## Layout & Spacing

The layout is built around a fluid responsive grid bounded by a max-width container of `1200px` for centered desktop readability. 

- **Mobile (up to 640px)**: 4-column layout, `1rem` outer margin, `1rem` gutter. Critical interactive modules lock to single-column stacking, prioritizing single-thumb reach.
- **Tablet (641px - 1024px)**: 8-column layout, `2rem` margin, `1.25rem` gutter. Product and menu cards shift into dual-column grids.
- **Desktop (1025px+)**: 12-column layout, `3rem` margin, `1.5rem` gutter. Split layouts accommodate sticky visual van schedules and live ordering sidebars.

Vertical rhythm adheres strictly to an 8px scale. Generous spacing around text and media creates an uncluttered, high-end cafe experience.

## Elevation & Depth

Visual hierarchy uses warm ambient lighting rather than artificial gray dropshadows:

- **Flat / Base Layer**: Default `#FAF6F1` background with no shadow.
- **Card Tier (Low Elevation)**: `#FFFDFB` background with a 1px solid `#E8E3DC` boundary and an ultra-soft ambient shadow: `0 4px 20px -2px rgba(92, 70, 52, 0.05)`.
- **Floating Overlays & Sticky Bars (Mid Elevation)**: Checkout sheets, filter bars, and modal controls use: `0 12px 32px -4px rgba(26, 26, 26, 0.08)`.
- **Primary Interactive Hover**: Buttons and interactive tiles gently lift with `0 8px 24px -2px rgba(232, 98, 61, 0.25)` to convey warmth and responsiveness.

## Shapes

The geometric identity balances soft structural cards with fully pill-shaped touch targets:

- **Primary Cards & Panels**: Fixed at `12px` to `16px` radius (`rounded-lg`), mirroring rounded vehicle windows and vintage caravan joinery.
- **Buttons, Badges, and Chips**: Full pill profiles (`9999px`) to create friendly, tactile tap targets that invite touch.
- **Form Controls & Inputs**: `12px` radius for consistency with parent containers.

## Components

### Buttons
- **Primary Button**: Filled `#E8623D` with `#FFFFFF` text. Fully pill-shaped (`9999px`), padding `12px 24px`. Hover brings a slight warm brightness shift and shadow expansion. Active state applies a subtle `scale(0.98)` depression.
- **Secondary Button**: Outlined ghost button with a 1.5px border of `#1A1A1A` or `#E8E3DC`, charcoal text `#1A1A1A`, transparent background. On hover, fills with `#FAF6F1`.
- **Muted / Tertiary Button**: Text-only button in `#4A7C6E` or `#1A1A1A` with an underline transition.

### Chips & Filter Pills
- **Filter Chip (Default)**: `#FFFDFB` background, 1px `#E8E3DC` border, `#6B655F` text, `label-md` weight.
- **Filter Chip (Selected)**: `#1A1A1A` fill with `#FFFFFF` text or `#4A7C6E` fill with `#FFFFFF` text for dietary tags.

### Cards & Menu Tiles
- Surface uses `#FFFDFB` bounded by 1px `#E8E3DC` with `16px` border-radius. Internal padding is `20px` (`space-lg`). Includes customisation chips (e.g., "Oat Milk", "Extra Shot") organized in flex rows.

### Input Fields & Selectors
- Background `#FFFFFF`, 1.5px border `#E8E3DC`, `12px` border-radius, font size `body-md`. Focus rings transition cleanly to a 1.5px `#E8623D` border without harsh default browser glow.

### Checkboxes & Radio Controls
- Styled with custom `20px` circles/rounded squares. Border in `#E8E3DC`. Selected state animates to a solid `#E8623D` or `#4A7C6E` center with a crisp white mark.

### Sticky Order Summary / Checkout Bar
- Fixed to viewport bottom on mobile. Warm white `#FFFDFB` surface, top border 1px `#E8E3DC`, soft upward drop shadow `0 -6px 24px rgba(26, 26, 26, 0.06)`. Houses total price, real-time caravan prep status, and a full-width terracotta CTA button.

### Van Tracker & Schedule Pill
- Distinctive component displaying location status (e.g., "Parked at 5th & Pine until 2 PM"). Uses `#4A7C6E` tint background, subtle pulsating live beacon dot, and compact `label-sm` metadata.