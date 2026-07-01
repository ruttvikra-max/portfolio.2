# Slow Pour — Portfolio

> Design is craft, not output. I don't generate — I brew.

A coffee-themed product-design portfolio. This is the **Tier-0 foundation**: a fast,
fully-accessible, no-JS-required static page plus the complete design-token system.
Everything else (interactive 3D hero, scroll motion, case-study pages) layers on top
of this without changing the tokens or markup.

## Structure

```
.
├── index.html          # Tier-0 landing page (semantic, no-JS-required)
├── styles/
│   ├── tokens.css       # Design tokens: primitives → semantic (re-theme here)
│   └── base.css         # Reset, fonts, components, responsive, reduced-motion
├── fonts/               # Mileast (display) + Roboto (body)
└── Assets/              # Imagery / 3D assets (added in later tiers)
```

## Design tokens

Two layers, by design:

- **Primitives** — raw brand values (`--coffee-crema`, `--heat-500`, …).
- **Semantic** — roles components actually consume (`--surface-canvas`, `--text-primary`, `--accent`, …).

To re-theme the whole site, edit the **primitives** block in `styles/tokens.css`. Nothing else needs to change.

| Role | Token | Value |
|------|-------|-------|
| Canvas | `--surface-canvas` | `#F5ECD2` cream |
| Texture | `--surface-texture` | `#C7AD9E` kraft |
| Ink / dark | `--surface-inverse` | `#29303D` roast |
| Cool neutral | `--coffee-steam` | `#8082A6` |
| Heat (brew/CTA only) | `--heat-300/500/700` | `#F2C230 / #F2921D / #F24F13` |

Type: **Mileast** (display) + **Roboto** (body). Two weights only (400/500).

## Run it

No build step. Open `index.html`, or serve the folder:

```bash
python -m http.server 8000   # or: npx serve .
```

## Performance notes (Tier 0)

- No JS required to read or navigate (one tiny script only sets the footer year).
- Critical fonts preloaded; `font-display: swap`.
- The grid is pure CSS (no image). The hero mug is pure CSS (placeholder for the 3D/poster).
- All motion respects `prefers-reduced-motion`.

### TODO before launch
- [ ] Subset + convert fonts to **woff2** (Roboto .ttf is ~159 KB each; woff2 subset → ~15–30 KB).
- [ ] Replace the CSS mug with the real hero **poster** (AVIF/WebP, < 80 KB).
- [ ] Real case-study pages at `/work/[slug]`.

## Roadmap (build tiers)

- **Tier 0 — this** · static, accessible, tokenized. ✅
- **Tier 1 — motion** · scroll reveals, avatar companion, mobile hero video loop.
- **Tier 2 — interactive 3D** · React Three Fiber coffee machine (desktop), click-to-brew.

Tier-2 effects (ReactBits: TextType, SplashCursor, MagicBento/Masonry) and the button
micro-interaction spec are staged in [`tier2-effects/`](tier2-effects/README.md) — exact
install commands, deps, and config, ready to pull via the `shadcn` MCP once React lands.
Not wired into the static site.

### Migrating to Next.js (when we add Tier 1/2)
The tokens and fonts port 1:1. `tokens.css` → import in `app/globals.css` (or map to a
Tailwind theme). Each `<section>` in `index.html` becomes a React component; the page is
a single server component for the Tier-0 render, with 3D/motion dynamically imported and
capability-gated so it never blocks the first paint.
