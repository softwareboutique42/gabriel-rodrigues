# Slots Image Customization Guide

This guide explains how to replace the current text-based reel symbols with production-style slot images.

## Goal

Keep the deterministic game logic exactly as-is, while upgrading only presentation.

- Do not change RNG, reels, payline rules, or payout logic.
- Only change symbol rendering, asset files, and visual styles.

## Current Rendering Flow

The slots reel presentation is driven by these files:

- `src/scripts/slots/controller.ts`
- `src/pages/en/slots/index.astro`
- `src/pages/pt/slots/index.astro`
- `src/styles/global.css`

The controller maps runtime symbols (`A` to `E`) to visible labels using `SYMBOL_PRESENTATION`.

## Recommended Asset Spec

Use a consistent source sheet or per-symbol files.

- Canvas size per symbol: `512x512` (or `1024x1024` for high-density screens)
- Format: `webp` (preferred) or `png`
- Background: transparent or dark tinted, depending on style direction
- Keep all symbols aligned to the same visual baseline
- Export 2x assets for crispness on retina displays

Suggested symbol set:

- `A`: BAR
- `B`: SEVEN
- `C`: CROWN
- `D`: DIAMOND
- `E`: STAR

## Step 1: Add Assets

Create a public folder for symbols:

- `public/images/slots/symbols/`

Current shipped defaults (SVG atlas-friendly):

- `public/images/slots/symbols/bar.svg`
- `public/images/slots/symbols/seven.svg`
- `public/images/slots/symbols/crown.svg`
- `public/images/slots/symbols/diamond.svg`
- `public/images/slots/symbols/star.svg`

Alternative production formats (if you prefer raster):

- `public/images/slots/symbols/bar.webp`
- `public/images/slots/symbols/seven.webp`
- `public/images/slots/symbols/crown.webp`
- `public/images/slots/symbols/diamond.webp`
- `public/images/slots/symbols/star.webp`

## Step 2: Keep Symbol Identity Stable

In `src/scripts/slots/controller.ts`, keep symbol IDs (`A` to `E`) stable.

You can keep `SYMBOL_PRESENTATION` for fallback text and accessibility labels.

## Step 3: Render Images Via CSS by Symbol

The reel windows already receive symbol identity on each spin:

- `data-slots-symbol="A"`
- `data-slots-symbol="B"`
- `data-slots-symbol="C"`
- `data-slots-symbol="D"`
- `data-slots-symbol="E"`

Add/update CSS in `src/styles/global.css`:

```css
.slots-stage__reel-window {
  background-size: cover;
  background-position: center;
}

.slots-stage__reel-window[data-slots-symbol='A'] {
  background-image: url('/images/slots/symbols/bar.webp');
}

.slots-stage__reel-window[data-slots-symbol='B'] {
  background-image: url('/images/slots/symbols/seven.webp');
}

.slots-stage__reel-window[data-slots-symbol='C'] {
  background-image: url('/images/slots/symbols/crown.webp');
}

.slots-stage__reel-window[data-slots-symbol='D'] {
  background-image: url('/images/slots/symbols/diamond.webp');
}

.slots-stage__reel-window[data-slots-symbol='E'] {
  background-image: url('/images/slots/symbols/star.webp');
}

/* Optional: hide text once image pipeline is complete */
.slots-stage__reel-window .slots-symbol {
  opacity: 0;
}
```

## Step 4: Add Accessibility Labels

If you hide text, keep ARIA labels meaningful.

You can set this in `controller.ts` when symbols render:

- `windowEl.setAttribute('aria-label', 'Reel symbol BAR')`

Use localized labels if you want EN/PT specific naming.

## Step 5: Optional Professional Polish

For a more premium look:

- Add subtle per-symbol glow overlays (not full-screen bloom)
- Add a slight vertical texture to mimic reel glass
- Use controlled contrast so symbols are readable under all effects
- Keep reduced-motion mode readable and stable

## QA Checklist

After any image update:

1. Run `npm run lint`
2. Run `node --test tests/compatibility-contract.test.mjs tests/slots-i18n-parity-contract.test.mjs`
3. Run `npx playwright test e2e/compatibility.spec.ts --project=chromium --workers=1 --grep "slots runtime compatibility"`
4. Verify EN and PT routes:
   - `/en/slots/`
   - `/pt/slots/`

## Safety Rules

- Never modify payout or RNG code while changing visuals.
- Keep symbol key mapping (`A` to `E`) deterministic.
- Preserve `data-slots-*` hooks used by tests.
- Keep mobile readability first; do not ship tiny symbol art.
