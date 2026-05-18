/**
 * Time utility functions.
 * Centralized date/time formatting helpers.
 *
 * Ported from celeste-tts-bot/obs/shared/time-utils.js.
 * All functions are pure (no side effects, no DOM dependency).
 *
 * Note: formatDuration accepts seconds (not milliseconds).
 *
 * @module core/time-utils
 */

/**
 * Format time in 24-hour format.
 * @param {Date} [date=new Date()] - Date to format
 * @returns {string} Time as "HH:MM"
 */
export function formatTime24h(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Format time in 12-hour format.
 * @param {Date} [date=new Date()] - Date to format
 * @returns {string} Time as "HH:MM AM/PM"
 */
export function formatTime12h(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format date.
 * @param {Date} [date=new Date()] - Date to format
 * @returns {string} Date as "Mon DD, YYYY"
 */
export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format date and time combined.
 * @param {Date} [date=new Date()] - Date to format
 * @returns {string} DateTime as "Mon DD, YYYY HH:MM"
 */
export function formatDateTime(date = new Date()) {
  return `${formatDate(date)} ${formatTime24h(date)}`;
}

/**
 * Format relative time (e.g., "5s ago", "3m ago").
 * @param {Date} date - Date to compare against now
 * @returns {string} Relative time string
 */
export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Format duration in seconds to a human-readable string.
 *
 * @param {number} seconds - Duration in seconds (NOT milliseconds)
 * @returns {string} Duration as "Xh Ym Zs" (omits zero units, except
 *   "0s" for zero-length durations)
 *
 * @example
 * formatDuration(3661) // "1h 1m 1s"
 * formatDuration(90)   // "1m 30s"
 * formatDuration(0)    // "0s"
 */
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);

  return parts.join(' ');
}

/**
 * Parse an ISO 8601 timestamp string to a Date.
 * @param {string} timestamp - ISO 8601 timestamp
 * @returns {Date} Parsed date
 */
export function parseTimestamp(timestamp) {
  return new Date(timestamp);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatTime24h, formatTime12h, formatDate, formatDateTime, timeAgo, formatDuration, parseTimestamp };
}
