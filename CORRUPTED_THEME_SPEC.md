# Corrupted Theme Specification

**Version:** 1.3
**Author:** whykusanagi
**Status:** Production
**License:** MIT (for contribution to corrupted-theme package)

---

## Overview

The **Corrupted Theme** is a visual aesthetic for digital interfaces that simulates neural corruption, data degradation, and system instability. It combines cyberpunk color schemes, Japanese text corruption, and glitch effects to create an unsettling yet captivating user experience.

**Core Concept:** Information appears to be **decaying**, **corrupted**, or **fighting to emerge** from digital chaos.

---

## Visual Principles

### 1. Color Palette

The palette has two tiers, and the distinction matters more than any
individual hex value. **Theme colors carry meaning. Accent colors carry
legibility.**

**Theme colors — magenta, violet, white.** These three are the aesthetic.
Any composition should read as belonging to the theme using only these.

```css
--corrupted-white:    #ffffff;  /* Stable, decoded, final readable state */
--corrupted-magenta:  #ff00ff;  /* Primary corruption */
--corrupted-purple:   #8b5cf6;  /* Violet — deep/intimate corruption */
```

**Supporting colors.** Extensions of the theme rather than additions to it.

```css
--corrupted-magenta2: #d94f90;  /* High-energy / playful corruption */
--corrupted-black:    #000000;  /* Background, void, corrupted holes */
--corrupted-green:    #00ff00;  /* Rare matrix/system callback */
```

**Accent colors — cyan and red.** These exist to make a visual *work*:
highlight something, or separate text from a dark background. They are a
typographic and compositional tool, not a state signal.

```css
--corrupted-cyan:     #00ffff;  /* Accent — highlight, separation */
--corrupted-red:      #ff0000;  /* Accent — highlight, separation, alarm */
```

**Usage Guidelines:**
- **White (#ffffff)**: Stable/decoded text, final readable state. The
  endpoint every corruption animation settles to.
- **Magenta (#ff00ff)**: Primary corruption color, the main glitch aesthetic.
- **Violet (#8b5cf6)**: Deep corruption — intimate/NSFW phrases, intense
  degradation, depth and shadow. (The CSS variable is
  `--corrupted-purple`; violet is the design name for the same colour.)
- **Magenta2 (#d94f90)**: Playful corruption — SFW phrases, high-energy
  glitches. A magenta variant, not a fourth theme colour.
- **Black (#000000)**: Background, void areas, corrupted "holes" in data.
- **Green (#00ff00)**: Rare matrix/system callback.
- **Cyan (#00ffff)** and **Red (#ff0000)**: accents. Reach for them when a
  composition needs a highlight, or when text would otherwise sink into a
  dark background. Red additionally reads naturally as alarm, so it suits
  critical states — but that is a convention it lends itself to, not a
  reservation. Neither accent should carry the identity of a component.

**Cyan is not, and never was, a stable-text colour.** It appeared in that
role by mistake and spread; see the 1.2 entry in Version History.

**Surfaces — the dark ramp.** Backgrounds are not palette colours: they carry
no corruption state, they are the ground the palette sits on. Four steps,
declared once in `variables.css` and mirrored in `colors.json` under
`surfaces`. Reach for a step rather than picking a new dark.

```css
--bg: #0a0a0a;               /* Page ground */
--bg-secondary: #0f0f1a;     /* Deep purple-black, section ground */
--surface: #12121a;          /* Panel/card sitting on the ground */
--surface-elevated: #1a1a24; /* Raised: hover, active tile, popover */
--checker: #17171f;          /* Transparency checkerboard square */
```

### Element Colours (NIKKE)

A **defined, published component** — `.element-badge` / `.element-water` … in
`nikke-utilities.css`, plus `--nikke-element-*` custom properties — consumed
by downstream NIKKE tools. The hexes are a compatibility surface: changing one
breaks callers.

```css
--nikke-element-water:    #0066cc;
--nikke-element-wind:     #22c55e;
--nikke-element-iron:     #f59e0b;
--nikke-element-electric: #a855f7;
--nikke-element-fire:     #ef4444;
```

**They are game data, not theme colours.** Three rules follow:

1. They never carry corruption state. Status/alert/badge styling uses the
   palette — green for system, magenta2 for corrupting, red for alarm. Theme
   chrome borrowing an element hex is how `.badge.error` and `fire` ended up
   the same colour.
2. They never replace a theme colour in a composition.
3. A layout must still read as on-theme with every element badge removed.

Rarity/tier/burst palettes beyond the five elements stay downstream and are
deliberately absent from `colors.json`.

### Enforcement

`tests/data/color-sweep.test.js` sweeps every `src/` and `examples/` source and
fails on any colour that is not the palette, a surface token, or a justified
entry in its `ALLOWED` list (third-party brands, declared component artwork,
frozen public API defaults). Add a deliberate exception with a reason rather
than widening the matcher.

Two things the guard has to get right to be worth having:

- It reads `rgb()` and `rgba()`, not only hex. A remap that fixes `color` and
  leaves the matching `background: rgba(...)` on the old value is invisible
  otherwise, which is exactly how it shipped the first time.
- **Element colours are legal only in the files that own the element system.**
  Allowing them everywhere is what let `.badge.error` be fire and
  `.badge.success` be wind: the guard saw a known colour and passed. Rule 1
  above is only enforceable if the guard can tell a badge from a border.

### 2. Text Shadow Effects

**Cyberpunk Glow:**
```css
text-shadow:
    0 0 10px #ff00ff,    /* Inner magenta glow */
    0 0 20px #ff00ff,    /* Mid magenta glow */
    0 0 30px #8b5cf6,    /* Outer purple haze */
    2px 2px 0 #ff0000,   /* Red chromatic aberration */
    -2px -2px 0 #d94f90; /* Magenta chromatic aberration */
```

**Purpose:** Creates RGB separation effect with magenta/purple dominant theme, simulates CRT display corruption, adds depth.

### 3. Glitch Animations

**Basic Skew Glitch:**
```css
@keyframes glitch {
    0%   { transform: skew(0deg); }
    25%  { transform: skew(2deg); }
    50%  { transform: skew(-2deg); }
    75%  { transform: skew(1deg); }
    100% { transform: skew(0deg); }
}
```

**Color Shift:**
```css
@keyframes colorShift {
    0%   { color: #ff00ff; }  /* Magenta */
    33%  { color: #8b5cf6; }  /* Purple */
    66%  { color: #d94f90; }  /* Magenta2 */
    100% { color: #ff00ff; }  /* Back to Magenta */
}
```

**Usage:** Apply to corrupted/unstable elements, cycle at 0.1s-0.5s intervals. Uses magenta/purple theme instead of cyan.

---

## Character Sets for Corruption

### 1. Japanese Katakana (Primary Corruption)
```
アイウエオカキクケコサシスセソ
タチツテトナニヌネノハヒフヘホ
マミムメモヤユヨラリルレロワヲン
```

**Purpose:** Primary visual corruption, Matrix-style cascade effect, high-tech aesthetic.

### 2. Japanese Hiragana (Softer Corruption)
```
あいうえおかきくけこさしすせそ
たちつてとなにぬねのはひふへほ
まみむめもやゆよらりるれろわをん
```

**Purpose:** Softer corruption, less aggressive visual weight, intimate/personal corruption.

### 3. Romaji (Readable Glitch)
```
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
```

**Purpose:** Semi-readable corruption, bridge between chaos and English, Western glitch aesthetic.

**English Letter Substitution Mode:**
For pure English corruption (SFW alternative), randomly replace letters with other letters:
```javascript
// Example: "Hello World" → "Hrllo Wmrld" → "Hrllz Wmrld" → "Hello World"
function corruptEnglishLetters(text, corruptionLevel = 0.5) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return text.split('').map(char => {
        if (letters.includes(char) && Math.random() < corruptionLevel) {
            // Replace with random letter of same case
            const isUpper = char === char.toUpperCase();
            const randomChar = letters[Math.floor(Math.random() * letters.length)];
            return isUpper ? randomChar.toUpperCase() : randomChar.toLowerCase();
        }
        return char;
    }).join('');
}
```

**Use Case:** Professional/corporate projects needing glitch effects without Japanese characters.

### 4. Symbols (Decorative Corruption)
```
0123456789!@#$%^&*()_+-=[]{}|;:,.<>?~`
★☆♥♡✧✦◆◇●○♟☣☭☾⚔✡☯⚡
```

**Purpose:** Visual punctuation, decorative glitches, add variety to corruption patterns.

### 5. Block Characters (Heavy Corruption)
```
█▓▒░▄▀▌▐
╔╗╚╝═║╠╣
▲▼◄►◊○●◘
```

**Purpose:** Severe corruption, data loss visual, terminal state indicators.

---

## Corruption Patterns

### Pattern 1: Character Corruption (Visual Glitch Only)

**Concept:** Final text emerges character-by-character from random character noise.

**What it is:** Pure visual glitch effect using random characters (Katakana, Hiragana, symbols)
**Content:** Always SFW - no phrases, just random characters
**Component:** `CorruptedText` class

**Implementation:**
```javascript
// Revealed portion (stable white) + random character noise (corruption)
const revealed = finalText.substring(0, revealedChars);
const remaining = finalText.length - revealedChars;

// Generate random character noise (NO PHRASES)
const KATAKANA = 'アイウエオカキクケコサシスセソ...';
const SYMBOLS = '!@#$%^&*()_+-=';
let chaos = '';
for (let i = 0; i < remaining; i++) {
    // Random character from set - no semantic meaning
    chaos += KATAKANA[Math.floor(Math.random() * KATAKANA.length)];
}

// Display: revealed (stable white) + character noise (magenta/purple corruption)
element.innerHTML =
    `<span style="color: #ffffff;">${revealed}</span>` +
    `<span style="color: #ff00ff;">${chaos}</span>`;
```

**Visual Effect:**
```
Initial:  アエ#カ*テ@ナ闇▓サシ%ク...
         ↓
Step 1:   N エ#ラ*ル@レ闇▓ロワヲ
         ↓
Step 2:   Ne ウエオ*カ@キク闇▓ケ
         ↓
Final:    Neural corruption detected...
```

**Key Point:** This pattern uses ONLY random characters, NOT phrases. It's always SFW.

**Use Cases:**
- Matrix-style visual glitch
- Decryption/decoding sequences
- Pure aesthetic effect without semantic content
- Multi-language text cycling (English → Romaji → Katakana)

### Pattern 2: Phrase Flickering (Buffer Corruption)

**Concept:** Simulates neural network "decoding" corrupted data buffer. Complete phrases flicker through rapidly as the system attempts to interpret corrupted memory before successfully decoding the final text.

**What it is:** Full phrases cycling through the text buffer (NOT random characters)
**Content:** SFW (default) or NSFW (opt-in with `{ nsfw: true }`)
**Component:** `TypingAnimation` class with phrase buffer

**Mental Model:** Imagine a corrupted data stream being parsed by a neural decoder. The decoder samples random phrases from its corrupted buffer memory before successfully reconstructing the intended message.

**Implementation (SFW Mode - Default):**
```javascript
// SFW phrase buffer (cute, playful, atmospheric)
const SFW_PHRASES = [
    'かわいい',                    // Cute words
    'きゃー',
    'nyaa~ uwu',                   // Romaji cute
    'ara ara~',
    'もう...見ないでよ...',        // Flirty/teasing
    'ドキドキしちゃう...',
    '闇が...私を呼んでいる...',    // Atmospheric corruption
    '深淵に...落ちていく...',
    'Neural corruption detected...',  // System messages
    'Loading data streams...',
    'Reality.exe error...'
];

// Flicker through SFW phrase buffer
setInterval(() => {
    if (elapsed < bufferDuration) {
        const phrase = SFW_PHRASES[Math.floor(Math.random() * SFW_PHRASES.length)];
        element.innerHTML = `<span style="color: #d94f90;">${phrase}</span>`;
    } else {
        // Successfully decoded final text
        element.innerHTML = `<span style="color: #ffffff;">${finalText}</span>`;
    }
}, flickerSpeed);  // 100-200ms per phrase
```

**Visual Effect (SFW Mode):**
```
Frame 1:  かわいい                        (150ms) - Cute word from buffer (magenta)
Frame 2:  nyaa~ uwu                      (150ms) - Romaji cute glitch (magenta)
Frame 3:  もう...見ないでよ...           (150ms) - Flirty phrase (magenta)
Frame 4:  闇が...私を呼んでいる...       (150ms) - Atmospheric corruption (magenta)
Frame 5:  Neural corruption detected...  (150ms) - System message (magenta)
... rapid buffer flickering (10-15 phrases) ...
Final:    System Online                  (stable white)
```

**Implementation (NSFW Mode - Opt-in Only):**
```javascript
// NSFW phrase buffer (explicit intimate/sexual phrases)
const NSFW_PHRASES = [
    '壊れちゃう...ああ...もうダメ...',  // Explicit loss of control
    'ずっと...してほしい... ♥',
    '変態',                              // Explicit words
    'えっち',
    '好きにして...お願い...',
    'Pleasure protocols loading...',     // Explicit system messages
    'Moral subroutines: DISABLED',
    "I'm breaking... can't anymore..."
];

// NSFW mode ONLY enabled with explicit opt-in
if (options.nsfw === true) {
    setInterval(() => {
        if (elapsed < bufferDuration) {
            const phrase = NSFW_PHRASES[Math.floor(Math.random() * NSFW_PHRASES.length)];
            element.innerHTML = `<span style="color: #8b5cf6;">${phrase}</span>`;
        } else {
            element.innerHTML = `<span style="color: #ffffff;">${finalText}</span>`;
        }
    }, flickerSpeed);
}
```

**Visual Effect (NSFW Mode):**
```
⚠️ 18+ Content Warning

Frame 1:  壊れちゃう...ああ...もうダメ...  (150ms) - Explicit phrase (purple)
Frame 2:  変態 えっち                      (150ms) - Explicit words (purple)
Frame 3:  ずっと...してほしい... ♥        (150ms) - Intimate phrase (purple)
Frame 4:  Pleasure protocols loading...    (150ms) - Explicit system (purple)
... rapid buffer flickering (10-15 phrases) ...
Final:    System Online                    (stable white)
```

**Color Usage:**
- SFW phrases: Magenta (#d94f90) - playful corruption energy
- NSFW phrases: Deep Purple (#8b5cf6) - intimate/deep corruption
- Final text: White (#ffffff) - successfully decoded stable text

**Use Cases:**
- Loading/buffering states (neural network "thinking")
- System attempting to decode corrupted memory
- Dramatic reveals (fighting through noise to find signal)
- Error recovery sequences (buffer clearing before success)
- "Hacking" or "decryption" animations

### Pattern 3: Hybrid Decoding (Combined)

**Concept:** Character-by-character decoding (Pattern 1) WITH phrase flickering in unrevealed portion (Pattern 2). Simulates neural network progressively decoding text while the buffer ahead still contains corrupted phrase fragments.

**What it is:** Revealed text is stable (white), unrevealed portion shows phrase snippets from buffer
**Content:** SFW (default) or NSFW (opt-in with `{ nsfw: true }`)
**Component:** Custom implementation combining `CorruptedText` + phrase buffer

**Mental Model:** As each character successfully decodes from left to right, the corrupted buffer to the right continues flickering with phrase fragments until those positions are also decoded.

**Implementation (SFW Mode - Default):**
```javascript
const revealed = finalText.substring(0, revealedChars);
const remaining = finalText.length - revealedChars;

// SFW phrase buffer
const SFW_PHRASES = [
    'かわいい きゃー',
    'nyaa~ uwu',
    'もう...見ないでよ...',
    '闇が...私を呼んでいる...',
    'Neural corruption...'
];

// Sample phrase snippet for unrevealed buffer
const randomPhrase = SFW_PHRASES[Math.floor(Math.random() * SFW_PHRASES.length)];
const bufferChaos = randomPhrase.substring(0, remaining);

element.innerHTML =
    `<span style="color: #ffffff;">${revealed}</span>` +      // Decoded (stable white)
    `<span style="color: #d94f90;">${bufferChaos}</span>`;    // Buffer (playful magenta)
```

**Visual Effect (SFW Mode):**
```
Step 1:  N かわいい きゃー                    - "N" decoded (white), buffer cute (magenta)
Step 2:  Ne nyaa~ uwu owo                      - "Ne" decoded (white), buffer romaji (magenta)
Step 3:  Neu もう...見ないでよ...             - "Neu" decoded (white), buffer flirty (magenta)
Step 4:  Neur 闇が...私を呼んでいる...         - "Neur" decoded (white), buffer atmospheric (magenta)
Step 5:  Neura Neural corruption...            - Almost done (white), buffer system (magenta)
Final:   Neural corruption detected...         - Fully decoded (stable white)
```

**Implementation (NSFW Mode - Opt-in Only):**
```javascript
// NSFW phrase buffer (explicit only)
const NSFW_PHRASES = [
    '壊れちゃう...ああ...もうダメ...',
    'ずっと...してほしい... ♥',
    '変態 えっち',
    '好きにして...お願い...',
    'Pleasure protocols...'
];

if (options.nsfw === true) {
    const randomPhrase = NSFW_PHRASES[Math.floor(Math.random() * NSFW_PHRASES.length)];
    const bufferChaos = randomPhrase.substring(0, remaining);

    element.innerHTML =
        `<span style="color: #ffffff;">${revealed}</span>` +      // Decoded (stable white)
        `<span style="color: #8b5cf6;">${bufferChaos}</span>`;    // Buffer (deep purple)
}
```

**Visual Effect (NSFW Mode):**
```
⚠️ 18+ Content Warning

Step 1:  N 壊れちゃう...ああ...もうダメ...    - "N" decoded (white), explicit buffer (purple)
Step 2:  Ne ずっと...してほしい... ♥        - "Ne" decoded (white), intimate buffer (purple)
Step 3:  Neu 変態 えっち                      - "Neu" decoded (white), explicit words (purple)
Step 4:  Neur 好きにして...お願い...         - "Neur" decoded (white), intimate phrase (purple)
Step 5:  Neura Pleasure protocols...          - Almost done (white), explicit system (purple)
Final:   Neural corruption detected...        - Fully decoded (stable white)
```

**Color Usage:**
- Revealed text: White (#ffffff) - successfully decoded characters
- SFW buffer: Magenta (#d94f90) - playful corruption ahead
- NSFW buffer: Deep Purple (#8b5cf6) - intimate corruption ahead

**Technical Details:**
- Update interval: 80-150ms per character reveal
- Buffer updates every frame with new random phrase
- Creates highly dynamic "fighting through corruption" effect
- Combines stability (left) with chaos (right) in single element

**Use Cases:**
- High-intensity corruption effects (maximum visual chaos)
- Terminal/hacking sequences (progressively "cracking" encrypted text)
- Dramatic narrative moments (truth fighting to emerge from lies)
- Loading screens with character-by-character progress indication
- "Downloading consciousness" / neural upload sequences

---

### Pattern 4: Staggered Grid Corruption

Corruption ripples across a grid of elements outward from an origin point
(center, a corner, an element index, or [x, y] coordinates). Each element
runs a short character-decode burst whose START TIME is delayed
proportionally to its grid distance from the origin (the "wave").

- **Direction:** chaos → order. The wavefront corrupts; behind it, elements
  settle to stable white (#ffffff). The grid always ends fully readable.
- **Color ramp by corruption age:** purple (#8b5cf6) at the wavefront →
  magenta (#ff00ff) mid-decay → white (#ffffff) settled.
- **Charsets:** standard registry sets only (katakana primary; blocks for
  heavy corruption). Via CorruptionCharsets — never inline.
- **Use for:** navigation menus, gallery/tile grids, dashboard panels,
  stream "starting soon" tile walls.
- **Accessibility:** wave delay ≥ 40ms between neighbors; per-element
  flicker ≥ 100ms/frame; total settle ≤ 4s; max 12 elements animating
  simultaneously (performance budget); static fallback = render final state.

**Reference implementation:** `GlitchStaggerGrid`
(`@whykusanagi/corrupted-theme/glitch-stagger-grid`, 0.3.0). Design
reference: anime.js v4 grid `stagger` (MIT) — API model only, no dependency.

---

### Pattern 5: Static Material Degradation

Corruption rendered as damage to the *surface* rather than as motion over
time. The artifact is a single frame — a poster, card, banner or export —
that reads as a recovered document from a degrading system. Patterns 1-4 all
animate chaos → order; Pattern 5 is the first non-temporal pattern, freezing
one moment mid-decay.

- **Direction:** order → chaos, then stopped. The composition underneath is
  legible instrument-panel structure — readouts, gauges, serial lines,
  dimension marks. Degradation is applied on top and must never obscure the
  primary readout.
- **Three degradation layers**, applied in this order, each independently
  dialable 0 → 1:
  1. **Warp** — `feTurbulence type="fractalNoise"` feeding
     `feDisplacementMap`. Bends geometry, as if the substrate buckled.
  2. **Erode** — `feTurbulence` + a high-contrast `feColorMatrix` alpha ramp
     + `feComposite operator="in"`. Eats away ink coverage.
  3. **Grain** — `feTurbulence` at high `baseFrequency`, low alpha,
     `stitchTiles="stitch"`. Sensor noise over everything.
- **Determinism:** every degradation layer derives its filter seed from the
  composition seed, so the same seed always produces the identical artifact.
  This is non-negotiable — a poster you cannot regenerate is not a design
  system output.
- **Theme colours carry the composition:** white (#ffffff) for the readable,
  settled readout; magenta (#ff00ff) and violet (#8b5cf6) for corruption,
  structure and depth. Cyan and red are available as accents where a readout
  needs to lift off the background — sparingly, and never as the identity of
  the piece.
- **Charsets:** standard registry sets via `CorruptionCharsets` — never
  inline. Katakana primary; blocks for heavy corruption.
- **Use for:** thumbnails, stream cards, social banners, poster exports,
  portfolio backgrounds — any single-frame surface.
- **Accessibility:** no animation, so no flicker limit applies. Instead:
  primary text holds ≥ 4.5:1 contrast against its local background *after*
  degradation is applied; `erode` is capped so no glyph loses more than ~30%
  coverage; and `degrade: 0` must produce a fully clean, legible artifact.
  Degradation is an effect, never a load-bearing part of the composition.

**Reference implementation:** `MicroGfx`
(`@whykusanagi/corrupted-theme/micro-gfx`, 0.3.2). Degradation uses SVG
filter primitives from the W3C Filter Effects spec — `feTurbulence`,
`feDisplacementMap`, `feColorMatrix`, `feComposite` — so the whole pattern is
declarative, with no dependency and no per-pixel JavaScript.

---

### Pattern 6: Ambient Mark Decay

Corruption carried by **non-textual geometric marks** — sparkles, rings,
reticles, bursts — scattered across a surface, each running its own corruption
clock. Patterns 1-3 corrupt text, Pattern 4 corrupts a grid of text cells,
Pattern 5 corrupts a static surface. Pattern 6 is the first that corrupts
nothing: the marks *are* the corruption, laid over content the theme does not
own.

- **Direction:** chaos → order, per mark, independently. A mark appears at its
  corruption event and decays toward a settled state on its own timeline. The
  surface as a whole has no single phase.
- **Colour is the mark's own age**, using Pattern 4's ramp unchanged —
  `wavefront #8b5cf6` violet at the corruption event, `mid #ff00ff` magenta
  mid-decay, `settled #ffffff` white once stable. This is Core Tenet 4 applied
  literally: a mark's colour tells you where in its decay it is, and nothing
  else. Deriving colour from a *shared* clock is the failure mode this pattern
  exists to name — it makes every mark the same colour regardless of state,
  which is decoration wearing a state signal's clothes.
- **Readable endpoint is mandatory** (Core Tenet 2). After a bounded number of
  loops each mark freezes in white at its fully-formed moment, and the
  animation loop *stops* once every mark has settled. An unbounded variant may
  be offered, but it is decorative and must be opt-in — a surface that never
  settles never reaches the stable state the theme promises.
- **Compositing-first.** The primary API draws one mark into a caller's
  context at the current transform: it paints no background, restores what it
  touched, and never assumes it owns the canvas. A grid or board of marks is a
  showcase format, not the pattern. Anything that forces an opaque plate
  cannot be composited over video or an overlay layer, which is most of what
  this pattern is for.
- **Timing snaps rather than smooths.** Quantized motion is the register —
  stutter, dropout, chromatic fringe — with cyan and red appearing only as
  split-channel fringes, never as a mark's identity.
- **The flicker floor is enforced by the implementation, not the caller.** Any
  quantization step derives its own maximum step count from the effective loop
  duration so no frame falls under the 100ms photosensitivity limit, whatever
  speed or duration a caller passes. Relying on an example's slider ranges is
  not enforcement.
- **Determinism:** a seed fixes mark selection, phase and any per-mark noise,
  so the same seed and frame index produce byte-identical output. Offline
  frame capture is a first-class consumer.
- **Use for:** VFX passes over artwork or video, stream and OBS overlays,
  thumbnail accents, transition stingers, offline frame export.
- **Accessibility:** the 100ms floor above, plus reduced motion paints the
  *settled* end state rather than a random mid-animation frame — a static
  fallback that is still the readable result, not an arbitrary one.

**Reference implementation:** `CorruptedFlares`
(`@whykusanagi/corrupted-theme/corrupted-flares`, 0.3.3). Shape vocabulary
borrows from anime VFX packs, where colour is arbitrary; the theme's
contribution is making it mean something.

---

## Content Classification: SFW vs NSFW

**⚠️ DEFINITIVE REFERENCE:** See `CORRUPTION_BUFFER_IMPLEMENTATIONS.md` for complete implementation details across all projects.

**Purpose:** Provide appropriate corruption aesthetics for different audience contexts.

**System Architecture:** 2-class system (SFW default, NSFW opt-in) with 3 languages per class (Japanese, English, Romaji).

---

### SFW Mode (Default) - Safe For Work

**Content:** Playful, cute, teasing, atmospheric corruption themes
**Tone:** Anime-style cute/flirty, cyberpunk atmospheric
**Safe for:** General audiences, streaming, professional projects, public display

**Includes:**

**Cute/Playful Expressions:**
| Japanese | Romaji | English |
|----------|--------|---------|
| ニャー | nyaa | (cute cat sound) |
| かわいい | kawaii | cute |
| きゃー | kyaa | (excited squeal) |
| あはは | ahaha | (laughing) |
| うふふ | ufufu | (giggle) |
| やだ | yada | no way! |
| ばか | baka | idiot/dummy |
| デレデレ | deredere | lovestruck |

**Flirty/Teasing Phrases:**
| Japanese | Romaji | English |
|----------|--------|---------|
| もう...見ないでよ... | Mou... minaide yo... | Don't... look at me... |
| そんな目で見ないで... ♡ | Sonna me de minaide... | Don't look at me like that... ♡ |
| ちょっと...恥ずかしい... | Chotto... hazukashii... | This is... embarrassing... |
| あなたって...意地悪ね... | Anata tte... ijiwaru ne... | You're such... a tease... |
| ドキドキしちゃう... | Dokidoki shichau... | My heart... racing... |

**Atmospheric/Corruption Themes:**
| Japanese | Romaji | English |
|----------|--------|---------|
| 闇が...私を呼んでいる... | Yami ga... watashi wo yonde iru... | The darkness... calls to me... |
| 深淵に...落ちていく... | Shin'en ni... ochite iku... | Falling... into the abyss... |
| もう逃げない... | Mou nigenai... | Won't run anymore... |
| 私...アビスの一部に... | Watashi... abisu no ichibu ni... | I... become part of the abyss... |

**Romaji/Internet Culture:**
- nyaa~, ara ara~, fufufu~, kyaa~, baka~
- <3, uwu, owo, >w<, ^w^

**System Messages:**
- "Neural corruption detected..."
- "System breach imminent..."
- "Loading data streams..."
- "Reality.exe has stopped responding..."
- "Decrypting protocols..."

**Color Usage:** Mix of magenta2 (#d94f90), magenta (#ff00ff), purple (#8b5cf6)

---

### NSFW Mode (Opt-in Only) - Not Safe For Work

**⚠️ 18+ Content Warning**

**Content:** Explicit intimate/sexual phrases, loss of control themes
**Tone:** Explicit, mature, sexual degradation
**Safe for:** 18+ projects ONLY, mature content streams, private use

**NOT suitable for:**
- ❌ Professional/corporate projects
- ❌ Public streams without 18+ rating
- ❌ Educational contexts
- ❌ All-ages content

**Includes:**

**Explicit Intimate Phrases:**
| Japanese | Romaji | English |
|----------|--------|---------|
| ずっと...してほしい... ♥ | Zutto... shite hoshii... | Please... keep doing it... ♥ |
| 壊れちゃう...ああ...もうダメ... | Kowarechau... aa... mou dame... | I'm breaking... can't anymore... |
| 好きにして...お願い... | Suki ni shite... onegai... | Do as you please... please... |
| 感じちゃう...やめて... | Kanjichau... yamete... | Feeling it... stop... |
| 頭...溶けていく... | Atama... tokete iku... | My mind... melting... |

**Explicit Words:**
| Japanese | Romaji | Meaning |
|----------|--------|---------|
| 変態 | hentai | pervert |
| えっち | ecchi | lewd/sexual |

**Explicit English:**
- "Please... keep going... ♥"
- "I'm breaking... can't anymore..."
- "Do as you please... please..."
- "My mind... melting away..."
- "Pleasure protocols loading..."
- "Moral subroutines: DISABLED"
- "Descending into depravity..."
- "Corruption level: CRITICAL"

**Color Usage:** Primarily purple (#8b5cf6) for deep corruption

**Usage:** Must be explicitly enabled via configuration option `{ nsfw: true }`

---

### Implementation: 2-Class System

**How they work together:**

```javascript
// Buffer generation with SFW/NSFW switch
function getRandomCorruptionPhrase(nsfw = false) {
    const phrases = nsfw ? NSFW_PHRASES : SFW_PHRASES;
    return phrases[Math.floor(Math.random() * phrases.length)];
}

// Example usage
const element = document.querySelector('.corruption-text');

// Default: SFW mode
new TypingAnimation(element, {
    // nsfw: false (default - no explicit content)
});

// Explicit opt-in: NSFW mode
new TypingAnimation(element, {
    nsfw: true  // Enables 18+ content
});
```

**Visual Progression Example (SFW Mode):**
```
Frame 1: 闇が...私を呼んでいる...     (Atmospheric: The darkness calls...)
Frame 2: N かわいい きゃー            (Cute words: kawaii, kyaa)
Frame 3: Ne nyaa~ uwu                 (Romaji cute: nyaa~, uwu)
Frame 4: Neu もう...見ないでよ...     (Flirty: Don't look at me...)
Frame 5: Neur ドキドキしちゃう...     (Teasing: My heart racing...)
Final:   Neural corruption detected... (Decoded clean text)
```

**Visual Progression Example (NSFW Mode):**
```
Frame 1: 壊れちゃう...ああ...もうダメ... (Explicit: I'm breaking...)
Frame 2: N 変態 えっち                  (Explicit words: hentai, ecchi)
Frame 3: Ne ずっと...してほしい... ♥   (Explicit: Please keep doing it...)
Frame 4: Neu Pleasure protocols...     (Explicit system message)
Frame 5: Neur 好きにして...お願い...   (Explicit: Do as you please...)
Final:   Neural corruption detected... (Decoded clean text)
```

**Design Intent:**
- **SFW** (Default): Playful, cute, atmospheric - safe for all audiences
- **NSFW** (Opt-in): Explicit, intimate, mature - 18+ only

---

### Decorative Symbol Glitch (Magenta #d94f90)

**Complete Symbol Set:**
```
★ ☆ ♥ ♡ ✧ ✦ ◆ ◇ ● ○ ♟ ☣ ☭ ☾ ⚔ ✡ ☯ ⚡
```

**Categories:**
- **Stars**: ★ ☆ ✧ ✦ (sparkle, shine)
- **Hearts**: ♥ ♡ (love, affection)
- **Shapes**: ◆ ◇ ● ○ (geometry)
- **Symbols**: ♟ ☣ ☭ ☾ ⚔ ✡ ☯ ⚡ (danger, mysticism, energy)

**Purpose:** Visual punctuation, decorative glitch accents, variety in corruption patterns.

**Tone:** Playful, mystical, sometimes ominous depending on context.

### Content Warning Guidelines

**Default Behavior (SFW Mode):**
- ✅ Professional/corporate projects
- ✅ Educational/academic contexts
- ✅ Public streaming (general audience)
- ✅ All-ages content
- ✅ Portfolio/demo projects
- ✅ Safe by default (no opt-in required)

**NSFW Mode (Requires Explicit Opt-in via `{ nsfw: true }`):**
- ✅ Mature/18+ projects
- ✅ Horror/psychological themes with age gate
- ✅ Adult content platforms
- ✅ Private/personal projects
- ❌ **NEVER use as default**
- ❌ **NEVER use without age verification**

**API Design Requirement:**
```javascript
// CORRECT: SFW is default
new TypingAnimation(element);  // Safe content

// CORRECT: NSFW requires explicit flag
new TypingAnimation(element, { nsfw: true });  // 18+ content
```

---

## Glass Morphism Integration

**Purpose:** Container styling for corrupted text overlays.

### Glass Modal Container
```css
.corrupted-modal {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(0, 255, 255, 0.3);
    border-radius: 10px;
    box-shadow:
        0 0 20px rgba(0, 255, 255, 0.5),
        0 0 40px rgba(255, 0, 255, 0.3),
        inset 0 0 20px rgba(0, 0, 0, 0.5);
}
```

**Features:**
- Semi-transparent background (70% opacity)
- Gaussian blur backdrop
- Cyan glowing border
- Multi-layer shadow (cyan + magenta)
- Inset shadow for depth

---

## Implementation Examples

### Example 1: Loading State
```javascript
function showLoadingWithCorruption(finalMessage) {
    const phrases = ['闇が...私を呼んでいる...', '壊れちゃう...ああ...'];
    let frameCount = 0;

    const interval = setInterval(() => {
        if (frameCount < 20) { // 3 seconds of corruption
            const phrase = phrases[Math.floor(Math.random() * phrases.length)];
            element.innerHTML = `<span style="color: #8b5cf6;">${phrase}</span>`;
            frameCount++;
        } else {
            clearInterval(interval);
            element.innerHTML = `<span style="color: #00ffff;">${finalMessage}</span>`;
        }
    }, 150);
}
```

### Example 2: Decoding Message
```javascript
function decodeFromChaos(finalText, duration = 4000) {
    const updateInterval = 80;
    const totalFrames = duration / updateInterval;
    let frame = 0;

    const interval = setInterval(() => {
        const progress = frame / totalFrames;
        const revealed = Math.floor(progress * finalText.length);
        const revealedText = finalText.substring(0, revealed);
        const remaining = finalText.length - revealed;

        // Generate chaos buffer
        let chaos = '';
        for (let i = 0; i < remaining; i++) {
            chaos += getRandomCorruptionChar();
        }

        element.innerHTML =
            `<span style="color: #00ffff;">${revealedText}</span>` +
            `<span style="color: #8b5cf6;">${chaos}</span>`;

        frame++;
        if (frame >= totalFrames) clearInterval(interval);
    }, updateInterval);
}
```

### Example 3: Countdown with Corruption
```javascript
function corruptedCountdown(label, startValue, endValue) {
    let current = startValue;

    const interval = setInterval(() => {
        current -= Math.floor(Math.random() * 8) + 3;
        if (current < endValue) current = endValue;

        const progress = 1 - (current / startValue);
        const revealed = Math.floor(progress * label.length);
        const revealedText = label.substring(0, revealed);

        // Chaos buffer for unrevealed portion
        let chaos = '';
        for (let i = revealed; i < label.length; i++) {
            chaos += getRandomCorruptionChar();
        }

        element.innerHTML =
            `<span style="color: #00ffff;">${revealedText}</span>` +
            `<span style="color: #8b5cf6;">${chaos}</span>` +
            `<br><span style="color: ${current === 0 ? '#ff0000' : '#ffffff'};">${current}%</span>`;

        if (current === endValue) clearInterval(interval);
    }, 200);
}
```

---

## Design Philosophy

### Core Tenets

1. **Chaos → Order**: Information emerges from corruption, not the reverse
2. **Readable Endpoints**: Final state must be readable (white, stable)
3. **Motion Indicates Instability**: Static = stable, animated = corrupted
4. **Color = State**: The theme colours encode corruption level — white is
   settled, magenta and violet are corrupting. The accents (cyan, red) are
   exempt: they serve legibility and emphasis, not state.
5. **Japanese = Foreign/Unknown**: Use foreign scripts for "unreadable" corruption

### Emotional Resonance

**What the aesthetic communicates:**
- 🔴 **Danger**: System instability, loss of control
- 🟣 **Intimacy**: Too close, boundaries eroding
- 🔵 **Hope**: Information can be recovered
- ⚫ **Despair**: Data loss, terminal states
- 🌈 **Chaos**: Multiple corruption sources fighting

### Accessibility Considerations

**Warnings:**
- ⚠️ Rapid flickering may trigger photosensitivity
- ⚠️ Constant animation can be distracting/exhausting
- ⚠️ Low contrast during corruption states reduces readability

**Mitigations:**
- Limit flicker speed (minimum 100ms per frame)
- Always settle on stable, readable final state
- Provide static fallback option
- Use ARIA labels for screen readers

---

## Browser Compatibility

**Required Features:**
- CSS3 Animations
- CSS3 Text Shadow
- CSS3 `backdrop-filter` (for glass morphism)
- JavaScript `setInterval`

**Fallbacks:**
- **No backdrop-filter**: Use solid background
- **No CSS animations**: Show static corrupted text
- **No JavaScript**: Show final text immediately

---

## Performance Optimization

### Best Practices
1. **Limit simultaneous animations**: Max 2-3 corrupted elements
2. **Use `requestAnimationFrame`**: For smooth 60fps animations
3. **Debounce updates**: Don't update faster than 60fps (16.6ms)
4. **Clean up intervals**: Always `clearInterval` when done
5. **Avoid layout thrashing**: Batch DOM updates

### Performance Budget
- **Typical update**: < 5ms
- **Full corruption cycle**: < 100ms total CPU time
- **Memory**: < 1MB for all corruption data structures

---

## Contribution Guidelines

### For corrupted-theme Package

**File Structure:**
```
corrupted-theme/
├── src/
│   ├── colors.css          # Color palette variables
│   ├── animations.css      # Glitch animation keyframes
│   ├── glass-morphism.css  # Container styles
│   └── corruption.js       # Character sets & functions
├── examples/
│   ├── decoding.html       # Character-by-character example
│   ├── flickering.html     # Phrase flickering example
│   └── countdown.html      # Countdown with corruption
└── docs/
    └── SPEC.md             # This file
```

**API Design:**
```javascript
import { CorruptedText } from '@whykusanagi/corrupted-theme';

const corrupted = new CorruptedText(element, {
    pattern: 'decoding',  // or 'flickering', 'hybrid'
    finalText: 'System Online',
    duration: 4000,
    includeLewd: false,   // Opt-in for mature content
    colorScheme: 'cyberpunk' // or 'matrix', 'vaporwave'
});

corrupted.start();
```

---

## Version History

- **1.3** (2026-08-25): Ambient corruption, and a palette guard that works
  - Added **Pattern 6: Ambient Mark Decay** — non-textual geometric marks,
    each decaying on its own clock, composited over content the theme does
    not own. Reuses Pattern 4's ramp; adds a mandatory readable endpoint and
    an implementation-enforced flicker floor.
  - **Surfaces** are now a declared four-step dark ramp rather than whatever
    dark each page invented. Backgrounds carry no corruption state.
  - **Element colours (NIKKE)** documented as a published compatibility
    surface and as game data — never corruption state, never theme chrome.
  - **Enforcement**: `tests/data/color-sweep.test.js` sweeps every source for
    colour outside palette ∪ surfaces ∪ elemental ∪ a justified exception. It
    reads `rgb()`/`rgba()` as well as hex, and element hexes are legal only in
    the files that own the element system, so the rule above is checkable
    rather than aspirational.

- **1.2** (2026-07-27): Static corruption
  - Added **Pattern 5: Static Material Degradation** — the first
    non-temporal pattern. Corruption as damage to the surface (warp /
    erode / grain via SVG filter primitives) rather than motion over time.
    Seed-deterministic by requirement.
  - Retroactively noted: **Pattern 4: Staggered Grid Corruption** shipped in
    package 0.3.0 without a version-history entry here.
  - **Palette restructured into theme colours and accent colours.** This is
    the clarification the palette section always needed, and it resolves the
    cyan confusion at the root rather than at the symptom.
    - **Theme colours are magenta, violet and white.** They are the
      aesthetic and they encode corruption state.
    - **Cyan and red are accents.** They exist to make a visual work —
      highlight something, or lift text off a dark background. They are a
      compositional tool, not a state signal. Red still suits alarm states
      because it reads that way naturally, but it is no longer *reserved*
      for them; the previous "critical/terminal states" framing overstated
      it.
    - Magenta2, black and green are supporting colours: extensions of the
      theme rather than additions to it.
  - **Cyan was never a stable-text colour.** It entered that role by
    mistake and propagated through the patterns, the data file and the
    components. The correction, applied here:
    - Patterns 3 and 4, core tenet 2 and the SFW phrase colour guidance say
      white. Core tenet 4 ("Color = State") now exempts the accents, which
      serve legibility rather than state.
    - `src/data/colors.json` gains `white` and `black`, declares `cyan` and
      `red` as `accents`, and corrects `semanticUse` — `decoded` was `cyan`
      (now `white`) and `accent` was `magenta` (now `corruption: magenta`).
    - Components: settled/decoded/revealed text and any colour declared
      "stable" moved to white; cyan used *as a corruption colour* moved to
      the magenta family; cyan was removed as any component's dominant
      colour.
    - Cyan is deliberately retained in genuine accent roles: RGB-split
      channels (it pairs with #ff0000 in chromatic aberration), glass
      borders and glows, the opt-in `.corrupted-ghost-cyan` /
      `.glass-container-cyan` variants, and structural grid chrome.
    - **Note for `CLAUDE.md` §7**, which still documents cyan as "Primary
      text, decoded/stable" and omits white and black entirely. That section
      now contradicts this spec. `CLAUDE.md` is read-only policy per its own
      §4.3, so it is left for the maintainer to update.

- **1.1** (2026-01-15): Content classification normalization & terminology clarification
  - **BREAKING**: Changed from 3-type to 2-class system (SFW/NSFW)
  - **BREAKING**: Color palette update - white/magenta/purple primary, cyan demoted to accent only
    - Stable/decoded text: Cyan (#00ffff) → White (#ffffff)
    - Primary corruption: Now Magenta (#ff00ff) and Purple (#8b5cf6)
    - Cyan relegated to rare accent/highlight use only
  - Normalized "lewd" terminology to "NSFW" for clarity
  - Made SFW the explicit default (no opt-in required)
  - NSFW requires explicit `{ nsfw: true }` opt-in
  - Moved explicit words ("hentai", "ecchi") from playful to NSFW
  - **Pattern 1 clarification**: Renamed to "Character Corruption (Visual Glitch Only)" - uses ONLY random characters, NO phrases
  - **Pattern 2 clarification**: Renamed to "Phrase Flickering (Buffer Corruption)" - explicitly coded as "buffer decoding from neural corruption"
  - **Pattern 3 clarification**: Updated to show clear SFW vs NSFW examples with "neural network progressively decoding" mental model
  - Updated all patterns with separate SFW (default) and NSFW (opt-in) implementation examples
  - Added "Mental Model" sections to explain corruption as data buffer decoding
  - Updated all code examples to use white for stable text, magenta/purple for corruption

- **1.0** (2025-12-24): Initial specification
  - Character sets defined
  - Three corruption patterns documented
  - Glass morphism integration
  - Initial content guidelines (3-type system)

---

## License

MIT License - Free to use, modify, and distribute with attribution.

**Attribution:**
```
Corrupted Theme by whykusanagi
https://github.com/whykusanagi/corrupted-theme
```

---

## Credits

**Inspired by:**
- The Matrix (1999) - Digital rain aesthetic
- Ghost in the Shell (1995) - Cyberpunk corruption
- Steins;Gate - CRT glitch effects
- Doki Doki Literature Club - Psychological corruption
- Needy Streamer Overload - Digital degradation themes

**Character Set Sources:**
- Unicode Katakana/Hiragana blocks
- Box Drawing Unicode blocks
- Geometric Shapes Unicode blocks

---

## Quick Reference: Content Classification

### SFW Mode (Default)

| Content Type | Examples | Use Case |
|--------------|----------|----------|
| **Cute/Playful Words** | ニャー, かわいい, きゃー, ばか | General glitch effect |
| **Flirty/Teasing** | "Don't look at me...", "ara ara~" | Anime-style playful |
| **Atmospheric** | "The darkness calls...", "Neural corruption..." | Cyberpunk mood |
| **Romaji Cute** | nyaa~, uwu, owo, ^w^ | Internet culture |
| **System Messages** | "Loading data...", "Reality.exe error..." | Technical aesthetic |

**Config:** `{ nsfw: false }` or omit option (default)
**Safe for:** All audiences, professional use, public display

---

### NSFW Mode (Opt-in Only)

| Content Type | Examples | Use Case |
|--------------|----------|----------|
| **Explicit Phrases** | "Please keep doing it... ♥", "I'm breaking..." | Mature themes only |
| **Explicit Words** | 変態 (hentai), えっち (ecchi) | 18+ content |
| **Sexual Systems** | "Pleasure protocols...", "Moral subroutines: DISABLED" | Adult projects |

**Config:** `{ nsfw: true }` ⚠️ **EXPLICIT OPT-IN REQUIRED**
**Safe for:** 18+ projects ONLY, never default

---

### Character Set Reference

| Character Set | Example | Use Case |
|---------------|---------|----------|
| **Katakana** | アイウエオ | Matrix-style rain, high-tech glitch |
| **Hiragana** | あいうえお | Softer visual corruption |
| **Romaji** | A-Z, a-z | Semi-readable Western glitch |
| **Symbols** | ★☆♥✧ | Visual accents, decorative |
| **Blocks** | █▓▒░ | Heavy corruption, terminal state |

**Note:** Character sets are content-neutral. Phrase classification determines SFW/NSFW.

---

### Quick Selection Guide

**Choose SFW Mode When:**
- ✅ Default/unsure what audience will see
- ✅ Professional or corporate project
- ✅ Public streaming (general audience)
- ✅ Educational/portfolio content
- ✅ Want cute/playful aesthetic

**Choose NSFW Mode When:**
- ✅ Explicit 18+ project with age gate
- ✅ Adult content platform
- ✅ Private/personal mature project
- ❌ **NEVER** as default
- ❌ **NEVER** without explicit user consent

---

**Maintained by:** whykusanagi
**Contact:** [GitHub Issues](https://github.com/whykusanagi/corrupted-theme/issues)
**Status:** Ready for community contribution
