# RFC-0001: AbyssalSeal built-in palettes

**Status**: Review
**Author**: whykusanagi
**Date**: 2026-11-09
**Type**: Standard

## Problem Statement

`AbyssalSeal` takes a free-form `colors` object. Every consumer so far has
hand-typed its own hexes: the gold NYE seal copied seven values out of a
livestream_asset campaign file, and the crimson seal was invented in a scratch
harness. That is the pattern that produced the colour drift this repo spent
0.3.4 cleaning up — each new render, often written by an LLM, picks "a gold"
or "a red" and the values diverge.

## Proposed Solution

Ship a fixed set of named palettes and make the name the supported interface.

```js
new AbyssalSeal(svg, { palette: 'gold' });
```

- `SEAL_PALETTES` is exported, frozen, and is the only source of these hexes.
- `palette` defaults to `'abyss'` (today's default look, unchanged).
- An unknown name **throws** `RangeError`. No silent fallback — a typo must
  not render a seal in the wrong colours.
- `colors` still exists and is applied on top of the palette, for one-off
  experiments. Anything that ships twice should become a palette here.
- The sigil tint follows the palette (`pink`) unless `sigilColor` is set.

### The palettes (locked)

Values are exactly what the approved renders used.

| key | abyss (default) | gold | crimson |
|---|---|---|---|
| pink (primary, sigil) | `#ff82d9` | `#ffd36b` | `#ff3b5c` |
| violet (rules) | `#b08aff` | `#c9a227` | `#a0182e` |
| iceCyan (motto, labels) | `#7ef0ff` | `#ffe9a0` | `#ff8095` |
| cyan (rim, highlights) | `#00ffff` | `#fff1b8` | `#ffb3c0` |
| plum (halo) | `#3a1828` | `#3a2a10` | `#3a0810` |
| accent (typing buffer) | `#d94f90` | `#e0b040` | `#d0203a` |
| white (legend, cursor) | `#ffffff` | `#fffaf0` | `#fff0f2` |

- **abyss** — the mandala's own tints; the seal's default identity.
- **gold** — ceremonial / New Year. Matches livestream_asset's `nye_gold`
  mandala colours, so the seal and ring agree on the same video.
- **crimson** — red-screen and alarm scenes; sits on a raw red backdrop.

Adding a palette is a Standard change: new row here, new entry in
`SEAL_PALETTES`, new pinned values in the test, new colour-sweep exceptions.
Changing an existing value is a breaking visual change for shipped renders.

## Enforcement

- `tests/lib/abyssal-seal.test.js` pins every hex of every palette.
- `tests/data/color-sweep.test.js` lists each hex as a declared exception, so a
  new unexplained colour in the component fails CI.

## Out of scope

- `CorruptedMandala` has the same free-form `colors` problem (the NYE gold ring
  is hand-copied in livestream_asset). Sharing these named palettes with the
  mandala is a follow-up RFC.
- A white/silver palette was discussed for the evening dress but has no
  approved render yet; it waits until one exists.
