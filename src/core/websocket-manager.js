/**
 * WebSocketManager — auto-reconnecting WebSocket wrapper.
 *
 * Standardized connection handling with exponential-or-fixed backoff,
 * event-ID deduplication, ACK support, and page-visibility disconnect.
 *
 * Adapted from celeste-tts-bot/obs/shared/websocket-manager.js.
 *
 * @example
 *   import { WebSocketManager } from '@whykusanagi/corrupted-theme/websocket-manager';
 *
 *   const ws = new WebSocketManager({ url: 'wss://example.com/ws' });
 *   ws.on((msg) => console.log(msg));
 *   ws.connect();
 *   ws.send({ type: 'ping' });
 *   ws.destroy();
 */

export class WebSocketManager {
  /**
   * @param {Object} options
   * @param {string}  options.url                    - WebSocket URL (required)
   * @param {string}  [options.clientId]             - Client identifier for auto-registration
   * @param {number}  [options.maxAttempts=10]       - Max reconnect attempts
   * @param {number}  [options.baseDelay=2000]       - Base reconnect delay (ms)
   * @param {number}  [options.maxDelay=30000]       - Maximum reconnect delay cap (ms)
   * @param {boolean} [options.useExponentialBackoff=true]
   * @param {boolean} [options.autoReconnect=true]
   * @param {boolean} [options.trackEvents=false]    - Enable event-ID dedup
   * @param {boolean} [options.enableAck=false]      - Send ACK for events with requires_ack
   * @param {boolean} [options.handleVisibilityChange=true] - Disconnect on page-hidden
   * @param {boolean} [options.autoConnect=true]     - Connect immediately on construction
   */
  constructor(options = {}) {
    // Accept both object-form { url, ... } and legacy positional (url, options)
    // to keep the constructor consistent with the corrupted-theme pattern.
    if (typeof options === 'string') {
      // Defensive: allow new WebSocketManager('wss://…', { … }) call shape too
      const url = options;
      const rest = arguments[1] || {};
      options = { url, ...rest };
    }

    this.url = options.url ?? '';
    this.options = {
      clientId:               options.clientId               ?? null,
      maxAttempts:            options.maxAttempts            ?? 10,
      baseDelay:              options.baseDelay              ?? 2000,
      maxDelay:               options.maxDelay               ?? 30000,
      useExponentialBackoff:  options.useExponentialBackoff  ?? true,
      autoReconnect:          options.autoReconnect          ?? true,
      trackEvents:            options.trackEvents            ?? false,
      enableAck:              options.enableAck              ?? false,
      handleVisibilityChange: options.handleVisibilityChange ?? true,
      autoConnect:            options.autoConnect            ?? true,
    };

    // Connection state
    this.ws = null;
    this.reconnectAttempts = 0;
    this.reconnectTimeout = null;
    this.isManualDisconnect = false;
    this._destroyed = false;

    // Event tracking
    this.processedEventIds = new Set();
    this._handlers = [];

    // Bind for later removeEventListener
    this._handleVisibilityChange = this._handleVisibilityChange.bind(this);
    this._handleBeforeUnload     = this._handleBeforeUnload.bind(this);

    // Register global listeners (guarded for Node)
    if (typeof document !== 'undefined' && this.options.handleVisibilityChange) {
      document.addEventListener('visibilitychange', this._handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this._handleBeforeUnload);
    }

    if (this.options.autoConnect && this.url) {
      this.connect();
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Open the WebSocket connection.
   * Safe to call even if already connected (closes previous socket first).
   */
  connect() {
    if (this._destroyed) return;
    if (typeof WebSocket === 'undefined') return;  // Node guard

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isManualDisconnect = false;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log(`[WebSocketManager] Connected to ${this.url}`);
        this.reconnectAttempts = 0;

        if (this.options.clientId) {
          this.send({ type: 'register', client_id: this.options.clientId });
        }

        this._notifyHandlers({ type: 'connection', status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this._handleMessage(message);
        } catch (err) {
          console.error('[WebSocketManager] Failed to parse message:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocketManager] WebSocket error:', error);
        this._notifyHandlers({ type: 'connection', status: 'error', error });
      };

      this.ws.onclose = () => {
        console.log('[WebSocketManager] WebSocket closed');
        this._notifyHandlers({ type: 'connection', status: 'closed' });

        if (!this.isManualDisconnect && this.options.autoReconnect && !this._destroyed) {
          this._attemptReconnect();
        }
      };
    } catch (err) {
      console.error('[WebSocketManager] Failed to create WebSocket:', err);
      if (this.options.autoReconnect && !this._destroyed) {
        this._attemptReconnect();
      }
    }
  }

  /**
   * Close the connection and cancel any pending reconnect.
   */
  disconnect() {
    this.isManualDisconnect = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.onclose = null;  // Prevent reconnect loop
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    console.log('[WebSocketManager] Manually disconnected');
  }

  /**
   * Send a JSON-serialisable message.
   * @param {Object} message
   * @returns {boolean} true if sent
   */
  send(message) {
    if (typeof WebSocket === 'undefined') return false;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (err) {
        console.error('[WebSocketManager] Failed to send message:', err);
        return false;
      }
    }
    console.warn('[WebSocketManager] Cannot send — socket not open');
    return false;
  }

  /**
   * Register a message handler.
   * @param {Function} handler  Called with each incoming message object.
   */
  on(handler) {
    if (typeof handler === 'function' && !this._handlers.includes(handler)) {
      this._handlers.push(handler);
    }
  }

  /**
   * Remove a previously registered handler.
   * @param {Function} handler
   */
  off(handler) {
    const idx = this._handlers.indexOf(handler);
    if (idx !== -1) this._handlers.splice(idx, 1);
  }

  /**
   * Legacy aliases kept for compatibility with callers using onMessage/offMessage.
   */
  onMessage(handler)  { return this.on(handler);  }
  offMessage(handler) { return this.off(handler); }

  /**
   * Clean up all resources, remove DOM listeners, and prevent reconnection.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.disconnect();
    this._handlers = [];
    this.processedEventIds.clear();

    if (typeof document !== 'undefined' && this.options.handleVisibilityChange) {
      document.removeEventListener('visibilitychange', this._handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this._handleBeforeUnload);
    }

    console.log('[WebSocketManager] Destroyed');
  }

  /**
   * @returns {'open'|'connecting'|'closing'|'closed'|'disconnected'}
   */
  getStatus() {
    if (typeof WebSocket === 'undefined' || !this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN:       return 'open';
      case WebSocket.CLOSING:    return 'closing';
      case WebSocket.CLOSED:     return 'closed';
      default:                   return 'unknown';
    }
  }

  /** @returns {boolean} */
  isConnected() {
    if (typeof WebSocket === 'undefined') return false;
    return !!(this.ws && this.ws.readyState === WebSocket.OPEN);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  _handleMessage(message) {
    if (this.options.trackEvents && message.event_id) {
      if (this.processedEventIds.has(message.event_id)) {
        console.log(`[WebSocketManager] Ignoring duplicate event: ${message.event_id}`);
        return;
      }
      this.processedEventIds.add(message.event_id);
    }

    this._notifyHandlers(message);

    if (this.options.enableAck && message.requires_ack && message.event_id) {
      this.send({ type: 'ack', event_id: message.event_id });
    }
  }

  _notifyHandlers(message) {
    for (const handler of this._handlers) {
      try {
        handler(message);
      } catch (err) {
        console.error('[WebSocketManager] Handler error:', err);
      }
    }
  }

  _attemptReconnect() {
    if (this._destroyed || this.reconnectAttempts >= this.options.maxAttempts) {
      if (!this._destroyed) {
        console.error(
          `[WebSocketManager] Max reconnection attempts (${this.options.maxAttempts}) reached`
        );
        this._notifyHandlers({ type: 'connection', status: 'failed' });
      }
      return;
    }

    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

    this.reconnectAttempts++;

    const delay = this.options.useExponentialBackoff
      ? Math.min(
          this.options.baseDelay * Math.pow(2, this.reconnectAttempts - 1),
          this.options.maxDelay
        )  // exponential growth capped at maxDelay: 2s, 4s, 8s, 16s, 30s…
      : this.options.baseDelay;

    console.log(
      `[WebSocketManager] Reconnecting in ${delay / 1000}s ` +
      `(attempt ${this.reconnectAttempts}/${this.options.maxAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, delay);
  }

  _handleVisibilityChange() {
    if (typeof document === 'undefined') return;
    if (document.hidden) {
      console.log('[WebSocketManager] Page hidden, disconnecting');
      this.disconnect();
    } else {
      console.log('[WebSocketManager] Page visible, reconnecting');
      this.connect();
    }
  }

  _handleBeforeUnload() {
    this.disconnect();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WebSocketManager };
}
