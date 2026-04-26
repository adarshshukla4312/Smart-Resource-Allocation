# Design System Inspired by Wispr Flow

## 1. Visual Theme & Atmosphere

Wispr Flow embodies a sophisticated, minimalist aesthetic that celebrates clarity and precision. The design system merges serif elegance with modern simplicity, creating a premium yet accessible voice dictation experience. The palette balances deep, luxurious blacks with warm cream tones and accents of rich purple, drawing inspiration from editorial design while maintaining technological sophistication. The visual language emphasizes speech-to-text clarity through generous whitespace, thoughtful typography hierarchies, and subtle color accents that guide user attention. This is a design system for ambitious professionals who value both aesthetics and functionality—where every element serves the goal of effortless communication.

**Key Characteristics**
- Serif-driven typography with EB Garamond for display hierarchy
- Deep, near-black base (`#1A1A1A`) paired with warm cream (`#FFFFEB`)
- Accent colors in purple, teal, and warm earth tones for interactive states
- Minimal use of borders and shadows; relies on color and typography contrast
- Generous whitespace and breathing room between components
- Premium, editorial aesthetic with modern UX principles
- Rounded corners on contained elements; sharp edges for navigation
- Warm, inviting tone that demystifies voice technology

## 2. Color Palette & Roles

### Primary

- **Brand Teal** (`#034F46`): Primary accent for strategic CTAs, highlights, and brand identity. Used sparingly for maximum impact on dark backgrounds.
- **Deep Purple** (`#F0D7FF`): Premium call-to-action color; soft but commanding presence on light surfaces. Paired with borders for interactive buttons.

### Accent Colors

- **Berry Red** (`#7F1C34`): Deep jewel accent for special states or secondary highlights; reserved for premium or premium-tier messaging.
- **Soft Mint** (`#CEF5CA`): Positive, success-state color; fresh and approachable confirmation messaging.
- **Light Olive** (`#114E0B`): Deep green secondary accent; used alongside soft mint for nature-inspired or calming interactions.
- **Warm Cream Highlight** (`#FCF8D8`): Soft background tint for featured sections or callouts; creates warmth without jarring contrast.
- **Dark Olive** (`#5E5515`): Muted earth tone for secondary text or subtle borders on warm backgrounds.

### Interactive

- **Ghost Purple** (`#FFF0`): Transparent purple overlay for hover states on dark backgrounds; creates depth and interactivity sensation.
- **Warning Orange** (`#FFA946`): Warning and alert states; draws attention to system messages and confirmations.

### Neutral Scale

- **True Black** (`#1A1A1A`): Primary text, navigation, and default UI element color. Dominant throughout the design system.
- **Dark Charcoal** (`#222222`): Secondary text and subtle dividers; slightly lighter than true black for hierarchy.
- **Medium Gray** (`#333333`): Tertiary text, disabled states, and icon fills.
- **Light Gray** (`#DDDDDD`): Subtle borders and dividers on light backgrounds.
- **Medium Gray Neutral** (`#E4E4D0`): Muted border color; less harsh than pure gray.

### Surface & Borders

- **Cream White** (`#FFFFEB`): Primary background for light sections; warm undertone prevents clinical feel.
- **Off-White** (`#FFFDF9`): Secondary surface color; slightly warmer alternative to pure white.
- **Pure White** (`#FFFFFF`): Maximum contrast backgrounds for critical content or overlay surfaces.

## 3. Typography Rules

### Font Family

**Primary:** EB Garamond (serif) with fallback stack: `"EB Garamond", "Garamond", "Georgia", serif`

**Secondary:** Figtree (sans-serif) with fallback stack: `"Figtree", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"`

EB Garamond carries the editorial voice and premium positioning; Figtree handles body copy, UI labels, and functional text with modern clarity.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|-----------------|-------|
| Display / H1 | EB Garamond | 120px | 400 | 102px | 0px | Hero headlines; ultra-premium positioning |
| Heading / H2 | EB Garamond | 64px | 400 | 60.8px | 0px | Section headers; commanding presence |
| Subheading / H3 | EB Garamond | 32px | 400 | 41.6px | 0px | Feature headers; clear topic introduction |
| Body Large | Figtree | 20px | 600 | 26px | 0px | Marketing copy; featured descriptions |
| Body Standard | Figtree | 16px | 400 | 20.8px | 0px | UI copy; navigation; standard body text |
| Link | Figtree | 16px | 500 | 20.8px | 0px | Interactive link elements; subtle weight increase |
| Button Label | Figtree | 16px | 600 | 16px | 0px | Call-to-action labels; bold emphasis |
| Caption / Small | Figtree | 14px | 400 | 18.2px | 0px | Helper text; footnotes; tertiary information |
| Code / Monospace | Courier New | 13px | 400 | 17.69px | 0.5px | Code snippets; technical reference |

### Principles

- **Serif for prestige:** EB Garamond display fonts establish editorial authority and luxury positioning; reserved for headlines and hero content.
- **Sans-serif for clarity:** Figtree provides modern readability for UI labels, buttons, navigation, and body copy.
- **Generous leading:** Line heights exceed standard ratios to support premium, spacious layouts; improves scannability.
- **Weight contrast:** Body text at 400 weight; interactive elements bumped to 500–600 weight for clear affordance.
- **No tight tracking:** Letter spacing kept at 0px; letterforms speak for themselves through font selection.
- **Functional sizing:** Sizes scale in meaningful increments (16px, 20px, 32px, 64px, 120px); predictable and maintainable rhythm.

## 4. Component Stylings

### Buttons

#### Primary Button
- **Background:** `#F0D7FF` (Deep Purple)
- **Text Color:** `#1A1A1A` (True Black)
- **Font:** Figtree, 16px, weight 600
- **Padding:** `16px 24px` (vertical horizontal)
- **Border Radius:** `12px`
- **Border:** `2px solid #1A1A1A` (True Black outline)
- **Line Height:** 16px
- **Hover State:** Darken background to `#E8C4FF`, maintain border
- **Active State:** Inset shadow `inset 0 2px 4px rgba(0, 0, 0, 0.2)`, reduce opacity to 0.85
- **Focus State:** Add outline `2px solid #034F46` offset `2px`

#### Secondary Button (Ghost)
- **Background:** `transparent`
- **Text Color:** `#1A1A1A` (True Black)
- **Font:** Figtree, 16px, weight 400
- **Padding:** `0px 0px` (no padding; text only)
- **Border Radius:** `0px` (no rounding)
- **Border:** `0px none`
- **Line Height:** 20.8px
- **Hover State:** Text color becomes `#034F46` (Brand Teal)
- **Active State:** Text color becomes `#222222` with underline
- **Focus State:** Add underline `1px solid #034F46`

#### Tertiary Button (Outlined)
- **Background:** `transparent`
- **Text Color:** `#1A1A1A` (True Black)
- **Font:** Figtree, 16px, weight 600
- **Padding:** `12px 20px`
- **Border Radius:** `12px`
- **Border:** `1px solid #1A1A1A`
- **Line Height:** 16px
- **Hover State:** Background `#FFFFEB`, maintain border and text color
- **Active State:** Background `#E4E4D0`, border becomes `1px solid #222222`
- **Focus State:** Add outline `2px solid #034F46` offset `2px`

### Cards & Containers

#### Dark Card (default)
- **Background:** `#1A1A1A` (True Black)
- **Text Color:** `#FFFFEB` (Cream White)
- **Border Radius:** `40px` (large, rounded)
- **Padding:** `70px 55px 0px 55px` (varied by context)
- **Border:** `0px none`
- **Box Shadow:** `none`
- **Font:** Figtree, 16px, weight 400
- **Line Height:** 20.8px
- **Heading within card:** Use EB Garamond, 32px, weight 400, `#FFFFEB`

#### Light Card
- **Background:** `#FFFFEB` (Cream White)
- **Text Color:** `#1A1A1A` (True Black)
- **Border Radius:** `32px`
- **Padding:** `24px 24px`
- **Border:** `1px solid #E4E4D0`
- **Box Shadow:** `none`
- **Font:** Figtree, 16px, weight 400

#### Floating Card (Overlay)
- **Background:** `#FFFFFF` (Pure White)
- **Text Color:** `#1A1A1A` (True Black)
- **Border Radius:** `12px`
- **Padding:** `20px 24px`
- **Border:** `1px solid #DDDDDD`
- **Box Shadow:** `0 4px 12px rgba(0, 0, 0, 0.08)`
- **Font:** Figtree, 16px, weight 400

### Inputs & Forms

#### Text Input (default)
- **Background:** `#FFFFFF` (Pure White)
- **Text Color:** `#1A1A1A` (True Black)
- **Font:** Figtree, 16px, weight 400
- **Padding:** `12px 12px` (increased from token for usability)
- **Border Radius:** `4px`
- **Border:** `1px solid #DDDDDD`
- **Line Height:** 20.8px
- **Placeholder Color:** `#999999` (Gray)
- **Focus State:** Border becomes `2px solid #034F46`, box shadow `0 0 0 3px rgba(3, 79, 70, 0.1)`
- **Error State:** Border becomes `2px solid #FFA946` (Warning Orange), background tint `#FFFAF7`
- **Disabled State:** Background `#F5F5F5`, text color `#999999`, border `1px solid #DDDDDD`, opacity 0.6

#### Textarea
- **Background:** `#FFFFFF` (Pure White)
- **Text Color:** `#1A1A1A` (True Black)
- **Font:** Figtree, 16px, weight 400
- **Padding:** `16px`
- **Border Radius:** `8px`
- **Border:** `1px solid #DDDDDD`
- **Line Height:** 24px
- **Min Height:** 120px
- **Focus State:** Border `2px solid #034F46`, box shadow `0 0 0 3px rgba(3, 79, 70, 0.1)`

#### Toggle / Checkbox
- **Size:** `20px × 20px`
- **Border Radius:** `4px`
- **Border:** `2px solid #1A1A1A` (unchecked)
- **Background (unchecked):** `#FFFFFF`
- **Background (checked):** `#034F46` (Brand Teal)
- **Checkmark Color:** `#FFFFFF`
- **Focus State:** Add outline `2px solid #034F46` offset `2px`

### Navigation

#### Navbar / Header
- **Background:** `#FFFFEB` (Cream White) or transparent overlay variant
- **Text Color:** `#1A1A1A` (True Black)
- **Font:** Figtree, 16px, weight 400
- **Height:** `68px` (minimum)
- **Padding:** `12px 24px`
- **Border Radius:** `0px` (nav bar spans full width or has corner radius on contained variant)
- **Border:** `0px none`
- **Box Shadow:** `none` (or subtle `0 1px 3px rgba(0, 0, 0, 0.05)` if floating)

#### Navigation Link (default)
- **Text Color:** `#1A1A1A`
- **Font:** Figtree, 16px, weight 400
- **Padding:** `8px 16px`
- **Border Radius:** `0px`
- **Border:** `0px none`
- **Hover State:** Text color `#034F46`, background `#F0D7FF` (if contained variant)
- **Active State:** Text color `#034F46`, underline `2px solid #034F46`
- **Focus State:** Add outline `2px solid #034F46` offset `2px`

#### Navigation Link (Dark Background)
- **Text Color:** `#FFFFEB` (Cream White)
- **Font:** Figtree, 16px, weight 500
- **Padding:** `8px 0px` (no background fill)
- **Hover State:** Text color lighter, underline `1px solid #F0D7FF`
- **Active State:** Text color `#F0D7FF`, underline `2px solid #F0D7FF`

#### Dropdown Menu
- **Background:** `#FFFFFF` (Pure White)
- **Border:** `1px solid #E4E4D0`
- **Border Radius:** `8px`
- **Padding:** `8px 0px`
- **Box Shadow:** `0 8px 24px rgba(0, 0, 0, 0.12)`
- **Item Padding:** `12px 20px`
- **Item Hover:** Background `#FFFFEB`, text color `#034F46`
- **Item Font:** Figtree, 14px, weight 400

### Badges & Chips

#### Badge (small)
- **Background:** `#F0D7FF` (Deep Purple)
- **Text Color:** `#1A1A1A` (True Black)
- **Font:** Figtree, 12px, weight 600
- **Padding:** `4px 12px`
- **Border Radius:** `1000px` (full pill)
- **Border:** `1px solid #1A1A1A` (optional outline variant)

#### Status Badge (Success)
- **Background:** `#CEF5CA` (Soft Mint)
- **Text Color:** `#114E0B` (Dark Olive)
- **Font:** Figtree, 12px, weight 600
- **Padding:** `6px 12px`
- **Border Radius:** `992px`

#### Status Badge (Warning)
- **Background:** `#FFA946` (Warning Orange)
- **Text Color:** `#1A1A1A` (True Black)
- **Font:** Figtree, 12px, weight 600
- **Padding:** `6px 12px`
- **Border Radius:** `992px`

### Links

#### Link (standard)
- **Text Color:** `#034F46` (Brand Teal)
- **Font:** Figtree, 16px, weight 500
- **Padding:** `0px 0px`
- **Border Radius:** `0px`
- **Border:** `0px none`
- **Text Decoration:** `underline`
- **Line Height:** 20.8px
- **Hover State:** Text color `#1A1A1A`, underline remains
- **Active State:** Text color `#222222`, text decoration `underline double`
- **Focus State:** Add outline `2px solid #034F46` offset `2px`

#### Link (light background / dark text context)
- **Text Color:** `#FFFFEB` (Cream White)
- **Font:** Figtree, 16px, weight 600
- **Hover State:** Text color `#F0D7FF` (Deep Purple)
- **Active State:** Text color `#F0D7FF`, underline `1px solid #F0D7FF`

## 5. Layout Principles

### Spacing System

**Base Unit:** `8px`

**Spacing Scale:**
- `4px` – Minimal gap between inline elements; icon-to-text spacing
- `8px` – Tight padding within compact components; subtle gaps
- `12px` – Standard internal padding for inputs, small buttons
- `16px` – Default margin between adjacent UI elements
- `20px` – Comfortable padding within cards and containers
- `24px` – Generous padding; section headers and feature blocks
- `60px` – Large vertical separation between major content sections
- `192px` – Hero spacing; distance between hero and next section

**Usage Context:**
- Buttons: `16px 24px` padding (vertical × horizontal)
- Cards: `20px` to `24px` internal padding; `24px` margin to adjacent elements
- Navigation: `16px` horizontal padding per link; `12px` vertical
- Forms: `12px` padding per input; `16px` margin between fields
- Sections: `60px` top/bottom margin; `192px` for hero transitions

### Grid & Container

**Max Width:**
- Desktop: `1200px` centered container for body content
- Wide: `1400px` for full-bleed features
- Mobile: Full width with `16px` left/right margin

**Column Strategy:**
- Desktop: 12-column flexible grid; components span 3–12 columns as needed
- Tablet (768px–1024px): 6-column flexible grid
- Mobile (< 768px): 1-column full-width stacked layout

**Section Patterns:**
- Hero section: Full viewport height (min 600px); centered text with EB Garamond headline
- Feature blocks: Alternating left/right text-image on desktop; stacked on mobile
- Cards grid: 3 columns on desktop, 2 on tablet, 1 on mobile with `24px` gap
- Navigation: Horizontal nav on desktop, hamburger menu on mobile

### Whitespace Philosophy

Wispr Flow embraces generous whitespace as a design principle. Spacing is not an afterthought but a primary design element that guides the eye, creates hierarchy, and reduces cognitive load. Every section breathes. Elements are never cramped. The design favors negative space over density, allowing premium typography and imagery to shine. Whitespace also creates pacing—the reader moves through content with intent, not rushed. On mobile, whitespace contracts slightly but remains respectful; no element feels suffocated.

### Border Radius Scale

- `0px` – Sharp edges for navigation bar, text inputs (minimal variant)
- `4px` – Tight radius for form inputs, small utility components
- `8px` – Moderate radius for floating cards, dropdowns
- `12px` – Standard radius for buttons, small-to-medium contained components
- `32px` – Large radius for prominent cards, feature blocks
- `40px` – Extra large radius for hero cards, major containers on dark backgrounds
- `1000px` (and above) – Full pill radius for badges, chips, toggles

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat / Base (L0) | `box-shadow: none` | Default UI elements; form inputs; navigation; body backgrounds |
| Raised / Card (L1) | `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)` | Floating cards; light overlays; lifted feature blocks |
| Modal / Overlay (L2) | `box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16)` | Modal dialogs; dropdown menus with strong separation; tooltips |
| Tooltip / Hover (L3) | `box-shadow: 0 16px 40px rgba(0, 0, 0, 0.20)` | Floating tooltips; critical overlays; max elevation for user interaction |

**Shadow Philosophy:**

Wispr Flow uses shadows sparingly and purposefully. Elevation is established primarily through color contrast (dark cards on light backgrounds) and whitespace, not aggressive shadow work. When shadows appear, they are soft and subtle—suggesting gentle lift rather than dramatic depth. This maintains the clean, editorial aesthetic while preserving visual hierarchy. Shadows increase in intensity as components move higher in the interaction layer (hover state → modal), creating a natural sense of depth through restraint.

## 7. Do's and Don'ts

### Do

- **Use EB Garamond for headlines.** Headlines above `24px` should leverage the serif font for premium positioning and editorial authority.
- **Pair colors intentionally.** Purple (primary CTA) sits best on cream (`#FFFFEB`) or light backgrounds; avoid purple on dark backgrounds unless using the ghost overlay variant.
- **Embrace whitespace.** Sections should feel spacious; default to `24px` padding and `60px` section margins.
- **Apply Dark Purple (`#F0D7FF`) consistently for primary CTAs.** Make it the go-to button color across the interface for recognition and consistency.
- **Use Figtree for all body copy and UI labels.** Its modern clarity ensures readability and reduces cognitive friction.
- **Maintain border radius hierarchy.** Buttons and small inputs use `12px`; hero cards use `40px`. Never mix scales arbitrarily.
- **Test text on background context.** Cream text (`#FFFFEB`) on dark backgrounds; dark text (`#1A1A1A`) on light. Ensure WCAG AA contrast at minimum (4.5:1 for body, 3:1 for large text).
- **Use Brand Teal (`#034F46`) for links, focus states, and interactive affordances.** It stands out clearly against light backgrounds and signals interactivity.
- **Stack warnings and alerts with orange (`#FFA946`).** Reserve this for system feedback; don't overuse.
- **Keep form inputs clean.** Minimal borders (`1px solid #DDDDDD`); focus states clearly signal interaction via brand teal border and light shadow.

### Don't

- **Don't mix serif and sans-serif in the same hierarchy level.** EB Garamond is for display; Figtree is for everything else. Never put Figtree in a 64px headline or EB Garamond in a button label.
- **Don't apply harsh shadows.** Keep elevation subtle; max shadow is `0 16px 40px rgba(0, 0, 0, 0.20)` reserved for critical modals only.
- **Don't use pure black text (`#000000`) or pure white backgrounds (`#FFFFFF`) as defaults.** Use `#1A1A1A` for text and `#FFFFEB` for warm backgrounds; pure white is reserved for overlay emphasis.
- **Don't cram padding into components.** Minimum button padding is `16px 24px`; form fields need `12px` min. Compressed UI feels cheap and fatiguing.
- **Don't force all accent colors into use.** Berry Red, Soft Mint, and Light Olive are optional; lean on the core palette (teal, purple, cream, black) for 80% of the interface.
- **Don't round navigation bars or header edges.** Top-level navigation benefits from sharp (`0px`) radius; containers and cards are where radius lives.
- **Don't nest cards deeper than 2 levels on top of each other.** Visual stack complexity diminishes after L2 (modal); avoid cascade confusion.
- **Don't apply hover color changes that are less than 10% luminance shift.** Hover states must feel responsive; pale changes go unnoticed.
- **Don't use outline-style borders on dark backgrounds.** Use solid or inset; outlines feel fragile against dense color.
- **Don't reduce padding on mobile arbitrarily.** Maintain tactile targets; at minimum `12px` padding on touch buttons.

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Key Changes |
|------------|-------|------------|
| Mobile | < 768px | Single-column layout; full-width cards with `16px` margin; hamburger navigation; font sizes reduce to 16px body, 28px H2 |
| Tablet | 768px–1024px | Two-column grid for cards; condensed navigation; 18px body font; 48px H2 |
| Desktop | 1024px–1440px | Three-column grid; full navigation bar; standard font sizes; `1200px` max container |
| Wide / Large Desktop | > 1440px | Four-column grid optional; `1400px` max container; full feature imagery |

### Touch Targets

- **Minimum button size:** `44px × 44px` (includes padding)
- **Minimum link/tap area:** `40px × 40px` independent of visual size
- **Navigation link padding:** `16px 24px` to exceed 40px minimum
- **Form input height:** `44px` minimum (12px padding + 20px line height)
- **Icon button:** `44px × 44px` square; center icon at `20px × 20px`
- **Spacing between touch targets:** `8px` minimum gap to avoid accidental taps

### Collapsing Strategy

**Desktop (1024px+):**
- Hero: Centered text with EB Garamond 120px headline; full-width background
- Navigation: Horizontal links with dropdown menus; logo on left
- Feature blocks: Alternating text-image (50/50 split)
- Card grids: Three columns with `24px` gap; cards span full container

**Tablet (768px–1024px):**
- Hero: EB Garamond 64px headline (scaled down); text centered or left-aligned
- Navigation: Hamburger menu or horizontal collapsed nav with fewer visible links
- Feature blocks: Image on top, text below (stacked); full width
- Card grids: Two columns with `20px` gap

**Mobile (< 768px):**
- Hero: EB Garamond 32px headline; centered; stacked layout with image below headline if present
- Navigation: Full hamburger menu; collapse all dropdowns into mobile menu drawer
- Feature blocks: Full-width stacked; image 100% width, text below
- Card grids: Single column, full width minus `16px` left/right margin
- Buttons: Full width or side-by-side if two buttons are present (`48% width` each with `4%` gap)
- Form inputs: Full width (`100%`) with `16px` margin
- Typography: Body reduces to 16px; headings scale proportionally (H1 → 32px, H2 → 28px, H3 → 20px)
- Padding: Section padding reduces to `16px` horizontal; `40px` vertical (from `60px`)

**Collapsing Rules:**
- Never hide critical content; reprioritize and reflow instead
- Maintain touch target minimums even when layout compresses
- Images scale proportionally; never crop or distort
- Whitespace reduces but never disappears; respect `8px` base unit
- Typography hierarchy persists across all breakpoints; scale fonts but maintain weight and color roles

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA:** Deep Purple (`#F0D7FF`) – Buttons, highlighted actions
- **Primary Link / Accent:** Brand Teal (`#034F46`) – Interactive elements, focus states, links
- **Text (Light Background):** True Black (`#1A1A1A`) – Default, primary content
- **Text (Dark Background):** Cream White (`#FFFFEB`) – Light text on dark cards
- **Background (Light):** Cream White (`#FFFFEB`) – Warm default background; avoid pure white
- **Background (Dark):** True Black (`#1A1A1A`) – Hero sections, dark cards, footers
- **Borders (Light):** Light Gray (`#DDDDDD`) or Muted Neutral (`#E4E4D0`) – Subtle separation
- **Warning / Alert:** Warning Orange (`#FFA946`) – Attention, errors, confirmations
- **Success State:** Soft Mint (`#CEF5CA`) – Positive feedback, confirmations

### Iteration Guide

1. **Start with typography.** All sections begin with EB Garamond headlines (display) or Figtree body. Never mix serif and sans at the same level; follow the hierarchy table exactly.

2. **Apply color roles consistently.** Purple for CTAs, teal for links, cream/black for background/text. When in doubt, default to the True Black and Cream White pairing; it never fails.

3. **Respect spacing base unit (8px).** Every dimension should be a multiple of 8px: padding `16px`, `24px`, `32px`; margins `16px`, `24px`, `60px`. No arbitrary sizing.

4. **Keep components consistent.** All buttons use Figtree 16px weight 600 with `16px 24px` padding and `12px` radius. Dark cards always use `40px` radius; light cards use `32px`. One variant per component type; exceptions require design team approval.

5. **Use shadows only when necessary.** Default is flat (`box-shadow: none`). Floating cards get `0 4px 12px rgba(0, 0, 0, 0.08)`; modals get `0 12px 32px rgba(0, 0, 0, 0.16)`. Never exceed L3.

6. **Test contrast ratios.** Light text on dark must be at least 4.5:1 (body) or 3:1 (large text). Dark text on light same standards. Use WCAG AAA for best practice.

7. **Implement focus states universally.** All interactive elements get `2px solid #034F46` outline offset `2px` on focus. Makes keyboard navigation accessible and clear.

8. **Scale typography responsively.** Desktop H1 = 120px; tablet H2 = 48px; mobile H2 = 28px. Use the breakpoints table to guide scaling; don't guess.

9. **Maintain touch target minimums.** Buttons and links must be at least `44px × 44px` on mobile; form inputs `44px` height. Test on real devices.

10. **Verify dark/light variants.** Components appear on both cream (`#FFFFEB`) and black (`#1A1A1A`) backgrounds. Purple button on cream is strong; on dark, use teal with border instead. Design for context.