<!--
  Copyright Artem Iagovdik <artyom.yagovdik@gmail.com>
  GitHub: https://github.com/artttj
-->
# Noto Visual Backport — Design Spec

**Date:** 2026-05-15
**Status:** Approved
**Scope:** Backport noto's visual design system into synto, with a11y compliance focus

## Goal

Backport the polished visual design from `/var/www/noto` into synto. Adopt noto's transparent surface hierarchy, gold accent system, DM Sans typography, glassmorphism, and micro-interactions. Ensure the light theme meets EU EN 301 549 / WCAG 2.1 AA contrast requirements. Unify design tokens into a shared file.

## Design Decisions

- **Visual identity:** Full backport — gold accent (`#e8b931`), DM Sans, glassmorphism, rgba transparency hierarchy
- **Light theme base:** Warm off-white (`#f5f5f5`), matching noto's approach
- **Font loading:** Self-hosted woff2 files bundled with the extension (~90KB total)
- **Token architecture:** Single shared `tokens.css` file, imported by both popup and options

## Token System

New file: `src/shared/tokens.css`

### Dark theme (default, `:root`)

Surfaces use rgba transparency hierarchy (white-on-black):

| Token | Value | Purpose |
|-------|-------|---------|
| `--c-bg` | `#0d0d0d` | Base background |
| `--c-surface` | `rgba(255,255,255,0.055)` | Card/surface |
| `--c-elevated` | `rgba(255,255,255,0.085)` | Hover/elevated |
| `--c-border` | `rgba(255,255,255,0.10)` | Standard border |
| `--c-border-hi` | `rgba(255,255,255,0.22)` | Emphasized border |
| `--c-accent` | `#e8b931` | Gold accent |
| `--c-accent-hi` | `#f0c94a` | Accent hover |
| `--c-accent-lo` | `#c9a028` | Accent muted |
| `--c-accent-dim` | `rgba(232,185,49,0.08)` | Accent background tint |
| `--c-btn-bg` | `rgba(255,255,255,0.94)` | Primary button background |
| `--c-btn-text` | `#0d0d0d` | Primary button text |
| `--c-text` | `rgba(238,238,238,0.96)` | Primary text (~13.5:1 on bg) |
| `--c-text-2` | `rgba(196,196,196,0.84)` | Secondary text (~9.5:1 on bg) |
| `--c-text-3` | `#949494` | Tertiary text (~5.0:1 on bg) |
| `--c-success` | `#5dd69c` | Success (~8.5:1 on bg) |
| `--c-error` | `#ff7070` | Error (~4.6:1 on bg) |
| `--c-warn` | `#e8b931` | Warning (reuses accent) |
| `--c-error-bg` | `rgba(255,96,96,0.10)` | Error tint |
| `--c-error-bd` | `rgba(255,110,110,0.28)` | Error border |
| `--c-input-bg` | `rgba(255,255,255,0.07)` | Input background |
| `--c-overlay` | `rgba(0,0,0,0.55)` | Modal overlay |
| `--c-toggle-bg` | `rgba(255,255,255,0.06)` | Toggle track |
| `--c-active-bg` | `rgba(255,255,255,0.10)` | Active state |
| `--c-header-bg` | `rgba(255,255,255,0.03)` | Header background |

Glass tokens:

| Token | Value |
|-------|-------|
| `--glass-blur` | `blur(12px) saturate(140%)` |
| `--glass-blur-sm` | `blur(8px) saturate(120%)` |
| `--glass-gloss` | `inset 0 1px 0 rgba(255,255,255,0.10)` |

Shadow tokens:

| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.20)` |
| `--shadow-md` | `0 4px 24px rgba(0,0,0,0.25)` |

Structural tokens:

| Token | Value |
|-------|-------|
| `--r-sm` | `4px` |
| `--r-md` | `8px` |
| `--r-lg` | `12px` |
| `--r-xl` | `20px` |
| `--font` | `'DM Sans', system-ui, -apple-system, sans-serif` |
| `--font-mono` | `'Space Mono', ui-monospace, 'SF Mono', monospace` |
| `--ease` | `cubic-bezier(0.4, 0.0, 0.2, 1)` |
| `--t` | `160ms` |

### Light theme (`html[data-theme="light"]`)

Surfaces flip to rgba transparency hierarchy (black-on-white):

| Token | Value | Contrast on `#f5f5f5` |
|-------|-------|------------------------|
| `--c-bg` | `#f5f5f5` | — |
| `--c-surface` | `rgba(0,0,0,0.04)` | — |
| `--c-elevated` | `rgba(0,0,0,0.07)` | — |
| `--c-border` | `rgba(0,0,0,0.10)` | — |
| `--c-border-hi` | `rgba(0,0,0,0.22)` | — |
| `--c-accent` | `#d4a72c` | ~7.2:1 |
| `--c-accent-hi` | `#e0b840` | — |
| `--c-accent-lo` | `#b8910f` | — |
| `--c-accent-dim` | `rgba(212,167,44,0.06)` | — |
| `--c-btn-bg` | `#111111` | — |
| `--c-btn-text` | `#f5f5f5` | ~14.5:1 on `#111` |
| `--c-text` | `#1a1a1a` | ~13.7:1 |
| `--c-text-2` | `rgba(30,30,30,0.72)` | ~5.1:1 |
| `--c-text-3` | `#595959` | ~5.4:1 |
| `--c-success` | `#1a9e60` | ~4.8:1 |
| `--c-error` | `#c0392b` | ~5.4:1 |
| `--c-warn` | `#d4a72c` | — |
| `--c-error-bg` | `rgba(192,57,43,0.08)` | — |
| `--c-error-bd` | `rgba(192,57,43,0.22)` | — |
| `--c-input-bg` | `rgba(0,0,0,0.04)` | — |
| `--c-overlay` | `rgba(255,255,255,0.55)` | — |
| `--c-toggle-bg` | `rgba(0,0,0,0.06)` | — |
| `--c-active-bg` | `rgba(0,0,0,0.08)` | — |
| `--c-header-bg` | `rgba(0,0,0,0.02)` | — |
| `--glass-gloss` | `inset 0 1px 0 rgba(255,255,255,0.6)` | — |
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.10)` | — |
| `--shadow-md` | `0 4px 24px rgba(0,0,0,0.12)` | — |

## Typography

### Font files

Self-hosted woff2 in `src/assets/fonts/`:

- `dm-sans-400.woff2` — Regular weight for body text
- `dm-sans-600.woff2` — Semi-bold for headings, buttons, labels
- `space-mono-400.woff2` — Monospace for code blocks

~90KB total. Loaded with `font-display: swap`.

### Font-face declarations (in tokens.css)

```css
@font-face {
  font-family: 'DM Sans';
  src: url('../assets/fonts/dm-sans-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'DM Sans';
  src: url('../assets/fonts/dm-sans-600.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Space Mono';
  src: url('../assets/fonts/space-mono-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### Typography scale

| Element | Size | Weight | Tracking | Purpose |
|---------|------|--------|----------|---------|
| Body | 13px | 400 | 0 | Main content, messages |
| Section label | 11px | 600 | 0.06em | Uppercase labels |
| Button | 13px | 600 | 0 | Primary actions |
| Small label | 10-11px | 500-600 | 0 | Badges, meta |
| Chat bubble | 13px | 400 | 0 | AI/user messages |
| Code preview | 13px | 400 | 0 | Monospace content |

Antialiasing: `-webkit-font-smoothing: antialiased` on `html/body`.

## Accessibility (EN 301 549 / WCAG 2.1 AA)

### Contrast ratios

All text tokens meet 4.5:1 minimum for normal text. All borders and UI components meet 3:1 minimum for non-text contrast. See token tables above for computed ratios.

### Focus-visible states

```css
:focus-visible {
  outline: 2px solid #5b9fd6;
  outline-offset: 2px;
}
html[data-theme="light"] :focus-visible {
  outline-color: #2563eb;
}
```

Keyboard-only focus ring — does not show on mouse click.

### Touch targets

All interactive elements: minimum 44x44px touch target area via `min-height: 44px; min-width: 44px`.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### ARIA additions

- `role="tablist"` / `role="tab"` / `aria-selected` on intent tabs
- `aria-label` on all icon-only buttons
- `aria-hidden="true"` on decorative SVG icons
- `.visually-hidden` utility class for screen-reader-only text

### WCAG criteria covered

- 1.4.3 Contrast (Minimum) — all text meets 4.5:1
- 1.4.11 Non-text Contrast — borders and UI components meet 3:1
- 2.4.7 Focus Visible — keyboard focus ring on all interactive elements
- 2.5.5 Target Size — 44px minimum touch targets
- 2.3.3 Animation from Interactions — reduced-motion support

## Bug Fix

The popup currently sets `data-theme` to the raw stored value (`settings.theme ?? 'dark'`), which means `'system'` is never resolved to `'light'` or `'dark'`. The options page correctly uses `applyAndWatchTheme()`. Fix: popup should use `applyAndWatchTheme()` from `theme.ts`.

## Implementation Phases

### Phase 1: Tokens + A11y

Create `src/shared/tokens.css` with full token definitions. Remove duplicated `:root` and `html[data-theme="light"]` blocks from popup.css and options.css, replacing with `@import`. Fix system theme resolution bug in popup. Add focus-visible, reduced-motion, touch target, and ARIA improvements.

**Files:**
- `src/shared/tokens.css` — NEW
- `src/popup/popup.css` — remove tokens, add import, update selectors
- `src/options/options.css` — remove tokens, add import, update selectors
- `src/popup/popup.ts` — use `applyAndWatchTheme()`
- `src/popup/popup.html` — ARIA attributes
- `src/options/options.html` — ARIA attributes

### Phase 2: Typography + Fonts

Add self-hosted woff2 font files. Add `@font-face` declarations to tokens.css. Update font-family references in both CSS files. Update build config to copy font assets.

**Files:**
- `src/assets/fonts/*.woff2` — NEW
- `src/shared/tokens.css` — add @font-face
- `src/popup/popup.css` — update font-family, letter-spacing, antialiasing
- `src/options/options.css` — same typography updates
- Build config — woff2 copy step

### Phase 3: Glassmorphism + Micro-interactions

Activate glass tokens from Phase 1. Add `backdrop-filter` to header. Add `scale(0.96)` active feedback on buttons. Add `cubic-bezier(0.16, 1, 0.3, 1)` entrance animations for chat bubbles.

**Files:**
- `src/popup/popup.css` — glass + motion
- `src/options/options.css` — glass + motion