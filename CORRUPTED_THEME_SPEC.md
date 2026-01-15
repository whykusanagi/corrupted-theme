# Corrupted Theme Specification

**Version:** 1.0
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

**Primary Colors:**
```css
--corrupted-cyan:     #00ffff;  /* Primary text, decoded/stable state */
--corrupted-magenta:  #ff00ff;  /* Accent, secondary corruption */
--corrupted-purple:   #8b5cf6;  /* Lewd/intimate corruption */
--corrupted-magenta2: #d94f90;  /* High-energy glitches */
--corrupted-red:      #ff0000;  /* Critical state, danger */
--corrupted-green:    #00ff00;  /* System/matrix references */
```

**Usage Guidelines:**
- **Cyan (#00ffff)**: Stable, decoded, readable text
- **Purple (#8b5cf6)**: Deep corruption (lewd phrases, intimate content)
- **Magenta (#d94f90)**: Surface corruption (short glitches, energy bursts)
- **Red (#ff0000)**: Critical/terminal states (0%, errors, failures)
- **Green (#00ff00)**: Matrix callbacks, system states

### 2. Text Shadow Effects

**Cyberpunk Glow:**
```css
text-shadow:
    0 0 10px #00ffff,    /* Inner glow */
    0 0 20px #00ffff,    /* Mid glow */
    0 0 30px #ff00ff,    /* Outer magenta */
    2px 2px 0 #ff0000,   /* Red chromatic aberration */
    -2px -2px 0 #00ff00; /* Green chromatic aberration */
```

**Purpose:** Creates RGB separation effect, simulates CRT display corruption, adds depth.

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
    0%   { color: #00ffff; }
    33%  { color: #ff00ff; }
    66%  { color: #00ff00; }
    100% { color: #00ffff; }
}
```

**Usage:** Apply to corrupted/unstable elements, cycle at 0.1s-0.5s intervals.

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

### Pattern 1: Character-by-Character Decoding

**Concept:** Final text emerges character-by-character from chaotic buffer.

**Implementation:**
```javascript
// Revealed portion (cyan) + chaos buffer (purple/magenta)
const revealed = finalText.substring(0, revealedChars);
const remaining = finalText.length - revealedChars;

// Generate chaos for unrevealed portion
let chaos = '';
for (let i = 0; i < remaining; i++) {
    chaos += randomCorruptionChar();
}

// Display: revealed (stable) + chaos (unstable)
element.innerHTML =
    `<span style="color: #00ffff;">${revealed}</span>` +
    `<span style="color: #8b5cf6;">${chaos}</span>`;
```

**Visual Effect:**
```
Initial:  闇が...私を呼んでいる... 壊れちゃう...
         ↓
Step 1:   N 好きにして...お願い... えっち
         ↓
Step 2:   Ne 許して...もう戻れない...
         ↓
Final:    Neural corruption detected...
```

**Use Cases:**
- Loading states
- Decryption/decoding sequences
- System boot messages
- Progressive reveal of information

### Pattern 2: Phrase Flickering (Buffer Corruption)

**Concept:** Rapid cycling through complete phrases before settling on final text.

**Implementation:**
```javascript
const lewdPhrases = [
    '闇が...私を呼んでいる...',
    '壊れちゃう...ああ...もうダメ...',
    '好きにして...お願い...'
];

// Flicker through phrases
setInterval(() => {
    if (elapsed < bufferDuration) {
        const phrase = lewdPhrases[Math.floor(Math.random() * lewdPhrases.length)];
        element.innerHTML = `<span style="color: #8b5cf6;">${phrase}</span>`;
    } else {
        element.innerHTML = `<span style="color: #00ffff;">${finalText}</span>`;
    }
}, flickerSpeed);
```

**Visual Effect:**
```
Frame 1:  闇が...私を呼んでいる...      (150ms)
Frame 2:  壊れちゃう...ああ...もうダメ... (150ms)
Frame 3:  許して...もう戻れない...      (150ms)
... rapid flickering ...
Final:    System Online                  (stable)
```

**Use Cases:**
- Loading/buffering states
- System instability
- Dramatic reveals
- Error states transitioning to recovery

### Pattern 3: Hybrid Decoding (Combined)

**Concept:** Character-by-character decoding WITH phrase flickering in unrevealed portion.

**Implementation:**
```javascript
const revealed = finalText.substring(0, revealedChars);
const remaining = finalText.length - revealedChars;

// Flicker complete phrase snippets in chaos buffer
const randomPhrase = lewdPhrases[Math.floor(Math.random() * lewdPhrases.length)];
const chaos = randomPhrase.substring(0, remaining);

element.innerHTML =
    `<span style="color: #00ffff;">${revealed}</span>` +
    `<span style="color: #8b5cf6;">${chaos}</span>`;
```

**Visual Effect:**
```
Step 1:  N 闇が...私を呼んでいる...
Step 2:  Ne 壊れちゃう...ああ...もう
Step 3:  Neu 許して...もう戻れない
Step 4:  Neur 好きにして...お願い
Final:   Neural corruption detected...
```

**Use Cases:**
- High-intensity corruption effects
- Combining multiple corruption sources
- Maximum visual chaos before stability

---

## Lewd/Intimate Corruption Content

**⚠️ DEFINITIVE REFERENCE:** See `CORRUPTION_BUFFER_IMPLEMENTATIONS.md` for complete implementation details across all projects.

**Purpose:** Create unsettling, intimate, "too far gone" atmosphere for mature/dark themed projects.

**System Architecture:** 2-type corruption system (Lewd + Flirty) with 3 languages per type (Japanese, English, Romaji).

---

### Type 1: Deep Lewd Phrases (Purple #8b5cf6)

**Intensity:** High (full intimate/corrupted sentences)
**Color:** Purple #8b5cf6
**Length:** Long phrases (10-20 characters)

| Japanese | Romaji | English (Context) |
|----------|--------|-------------------|
| 闇が...私を呼んでいる... | Yami ga... watashi wo yonde iru... | The darkness... calls to me... |
| 頭...溶けていく... | Atama... tokete iku... | My mind... melting... |
| ずっと...してほしい... ♥ | Zutto... shite hoshii... | Please... keep doing it... ♥ |
| 壊れちゃう...ああ...もうダメ... | Kowarechau... aa... mou dame... | I'm breaking... ah... can't anymore... |
| 許して...もう戻れない... | Yurushite... mou modorenai... | Forgive me... I can't go back... |
| 私...アビスの一部に... | Watashi... abisu no ichibu ni... | I... become part of the abyss... |
| もう逃げない...もうダメ... | Mou nigenai... mou dame... | I won't run anymore... it's over... |
| 好きにして...お願い... | Suki ni shite... onegai... | Do as you please... please... |
| ここは...天使の地獄... | Koko wa... tenshi no jigoku... | This is... angel's hell... |

**Tone:** Surrender, corruption, loss of control, intimate degradation.

**Usage:** Primary buffer corruption for mature themes, countdown overlays, deep corruption states.

---

### Type 2: Short Japanese Glitch (Magenta #d94f90)

**Intensity:** Medium (playful/lewd single words)
**Color:** Magenta #d94f90
**Length:** Short words (2-5 characters)

| Japanese | Romaji | Vibe |
|----------|--------|------|
| ニャー | nyaa | Playful/cute |
| かわいい | kawaii | Cute |
| 変態 | hentai | Pervert |
| えっち | ecchi | Lewd |
| デレデレ | deredere | Lovestruck |
| きゃー | kyaa | Squeal |
| あはは | ahaha | Laughing |
| うふふ | ufufu | Giggle |
| やだ | yada | No way! |
| ばか | baka | Idiot |

**Tone:** Surface-level playful/lewd, not as intense as full phrases.

**Usage:** Quick glitch accents, lighter corruption moments, variety in buffer.

---

### Type 3: Romaji Glitch Phrases (Cyan #00d4ff)

**Intensity:** Low (cute/playful romanized)
**Color:** Cyan #00d4ff
**Length:** Short phrases/emoticons (3-8 characters)

| Phrase | Vibe |
|--------|------|
| nyaa~ | Cute cat sound |
| ara ara~ | Teasing/mature |
| fufufu~ | Mischievous laugh |
| kyaa~ | Excited squeal |
| baka~ | Playful insult |
| <3 | Heart emoticon |
| uwu | Cute text face |
| owo | Curious text face |
| >w< | Happy text face |
| ^w^ | Content text face |

**Purpose:** Romanized cute phrases and text emoticons for playful, readable corruption.

**Tone:** Western internet culture meets anime aesthetic, lighter than Japanese glitch.

**Usage:** Readable corruption, Western audience accessibility, cute/playful themes.

---

### Implementation: 3-Type System

**How they work together:**

```javascript
// Buffer generation using all 3 types
function getRandomLewd() {
    const rand = Math.random();

    if (rand < 0.40) {
        // Type 1: Deep lewd phrase (40% chance)
        return lewdPhrases[random]; // "闇が...私を呼んでいる..."
    } else if (rand < 0.70) {
        // Type 2: Short Japanese glitch (30% chance)
        return japaneseGlitch[random]; // "えっち"
    } else {
        // Type 3: Romaji glitch (30% chance)
        return romajiGlitch[random]; // "nyaa~"
    }
}
```

**Visual Progression Example:**
```
Frame 1: 闇が...私を呼んでいる...     (Type 1: Deep corruption)
Frame 2: N えっち かわいい            (Type 2: Short glitch)
Frame 3: Ne nyaa~ uwu                 (Type 3: Romaji playful)
Frame 4: Neu 壊れちゃう...             (Type 1: Back to deep)
Frame 5: Neur きゃー                  (Type 2: Surface glitch)
Final:   Neural corruption detected... (Decoded clean text)
```

**Design Intent:**
- **Type 1** (Purple): Creates unsettling, "too far gone" atmosphere
- **Type 2** (Magenta): Adds playful energy, breaks up intensity
- **Type 3** (Cyan): Provides readable moments, Western accessibility

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

**When to use lewd corruption:**
- ✅ Mature/18+ projects
- ✅ Horror/psychological themes
- ✅ Dark cyberpunk aesthetics
- ✅ "Corrupted AI" character themes

**When NOT to use:**
- ❌ Professional/corporate projects
- ❌ Educational/academic contexts
- ❌ All-ages content
- ❌ Default states (make it opt-in)

**Alternative for SFW projects:**
Use only:
- Katakana/Hiragana (no meaning)
- Block characters
- Symbols
- Generic system messages

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
2. **Readable Endpoints**: Final state must be readable (cyan, stable)
3. **Motion Indicates Instability**: Static = stable, animated = corrupted
4. **Color = State**: Each color represents a corruption level/type
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

- **1.0** (2025-12-24): Initial specification
  - Character sets defined
  - Three corruption patterns documented
  - Glass morphism integration
  - Lewd content guidelines

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

## Quick Reference: All Corruption Modes

| Corruption Type | Color | Character Set | Use Case | Example |
|----------------|-------|---------------|----------|---------|
| **Japanese Katakana** | N/A | アイウエオ... | Primary visual corruption, Matrix aesthetic | アラエテカ |
| **Japanese Hiragana** | N/A | あいうえお... | Softer corruption, intimate themes | あかすてな |
| **Romaji Letters** | N/A | A-Z, a-z | Semi-readable Western glitch | HeLLo WoRlD |
| **English Substitution** | Cyan #00ffff | A-Z → random | SFW corruption, professional contexts | Hrllo Wmrld |
| **Type 1: Deep Lewd Phrases** | Purple #8b5cf6 | 闇が...私を... | High intensity, mature themes (40%) | 壊れちゃう... |
| **Type 2: Short Japanese Glitch** | Magenta #d94f90 | ニャー, かわいい | Medium intensity, playful (30%) | えっち, きゃー |
| **Type 3: Romaji Glitch Phrases** | Cyan #00d4ff | nyaa~, uwu | Low intensity, readable (30%) | ara ara~, ^w^ |
| **Decorative Symbols** | Magenta #d94f90 | ★☆♥✧ | Visual punctuation, accents | ✦◇●⚡ |
| **Block Characters** | Red #ff4757 | █▓▒░ | Heavy corruption, terminal state | ╔╗═║▲▼ |

### Corruption Mode Selection Guide

**For 18+ Dark Themes (3-Type Lewd System):**
- **Type 1**: Deep Lewd Phrases (#8b5cf6) - 40% probability
- **Type 2**: Short Japanese Glitch (#d94f90) - 30% probability
- **Type 3**: Romaji Glitch Phrases (#00d4ff) - 30% probability
- **Accents**: Decorative Symbols, Block Characters
- **Pattern**: Mix all 3 types randomly in buffer for varied intensity

**For Playful/Cute Themes:**
- Primary: Romaji Glitch Phrases (#00d4ff)
- Secondary: Short Japanese Glitch (#d94f90)
- Accents: Decorative Symbols (hearts, stars)

**For Professional/SFW:**
- Primary: English Letter Substitution (#00ffff)
- Secondary: Romaji Letters
- Accents: Block Characters (minimal)

**For Maximum Chaos:**
- Mix all modes randomly
- High flicker speed (< 100ms)
- Deep corruption (lewd phrases + blocks)

---

**Maintained by:** whykusanagi
**Contact:** [GitHub Issues](https://github.com/whykusanagi/corrupted-theme/issues)
**Status:** Ready for community contribution
