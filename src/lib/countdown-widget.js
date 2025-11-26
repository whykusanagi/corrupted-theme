/**
 * countdown-widget.js — Event Countdown Widget with Configurable Shapes
 * 
 * A sophisticated countdown widget with JSON configuration support,
 * multiple shape containers, and animated popup messages.
 * 
 * @module countdown-widget
 * @version 1.0.0
 * @license MIT
 * 
 * Features:
 * - JSON-based configuration
 * - Multiple shape containers (diamond, circle, heart, star, hexagon, octagon)
 * - Character image with optional overlay
 * - Animated popup messages
 * - Real-time countdown timer
 * - Completion state handling
 * - Responsive design
 * 
 * Usage:
 * ```html
 * <div id="countdown-widget"></div>
 * 
 * <script type="module">
 *   import { initCountdown } from '@whykusanagi/corrupted-theme/src/lib/countdown-widget.js';
 *   
 *   // Using URL parameter: ?event=kirara loads /data/countdown/kirara.json
 *   initCountdown();
 *   
 *   // Or with inline config:
 *   initCountdown({
 *     config: {
 *       title: 'Launch Countdown',
 *       eventDate: '2025-04-01T00:00:00-07:00',
 *       character: { image: 'character.png' }
 *     }
 *   });
 * </script>
 * ```
 */

// ============================================================================
// CONFIGURATION SCHEMA
// ============================================================================

/**
 * @typedef {Object} CountdownConfig
 * @property {string} title - Title displayed above countdown
 * @property {string} eventDate - ISO 8601 date string for target time
 * @property {string} [basicMessage] - Short description
 * @property {string} [detailedMessage] - HTML message with links
 * @property {string} [completedMessage] - Message shown when countdown ends
 * @property {string} [style='compact'] - Widget style variant
 * @property {CharacterConfig} [character] - Character image configuration
 * @property {PopupConfig} [popup] - Popup message configuration
 * @property {ColorConfig} [colors] - Color overrides
 */

/**
 * @typedef {Object} CharacterConfig
 * @property {string} image - Character image URL or path
 * @property {number} [rotation=0] - Image rotation in degrees
 * @property {string} [objectPosition] - CSS object-position value
 * @property {BackgroundConfig} [background] - Shape background config
 * @property {OverlayConfig} [overlay] - Overlay image config
 */

/**
 * @typedef {Object} BackgroundConfig
 * @property {string} [type='diamond'] - Shape type
 * @property {string} [color] - CSS background value
 * @property {string} [borderColor] - Hex color for border
 * @property {boolean} [pattern=false] - Use pattern overlay
 */

/**
 * @typedef {Object} OverlayConfig
 * @property {string} [image] - Overlay image URL
 * @property {string} [position='behind'] - 'behind' or 'front'
 * @property {string} [animation] - Animation type ('float' or null)
 * @property {number} [rotation] - Overlay rotation
 */

/**
 * @typedef {Object} PopupConfig
 * @property {string} message - HTML content for popup
 * @property {number} [frequency=10000] - Ms between popups
 * @property {number} [duration=5000] - Ms popup stays visible
 * @property {Object} [colors] - Popup color overrides
 */

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG = {
  title: 'Event Countdown',
  eventDate: null,
  basicMessage: '',
  detailedMessage: '',
  completedMessage: 'Event is Live!',
  style: 'compact',
  character: {
    image: null,
    rotation: 0,
    objectPosition: 'center',
    background: {
      type: 'diamond',
      color: null,
      borderColor: null,
      pattern: false
    },
    overlay: null
  },
  popup: null,
  colors: {
    primary: null,
    accent: null,
    text: null
  }
};

const WIDGET_OPTIONS = {
  containerId: 'countdown-widget',
  configPath: 'data/countdown',
  assetBasePath: ''
};

// ============================================================================
// STATE
// ============================================================================

let state = {
  config: null,
  countdownInterval: null,
  popupInterval: null,
  isCompleted: false
};

// ============================================================================
// ASSET HANDLING
// ============================================================================

/**
 * Converts relative asset paths to full URLs
 * @private
 * @param {string} path - Asset path
 * @returns {string} Full URL
 */
function resolveAssetPath(path) {
  if (!path) return '';
  
  // Already a full URL
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  // Check for global AssetConfig (for environment-aware paths)
  if (typeof window !== 'undefined' && window.AssetConfig?.convertUrl) {
    return window.AssetConfig.convertUrl(path);
  }
  
  // Use base path if configured
  if (WIDGET_OPTIONS.assetBasePath) {
    return `${WIDGET_OPTIONS.assetBasePath}/${path}`;
  }
  
  return path;
}

// ============================================================================
// CONFIG LOADING
// ============================================================================

/**
 * Loads countdown configuration from JSON file
 * @private
 * @param {string} eventName - Event name (filename without .json)
 * @returns {Promise<CountdownConfig>}
 */
async function loadConfigFromJson(eventName) {
  const url = `${WIDGET_OPTIONS.configPath}/${eventName}.json`;
  
  try {
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[CountdownWidget] Error loading config for "${eventName}":`, error);
    throw error;
  }
}

/**
 * Gets URL parameter value
 * @private
 * @param {string} name - Parameter name
 * @returns {string|null}
 */
function getUrlParam(name) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Merges config with URL parameter overrides
 * @private
 * @param {CountdownConfig} config - Base config
 * @returns {CountdownConfig}
 */
function applyUrlOverrides(config) {
  const overrides = {};
  
  const dateOverride = getUrlParam('date');
  if (dateOverride) overrides.eventDate = dateOverride;
  
  const titleOverride = getUrlParam('title');
  if (titleOverride) overrides.title = decodeURIComponent(titleOverride);
  
  return { ...config, ...overrides };
}

// ============================================================================
// RENDERING
// ============================================================================

/**
 * Renders the countdown widget HTML
 * @private
 * @param {CountdownConfig} config
 * @returns {Object} DOM element references
 */
function renderWidget(config) {
  const container = document.getElementById(WIDGET_OPTIONS.containerId);
  if (!container) {
    throw new Error(`[CountdownWidget] Container #${WIDGET_OPTIONS.containerId} not found`);
  }
  
  container.innerHTML = '';
  
  const wrapper = document.createElement('div');
  wrapper.className = 'countdown-container';
  
  // Shape container
  const shapeType = config.character?.background?.type || 'diamond';
  const shapeContainer = document.createElement('div');
  shapeContainer.className = `shape-container ${shapeType}`;
  
  // Apply custom colors
  if (config.character?.background?.color) {
    shapeContainer.style.background = config.character.background.color;
  }
  if (config.character?.background?.borderColor) {
    shapeContainer.style.borderColor = config.character.background.borderColor;
  }
  
  const shapeContent = document.createElement('div');
  shapeContent.className = 'shape-content';
  
  // Overlay (behind character)
  if (config.character?.overlay?.image && config.character.overlay.position !== 'front') {
    const overlayWrapper = createOverlay(config.character.overlay);
    shapeContent.appendChild(overlayWrapper);
  }
  
  // Character image
  if (config.character?.image) {
    const characterImg = document.createElement('img');
    characterImg.className = 'countdown-character';
    characterImg.src = resolveAssetPath(config.character.image);
    characterImg.alt = config.title || 'Event Character';
    
    if (config.character.rotation) {
      characterImg.style.transform = `translate(-50%, -50%) scale(0.9) rotate(${config.character.rotation}deg)`;
    }
    if (config.character.objectPosition) {
      characterImg.style.objectPosition = config.character.objectPosition;
    }
    
    shapeContent.appendChild(characterImg);
  }
  
  // Overlay (front of character)
  if (config.character?.overlay?.image && config.character.overlay.position === 'front') {
    const overlayWrapper = createOverlay(config.character.overlay);
    overlayWrapper.classList.add('front');
    shapeContent.appendChild(overlayWrapper);
  }
  
  shapeContainer.appendChild(shapeContent);
  wrapper.appendChild(shapeContainer);
  
  // Countdown box
  const countdownBox = document.createElement('div');
  countdownBox.className = 'countdown-box';
  countdownBox.innerHTML = `
    <div class="countdown-title">${escapeHtml(config.title)}</div>
    <div class="countdown-timer">
      <span class="unit days">--</span><span class="separator">D</span>
      <span class="unit hours">--</span><span class="separator">H</span>
      <span class="unit minutes">--</span><span class="separator">M</span>
      <span class="unit seconds">--</span><span class="separator">S</span>
    </div>
  `;
  wrapper.appendChild(countdownBox);
  
  // Popup (optional)
  let popup = null;
  if (config.popup?.message) {
    popup = document.createElement('div');
    popup.className = 'countdown-popup';
    popup.innerHTML = config.popup.message;
    
    if (config.popup.colors) {
      if (config.popup.colors.bg) popup.style.background = config.popup.colors.bg;
      if (config.popup.colors.border) popup.style.borderColor = config.popup.colors.border;
      if (config.popup.colors.text) popup.style.color = config.popup.colors.text;
    }
    
    wrapper.appendChild(popup);
  }
  
  container.appendChild(wrapper);
  
  return { countdownBox, popup };
}

/**
 * Creates overlay element
 * @private
 * @param {OverlayConfig} overlay
 * @returns {HTMLElement}
 */
function createOverlay(overlay) {
  const wrapper = document.createElement('div');
  wrapper.className = 'countdown-overlay-wrapper';
  
  const img = document.createElement('img');
  img.className = 'countdown-overlay-img';
  img.src = resolveAssetPath(overlay.image);
  img.alt = '';
  
  if (overlay.animation === 'float') {
    img.classList.add('animate-float');
  }
  
  if (overlay.rotation) {
    img.style.transform = `rotate(${overlay.rotation}deg)`;
  }
  
  wrapper.appendChild(img);
  return wrapper;
}

/**
 * Escapes HTML to prevent XSS
 * @private
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// COUNTDOWN LOGIC
// ============================================================================

/**
 * Updates the countdown timer display
 * @private
 * @param {Date} targetDate
 * @param {HTMLElement} countdownBox
 * @param {string} completedMessage
 */
function updateCountdown(targetDate, countdownBox, completedMessage) {
  const now = new Date().getTime();
  const distance = targetDate.getTime() - now;
  
  if (distance <= 0) {
    // Countdown completed
    if (!state.isCompleted) {
      state.isCompleted = true;
      countdownBox.classList.add('completed');
      countdownBox.querySelector('.countdown-timer').innerHTML = `
        <span class="completed-message">${escapeHtml(completedMessage)}</span>
      `;
      
      // Stop intervals
      if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
        state.countdownInterval = null;
      }
    }
    return;
  }
  
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
  const daysEl = countdownBox.querySelector('.days');
  const hoursEl = countdownBox.querySelector('.hours');
  const minutesEl = countdownBox.querySelector('.minutes');
  const secondsEl = countdownBox.querySelector('.seconds');
  
  if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
  if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
  if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
  if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
}

/**
 * Starts the countdown timer
 * @private
 * @param {string} eventDate
 * @param {HTMLElement} countdownBox
 * @param {string} completedMessage
 */
function startCountdown(eventDate, countdownBox, completedMessage) {
  const targetDate = new Date(eventDate);
  
  if (isNaN(targetDate.getTime())) {
    console.error('[CountdownWidget] Invalid event date:', eventDate);
    countdownBox.querySelector('.countdown-timer').textContent = 'Invalid Date';
    return;
  }
  
  // Initial update
  updateCountdown(targetDate, countdownBox, completedMessage);
  
  // Update every second
  state.countdownInterval = setInterval(() => {
    updateCountdown(targetDate, countdownBox, completedMessage);
  }, 1000);
}

// ============================================================================
// POPUP LOGIC
// ============================================================================

/**
 * Starts the popup cycle
 * @private
 * @param {PopupConfig} popupConfig
 * @param {HTMLElement} popupElement
 */
function startPopup(popupConfig, popupElement) {
  if (!popupConfig?.message || !popupElement) return;
  
  const frequency = popupConfig.frequency || 10000;
  const duration = popupConfig.duration || 5000;
  
  // Show popup initially after a delay
  setTimeout(() => {
    showPopup(popupElement, duration);
  }, 2000);
  
  // Start cycle
  state.popupInterval = setInterval(() => {
    showPopup(popupElement, duration);
  }, frequency);
}

/**
 * Shows popup for specified duration
 * @private
 * @param {HTMLElement} popup
 * @param {number} duration
 */
function showPopup(popup, duration) {
  popup.classList.add('active');
  
  setTimeout(() => {
    popup.classList.remove('active');
  }, duration);
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Initializes the countdown widget
 * @param {Object} options - Initialization options
 * @param {string} [options.event] - Event name to load config from JSON
 * @param {CountdownConfig} [options.config] - Inline configuration
 * @param {string} [options.containerId] - Container element ID
 * @param {string} [options.configPath] - Path to config JSON files
 * @param {string} [options.assetBasePath] - Base path for assets
 * @returns {Promise<Object>} Widget API
 */
export async function initCountdown(options = {}) {
  // Apply options
  if (options.containerId) WIDGET_OPTIONS.containerId = options.containerId;
  if (options.configPath) WIDGET_OPTIONS.configPath = options.configPath;
  if (options.assetBasePath) WIDGET_OPTIONS.assetBasePath = options.assetBasePath;
  
  // Clean up previous instance
  destroyCountdown();
  
  let config;
  
  try {
    if (options.config) {
      // Use inline config
      config = { ...DEFAULT_CONFIG, ...options.config };
    } else {
      // Load from JSON
      const eventName = options.event || getUrlParam('event');
      
      if (!eventName) {
        throw new Error('No event specified. Use ?event=<name> or provide config.');
      }
      
      const loadedConfig = await loadConfigFromJson(eventName);
      config = { ...DEFAULT_CONFIG, ...loadedConfig };
    }
    
    // Apply URL overrides
    config = applyUrlOverrides(config);
    state.config = config;
    
    // Validate required fields
    if (!config.eventDate) {
      throw new Error('eventDate is required in configuration');
    }
    
    // Render widget
    const { countdownBox, popup } = renderWidget(config);
    
    // Start countdown
    startCountdown(config.eventDate, countdownBox, config.completedMessage);
    
    // Start popup cycle
    if (popup && config.popup) {
      startPopup(config.popup, popup);
    }
    
    // Return API
    return {
      getConfig: () => ({ ...state.config }),
      isCompleted: () => state.isCompleted,
      destroy: destroyCountdown
    };
    
  } catch (error) {
    console.error('[CountdownWidget] Initialization error:', error);
    
    const container = document.getElementById(WIDGET_OPTIONS.containerId);
    if (container) {
      container.innerHTML = `
        <div class="countdown-error" style="
          padding: 2rem;
          text-align: center;
          color: var(--text-secondary, #888);
          background: var(--glass, rgba(20, 12, 40, 0.7));
          border-radius: var(--radius-lg, 12px);
          border: 1px solid var(--border, #3a2555);
        ">
          <p style="margin-bottom: 0.5rem; color: var(--accent, #d94f90);">⚠️ Countdown Error</p>
          <p style="font-size: 0.9rem;">${escapeHtml(error.message)}</p>
        </div>
      `;
    }
    
    throw error;
  }
}

/**
 * Destroys the countdown widget and cleans up resources
 */
export function destroyCountdown() {
  if (state.countdownInterval) {
    clearInterval(state.countdownInterval);
    state.countdownInterval = null;
  }
  
  if (state.popupInterval) {
    clearInterval(state.popupInterval);
    state.popupInterval = null;
  }
  
  state.config = null;
  state.isCompleted = false;
  
  const container = document.getElementById(WIDGET_OPTIONS.containerId);
  if (container) {
    container.innerHTML = '';
  }
}

// Export for global usage
if (typeof window !== 'undefined') {
  window.CorruptedCountdown = {
    init: initCountdown,
    destroy: destroyCountdown
  };
}

