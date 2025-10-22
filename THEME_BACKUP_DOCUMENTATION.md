# Theme Backup Documentation - Dark Theme to White Theme Change

**Date:** 2025-10-22
**Purpose:** Document the original dark theme configuration for potential reversion

## Overview

This document contains all original styling values and configurations before converting from dark theme to white theme. The application currently uses a dark teal/cyan theme with yellow accent highlights.

---

## 1. Root Layout Configuration

**File:** `src/app/layout.tsx:23`

**Original:**

```tsx
<html lang="en" className={'min-h-full dark'}>
```

**Key Change:** The `dark` class is applied to the HTML element, triggering dark mode CSS variables.

---

## 2. Global CSS Variables

**File:** `src/styles/globals.css`

### Current :root (Light Mode - Lines 7-33)

```css
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(240 5% 96%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(222.2 84% 4.9%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(222.2 84% 4.9%);
  --primary: hsl(222.2 47.4% 11.2%);
  --primary-foreground: hsl(240 5% 96%);
  --secondary: hsl(210 40% 96.1%);
  --secondary-foreground: hsl(222.2 47.4% 11.2%);
  --muted: hsl(210 40% 96.1%);
  --muted-foreground: hsl(215.4 16.3% 46.9%);
  --accent: hsl(210 40% 96.1%);
  --accent-foreground: hsl(222.2 47.4% 11.2%);
  --destructive: hsl(0 84.2% 60.2%);
  --destructive-foreground: hsl(210 40% 98%);
  --border: hsl(194 9% 28%);
  --input: hsl(214.3 31.8% 91.4%);
  --ring: hsl(222.2 84% 4.9%);
  --radius: 16px;
}
```

### Current .dark (Active Theme - Lines 35-60)

```css
.dark {
  --background: hsl(180 18% 7%); /* Deep teal-cyan background */
  --foreground: hsl(240 5% 96%); /* Light gray text */
  --card: hsl(222.2 84% 4.9%); /* Very dark blue cards */
  --card-foreground: hsl(210 40% 98%); /* Near white text */
  --popover: hsl(222.2 84% 4.9%); /* Dark blue popover */
  --popover-foreground: hsl(210 40% 98%); /* Near white text */
  --primary: hsl(210 40% 98%); /* Near white primary */
  --primary-foreground: hsl(222.2 47.4% 11.2%); /* Dark blue text */
  --secondary: hsl(240, 5%, 80%); /* Light gray secondary */
  --secondary-foreground: hsl(0 0% 100%); /* Pure white text */
  --muted: hsl(217.2 32.6% 17.5%); /* Muted dark blue */
  --muted-foreground: hsl(180 1% 48%); /* Medium gray */
  --accent: hsl(217.2 32.6% 17.5%); /* Dark blue accent */
  --accent-foreground: hsl(210 40% 98%); /* Near white text */
  --destructive: hsl(0 62.8% 30.6%); /* Dark red */
  --destructive-foreground: hsl(210 40% 98%); /* Near white text */
  --border: hsl(187 10% 17%); /* Dark teal border */
  --input: hsl(217.2 32.6% 17.5%); /* Dark blue input */
  --ring: hsl(58 100% 70%); /* Yellow ring/focus */
}
```

---

## 3. Dashboard Styling

**File:** `src/styles/dashboard.css`

### Gradient Effects (Lines 11-63)

```css
/* Top gradient blur - yellow/cyan effect */
.dashboard-shared-top-grainy-blur {
  background: linear-gradient(
    0deg,
    rgba(255, 251, 229, 0) 0%,
    rgba(21, 227, 227, 0.06) 35.5%,
    rgba(255, 248, 0, 0.48) 80.5%
  );
  filter: blur(26px);
}

.dashboard-shared-top-grainy-blur::before {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(168, 240, 248, 0.6) 100%);
  filter: blur(26px);
}

/* Bottom gradient blur - yellow/cyan effect */
.dashboard-shared-bottom-grainy-blur {
  background: linear-gradient(
    180deg,
    rgba(255, 251, 229, 0) 0%,
    rgba(21, 227, 227, 0.06) 35.5%,
    rgba(255, 248, 0, 0.48) 80.5%
  );
  filter: blur(100px);
}

.dashboard-shared-bottom-grainy-blur::before {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(168, 240, 248, 0.6) 100%);
  filter: blur(100px);
}
```

### Sidebar Items (Lines 65-82)

```css
.dashboard-sidebar-items {
  svg.lucide {
    color: #4b4f4f; /* Dark gray icons */
  }
  &.dashboard-sidebar-items-active {
    background: #161d1d; /* Very dark teal background */
    svg.lucide {
      color: hsl(var(--primary)); /* Light/white icons when active */
    }
  }
}

.dashboard-sidebar-items:hover {
  background: #161d1d; /* Very dark teal on hover */
  svg.lucide {
    color: hsl(var(--primary)); /* Light icons on hover */
  }
}
```

### Yellow Highlights (Lines 84-112)

```css
/* Yellow accent line - signature element */
.dashboard-sidebar-highlight:after {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 15%,
    rgba(255, 248, 0, 0.6) 50%,
    rgba(255, 255, 255, 0) 85%
  );
}

.dashboard-header-highlight::after {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 15%,
    rgba(255, 248, 0, 0.6) 50%,
    rgba(255, 255, 255, 0) 85%
  );
}
```

---

## 4. Checkout Styling

**File:** `src/styles/checkout.css`

### Gradient Effects (Lines 15-20, 59-78)

```css
.top-left-gradient-background {
  background: url('/assets/background/checkout-top-gradient.svg') no-repeat top left;
}

.bottom-right-gradient-background {
  background: url('/assets/background/checkout-bottom-gradient.svg') no-repeat bottom right;
}

/* Mobile gradients - yellow/cyan */
.checkout-mobile-grainy-blur {
  background: linear-gradient(
    0deg,
    rgba(255, 251, 229, 0) 0%,
    rgba(21, 227, 227, 0.06) 35.5%,
    rgba(255, 248, 0, 0.48) 80.5%
  );
  filter: blur(26px);
}

.checkout-mobile-grainy-blur::before {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(168, 240, 248, 0.6) 100%);
  filter: blur(26px);
}
```

### Yellow Highlights (Lines 22-46, 101-115)

```css
.checkout-yellow-highlight {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 15%,
    rgba(255, 248, 0, 0.6) 50%,
    rgba(255, 255, 255, 0) 85%
  );
}

.checkout-hard-blur {
  background: #fff800; /* Pure yellow */
  opacity: 0.1;
  filter: blur(12px);
}

.checkout-soft-blur {
  background: #fff800; /* Pure yellow */
  opacity: 0.3;
  filter: blur(32px);
}
```

### Success Page (Lines 117-145)

```css
.checkout-success-background {
  background: linear-gradient(
    180deg,
    rgba(255, 251, 229, 0) 0%,
    rgba(21, 227, 227, 0.06) 35.5%,
    rgba(255, 248, 0, 0.18) 80.5%
  );
  filter: blur(100px);
}

.checkout-success-background::before {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(168, 240, 248, 0.6) 100%);
  filter: blur(100px);
}
```

### Footer Border (Lines 147-164)

```css
.footer-border {
  background: linear-gradient(90deg, rgba(65, 75, 78, 0) 0%, #414b4e 49.5%, rgba(65, 75, 78, 0) 100%);
}

.footer-border::after {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 15%,
    rgba(255, 248, 0, 0.6) 50%,
    rgba(255, 255, 255, 0) 85%
  );
}
```

---

## 5. Component Classes

**File:** `src/styles/globals.css` (Lines 128-193)

### Button Styles

```css
.btn-primary {
  @apply bg-blue-600 text-white border border-blue-600 hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-white text-slate-700 border border-slate-300 hover:bg-slate-50;
}
```

### Card Styles

```css
.card {
  @apply bg-white rounded-2xl shadow-lg border border-slate-200;
}
```

---

## Color Palette Summary

### Primary Colors (Dark Theme)

- **Background:** `hsl(180 18% 7%)` - Deep teal (#0f1616)
- **Foreground:** `hsl(240 5% 96%)` - Light gray text (#f4f4f5)
- **Card:** `hsl(222.2 84% 4.9%)` - Very dark blue (#020817)
- **Border:** `hsl(187 10% 17%)` - Dark teal border (#252e30)

### Accent Colors

- **Yellow Highlight:** `#fff800` / `rgba(255, 248, 0, 0.6)`
- **Cyan Accent:** `rgba(21, 227, 227, 0.06)` / `rgba(168, 240, 248, 0.6)`
- **Yellow Focus Ring:** `hsl(58 100% 70%)`

### Sidebar/Navigation

- **Active Background:** `#161d1d`
- **Icon Default:** `#4b4f4f`
- **Icon Active:** Uses `--primary` (near white)

---

## Files Modified in Theme Change

1. `src/app/layout.tsx` - HTML class
2. `src/styles/globals.css` - CSS variables
3. `src/styles/dashboard.css` - Dashboard gradients, sidebar, highlights
4. `src/styles/checkout.css` - Checkout gradients and highlights

---

## Reversion Instructions

To revert to the dark theme:

1. **Restore HTML class:**

   ```tsx
   // src/app/layout.tsx:23
   <html lang="en" className={'min-h-full dark'}>
   ```

2. **Restore CSS variables:**
   - Copy the `.dark` section values from this document back to `src/styles/globals.css:35-60`

3. **Restore dashboard styling:**
   - Restore gradient colors in `src/styles/dashboard.css`
   - Restore sidebar colors (lines 65-82)
   - Keep yellow highlights unchanged (they work in both themes)

4. **Restore checkout styling:**
   - Restore gradient effects in `src/styles/checkout.css`
   - Keep yellow highlights unchanged

5. **Test thoroughly:**
   - Verify dashboard navigation visibility
   - Check checkout page backgrounds
   - Ensure all text is readable
   - Test icon visibility in sidebar

---

## Notes

- Yellow accent highlights (`#fff800`) are a signature design element
- Grain background texture (`/assets/background/grain-bg.svg`) is used throughout
- SVG gradient assets may need to be inverted/regenerated for white theme
- Focus states use yellow ring for accessibility
- Consider keeping some subtle accent elements for brand consistency

---

**End of Backup Documentation**
