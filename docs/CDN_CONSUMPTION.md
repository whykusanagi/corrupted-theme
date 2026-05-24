# CDN Consumption Guide

corrupted-theme is served from a Cloudflare R2 bucket bound to BOTH:

- `https://cdn.whykusanagi.xyz/`
- `https://cdn.nikkers.cc/`

Files live under the `/corrupted-theme/` prefix. Both domains serve the
same content from the same bucket (`whykusanagi`).

## Same-Origin Rule

**Use the CDN URL matching your site's root domain.** This keeps every
load same-origin → no CORS preflight, no CSP whitelisting, no
third-party warnings.

| Your site's root | CDN URL to use |
|---|---|
| `nikkers.cc` (any subdomain) | `https://cdn.nikkers.cc/...` |
| `whykusanagi.xyz` (any subdomain) | `https://cdn.whykusanagi.xyz/...` |
| Third-party / external | Either (cross-origin, see CORS section below) |

## Pinned Version Mode (Recommended for Production)

```html
<link rel="stylesheet"
      href="https://cdn.nikkers.cc/corrupted-theme/@0.2.1/dist/theme.min.css">
<script type="module"
        src="https://cdn.nikkers.cc/corrupted-theme/@0.2.1/dist/corrupted-text.min.js"></script>
```

**Pro:** Breaking changes never auto-propagate. **Con:** Manual version
bump in each site.

## Floating `@latest` Mode (Recommended for First-Party Sites Updated Together)

```html
<link rel="stylesheet"
      href="https://cdn.whykusanagi.xyz/corrupted-theme/@latest/dist/theme.min.css">
<script type="module"
        src="https://cdn.whykusanagi.xyz/corrupted-theme/@latest/dist/corrupted-text.min.js"></script>
```

**Pro:** Publish once, every consumer site updates. **Con:** Breaking
changes propagate immediately. Use only for sites you control and can
verify together. The `@latest` route is cached for 5 minutes — updates
propagate within that window.

## Subresource Integrity (SRI)

For production hardening, add SRI hashes:

```html
<script type="module"
        src="https://cdn.nikkers.cc/corrupted-theme/@0.2.1/dist/corrupted-text.min.js"
        integrity="sha384-<paste-hash-here>"
        crossorigin="anonymous"></script>
```

Generate hashes for a specific release:

```bash
npm run generate-sri
```

The maintainer publishes hashes alongside each release in CHANGELOG.md.

## Content-Security-Policy

If your site uses CSP, the same-origin loads don't require additional
`script-src`/`style-src` entries beyond `'self'`. The CDN subdomain IS
a different origin from the base domain in browser security terms, but
because both are under the same registrable domain, CSP rules using
`https://*.whykusanagi.xyz` or `https://*.nikkers.cc` cover both.

For sites that want to be explicit:

```
script-src 'self' https://cdn.whykusanagi.xyz https://cdn.nikkers.cc;
style-src  'self' https://cdn.whykusanagi.xyz https://cdn.nikkers.cc;
connect-src 'self' https://cdn.whykusanagi.xyz https://cdn.nikkers.cc;
```

If you're using only your matching same-origin CDN, you only need to
list the one you actually use.

## Cross-Origin Embedding (Third Parties)

The R2 bucket has a curated CORS allowlist for cross-origin embeds.
Currently allowed origins:

- `https://whykusanagi.xyz` (and `www.`)
- `https://nikkers.cc`
- `https://github.com`, `camo.githubusercontent.com`,
  `raw.githubusercontent.com`
- `https://myoshi.co`, `https://oshi.to`

Third-party sites NOT in this allowlist can still embed corrupted-theme
assets via `<script>`/`<link>` (those don't trigger CORS), but
`fetch()`/`XMLHttpRequest` from outside the allowlist will fail. Either
fetch + rehost on your own origin, or request to be added.

## JSON Data Consumption

The canonical phrases/charsets/colors are available as JSON:

```javascript
fetch('https://cdn.whykusanagi.xyz/corrupted-theme/@latest/data/phrases.json')
  .then(r => r.json())
  .then(phrases => { /* use */ });
```

See `docs/CROSS_LANGUAGE_CONTRACT.md` for the JSON schema.

## Cache Behavior

| Path | Cache-Control |
|---|---|
| `/corrupted-theme/@<version>/...` | R2 default (typically `public, max-age=14400`) |
| `/corrupted-theme/@latest/...` | `public, max-age=300, must-revalidate` (5 min) |

The Worker that handles `@latest` sets the short max-age explicitly so
KV pointer updates propagate within ~5 minutes globally.

## Architecture

Behind the scenes:

- The `whykusanagi` R2 bucket is bound to four custom domains
  (`s3.{whykusanagi.xyz, nikkers.cc}` plus `cdn.{whykusanagi.xyz,
  nikkers.cc}`)
- A Cloudflare Worker (`cdn-worker`) listens on
  `cdn.{whykusanagi.xyz, nikkers.cc}/corrupted-theme/@latest/*` and
  rewrites those requests to `/corrupted-theme/@<current_version>/*`
- The current version pointer is stored in a KV namespace `CDN_KV`
  and bumped on each `npm run publish-cdn`
- All other paths pass through to R2 directly

There is no CDN-side authentication; the bucket and Worker are public
read-only.
