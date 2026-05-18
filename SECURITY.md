# Security

This document describes the security posture of `@whykusanagi/corrupted-theme` as an **npm package** and of the **live example site** at <https://corrupted.whykusanagi.xyz>.

## Reporting a vulnerability

Email **contact@whykusanagi.xyz** with subject line `[corrupted-theme security]`. Please do **not** open a public GitHub issue for security-sensitive reports. Include:
- Affected file path + version (or URL path if it's a site issue)
- Reproduction steps
- Observed vs. expected behavior
- Your proposed severity

Acknowledgement within 72 hours; fixes usually within 7 days for high/critical issues.

---

## Scope of this package

`corrupted-theme` is a **client-side CSS + vanilla-JS design system**. It has:

- **No server runtime** — everything runs in the browser.
- **No authentication, no user accounts, no user-generated content storage.**
- **No database, no cookies, no localStorage** (the one exception is NSFW toggle state on the typing-animation example, which is intentionally *not* persisted — resets every page load per the explicit-opt-in content-rating policy).
- **No secrets shipped** in the tarball or deployed site. Verified by secret scan on every release.

Attack surface is therefore limited to: (1) DOM-based XSS if callers pass untrusted input through component APIs, (2) supply-chain attacks on build-time dependencies, (3) the live site's infrastructure layer.

---

## Threat model

### What we defend against

| Threat | Mitigation | Status |
|---|---|---|
| **DOM-based XSS** in library components | All DOM writes use `createElement`/`textContent`/`appendChild`. Zero `innerHTML` in `src/lib/` or `src/core/` after the v0.1.7 hardening pass. | Enforced in code, preserved through v0.1.9 |
| **Clickjacking** of the live site | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` | Enforced in Worker |
| **MIME sniffing** attacks on static assets | `X-Content-Type-Options: nosniff` | Enforced in Worker |
| **Protocol downgrade** on live site | `Strict-Transport-Security: max-age=31536000; includeSubDomains` + CF "Always use HTTPS" | Enforced in Worker + CF |
| **Third-party origin abuse** via CSP bypass | CSP `default-src 'self'`, explicit allowlist for `https://cdnjs.cloudflare.com` (Font Awesome only) and `https:` for images (placeholders + R2 assets) | Enforced in Worker |
| **Sensor API abuse** (geolocation, camera, etc.) by injected scripts | `Permissions-Policy` blocks all sensor APIs | Enforced in Worker |
| **Referrer leakage** to third-party resources | `Referrer-Policy: strict-origin-when-cross-origin` | Enforced in Worker |
| **Supply-chain attacks** on npm dependencies | `npm audit` gated on every PR via `.github/workflows/checks.yml`; zero runtime dependencies (only 3 dev deps) | Enforced via CI |
| **Accidentally-shipped secrets** | `.npmignore` excludes `CLAUDE.md` + specs; `.assetsignore` excludes same from the live site; regular grep audit for API-key patterns | Enforced via config + review |

### What we do NOT defend against (out of scope)

| Scenario | Why out of scope |
|---|---|
| **Browser supply-chain attacks** (e.g. a compromised CDN serves malicious Font Awesome) | The risk is accepted because the blast radius is limited to the live site only. Consumers using the npm package never load Font Awesome from our code. Future hardening: add SRI hashes to CDN `<link>` tags. |
| **Stored-XSS in consumer applications** that pass untrusted input to `CorruptedText.start()`, `TypingAnimation.start()`, etc. | Consumers must sanitize input before passing to our components. We use `textContent` internally, but if the consumer builds an HTML string and passes it as a "text" argument, they're responsible. Documented in `docs/COMPONENTS_REFERENCE.md`. |
| **Abuse of the free Cloudflare Workers tier** on the live site | CF has built-in abuse protection + rate limiting. The site is static and CDN-cached; abuse would mostly hit cache, not origin. |
| **NSFW content accessed by minors** | The NSFW toggle is an ephemeral honor-system checkbox (client-side only, resets every page load). Content is tagged and visually distinct (red 18+ banner). Deliberately *not* gated server-side: this is a design-system demo, not a content-delivery platform. Projects embedding these components in production are responsible for their own age gate. |

---

## Live site security controls

The example site at <https://corrupted.whykusanagi.xyz> runs on Cloudflare Workers Static Assets. All asset responses are wrapped by `worker/index.js` which adds the headers listed above.

### Verify headers

```bash
curl -sI https://corrupted.whykusanagi.xyz/ | grep -iE 'strict-transport|x-frame|x-content|referrer|permissions|content-security'
```

### CSP details

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
img-src 'self' data: https:;
font-src 'self' https://cdnjs.cloudflare.com data:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
```

**`'unsafe-inline'` is allowed for `script` and `style`** because every example page uses inline `<script>`, inline `onclick="..."` handlers, and inline `<style>` blocks to keep demos self-contained and copy-pasteable. The tradeoff is accepted because:

1. Zero user input flows into the DOM (no auth, no forms, no URL-parameter reflection).
2. Every DOM write in library code uses `textContent`/`createElement`, not `innerHTML`.
3. The next XSS-hardening phase (if a specific attack is demonstrated) would switch to nonce-based CSP and move the inline scripts to external files.

---

## Secret-handling policy

This is a **public OSS package**. The repository must never contain:

- API keys, tokens, passwords
- Private URLs (staging/prod endpoints not meant for public access)
- `.env` files (only `.env.example` with placeholder values)
- OAuth credentials

If a secret is accidentally committed:

1. **Revoke the secret immediately** in its source-of-truth (DigitalOcean dashboard, npm, etc.)
2. Generate a new secret
3. Force-push the rewrite *only* if the secret hasn't left the local machine (rare) — otherwise treat it as compromised even post-rewrite
4. Audit git history for the old secret and any derived work

### Current state

- `examples/.env.example` — template file with placeholder values (e.g. `your-api-key-token`). Safe to commit and deploy. Verified 2026-04-19.
- No real secrets detected by `grep` sweep across git-tracked files.

---

## Build-time supply chain

The package depends on three dev-only packages:

- `cssnano` ^7.1.2
- `postcss` ^8.4.0
- `postcss-cli` ^11.0.1

**Zero runtime dependencies.** The built `dist/theme.min.css` has no transitive JS.

CI runs `npm install` + `npm run build` on every PR. `npm audit` is run locally before release and any HIGH/CRITICAL findings are remediated or explicitly accepted in `CHANGELOG.md`.

---

## Version history of security-relevant changes

| Version | Change |
|---|---|
| 0.1.7 | XSS hardening pass — `celeste-widget.js`, `countdown-widget.js`, `components.js` rebuilt to use `textContent`/`createElement` instead of `innerHTML` |
| 0.1.8 | Added `corrupted-particles.js` and `corrupted-vortex.js` following same `textContent`-only DOM pattern |
| 0.1.9 | `TypingAnimation` rewrite preserves the XSS hardening (zero `innerHTML`); new `destroy()` method on `CorruptedText` and `TypingAnimation` for clean teardown of DOM + timers |
| 0.1.9 | Added `.github/workflows/checks.yml` with build + syntax check gating on PRs |
| 0.1.9 | Added `.assetsignore` so `node_modules/`, internal specs, and dev-only files are never served on the live site |
| 0.1.9 | Added `worker/index.js` + `wrangler.jsonc` with security headers on all live-site responses |

---

## CDN Distribution Threat Model (0.2.0+)

Starting with 0.2.0, corrupted-theme is served from a Cloudflare R2-backed
CDN at `cdn.whykusanagi.xyz` and `cdn.nikkers.cc`. This section documents
the threat surface introduced by CDN distribution.

### Trust Boundaries

| Boundary | Trust Level | Notes |
|---|---|---|
| Maintainer → R2 bucket | Trusted (auth via wrangler) | Only the maintainer holds R2 write credentials |
| R2 bucket → Consumer browsers | Untrusted reader | All consumers are anonymous; content is public |
| Worker → KV namespace | Trusted (binding) | KV write requires Worker-level auth |
| Consumer browsers → Worker | Untrusted | Worker validates path, no user input parsing |

### Threats and Mitigations

| Threat | Likelihood | Mitigation |
|---|---|---|
| Content tampering at R2 layer | Low | Only maintainer can write; SRI hashes available for consumers (see `docs/CDN_CONSUMPTION.md`) |
| Supply-chain via stale/malicious JS in `@latest` | Low | Versioned paths immutable; `@latest` is a maintainer-controlled pointer; consumers can pin instead |
| PII/secret leakage in published JSON | None | JSON contents are public MIT-licensed phrase/charset/color data; no secrets in package |
| Cross-origin exfiltration via curated CORS allowlist | Low | Existing allowlist limits cross-origin embedders (`whykusanagi.xyz`, `nikkers.cc`, github mirrors, etc.). No wildcard. Same-origin loads don't trigger CORS. |
| Torn state on partial publish failure | Low | Publish script uploads files first, bumps KV pointer last; if upload fails, `@latest` still resolves to last good version |
| KV vs R2 propagation lag | Low | KV is eventually consistent (~60s globally); some edges resolve `@latest` to old version for up to a minute after publish — acceptable |
| Worker downtime | Medium | Only `@latest` consumers affected; pinned-version consumers continue working via R2 direct |
| Shared-bucket cross-contamination | Low | `corrupted-theme/` prefix scopes uploads; doesn't collide with `optimized_assets/` or other existing content on the shared `whykusanagi` bucket |

### Consumer Recommendations

- **Production sites:** pin a specific version (`@0.2.0`, not `@latest`). Add SRI hashes per `docs/CDN_CONSUMPTION.md`.
- **Sites the maintainer controls and updates together:** `@latest` is acceptable.
- **Don't pass user input to corrupted-theme APIs that build phrase pools.** The XSS-hardening in `src/**` assumes upstream-controlled content.
- **CSP recommendation:** consumer sites should list `https://cdn.{matching-root-domain}` in `script-src` and `style-src` if they're loading from the CDN. Same-origin loads still benefit from explicit CSP.

### Operational Notes

- Publish flow: `npm publish --access public` (npm) → `npm run publish-cdn` (R2 + KV pointer bump)
- The publish script REQUIRES `wrangler login` to be current; tokens are not embedded in the script
- KV pointer is the single source of truth for `@latest` — bumping it is atomic
- Worker route bindings: `cdn.{whykusanagi.xyz,nikkers.cc}/corrupted-theme/@latest/*`. Non-`@latest` requests pass through to R2 directly.

### Reporting

Same channels as the rest of this document. See top of SECURITY.md.

---

## References

- [Cloudflare Workers Static Assets — security features](https://developers.cloudflare.com/workers/static-assets/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN — Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- Project CLAUDE.md §10 (Secrets & Sensitive Files)
- Project CLAUDE.md §11 (Publishing Workflow)
