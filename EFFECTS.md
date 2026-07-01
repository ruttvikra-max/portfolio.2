# Effects layer — plug & play

All page motion is decoupled into one layer so effects can be added, swapped, or
removed without touching layout or components.

- **CSS:** [`styles/effects.css`](styles/effects.css) — effect styling, scoped under `.js-motion`.
- **JS:** [`scripts/effects.js`](scripts/effects.js) — the registry that wires behaviors.
- **Dials:** [`styles/tokens.css`](styles/tokens.css) — `--dur-*`, `--ease-*` timing/easing.

## How it works
- `scripts/effects.js` adds `.js-motion` to `<html>` **only** when motion is allowed.
  Every CSS effect is scoped under `.js-motion`, so nothing animates until armed.
- **Progressive enhancement:** content is fully visible by default. No-JS,
  `prefers-reduced-motion`, and the kill switch all leave the page static and readable.

## Apply an effect (the plug-and-play surface)
Add an attribute to any element:

| Effect | Attribute | Options | Tech |
|---|---|---|---|
| Scroll reveal | `data-reveal` | row stagger via `effects.css` nth-child | CSS + IntersectionObserver |
| Hero text reveal | `data-fx="splittext"` | `data-fx-split="words\|chars"`, `data-fx-stagger="<ms>"`, `data-fx-duration="<ms>"` | anime.js (lazy via CDN) |
| Hero entrance | (auto on `.hero__copy`) | edit `heroFade` in `effects.css` | CSS |
| Pour button | `.fx-pour` (class) | uses `--accent-gradient` | CSS |
| Directional fill button | `data-fx="fill"` | `--fx-fill-color`, `--fx-fill-dur` (placeholders) | CSS + JS pointer origin |
| Scroll avatar companion | `data-fx="scroll-avatar"` | crossfades standing→drinking via `--scroll` | CSS + JS scroll progress |

Remove the attribute → effect gone. That's the whole contract.

## Global controls
- **Kill all effects:** add `data-fx-off` to `<html>` → registry wires nothing, content visible.
- **Tune speed/feel globally:** edit `--dur-*` / `--ease-*` in `tokens.css`.
- **Reduced motion:** honored automatically (no effects, content visible).

## Add a NEW effect
1. **CSS-only effect:** add a scoped rule in `effects.css` under `.js-motion`
   (e.g. `.js-motion .fx-pour { ... }`), apply the class in markup.
2. **JS behavior:** add an `init*()` function in `effects.js`, key it off a
   `data-fx~="<name>"` attribute, and call it from the armed block. Lazy-import
   any library so its cost is opt-in.

## Notes
- anime.js loads from a CDN (esm.sh) via the import map in `index.html`. Before
  launch, pin/self-host it so the hero never depends on a third party.
- Tier-2 effects (TextType, SplashCursor, MagicBento/Masonry) are staged in
  [`tier2-effects/`](tier2-effects/README.md) and will plug into this same layer.
