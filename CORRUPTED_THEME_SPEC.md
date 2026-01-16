# Corrupted Theme Specification

**Version:** 1.1
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
--corrupted-white:    #ffffff;  /* Primary text, decoded/stable state */
--corrupted-black:    #000000;  /* Background, void, deep darkness */
--corrupted-magenta:  #ff00ff;  /* Primary corruption color */
--corrupted-purple:   #8b5cf6;  /* Deep/intimate corruption */
--corrupted-magenta2: #d94f90;  /* High-energy glitches, playful corruption */
--corrupted-red:      #ff0000;  /* Critical state, danger, terminal errors */
--corrupted-cyan:     #00ffff;  /* Accent only (rare, for highlights) */
--corrupted-green:    #00ff00;  /* System/matrix references (rare) */
```

**Usage Guidelines:**
- **White (#ffffff)**: Primary stable/decoded text, final readable state
- **Black (#000000)**: Background, void areas, corrupted "holes" in data
- **Magenta (#ff00ff)**: Primary corruption color, main glitch aesthetic
- **Purple (#8b5cf6)**: Deep corruption (intimate/NSFW phrases, intense degradation)
- **Magenta2 (#d94f90)**: Playful corruption (SFW phrases, high-energy glitches)
- **Red (#ff0000)**: Critical/terminal states (0%, errors, failures, system collapse)
- **Cyan (#00ffff)**: Accent ONLY (occasional highlight, rare matrix callback)
- **Green (#00ff00)**: System/matrix references (rare, nostalgic nod to Matrix aesthetic)

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

**What it is:** Revealed text is stable (cyan), unrevealed portion shows phrase snippets from buffer
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
