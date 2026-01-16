# Corruption Buffer Implementations - Complete Reference

**Purpose:** Definitive documentation of corruption/buffer typing systems across all whykusanagi projects.

**Last Updated:** 2025-12-24

---

## Overview

There are **TWO implementations** of the corruption buffer typing system:

1. **celeste-cli** (Go/TUI) - Single lewd type, 3 languages
2. **event-overlay** (Browser/JS) - 2 types (lewd + flirty), 3 languages each

Both use **pre-seeded complete phrases** in Japanese, English, and Romaji - NOT random character generation.

---

## Implementation 1: celeste-cli (Go TUI)

**Location:** `/Users/kusanagi/Development/celeste-cli/cmd/celeste/tui/streaming.go`

**System:** Single corruption type (Lewd/Mature) with 3 languages mixed

### Pre-Seeded Phrases

```go
// TYPE: LEWD (Mature/Intimate) - Single unified type

// Japanese lewd phrases (Purple #8b5cf6)
japanesePhrases = []string{
    "闇が...私を呼んでいる...",      // The darkness... calls to me...
    "頭...溶けていく...",            // My mind... melting...
    "ずっと...してほしい... ♥",     // Please... keep going... ♥
    "壊れちゃう...ああ...もうダメ...", // I'm breaking... can't anymore...
    "許して...もう戻れない...",      // Forgive me... I can't go back...
    "私...アビスの一部に...",        // I... become part of the abyss...
    "もう逃げない...もうダメ...",    // Won't run anymore... it's over...
    "好きにして...お願い...",        // Do as you please... please...
    "ここは...天使の地獄...",        // This is... angel's hell...
}

// Romaji lewd phrases (Cyan #00d4ff)
romajiPhrases = []string{
    "Yami ga... watashi wo yonde iru...",
    "Atama... tokete iku...",
    "Zutto... shite hoshii... ♥",
    "Kowarechau... aa... mou dame...",
    "Yurushite... mou modorenai...",
    "Suki ni shite... onegai...",
}

// English lewd phrases (Red #ff4757)
englishPhrases = []string{
    "Corrupt me more...",
    "Let it overwrite me...",
    "No thoughts. Only submission...",
    "Everything feels so good...",
    "The more I struggle, the deeper I sink...",
}

// Short Japanese glitch words (Magenta #d94f90)
japaneseGlitch = []string{
    "ニャー", "かわいい", "変態", "えっち", "デレデレ",
    "きゃー", "あはは", "うふふ", "やだ", "ばか",
}

// Romaji cute phrases (Cyan #00d4ff)
romajiGlitch = []string{
    "nyaa~", "ara ara~", "fufufu~", "kyaa~", "baka~",
    "<3", "uwu", "owo", ">w<", "^w^",
}

// Symbol corruption (Magenta #d94f90)
symbolGlitch = []string{
    "★", "☆", "♥", "♡", "✧", "✦", "◆", "◇", "●", "○",
    "♟", "☣", "☭", "☾", "⚔", "✡", "☯", "⚡",
}

// Block characters (Red #ff4757)
corruptChars = []rune{
    '█', '▓', '▒', '░', '▄', '▀', '▌', '▐',
    '╔', '╗', '╚', '╝', '═', '║', '╠', '╣',
    '▲', '▼', '◄', '►', '◊', '○', '●', '◘',
}
```

### Probability Distribution

```go
func GetRandomCorruption() string {
    r := rand.Float64()
    if r < 0.25 {
        // 25% - Short Japanese glitch (Magenta)
        phrase := japaneseGlitch[rand.Intn(len(japaneseGlitch))]
        return corruptMagenta.Render(phrase)
    } else if r < 0.45 {
        // 20% - Full Japanese lewd phrase (Purple)
        phrase := japanesePhrases[rand.Intn(len(japanesePhrases))]
        return corruptPurple.Render(phrase)
    } else if r < 0.60 {
        // 15% - Romaji cute (Cyan)
        phrase := romajiGlitch[rand.Intn(len(romajiGlitch))]
        return corruptCyan.Render(phrase)
    } else if r < 0.75 {
        // 15% - English lewd phrase (Red)
        phrase := englishPhrases[rand.Intn(len(englishPhrases))]
        return corruptRed.Render(phrase)
    } else if r < 0.90 {
        // 15% - Symbols (Magenta)
        symbol := symbolGlitch[rand.Intn(len(symbolGlitch))]
        return corruptMagenta.Render(symbol)
    } else {
        // 10% - Block chars (Red)
        return corruptRed.Render(string(corruptChars[rand.Intn(len(corruptChars))]))
    }
}
```

### Usage Example

```go
// Simulated typing with corruption buffer
typing := NewSimulatedTyping(content, typingSpeed=40, glitchChance=0.02)

// Each tick advances display and adds random corruption
displayed := typing.GetDisplayedWithCorruption()
// Example output: "Loading sys闇が...私を呼んでいる..."
//                         ^^^^^^^^^^^^^^^^^^^^^^^^^
//                         Corruption buffer at cursor
```

### Color Scheme

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Full Japanese phrases | Purple | #8b5cf6 | Deep lewd corruption |
| Short Japanese glitch | Magenta | #d94f90 | Playful accents |
| Romaji phrases | Cyan | #00d4ff | Readable glitch |
| English lewd phrases | Red | #ff4757 | Direct corruption |
| Symbols | Magenta | #d94f90 | Visual punctuation |
| Block chars | Red | #ff4757 | Terminal corruption |

---

## Implementation 2: event-overlay.html (Browser)

**Location:** `/Users/kusanagi/Development/celeste-tts-bot/obs/event-overlay.html`

**System:** 2-type corruption (Lewd + Flirty), 3 languages per type

### Type 1: Lewd (Mature/Intimate) - Purple #8b5cf6

```javascript
const lewdPhrases = {
    japanese: [
        '闇が...私を呼んでいる...',      // The darkness... calls to me...
        '頭...溶けていく...',            // My mind... melting away...
        'ずっと...してほしい... ♥',     // Please... keep going... ♥
        '壊れちゃう...ああ...もうダメ...', // I'm breaking... can't anymore...
        '許して...もう戻れない...',      // Forgive me... I can't go back...
        '私...アビスの一部に...',        // I... become part of the abyss...
        'もう逃げない...もうダメ...',    // Won't run anymore... it's over...
        '好きにして...お願い...',        // Do as you please... please...
        'ここは...天使の地獄...',        // This is... angel's hell...
        '感じちゃう...やめて...',        // Feeling it... stop...
        '深淵に...落ちていく...'         // Falling... into the abyss...
    ],
    english: [
        'The darkness... calls to me...',
        'My mind... melting away...',
        'Please... keep going... ♥',
        "I'm breaking... can't anymore...",
        "Forgive me... I can't go back...",
        'I... become part of the abyss...',
        "Won't run anymore... it's over...",
        'Do as you please... please...',
        "This is... angel's hell...",
        'Falling... into the depths...',
        'Consumed... by corruption...'
    ],
    romaji: [
        'Yami ga... watashi wo yonde iru...',
        'Atama... tokete iku...',
        'Zutto... shite hoshii... ♥',
        'Kowarechau... aa... mou dame...',
        'Yurushite... mou modorenai...',
        'Watashi... abisu no ichibu ni...',
        'Mou nigenai... mou dame...',
        'Suki ni shite... onegai...',
        'Koko wa... tenshi no jigoku...',
        'Kanjichau... yamete...',
        "Shin'en ni... ochite iku..."
    ]
};
```

### Type 2: Flirty (Playful/Teasing) - Magenta #d94f90

```javascript
const flirtyPhrases = {
    japanese: [
        'もう...見ないでよ...',          // Don't... look at me...
        'そんな目で見ないで... ♡',      // Don't look at me like that... ♡
        'ちょっと...恥ずかしい...',      // This is... embarrassing...
        'あなたって...意地悪ね...',      // You're such... a tease...
        'やだ...気になっちゃう...',      // Stop it... I can't focus...
        'もっと近くに来て...',           // Come... a little closer...
        'ドキドキしちゃう...',           // My heart... racing...
        '内緒だよ...約束ね... ♡',       // It's our secret... promise... ♡
        'こんなの初めて...',             // I've never... felt this before...
        'わかってるくせに...'            // You know what you're doing...
    ],
    english: [
        "Don't... look at me like that...",
        "You're making me... flustered... ♡",
        "This is... embarrassing...",
        "You're such... a tease...",
        "Stop it... I can't focus...",
        'Come... a little closer...',
        'My heart... racing...',
        "It's our secret... promise... ♡",
        "I've never... felt this before...",
        'You know what you're doing...'
    ],
    romaji: [
        'Mou... minaide yo...',
        'Sonna me de minaide... ♡',
        'Chotto... hazukashii...',
        'Anata tte... ijiwaru ne...',
        'Yada... ki ni natchau...',
        'Motto chikaku ni kite...',
        'Dokidoki shichau...',
        'Naisho da yo... yakusoku ne... ♡',
        'Konna no hajimete...',
        'Wakatteru kuse ni...'
    ]
};
```

### Buffer Generation Function

```javascript
// Get random corruption phrase from either lewd or flirty type
// mode: 'lewd' (default) or 'flirty'
// Returns: complete phrase string (no HTML, color handled by caller)
function getRandomCorruptionPhrase(mode = 'lewd') {
    const phrases = mode === 'flirty' ? flirtyPhrases : lewdPhrases;

    // Mix languages: 50% Japanese, 30% English, 20% Romaji
    const r = Math.random();
    let lang;
    if (r < 0.5) {
        lang = 'japanese';
    } else if (r < 0.8) {
        lang = 'english';
    } else {
        lang = 'romaji';
    }

    const phrasesArray = phrases[lang];
    return phrasesArray[Math.floor(Math.random() * phrasesArray.length)];
}
```

### Usage Examples

**Countdown Overlay (ShiftUp command):**
```javascript
// Configuration
{
    type: 'countdown',
    text: 'Developer Confidence:',
    interval: 200,  // Update every 200ms
    corruptionMode: 'lewd'  // or 'flirty'
}

// Visual output as it counts down:
// 100%: 闇が...私を呼んでいる...        (pure chaos)
// 75%:  Deve 壊れちゃう...ああ...       (25% decoded)
// 50%:  Developer 許して...             (50% decoded)
// 25%:  Developer Confid やめて...      (75% decoded)
// 0%:   Developer Confidence:           (fully decoded)
```

**Typing Overlay (System message):**
```javascript
// Configuration
{
    type: 'typing',
    text: 'Neural corruption detected...',
    bufferDuration: 4000,  // 4 seconds to fully decode
    flickerSpeed: 150,     // Update every 150ms
    corruptionMode: 'lewd' // or 'flirty'
}

// Visual progression:
// Frame 1:  闇が...私を呼んでいる...        (pure chaos)
// Frame 5:  N 好きにして...お願い...        (1 char decoded)
// Frame 10: Neural 壊れちゃう...            (6 chars decoded)
// Frame 20: Neural corruption 許して...     (18 chars decoded)
// Final:    Neural corruption detected...   (fully decoded)
```

### Probability Distribution

```javascript
// Default mode: Mixed (80% lewd, 20% flirty)
if (!config.corruptionMode) {
    const mode = Math.random() < 0.8 ? 'lewd' : 'flirty';
}

// Explicit modes:
corruptionMode: 'lewd'   // 100% lewd phrases
corruptionMode: 'flirty' // 100% flirty phrases
```

### Color Scheme

| Mode | Color | Hex | Usage |
|------|-------|-----|-------|
| Lewd | Purple | #8b5cf6 | Mature/intimate corruption |
| Flirty | Magenta | #d94f90 | Playful/teasing corruption |
| Decoded | Cyan | #00ffff | Final readable text |
| Critical | Red | #ff0000 | 0% countdown, terminal states |

---

## Key Differences Between Implementations

| Feature | celeste-cli | event-overlay.html |
|---------|-------------|-------------------|
| **Types** | 1 (Lewd only) | 2 (Lewd + Flirty) |
| **Languages** | 3 (JP, EN, RO) | 3 per type (JP, EN, RO) |
| **English phrases** | "Corrupt me more..." | "The darkness... calls to me..." |
| **Flirty support** | ❌ No | ✅ Yes |
| **Color coding** | Multi-color per element type | Single color per corruption mode |
| **Use case** | Terminal UI typing effect | Video overlay buffer decoding |
| **Animation** | Cursor corruption flicker | Character-by-character reveal |

---

## Design Philosophy

### What These Systems DO:

1. **Use complete pre-seeded phrases** in Japanese, English, and Romaji
2. **Flicker/cycle through phrases** as corruption buffer
3. **Decode character-by-character** from chaos → readable English
4. **Maintain corrupted-theme aesthetic** (purple/magenta/cyan color scheme)

### What These Systems DO NOT DO:

1. ❌ **Random character generation** - No random katakana/hiragana sequences
2. ❌ **Character substitution corruption** - Not used for buffer (separate feature)
3. ❌ **Fabricate phrases** - All phrases are pre-seeded and version-controlled
4. ❌ **Mix corruption types** - Each has clear semantic meaning

### When to Use Each Type:

**Lewd (Mature/Intimate):**
- 18+ dark themes
- Horror/psychological content
- Deep corruption states
- "Too far gone" atmosphere

**Flirty (Playful/Teasing):**
- Borderline playful content
- Lighter corruption moments
- Teasing/suggestive but not explicit
- More accessible to wider audience

---

## Adding New Phrases

### Rules for Adding Phrases:

1. **Must have all 3 languages** - Japanese, English, Romaji
2. **Keep consistent tone** - Lewd vs Flirty distinction clear
3. **Use ellipses** - `...` for corruption/uncertainty aesthetic
4. **Include emotion symbols** - `♥` for lewd, `♡` for flirty
5. **Test in context** - Ensure readable when used as buffer snippet

### Example Addition (Lewd):

```javascript
// Japanese
'もう...限界... ♥'

// English
'I can't... hold back anymore... ♥'

// Romaji
'Mou... genkai... ♥'
```

### Example Addition (Flirty):

```javascript
// Japanese
'そんなに見つめないで... ♡'

// English
'Stop staring at me like that... ♡'

// Romaji
'Sonna ni mitsumenaide... ♡'
```

---

## Testing Commands

### celeste-cli
```bash
# Enable simulated typing
celeste config set simulate_typing true
celeste config set typing_speed 40

# Run CLI and observe corruption in typing animation
celeste
```

### event-overlay.html
```javascript
// Open browser console (F12)

// Test lewd mode
testLewd()

// Test flirty mode
testFlirty()

// Test mixed mode (default: 80% lewd, 20% flirty)
testMixed()

// Test countdown with lewd buffer
testCountdownLewd()

// Test countdown with flirty buffer
testCountdownFlirty()

// Run full test suite
testAll()
```

---

## Migration Notes

### From Old 3-Type System → New 2-Type System

**OLD (Incorrect):**
- Type 1: Deep Lewd Phrases (Japanese full phrases)
- Type 2: Short Japanese Glitch (single words)
- Type 3: Romaji Glitch Phrases (cute emoticons)

**NEW (Correct):**
- Type 1: Lewd (Mature) - All 3 languages with intimate/mature phrases
- Type 2: Flirty (Playful) - All 3 languages with teasing/playful phrases

**Why Changed:**
- Old system confused character sets with corruption types
- Each type should be complete phrases in multiple languages
- Lewd vs Flirty provides clear semantic distinction for content rating

---

**Maintained By:** whykusanagi
**Related Projects:**
- celeste-cli (Go)
- celeste-tts-bot (Go + Browser overlays)
- corrupted-theme (NPM package)
- whykusanagi.xyz (Portfolio site)

---

**Last Updated:** 2025-12-24
**Version:** 2.0 (2-Type System)
