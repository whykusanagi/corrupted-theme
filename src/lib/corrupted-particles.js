// src/lib/corrupted-particles.js
// CorruptedParticles — Canvas 2D floating phrase particles background
// Part of @whykusanagi/corrupted-theme

const SFW_PHRASES = [
  '壊れ corrupting', 'ロード loading', '処理中', '接続 connecting',
  '分析 analyzing', '待機 waiting', '実行 executing', '深淵 abyss',
  '監視中', 'cor壊rupting', '読み込み yomikomi', 'データ data',
  '解析 kaiseki', '壊れている', 'エラー error', 'システム system',
  '接続中 setsuzoku', '処理 processing', '壊れ kowarete',
];

const NSFW_PHRASES = [
  '壊れちゃう...ああ...', 'ずっと...してほしい... ♥',
  '変態', 'えっち', '好きにして...お願い...',
  'Moral subroutines: DISABLED', 'Pleasure protocols...',
  '壊れている kowarete-iru',
];

// Depth layer definitions — far (dim/slow) to near (bright/fast)
const LAYERS = [
  { name: 'far',  weight: 0.30, minSize: 9,  maxSize: 11, minSpeed: 0.2, maxSpeed: 0.4, minOpacity: 0.15, maxOpacity: 0.25 },
  { name: 'mid',  weight: 0.50, minSize: 12, maxSize: 15, minSpeed: 0.4, maxSpeed: 0.8, minOpacity: 0.35, maxOpacity: 0.55 },
  { name: 'near', weight: 0.20, minSize: 16, maxSize: 20, minSpeed: 0.8, maxSpeed: 1.4, minOpacity: 0.60, maxOpacity: 0.80 },
];

const CYAN   = '#00ffff';  // --corrupted-cyan  (kept for lineColor comparisons)
const PURPLE = '#8b5cf6';  // --corrupted-purple (kept for lineColor comparisons)
const CYAN_RGB   = { r: 0,   g: 255, b: 255 };
const PURPLE_RGB = { r: 139, g: 92,  b: 246 };

class CorruptedParticles {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.options = {
      count:        options.count        ?? 60,
      includeLewd:  options.includeLewd  ?? false,
      speed:        options.speed        ?? 1.0,
      lineDistance: options.lineDistance ?? 150,
    };

    if (this.options.includeLewd) {
      console.info('CorruptedParticles: lewd mode enabled — 18+ content only');
    }

    this.particles             = [];
    this.mouse                 = { x: -9999, y: -9999 };
    this._rafId                = null;
    this._isRunning            = false;
    this._lastTs               = null;
    this._resizeObserver       = null;
    this._intersectionObserver = null;

    this._onMouseMove = (e) => {
      const r   = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.mouse.x = (e.clientX - r.left) * dpr;
      this.mouse.y = (e.clientY - r.top)  * dpr;
    };
    this._onClick = (e) => {
      const r   = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this._spawnBurst((e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr);
    };
    this._onMouseLeave = () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    };

    this.init();
  }

  _pickLayer() {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < LAYERS.length; i++) {
      cumulative += LAYERS[i].weight;
      if (r < cumulative) return i;
    }
    return LAYERS.length - 1;
  }

  _pickPhrase() {
    const useLewd = this.options.includeLewd && Math.random() < 0.25;
    const pool    = useLewd ? NSFW_PHRASES : SFW_PHRASES;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  _makeParticle(x, y, forceLayerIndex) {
    const layerIndex = forceLayerIndex ?? this._pickLayer();
    const L          = LAYERS[layerIndex];
    const angle      = Math.random() * Math.PI * 2;
    const speed      = (L.minSpeed + Math.random() * (L.maxSpeed - L.minSpeed)) * this.options.speed;
    const phrase     = this._pickPhrase();
    const lewd       = this.options.includeLewd && NSFW_PHRASES.includes(phrase);
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      baseSpeed: speed,
      layerIndex,
      fontSize:  L.minSize + Math.random() * (L.maxSize - L.minSize),
      opacity:   L.minOpacity + Math.random() * (L.maxOpacity - L.minOpacity),
      phrase,
      lewd,
      flickerTimer:    2000 + Math.random() * 6000,
      flickering:      false,
      flickerDuration: 0,
      fadeIn:          1.0,  // lerps to 0; actual alpha = opacity * (1 - fadeIn)
    };
  }

  init() {
    this._resize();

    this.canvas.addEventListener('mousemove',  this._onMouseMove);
    this.canvas.addEventListener('click',      this._onClick);
    this.canvas.addEventListener('mouseleave', this._onMouseLeave);

    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(this.canvas);

    this._intersectionObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { this.start(); }
      else                           { this.stop();  }
    }, { threshold: 0.1 });
    this._intersectionObserver.observe(this.canvas);

    this.start();
  }

  _resize() {
    if (!this.canvas) return;
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.canvas.width  = Math.round(rect.width  * dpr);
    this.canvas.height = Math.round(rect.height * dpr);

    const mobile = window.innerWidth < 768;
    const count  = mobile ? Math.floor(this.options.count / 2) : this.options.count;

    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this._makeParticle(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height
      ));
    }
  }

  _render(ts) {
    if (!this._isRunning) return;

    let dt = 16;
    if (this._lastTs !== null) dt = ts - this._lastTs;
    this._lastTs = ts;

    const W            = this.canvas.width;
    const H            = this.canvas.height;
    const mx           = this.mouse.x;
    const my           = this.mouse.y;
    const REPEL_RADIUS = 120;
    const LINE_DIST    = this.options.lineDistance;
    const LINE_DIST_SQ = LINE_DIST * LINE_DIST;

    this.ctx.clearRect(0, 0, W, H);

    // --- Physics ---
    for (const p of this.particles) {
      if (p.fadeIn > 0) p.fadeIn = Math.max(0, p.fadeIn - dt / 300);

      if (p.flickerDuration > 0) {
        p.flickerDuration -= dt;
        if (p.flickerDuration <= 0) p.flickering = false;
      }
      p.flickerTimer -= dt;
      if (p.flickerTimer <= 0) {
        p.flickering      = true;
        p.flickerDuration = 100;
        p.flickerTimer    = 2000 + Math.random() * 6000;
      }

      const dx   = p.x - mx;
      const dy   = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_RADIUS && dist > 0.1) {
        const strength = (1 - dist / REPEL_RADIUS) * 0.8;
        p.vx += (dx / dist) * strength;
        p.vy += (dy / dist) * strength;
      }

      const spd     = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const maxSpd  = p.baseSpeed * 3;
      if (spd > maxSpd) {
        p.vx = (p.vx / spd) * maxSpd;
        p.vy = (p.vy / spd) * maxSpd;
      }
      p.vx *= 0.98;
      p.vy *= 0.98;

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x += W;
      if (p.x > W) p.x -= W;
      if (p.y < 0) p.y += H;
      if (p.y > H) p.y -= H;
    }

    // --- Connection lines ---
    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        if (Math.abs(a.layerIndex - b.layerIndex) > 1) continue;

        const ldx    = a.x - b.x;
        const ldy    = a.y - b.y;
        const ldist2 = ldx * ldx + ldy * ldy;
        if (ldist2 >= LINE_DIST_SQ) continue;
        const ldist  = Math.sqrt(ldist2);

        const lineAlpha = (1 - ldist / LINE_DIST) * 0.3;
        const rgb       = (a.lewd && b.lewd) ? PURPLE_RGB : CYAN_RGB;

        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${lineAlpha})`;
        this.ctx.lineWidth   = 0.5;
        this.ctx.moveTo(a.x, a.y);
        this.ctx.lineTo(b.x, b.y);
        this.ctx.stroke();
      }
    }

    // --- Phrases ---
    for (const p of this.particles) {
      const displayOpacity = p.flickering ? 0.05 : (p.opacity * (1 - p.fadeIn));
      if (displayOpacity < 0.01) continue;

      const rgb = p.lewd ? PURPLE_RGB : CYAN_RGB;

      this.ctx.font      = `${Math.round(p.fontSize)}px monospace`;
      this.ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${displayOpacity})`;
      this.ctx.fillText(p.phrase, p.x, p.y);
    }

    this._rafId = requestAnimationFrame(ts => this._render(ts));
  }

  _spawnBurst(x, y) {
    const nearLayerIndex = 2;
    for (let i = 0; i < 6; i++) {
      const p = this._makeParticle(x, y, nearLayerIndex);
      p.vx *= 2;
      p.vy *= 2;
      p.fadeIn = 1.0;
      this.particles.push(p);
    }
    if (this.particles.length > this.options.count * 2) {
      this.particles.splice(0, 6);
    }
  }

  start() {
    if (this._isRunning || !this.canvas) return;
    this._isRunning = true;
    this._lastTs    = null;
    this._rafId     = requestAnimationFrame(ts => this._render(ts));
  }

  stop() {
    this._isRunning = false;
    this._lastTs    = null;
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
  }

  destroy() {
    this.stop();
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove',  this._onMouseMove);
      this.canvas.removeEventListener('click',      this._onClick);
      this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
    }
    if (this._resizeObserver)       { this._resizeObserver.disconnect();       this._resizeObserver = null; }
    if (this._intersectionObserver) { this._intersectionObserver.disconnect(); this._intersectionObserver = null; }
    this.particles = null;
    this.canvas    = null;
    this.ctx       = null;
  }
}
