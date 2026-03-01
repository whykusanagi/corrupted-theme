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

const CYAN   = '#00ffff';  // --corrupted-cyan
const PURPLE = '#8b5cf6';  // --corrupted-purple

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
      flickerTimer: 2000 + Math.random() * 6000,
      flickering:   false,
      fadeIn:       1.0,  // lerps to 0; actual alpha = opacity * (1 - fadeIn)
    };
  }
}
