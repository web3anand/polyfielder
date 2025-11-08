# Premium Design System

## Design Philosophy

Inspired by modern fintech apps (like Neobank), this design system emphasizes:

- **Minimalism**: Clean, uncluttered interfaces with purposeful white space
- **Sophistication**: Dark theme with premium color palette
- **Clarity**: Clear visual hierarchy and typography
- **Performance**: Snappy interactions with subtle animations

## Color Palette

### Primary Colors
- **Background**: `#0a0a0f` - Deep dark background
- **Card Background**: `#141419` - Slightly elevated surface
- **Border**: `#1f1f24` - Subtle separation

### Accent Colors
- **Primary Green**: `#00ff87` - Success, positive actions, "Yes" odds
- **Secondary Blue**: `#00d4ff` - Complementary accent
- **Accent Red**: `#ff6b6b` - Warnings, "No" odds
- **Purple**: `#7b68ee` - Secondary accent

### Text Colors
- **Primary Text**: `#ffffff` - High contrast
- **Secondary Text**: `#9ca3af` (gray-400)
- **Tertiary Text**: `#6b7280` (gray-500)

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

### Font Weights
- **Light**: 300 - Rarely used
- **Regular**: 400 - Body text
- **Medium**: 500 - Subheadings
- **Semibold**: 600 - Buttons, labels
- **Bold**: 700-900 - Headings, emphasis

### Letter Spacing
- **Tight**: `-0.01em` - Body text
- **Wide**: `0.02em` - Small labels
- **Wider**: `0.05em` - Uppercase badges

## Components

### Card System

#### Modern Card (`.card-modern`)
```css
background: #141419;
border: 1px solid #1f1f24;
border-radius: 20px;
transition: all 0.2s ease;
```

Hover state:
- Border color changes to primary green with opacity
- Subtle lift with `translateY(-2px)`
- Soft glow shadow

### Buttons

#### Primary Button (`.btn-gradient`)
- Gradient: `#00ff87` → `#00d4ff`
- Dark text (`#0a0a0f`) for high contrast
- Font weight: 600
- Hover: Lift effect + enhanced shadow

#### Secondary Button (`.btn-secondary`)
- Background: `#141419`
- Border: `#1f1f24`
- White text
- Hover: Lighter background + border opacity

### Badges

#### Pill Badge (`.pill-badge`)
- Background: `rgba(0, 255, 135, 0.1)` - Translucent green
- Text color: `#00ff87`
- Small padding: `4px 12px`
- Border radius: `20px` (fully rounded)
- Tiny font: `0.75rem` with 600 weight
- Letter spacing for readability

#### Status Live (`.status-live`)
- Background: `rgba(255, 107, 107, 0.15)` - Translucent red
- Animated pulsing dot indicator
- Uppercase text with wide tracking
- Font size: `0.7rem`

## Layout

### Spacing
- **Container**: `max-w-7xl mx-auto`
- **Padding**: `px-6` (24px) on desktop
- **Gap between cards**: `gap-3` (12px) for tight layouts, `gap-6` (24px) for sections

### Grid System
- **Desktop**: 3-column grid (2 cols for markets, 1 col for sidebar)
- **Mobile**: Single column, full width
- Responsive with Tailwind breakpoints

## Interactions

### Transitions
- **Default**: `all 0.2s ease` - Quick, responsive
- **Hover states**: Subtle transforms and color changes
- **Active states**: `scale-95` for buttons (tactile feedback)

### Animations

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

#### Slide In
```css
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
```

#### Pulse Dot (for live indicator)
```css
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
```

## UI Patterns

### Header
- Sticky positioning
- Transparent background with backdrop blur
- Minimal height (80px)
- Brand logo with gradient accent
- Connection status in compact badges

### Market Cards
- Compact, information-dense
- Clear visual separation between YES/NO odds
- Nested dark background (`#0d0d11`) for odds containers
- Hover states on individual odds
- CTA button with strong visual weight

### Odds Display
- Large, bold numbers for price
- Small uppercase labels
- Color coding: Green for YES, Red for NO
- Implied probability shown in smaller text

### Live Scores Sidebar
- Sticky positioning to stay visible
- Compact game cards
- Live indicator with pulsing animation
- Score display with tabular numbers
- Team names truncated with ellipsis

## Accessibility

### Contrast Ratios
- Primary text on background: >14:1
- Secondary text on background: >7:1
- All interactive elements meet WCAG AA standards

### Interactive Elements
- Clear focus states
- Adequate touch targets (min 44x44px)
- Disabled states with reduced opacity

## Dark Theme Optimization

- Slightly reduced contrast to prevent eye strain
- Subtle borders instead of harsh lines
- Soft shadows using primary color with low opacity
- No pure black backgrounds (using `#0a0a0f` instead)

## Performance Considerations

- Hardware-accelerated animations (transform, opacity)
- Minimal reflows/repaints
- Efficient CSS selectors
- Optimized font loading with `display=swap`

## Responsive Design

### Mobile (<640px)
- Single column layout
- Reduced padding and gaps
- Simplified header
- Hidden sidebar (accessible via toggle)

### Tablet (640px - 1024px)
- Two column layout where appropriate
- Maintained spacing and padding
- Responsive font sizes

### Desktop (>1024px)
- Full three-column layout
- Maximum content width: `1280px`
- Sidebar always visible and sticky

