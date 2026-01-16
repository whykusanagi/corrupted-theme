# Terminology Clarification: Corruption vs Buffer

**Issue:** "Corrupted text" is ambiguous - refers to two different concepts
**Solution:** Clear terminology distinction

---

## Two Distinct Concepts

### 1. Character-Level Corruption (Visual Glitch)

**What it is:** Random character substitution for visual effect only
**Characters used:** Katakana (アイウエオ), Hiragana (あいうえお), Symbols, Blocks
**Purpose:** Matrix-style visual glitch, no semantic meaning
**Content:** Always SFW (no phrases, just random characters)

**Example:**
```
"Hello World" → "ア#Lェo W%▓l闇" → "Hello World"
```

**Component:** `CorruptedText` (character cycling animation)
**Spec Reference:** "Character-by-Character Decoding" (Pattern 1) - But using character sets only

---

### 2. Buffer Corruption (Phrase Flickering)

**What it is:** Full phrases flickering through before revealing final text
**Phrases used:** SFW or NSFW complete sentences/words
**Purpose:** Simulates neural network "decoding" corrupted data buffer
**Content:** Can be SFW or NSFW depending on configuration

**Example (SFW):**
```
"闇が...私を呼んでいる..." → "かわいい きゃー" → "nyaa~ uwu" → "Loading complete"
```

**Example (NSFW):**
```
"壊れちゃう...ああ...もうダメ..." → "変態 えっち" → "Pleasure protocols..." → "Loading complete"
```

**Component:** `TypingAnimation` (typing with phrase buffer)
**Spec Reference:** "Phrase Flickering (Buffer Corruption)" (Pattern 2)

---

## Correct Terminology

### ❌ Ambiguous Terms (Don't Use)
- "Corrupted text" - Which type?
- "Corruption effect" - Too vague
- "Glitch text" - Could be either

### ✅ Precise Terms (Use These)

| Concept | Correct Term | Component | Content |
|---------|--------------|-----------|---------|
| Random character substitution | **Character corruption** | CorruptedText | Always SFW |
| Phrase flickering in buffer | **Buffer corruption** | TypingAnimation | SFW or NSFW |
| Character reveal with phrase buffer | **Hybrid corruption** | Custom implementation | SFW or NSFW |

---

## Implementation Requirements

### Character Corruption (CorruptedText)
- ✅ Uses character sets only (Katakana, Hiragana, etc.)
- ✅ No phrases, no semantic content
- ✅ Always SFW by design
- ✅ No `nsfw` configuration option needed

### Buffer Corruption (TypingAnimation)
- ✅ Uses complete phrases (SFW or NSFW)
- ✅ **MUST** have `nsfw` configuration option
- ✅ **MUST** default to `nsfw: false` (SFW)
- ✅ NSFW phrases only shown when `nsfw: true`

---

## Spec Updates Needed

### 1. Update Pattern Terminology

**OLD (Confusing):**
- Pattern 1: "Character-by-Character Decoding" - Uses phrases in examples
- Pattern 2: "Phrase Flickering (Buffer Corruption)" - OK
- Pattern 3: "Hybrid Decoding (Combined)" - OK but uses lewd examples

**NEW (Clear):**
- Pattern 1: "Character Corruption (Visual Glitch)" - Pure character sets, no phrases
- Pattern 2: "Buffer Corruption (Phrase Flickering)" - Full phrases flicker
- Pattern 3: "Hybrid Corruption (Character + Buffer)" - Combines both

### 2. Separate Examples by Type

**Character Corruption Examples:**
```javascript
// Pure visual glitch - no phrases
const chaos = '';
for (let i = 0; i < remaining; i++) {
    chaos += randomCharacterFromSet(KATAKANA);  // Just characters
}
```

**Buffer Corruption Examples (SFW):**
```javascript
// Phrase flickering - SFW mode
const phrase = SFW_PHRASES[random];  // "かわいい", "nyaa~", "Neural corruption..."
element.textContent = phrase;
```

**Buffer Corruption Examples (NSFW):**
```javascript
// Phrase flickering - NSFW mode (opt-in only)
if (options.nsfw === true) {
    const phrase = NSFW_PHRASES[random];  // "壊れちゃう...", "変態"
    element.textContent = phrase;
}
```

---

## User-Facing Documentation

### README Example (Character Corruption)
```html
<!-- Visual glitch effect - always SFW, no phrases -->
<span class="corrupted-multilang"
      data-english="Hello"
      data-katakana="コンニチハ">
</span>
```

### README Example (Buffer Corruption - SFW)
```javascript
// Phrase buffer corruption - SFW mode (default)
new TypingAnimation(element, {
    finalText: "System Online"
    // Phrases like "かわいい", "nyaa~", "Neural corruption..." will flicker
});
```

### README Example (Buffer Corruption - NSFW)
```javascript
// Phrase buffer corruption - NSFW mode (explicit opt-in)
// ⚠️ 18+ Content Warning
new TypingAnimation(element, {
    finalText: "System Online",
    nsfw: true  // Enables explicit phrases
});
```

---

## Component Matrix

| Component | Type | Uses Phrases | SFW/NSFW Option | Default Safe |
|-----------|------|--------------|-----------------|--------------|
| **CorruptedText** | Character corruption | ❌ No (characters only) | N/A (always SFW) | ✅ Yes |
| **TypingAnimation** | Buffer corruption | ✅ Yes (SFW or NSFW) | ✅ `nsfw` option | ✅ Yes (SFW default) |
| **corruption-phrases.js** | Phrase library | ✅ Yes (exports both) | ✅ Separate exports | ✅ Yes (SFW default export) |

---

## Action Items

### 1. Update CORRUPTED_THEME_SPEC.md
- [ ] Rename Pattern 1 from "Character-by-Character Decoding" to "Character Corruption (Visual Glitch)"
- [ ] Update Pattern 1 examples to use ONLY character sets (no phrases)
- [ ] Ensure Pattern 2 "Buffer Corruption" examples use SFW_PHRASES in default examples
- [ ] Add NSFW opt-in examples to Pattern 2
- [ ] Update Pattern 3 "Hybrid" to clearly show SFW and NSFW variants

### 2. Component Implementation
- [x] CorruptedText - Already correct (uses characters only, no phrases)
- [ ] TypingAnimation - Port with SFW/NSFW phrase split
- [ ] corruption-phrases.js - Create with clear SFW/NSFW exports

### 3. Documentation
- [ ] README: Clarify "character corruption" vs "buffer corruption"
- [ ] Examples: Separate character vs buffer examples
- [ ] API docs: Document when `nsfw` option applies (buffer corruption only)

---

## Summary

**Character Corruption** = Visual glitch with random characters (always SFW)
**Buffer Corruption** = Phrase flickering in "decoding buffer" (SFW or NSFW)

Use precise terminology to avoid confusion!

---

**Status:** ⏸️ Awaiting spec update approval
