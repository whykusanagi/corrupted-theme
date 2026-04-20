/**
 * Cloudflare Worker — corrupted-theme example site
 *
 * Wraps env.ASSETS.fetch() (Cloudflare Workers Static Assets) with response
 * security headers. Static asset serving, .html-extension stripping, and the
 * 404 page are all handled by the ASSETS binding per wrangler.jsonc; this
 * worker only augments the response with security headers.
 *
 * Deployed to: https://corrupted.whykusanagi.xyz
 */

const SECURITY_HEADERS = {
  // HSTS — one year, include subdomains. Safe because this Worker routes the
  // whole corrupted.whykusanagi.xyz host (no http-only subdomains under it).
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

  // Prevent MIME sniffing
  'X-Content-Type-Options': 'nosniff',

  // Clickjacking defense
  'X-Frame-Options': 'DENY',

  // Limit referrer leakage to cross-origin requests
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // No browser-sensor APIs needed for demo pages
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()',

  // CSP. Tight on connect/frame; allows inline script+style because every
  // example page uses inline <script>, onclick="..." handlers, and <style>
  // blocks. 'unsafe-inline' is accepted here because there is no user input
  // and every DOM write in src/** goes through textContent/createElement
  // (XSS-hardened in v0.1.7, maintained through v0.1.9). Images allow https:
  // for s3.whykusanagi.xyz and placehold.co demo placeholders.
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://cdnjs.cloudflare.com data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; '),
};

export default {
  async fetch(request, env, ctx) {
    const assetResponse = await env.ASSETS.fetch(request);

    // Copy headers and add security headers on top. Preserve original
    // content-type, cache-control, etc. from ASSETS binding.
    const headers = new Headers(assetResponse.headers);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      headers.set(name, value);
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  },
};
