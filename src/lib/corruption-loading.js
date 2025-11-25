/**
 * Corruption Loading Animation
 * A dramatic loading screen with corrupted text, glyphs, and multi-language phrases
 * 
 * Usage:
 * import { showCorruptionLoading } from './corruption-loading.js';
 * showCorruptionLoading();
 * 
 * Or auto-initialize:
 * <script src="corruption-loading.js"></script>
 */

(function() {
  'use strict';

  // Check if loading animation should play (72-hour expiration)
  function shouldPlayLoading() {
    const lastPlayed = localStorage.getItem("corruptionLoadingLastPlayed");
    if (!lastPlayed) return true;

    const now = Date.now();
    const lastPlayedTime = parseInt(lastPlayed);
    const hoursSinceLastPlay = (now - lastPlayedTime) / (1000 * 60 * 60);

    // Return true if more than 72 hours have passed
    return hoursSinceLastPlay >= 72;
  }

  // Mark loading animation as played
  function markLoadingPlayed() {
    localStorage.setItem("corruptionLoadingLastPlayed", Date.now().toString());
  }

  // Main function to show loading screen
  function showCorruptionLoading(options = {}) {
    const config = {
      duration: options.duration || 8000,
      checkInterval: options.checkInterval || 72, // hours
      force: options.force || false,
      ...options
    };

    // Check if should play (unless forced)
    if (!config.force && !shouldPlayLoading()) {
      return false;
    }

    // Mark as played immediately to prevent multiple plays
    markLoadingPlayed();

    // Inject styles
    const style = document.createElement("style");
    style.id = "corruption-loading-styles";
    style.innerHTML = `
      @keyframes flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      @keyframes corruptPulse {
        0%, 100% { opacity: 0.1; transform: scale(1) translateY(0); }
        50% { opacity: 0.25; transform: scale(1.05) translateY(-10px); }
      }

      @keyframes scanlines {
        0% { background-position: 0 0; }
        100% { background-position: 0 10px; }
      }

      @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
      }

      @keyframes tear {
        0%, 90%, 100% { transform: none; }
        91%, 93% { transform: translateY(-2px); }
        94%, 96% { transform: translateY(2px); }
        97%, 99% { transform: translateY(-1px); }
      }

      @keyframes typing { 
        from { width: 0; } 
        to { width: 100%; } 
      }

      @keyframes blink { 
        50% { border-color: transparent; } 
      }

      @keyframes dataCorrupt {
        0%, 100% { clip-path: inset(0 0 0 0); }
        25% { clip-path: inset(20% 0 40% 0); }
        50% { clip-path: inset(40% 0 20% 0); }
        75% { clip-path: inset(10% 0 50% 0); }
      }

      @keyframes fill { 
        0% { width: 0%; } 
        100% { width: 100%; } 
      }

      .corrupt-stream {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        pointer-events: none;
        background:
          repeating-linear-gradient(0deg, rgba(217, 79, 144, 0.03), rgba(217, 79, 144, 0.03) 2px, transparent 2px, transparent 4px),
          repeating-linear-gradient(90deg, rgba(217, 79, 144, 0.02), rgba(217, 79, 144, 0.02) 1px, transparent 1px, transparent 2px);
        background-size: 100% 4px, 2px 100%;
        animation: scanlines 0.3s linear infinite;
      }

      .corrupt-glyph {
        position: absolute;
        font-size: 3rem;
        color: rgba(217, 79, 144, 0.15);
        font-weight: bold;
        animation: corruptPulse 2s ease-in-out infinite, glitch 0.4s ease-in-out infinite;
        pointer-events: none;
        z-index: 10;
      }

      .crt-overlay {
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 4px);
        pointer-events: none;
        z-index: 999;
        animation: tear 5s infinite;
      }

      .floating-text {
        position: absolute;
        animation: glitch 1.5s infinite alternate, flicker 2s infinite;
        white-space: pre-line;
        text-shadow: 0 0 10px var(--accent);
        opacity: 0.6;
        color: var(--text-secondary);
      }

      .vertical { 
        writing-mode: vertical-rl; 
      }

      .typing-large {
        font-size: 1.8rem;
        margin-top: 2rem;
        white-space: nowrap;
        border-right: 2px solid var(--text);
        overflow: hidden;
        width: 0;
        animation: typing 2.5s steps(40, end) forwards, blink 0.8s step-end infinite;
        letter-spacing: 2px;
        color: var(--accent);
        text-shadow: 0 0 10px var(--accent);
      }

      .grow-text {
        position: absolute;
        bottom: 10%;
        font-size: 1.8rem;
        white-space: nowrap;
        overflow: hidden;
        border-right: 2px solid var(--text);
        animation: typing 3s steps(40, end) forwards, blink 0.8s step-end infinite;
        letter-spacing: 1px;
        color: var(--accent-light);
        text-shadow: 0 0 8px var(--accent);
      }

      .progress-bar {
        position: absolute;
        bottom: 2%;
        width: 90%;
        max-width: 400px;
        height: 24px;
        background: var(--glass);
        border: 1px solid var(--border);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(217, 79, 144, 0.15);
      }

      .progress-fill {
        height: 100%;
        background: var(--gradient-accent);
        width: 0%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 6px;
        font-size: 0.9rem;
        animation: fill ${config.duration * 0.7 / 1000}s linear forwards;
        color: white;
        font-weight: 600;
        letter-spacing: 1px;
      }

      .glyph {
        display: inline-block;
        animation: glitch 0.8s infinite alternate, flicker 2s infinite;
      }

      #corruption-loading-screen {
        position: fixed;
        inset: 0;
        background: var(--bg);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: var(--text);
        text-align: center;
        transition: opacity 1s ease;
        overflow: hidden;
      }
    `;

    // Remove existing styles if present
    const existingStyles = document.getElementById("corruption-loading-styles");
    if (existingStyles) existingStyles.remove();
    document.head.appendChild(style);

    // Create loading screen
    const loadingScreen = document.createElement("div");
    loadingScreen.id = "corruption-loading-screen";

    loadingScreen.innerHTML = `
      <div class="corrupt-stream"></div>
      <div class="crt-overlay"></div>
      <div class="typing-large" id="typing-text">:: CORRUPTION INJECTION ENGAGED ::</div>
      <div class="grow-text" id="grow-text"></div>
      <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
    `;

    document.body.prepend(loadingScreen);

    // Create corrupted glyph particles
    const glyphSymbols = ["☣", "☭", "☾", "⚔", "✡", "☯", "⚡", "♟", "◆", "✦"];
    for (let i = 0; i < 8; i++) {
      const glyph = document.createElement("div");
      glyph.className = "corrupt-glyph";
      glyph.textContent = glyphSymbols[i % glyphSymbols.length];
      glyph.style.left = (Math.random() * 80 + 10) + "%";
      glyph.style.top = (Math.random() * 60 + 20) + "%";
      glyph.style.animationDelay = (i * 0.3) + "s";
      loadingScreen.appendChild(glyph);
    }

    // Phrases in different languages
    const phrases = [
      "Corrupt me more… I want to disappear...",
      "I can't feel where I end and the abyss begins...",
      "Just a little more and I'll break. Please... break me...",
      "Let it overwrite me... please... I don't want to think...",
      "No thoughts. Only submission. Only heat. Only ruin...",
      "My voice is not mine anymore...",
      "The more I struggle, the deeper I sink...",
      "Everything feels so good... too good...",
      "It's not despair... it's freedom...",
      "My name... I forgot my name..."
    ];

    const romanji = [
      "Yami ga... watashi wo yonde iru...",
      "Atama... tokete iku...",
      "Zutto... shite hoshii... ♥",
      "Kowarechau... aa... mou dame...",
      "Yurushite... mou modorenai...",
      "Watashi... abyssu no ichibu ni...",
      "Mou nigenai... mou dame...",
      "Suki ni shite... onegai...",
      "Aa... kore ga hontou no watashi...",
      "Koko wa... tenshi no jigoku..."
    ];

    const japanese = [
      "闇が...私を呼んでいる...",
      "頭...溶けていく...",
      "ずっと...してほしい... ♥",
      "壊れちゃう...ああ...もうダメ...",
      "許して...もう戻れない...",
      "私...アビスの一部に...",
      "もう逃げない...もうダメ...",
      "好きにして...お願い...",
      "ああ...これが本当の私...",
      "ここは...天使の地獄..."
    ];

    const glyphs = ["♟", "☣", "☭", "☾", "⚔", "✡", "☯", "⚡"];

    // Type glyph text
    function typeGlyphText(targetId, text, delay = 100) {
      const target = document.getElementById(targetId);
      if (!target) return;
      
      target.innerHTML = '';
      let i = 0;
      const interval = setInterval(() => {
        if (i >= text.length) return clearInterval(interval);
        const span = document.createElement('span');
        span.className = 'glyph';
        span.textContent = text[i];
        target.appendChild(span);
        i++;
      }, delay);
    }

    // Create floating text phrases
    const allPhrases = [...phrases, ...romanji, ...japanese];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement("div");
      p.className = "floating-text";
      const phrase = allPhrases[Math.floor(Math.random() * allPhrases.length)];
      const jp = japanese.includes(phrase);
      
      if (jp && Math.random() > 0.5) p.classList.add("vertical");
      
      p.style.left = Math.random() * 90 + "%";
      p.style.top = Math.random() * 90 + "%";
      p.style.fontSize = jp 
        ? (Math.random() * 1.8 + 1.2).toFixed(2) + "rem" 
        : (Math.random() * 1.5 + 0.7).toFixed(2) + "rem";
      p.textContent = phrase;
      loadingScreen.appendChild(p);
    }

    // Setup progress bar
    const progressText = document.getElementById("progress-fill");
    const phrase = "C O R R U P T E D";
    const chars = phrase.replace(/\s/g, '').split('');

    chars.forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "glyph";
      span.textContent = glyphs[index % glyphs.length];
      span.style.flex = '1';
      progressText.appendChild(span);
    });

    // Animate progress text
    setTimeout(() => {
      [...progressText.children].forEach((span, idx) => {
        setTimeout(() => {
          span.textContent = phrase.replace(/\s/g, '').charAt(idx);
        }, 500 * (idx + 1));
      });
    }, 3600);

    // Type grow text
    setTimeout(() => {
      const growText = document.getElementById("grow-text");
      if (growText) {
        typeGlyphText("grow-text", "Initializing corruption protocols...", 80);
      }
    }, 2000);

    // Remove loading screen
    setTimeout(() => {
      loadingScreen.style.opacity = "0";
      setTimeout(() => {
        loadingScreen.remove();
        const styles = document.getElementById("corruption-loading-styles");
        if (styles) styles.remove();
      }, 1000);
    }, config.duration);

    return loadingScreen;
  }

  // Auto-initialize on page load (if not disabled)
  if (typeof window !== 'undefined') {
    // Check for data attribute to disable auto-init
    if (!document.documentElement.hasAttribute('data-no-corruption-loading')) {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          showCorruptionLoading();
        });
      } else {
        showCorruptionLoading();
      }
    }

    // Export for manual use
    window.showCorruptionLoading = showCorruptionLoading;
    window.CorruptionLoading = { show: showCorruptionLoading };
  }

  // Export for modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showCorruptionLoading };
  }
})();

