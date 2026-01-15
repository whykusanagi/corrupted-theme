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

**Color Usage:** Mix of cyan (#00ffff), magenta (#d94f90), purple (#8b5cf6)

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

- **1.1** (2026-01-15): Content classification normalization
  - **BREAKING**: Changed from 3-type to 2-class system (SFW/NSFW)
  - Normalized "lewd" terminology to "NSFW" for clarity
  - Made SFW the explicit default (no opt-in required)
  - NSFW requires explicit `{ nsfw: true }` opt-in
  - Moved explicit words ("hentai", "ecchi") from playful to NSFW
  - Updated all examples and quick reference tables

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
