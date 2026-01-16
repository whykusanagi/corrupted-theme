# Content Classification Normalization Plan

**Issue:** Current spec has 3 ambiguous content classes instead of 2 clear ones
**Goal:** Normalize to 2 classes: **SFW (default)** and **NSFW (opt-in)**

---

## Current State Analysis

### Spec Inconsistencies

**CORRUPTED_THEME_SPEC.md** defines 3 types:
- Type 1: "Deep Lewd Phrases" → **NSFW**
- Type 2: "Short Japanese Glitch" → **MIXED** (includes "変態", "えっち")
- Type 3: "Romaji Glitch Phrases" → **SFW** ("nyaa~", "uwu")

**CORRUPTION_BUFFER_IMPLEMENTATIONS.md** defines 2 types:
- Type 1: "Lewd (Mature/Intimate)" → **NSFW**
- Type 2: "Flirty (Playful/Teasing)" → **SFW** (teasing but acceptable)

**corruption-phrases.js** defines:
- `LEWD_PHRASES` → **NSFW** ("快楽に...溺れたい...", "Pleasure protocols")
- `SFW_PHRASES` → **SFW** (system messages only)

---

## Proposed 2-Class System

### Class 1: SFW (Safe For Work) - DEFAULT

**Description:** Playful, cute, teasing, but no explicit sexual content

**Includes:**
- Cute anime expressions: "nyaa~", "ara ara~", "uwu", "owo"
- Playful/flirty phrases: "Don't look at me like that...", "You're such a tease..."
- Corruption metaphors: "The darkness calls...", "Neural corruption detected..."
- Short cute words: "かわいい" (kawaii), "きゃー" (kyaa), "ばか" (baka)
- System messages: "Loading data streams...", "Reality.exe stopped responding..."

**Tone:** Anime-style cute/playful, cyberpunk atmospheric, teasing but not explicit

**Examples:**
```javascript
SFW_PHRASES = [
    // Cute/Playful (Japanese)
    'ニャー',           // Nyaa (cat sound)
    'かわいい',         // Kawaii (cute)
    'きゃー',           // Kyaa (squeal)
    'あはは',           // Ahaha (laughing)
    'うふふ',           // Ufufu (giggle)
    'やだ',             // Yada (no way!)
    'ばか',             // Baka (idiot)
    'デレデレ',         // Deredere (lovestruck)

    // Flirty/Teasing (Japanese)
    'もう...見ないでよ...',           // Don't... look at me...
    'そんな目で見ないで... ♡',       // Don't look at me like that... ♡
    'ちょっと...恥ずかしい...',       // This is... embarrassing...
    'あなたって...意地悪ね...',       // You're such... a tease...
    'ドキドキしちゃう...',            // My heart... racing...

    // Corruption/Atmospheric (Japanese)
    '闇が...私を呼んでいる...',       // The darkness... calls to me...
    '深淵に...落ちていく...',         // Falling... into the abyss...
    'もう逃げない...',                // Won't run anymore...

    // Cute/Playful (Romaji)
    'nyaa~', 'ara ara~', 'fufufu~', 'kyaa~', 'baka~',
    '<3', 'uwu', 'owo', '>w<', '^w^',

    // Flirty/Teasing (English)
    "Don't... look at me like that...",
    "You're making me... flustered... ♡",
    "This is... embarrassing...",
    "You're such... a tease...",
    "My heart... racing...",

    // Corruption/Atmospheric (English)
    'The darkness... calls to me...',
    'Falling... into the depths...',
    'Consumed... by corruption...',
    'Neural corruption detected...',
    'System breach imminent...',
    'Reality.exe has stopped responding...',
    'Loading data streams...',
    'Decrypting protocols...',
];
```

---

### Class 2: NSFW (Not Safe For Work) - OPT-IN ONLY

**Description:** Explicit sexual/intimate content, loss of control themes

**Includes:**
- Explicit intimate phrases: "ずっと...してほしい... ♥" (Please... keep doing it... ♥)
- Loss of control: "壊れちゃう...ああ...もうダメ..." (I'm breaking... can't anymore...)
- Explicit words: "変態" (hentai), "えっち" (ecchi)
- Sexual pleasure references: "快楽に...溺れたい..." (I want to drown in pleasure...)
- Explicit English: "Pleasure protocols loading...", "Moral subroutines: DISABLED"

**Tone:** Explicit, intimate, sexual degradation

**Examples:**
```javascript
NSFW_PHRASES = [
    // Explicit Intimate (Japanese)
    'ずっと...してほしい... ♥',      // Please... keep doing it... ♥
    '壊れちゃう...ああ...もうダメ...', // I'm breaking... can't anymore...
    '好きにして...お願い...',         // Do as you please... please...
    '感じちゃう...やめて...',         // Feeling it... stop...
    '頭...溶けていく...',             // My mind... melting...
    '変態',                           // Hentai (pervert)
    'えっち',                         // Ecchi (lewd)

    // Explicit Intimate (English)
    'Please... keep going... ♥',
    "I'm breaking... can't anymore...",
    'Do as you please... please...',
    'My mind... melting away...',
    'Pleasure protocols loading...',
    'Moral subroutines: DISABLED',
    'Descending into depravity...',
    'Corruption level: CRITICAL',

    // Explicit Intimate (Romaji)
    'Zutto... shite hoshii... ♥',
    'Kowarechau... aa... mou dame...',
    'Suki ni shite... onegai...',
    'Atama... tokete iku...',
];
```

---

## Classification Decision Tree

```
Is the phrase/word explicitly sexual or about loss of control?
├─ YES → NSFW
└─ NO → Is it playful/cute/teasing/atmospheric?
    ├─ YES → SFW
    └─ NO → Technical/System → SFW
```

### Specific Word Classifications

| Word/Phrase | Current | Correct | Reason |
|-------------|---------|---------|--------|
| ニャー (nyaa) | Type 2 | SFW | Cute cat sound |
| かわいい (kawaii) | Type 2 | SFW | Just means "cute" |
| 変態 (hentai) | Type 2 | **NSFW** | Literally "pervert" |
| えっち (ecchi) | Type 2 | **NSFW** | Explicitly sexual |
| デレデレ (deredere) | Type 2 | SFW | Lovestruck/affectionate |
| きゃー (kyaa) | Type 2 | SFW | Excited squeal |
| ばか (baka) | Type 2 | SFW | Playful insult |
| nyaa~, uwu, owo | Type 3 | SFW | Internet cute culture |
| ara ara~ | Type 3 | SFW | Teasing but not explicit |
| 闇が...私を呼んでいる... | Type 1 | SFW | Atmospheric, not sexual |
| ずっと...してほしい... ♥ | Type 1 | **NSFW** | Explicitly intimate |
| 壊れちゃう... | Type 1 | **NSFW** | Loss of control (sexual context) |
| もう...見ないでよ... | Type 2 (Flirty) | SFW | Embarrassed/shy, not explicit |
| "Neural corruption detected" | SFW | SFW | Technical/atmospheric |
| "Pleasure protocols" | LEWD | **NSFW** | Explicitly sexual |

---

## Implementation Changes Required

### 1. Update CORRUPTED_THEME_SPEC.md

**Remove 3-type system:**
```diff
- ### Type 1: Deep Lewd Phrases (Purple #8b5cf6)
- ### Type 2: Short Japanese Glitch (Magenta #d94f90)
- ### Type 3: Romaji Glitch Phrases (Cyan #00d4ff)
```

**Replace with 2-class system:**
```markdown
### SFW Mode (Default)

**Content:** Playful, cute, teasing, atmospheric corruption themes
**Tone:** Anime-style cute/flirty, cyberpunk atmospheric
**Safe for:** General audiences, streaming, professional projects

**Includes:**
- Cute expressions: "nyaa~", "kawaii", "kyaa~"
- Playful teasing: "Don't look at me like that...", "ara ara~"
- Atmospheric corruption: "The darkness calls...", "Neural corruption..."
- System messages: "Loading data streams...", "Reality.exe error..."

### NSFW Mode (Opt-in)

**Content:** Explicit intimate/sexual phrases, loss of control themes
**Tone:** Explicit, mature, sexual degradation
**Safe for:** 18+ projects only, private use, mature content streams

**Includes:**
- Explicit intimate phrases with ♥ symbols
- Loss of control themes ("I'm breaking...", "My mind melting...")
- Explicit words: "hentai", "ecchi"
- Sexual pleasure references: "Pleasure protocols...", "Moral subroutines disabled"
```

### 2. Update CORRUPTION_BUFFER_IMPLEMENTATIONS.md

**Current implementation (event-overlay.html) is CORRECT:**
- Type 1: "Lewd" → **Rename to "NSFW"**
- Type 2: "Flirty" → **Merge into "SFW"**

**celeste-cli needs update:**
- Currently mixes all types together
- Should separate NSFW phrases from SFW

### 3. Update Components

#### corruption-phrases.js
```javascript
// CORRECT: Two clear exports
export const SFW_PHRASES = [/* combined cute, flirty, atmospheric */];
export const NSFW_PHRASES = [/* explicit only */];

// Helper with clear default
export function getRandomPhrase(nsfw = false) {
    const phrases = nsfw ? NSFW_PHRASES : SFW_PHRASES;
    return phrases[Math.floor(Math.random() * phrases.length)];
}
```

#### typing-animation.js
```javascript
// CORRECT: Separate phrase sets
static SFW_JAPANESE = ['ニャー', 'かわいい', 'きゃー', ...]; // No hentai/ecchi
static NSFW_JAPANESE = ['変態', 'えっち', '壊れちゃう...', ...];

// Constructor option
constructor(element, options = {}) {
    this.options = {
        nsfw: options.nsfw || false,  // Default: false
        ...options
    };
}
```

#### corrupted-text.js
- Currently doesn't use phrases (uses character-level corruption)
- No changes needed

---

## API Design

### Option Naming: `nsfw` (not `lewd`, not `includeLewd`)

**Reason:** Clear, unambiguous, industry-standard term

```javascript
// CORRECT
new TypingAnimation(element, { nsfw: false });  // Default
new TypingAnimation(element, { nsfw: true });   // Explicit opt-in

// WRONG (ambiguous)
new TypingAnimation(element, { lewd: true });    // "Lewd" vs "flirty" unclear
new TypingAnimation(element, { includeLewd: true }); // Too verbose
```

---

## Documentation Updates

### README.md Warning

```markdown
## Content Warnings

This package includes two content modes:

### SFW Mode (Default)
- Playful anime-style expressions
- Cute/teasing phrases
- Atmospheric corruption themes
- Safe for professional and public projects

### NSFW Mode (Opt-in Required)
- ⚠️ **18+ Content Warning**
- Explicit intimate/sexual phrases
- Loss of control themes
- **NOT suitable** for:
  - Professional/corporate projects
  - Public streams without 18+ rating
  - Educational contexts
  - All-ages content

**Enabling NSFW Mode:**
```javascript
new TypingAnimation(element, { nsfw: true });
```

**All examples default to SFW mode.**
```

### Content Warning in Examples

```html
<!-- examples/basic/typing-animation.html -->
<!-- ✅ SFW Mode (default) -->
<script>
new TypingAnimation(element, {
    // nsfw: false (default - no need to specify)
});
</script>

<!-- examples/advanced/nsfw-corruption.html -->
<!-- ⚠️ 18+ Content Warning -->
<div class="warning">
    <h2>⚠️ NSFW Content Warning</h2>
    <p>This example contains explicit mature content (18+)</p>
</div>
<script>
new TypingAnimation(element, {
    nsfw: true  // Explicit opt-in required
});
</script>
```

---

## Migration Path

### For Existing Projects Using celeste-tts-bot Components

**Breaking Change:** NO (additive only)

**v0.1.4 → v0.2.0 (This PR):**
- Default behavior: SFW mode
- Existing code without `nsfw` option → SFW mode
- To get old behavior: Add `{ nsfw: true }`

**Example:**
```javascript
// Old (celeste-tts-bot)
const typing = new TypingAnimation(element); // Mixed lewd/sfw

// New (corrupted-theme v0.2.0)
const typing = new TypingAnimation(element); // SFW only (default)
const typing = new TypingAnimation(element, { nsfw: true }); // Old behavior
```

---

## Testing Checklist

### Content Classification Validation

- [ ] **SFW phrases** contain NO explicit sexual content
- [ ] **SFW phrases** can be shown in professional context
- [ ] **NSFW phrases** are clearly explicit/mature
- [ ] **Default behavior** is SFW (no opt-in → no NSFW)
- [ ] **Examples** default to SFW (NSFW examples clearly labeled)

### Phrase Review

**Move to NSFW:**
- [ ] "変態" (hentai) - Type 2 → NSFW
- [ ] "えっち" (ecchi) - Type 2 → NSFW
- [ ] "ずっと...してほしい... ♥" - Currently Type 1 → NSFW ✅
- [ ] "壊れちゃう...ああ...もうダメ..." - Currently Type 1 → NSFW ✅
- [ ] "Pleasure protocols" - Currently LEWD → NSFW ✅

**Keep in SFW:**
- [ ] "ニャー", "かわいい", "きゃー", "ばか" - Cute words
- [ ] "nyaa~", "uwu", "ara ara~" - Internet cute culture
- [ ] "もう...見ないでよ..." - Shy/embarrassed (not explicit)
- [ ] "闇が...私を呼んでいる..." - Atmospheric (not sexual)
- [ ] "Neural corruption detected" - Technical/system

---

## Summary

**Before:** 3 ambiguous classes (Deep Lewd, Short Glitch, Romaji Glitch)
**After:** 2 clear classes (SFW default, NSFW opt-in)

**Key Changes:**
1. Merge Type 2 "Flirty" + Type 3 "Romaji" → **SFW**
2. Keep Type 1 "Deep Lewd" → **NSFW**
3. Move explicit words ("hentai", "ecchi") from Type 2 → **NSFW**
4. Keep atmospheric phrases ("darkness calls...") → **SFW**
5. API: Use `nsfw` boolean option (default: false)
6. Examples: Default to SFW, NSFW examples clearly labeled

**Default Behavior:** Safe, professional, family-friendly
**Opt-in Behavior:** Explicit 18+ mature content

---

**Status:** ⏸️ Awaiting approval before implementation
