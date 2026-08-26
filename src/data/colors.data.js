// AUTO-GENERATED from colors.json by scripts/inline-data.js — do not edit by hand.
// Run `npm run data:generate` to regenerate.
export default {
  "schemaVersion": "1.1",
  "palette": {
    "white": "#ffffff",
    "black": "#000000",
    "magenta": "#ff00ff",
    "purple": "#8b5cf6",
    "magenta2": "#d94f90",
    "red": "#ff0000",
    "cyan": "#00ffff",
    "green": "#00ff00"
  },
  "themeColors": [
    "magenta",
    "purple",
    "white"
  ],
  "accents": [
    "cyan",
    "red"
  ],
  "semanticUse": {
    "decoded": "white",
    "corruption": "magenta",
    "intimate": "purple",
    "corrupting": "magenta2",
    "void": "black",
    "system": "green"
  },
  "surfaces": {
    "bg": "#0a0a0a",
    "bgSecondary": "#0f0f1a",
    "surface": "#12121a",
    "checker": "#17171f",
    "surfaceElevated": "#1a1a24"
  },
  "elementalColors": {
    "water": "#0066cc",
    "wind": "#22c55e",
    "iron": "#f59e0b",
    "electric": "#a855f7",
    "fire": "#ef4444"
  },
  "elementalNotes": "NIKKE element colours. A defined, published component (`.element-badge`, `.element-water` … in nikke-utilities.css, `--nikke-element-*` custom properties) consumed by downstream NIKKE tools, so the hexes are a compatibility surface — changing one breaks callers. They are game data, NOT theme colours: they never carry corruption state, never replace a theme colour, and a composition must still read as on-theme with every element badge removed.",
  "tierPaletteNotes": "Rarity/tier/burst palettes beyond the five elements remain downstream concerns and are intentionally NOT in this file."
};
