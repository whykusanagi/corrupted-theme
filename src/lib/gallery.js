/**
 * gallery.js — Gallery System with Lightbox and NSFW Support
 * 
 * A complete gallery system with filtering, lightbox viewer, and NSFW content handling.
 * Integrates with the Corrupted Theme design system.
 * 
 * @module gallery
 * @version 1.0.0
 * @license MIT
 * 
 * Features:
 * - Responsive gallery grid
 * - Category filtering with animated transitions
 * - Fullscreen lightbox with keyboard navigation
 * - NSFW content blur with click-to-reveal
 * - Lazy loading support
 * - Touch gesture support for mobile
 * 
 * Usage:
 * ```html
 * <div class="filter-bar">
 *   <button class="filter-btn active" data-filter="all">All</button>
 *   <button class="filter-btn" data-filter="photos">Photos</button>
 * </div>
 * <div class="gallery-container" id="gallery">
 *   <div class="gallery-item" data-tags="photos">
 *     <img src="image.jpg" alt="Description">
 *     <div class="gallery-caption">Caption</div>
 *   </div>
 * </div>
 * 
 * <script type="module">
 *   import { initGallery } from '@whykusanagi/corrupted-theme/src/lib/gallery.js';
 *   initGallery('#gallery');
 * </script>
 * ```
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG = {
  // Gallery selectors
  gallerySelector: '.gallery-container',
  itemSelector: '.gallery-item',
  filterBarSelector: '.filter-bar',
  filterBtnSelector: '.filter-btn',
  
  // Lightbox
  enableLightbox: true,
  lightboxId: 'corrupted-lightbox',
  
  // NSFW
  enableNsfw: true,
  nsfwSelector: '.nsfw-content',
  nsfwWarning: '18+ Click to View',
  
  // Animation
  filterAnimation: true,
  animationDuration: 300,
  
  // Keyboard
  enableKeyboard: true,
  
  // Callbacks
  onFilter: null,
  onLightboxOpen: null,
  onLightboxClose: null,
  onNsfwReveal: null
};

// ============================================================================
// STATE
// ============================================================================

let state = {
  currentFilter: 'all',
  lightboxOpen: false,
  currentImageIndex: 0,
  galleryImages: [],
  config: { ...DEFAULT_CONFIG }
};

// ============================================================================
// LIGHTBOX
// ============================================================================

/**
 * Creates and injects the lightbox HTML into the DOM
 * @private
 */
function createLightbox() {
  if (document.getElementById(state.config.lightboxId)) return;
  
  const lightbox = document.createElement('div');
  lightbox.id = state.config.lightboxId;
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
    <button class="lightbox-prev" aria-label="Previous image">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
    <img class="lightbox-image" src="" alt="">
    <button class="lightbox-next" aria-label="Next image">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
    <div class="lightbox-caption"></div>
    <div class="lightbox-counter"></div>
  `;
  
  document.body.appendChild(lightbox);
  
  // Event listeners
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => navigateLightbox(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => navigateLightbox(1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  
  // Touch gestures
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  
  lightbox.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
      navigateLightbox(diff > 0 ? 1 : -1);
    }
  }, { passive: true });
}

/**
 * Opens the lightbox with specified image
 * @param {number} index - Index of image in gallery
 */
function openLightbox(index) {
  const lightbox = document.getElementById(state.config.lightboxId);
  if (!lightbox || !state.galleryImages[index]) return;
  
  state.currentImageIndex = index;
  state.lightboxOpen = true;
  
  const imageData = state.galleryImages[index];
  const img = lightbox.querySelector('.lightbox-image');
  const caption = lightbox.querySelector('.lightbox-caption');
  const counter = lightbox.querySelector('.lightbox-counter');
  
  img.src = imageData.src;
  img.alt = imageData.alt || '';
  
  // Handle NSFW class
  if (imageData.isNsfw) {
    img.classList.add('nsfw-revealed');
  } else {
    img.classList.remove('nsfw-revealed');
  }
  
  caption.textContent = imageData.caption || '';
  caption.style.display = imageData.caption ? 'block' : 'none';
  
  counter.textContent = `${index + 1} / ${state.galleryImages.length}`;
  
  // Update navigation buttons
  lightbox.querySelector('.lightbox-prev').disabled = index === 0;
  lightbox.querySelector('.lightbox-next').disabled = index === state.galleryImages.length - 1;
  
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  if (state.config.onLightboxOpen) {
    state.config.onLightboxOpen(imageData, index);
  }
}

/**
 * Closes the lightbox
 */
function closeLightbox() {
  const lightbox = document.getElementById(state.config.lightboxId);
  if (!lightbox) return;
  
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  state.lightboxOpen = false;
  
  if (state.config.onLightboxClose) {
    state.config.onLightboxClose();
  }
}

/**
 * Navigates to next/previous image in lightbox
 * @param {number} direction - 1 for next, -1 for previous
 */
function navigateLightbox(direction) {
  const newIndex = state.currentImageIndex + direction;
  
  if (newIndex >= 0 && newIndex < state.galleryImages.length) {
    openLightbox(newIndex);
  }
}

// ============================================================================
// FILTERING
// ============================================================================

/**
 * Filters gallery items by category
 * @param {string} filter - Filter value (tag name or 'all')
 */
function filterGallery(filter) {
  const galleries = document.querySelectorAll(state.config.gallerySelector);
  
  galleries.forEach(gallery => {
    const items = gallery.querySelectorAll(state.config.itemSelector);
    
    items.forEach(item => {
      const tags = (item.dataset.tags || '').split(',').map(t => t.trim());
      const shouldShow = filter === 'all' || tags.includes(filter);
      
      if (state.config.filterAnimation) {
        item.style.transition = `opacity ${state.config.animationDuration}ms ease, transform ${state.config.animationDuration}ms ease`;
        
        if (shouldShow) {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          item.style.display = '';
          
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          
          setTimeout(() => {
            item.style.display = 'none';
          }, state.config.animationDuration);
        }
      } else {
        item.style.display = shouldShow ? '' : 'none';
      }
    });
  });
  
  state.currentFilter = filter;
  updateGalleryImages();
  
  // Update filter button active state
  document.querySelectorAll(state.config.filterBtnSelector).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  if (state.config.onFilter) {
    state.config.onFilter(filter);
  }
}

// ============================================================================
// NSFW HANDLING
// ============================================================================

/**
 * Reveals NSFW content on click
 * @param {HTMLElement} element - NSFW content element
 */
function revealNsfwContent(element) {
  if (element.classList.contains('revealed')) return;
  
  element.classList.add('revealed');
  
  if (state.config.onNsfwReveal) {
    state.config.onNsfwReveal(element);
  }
}

/**
 * Initializes NSFW content handling
 * @private
 */
function initNsfwContent() {
  document.querySelectorAll(state.config.nsfwSelector).forEach(item => {
    if (!item.dataset.warning) {
      item.dataset.warning = state.config.nsfwWarning;
    }
    
    item.addEventListener('click', (e) => {
      if (!item.classList.contains('revealed')) {
        e.preventDefault();
        e.stopPropagation();
        revealNsfwContent(item);
      }
    });
  });
}

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * Handles keyboard events for lightbox navigation
 * @private
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboard(e) {
  if (!state.lightboxOpen) return;
  
  switch (e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      navigateLightbox(-1);
      break;
    case 'ArrowRight':
      navigateLightbox(1);
      break;
  }
}

// ============================================================================
// UTILITY
// ============================================================================

/**
 * Updates the list of gallery images for lightbox navigation
 * @private
 */
function updateGalleryImages() {
  state.galleryImages = [];
  
  document.querySelectorAll(`${state.config.gallerySelector} ${state.config.itemSelector}`).forEach((item, index) => {
    if (item.style.display === 'none') return;
    
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-caption');
    
    if (img) {
      state.galleryImages.push({
        src: img.dataset.fullSrc || img.src,
        alt: img.alt,
        caption: caption ? caption.textContent : '',
        isNsfw: item.classList.contains('nsfw-content'),
        element: item,
        originalIndex: index
      });
    }
  });
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Initializes the gallery system
 * @param {string|HTMLElement} selector - Gallery container selector or element
 * @param {Object} options - Configuration options
 * @returns {Object} Gallery API
 */
export function initGallery(selector = '.gallery-container', options = {}) {
  // Merge config
  state.config = { ...DEFAULT_CONFIG, ...options };
  
  if (typeof selector === 'string') {
    state.config.gallerySelector = selector;
  }
  
  // Create lightbox
  if (state.config.enableLightbox) {
    createLightbox();
  }
  
  // Initialize filter buttons
  document.querySelectorAll(state.config.filterBtnSelector).forEach(btn => {
    btn.addEventListener('click', () => {
      filterGallery(btn.dataset.filter || 'all');
    });
  });
  
  // Initialize gallery items
  document.querySelectorAll(`${state.config.gallerySelector} ${state.config.itemSelector}`).forEach((item, index) => {
    const img = item.querySelector('img');
    
    if (img && state.config.enableLightbox) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', (e) => {
        // Don't open lightbox for unrevealed NSFW content
        if (item.classList.contains('nsfw-content') && !item.classList.contains('revealed')) {
          return;
        }
        
        e.stopPropagation();
        const visibleIndex = state.galleryImages.findIndex(i => i.element === item);
        if (visibleIndex !== -1) {
          openLightbox(visibleIndex);
        }
      });
    }
  });
  
  // Initialize NSFW handling
  if (state.config.enableNsfw) {
    initNsfwContent();
  }
  
  // Initialize keyboard navigation
  if (state.config.enableKeyboard) {
    document.addEventListener('keydown', handleKeyboard);
  }
  
  // Build initial image list
  updateGalleryImages();
  
  // Return public API
  return {
    filter: filterGallery,
    openLightbox,
    closeLightbox,
    revealNsfw: revealNsfwContent,
    refresh: updateGalleryImages,
    getImages: () => [...state.galleryImages],
    getCurrentFilter: () => state.currentFilter
  };
}

/**
 * Destroys the gallery instance and removes event listeners
 */
export function destroyGallery() {
  const lightbox = document.getElementById(state.config.lightboxId);
  if (lightbox) {
    lightbox.remove();
  }
  
  document.removeEventListener('keydown', handleKeyboard);
  
  state = {
    currentFilter: 'all',
    lightboxOpen: false,
    currentImageIndex: 0,
    galleryImages: [],
    config: { ...DEFAULT_CONFIG }
  };
}

// Auto-initialize if DOM is ready and elements exist
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.querySelector('.gallery-container')) {
        initGallery();
      }
    });
  } else {
    if (document.querySelector('.gallery-container')) {
      initGallery();
    }
  }
}

// Export for global usage
if (typeof window !== 'undefined') {
  window.CorruptedGallery = {
    init: initGallery,
    destroy: destroyGallery
  };
}

