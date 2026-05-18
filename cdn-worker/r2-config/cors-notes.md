# CORS Configuration Notes — whykusanagi R2 bucket

The whykusanagi R2 bucket is shared between:
- `s3.whykusanagi.xyz` + `s3.nikkers.cc` (pre-existing, for general assets)
- `cdn.whykusanagi.xyz` + `cdn.nikkers.cc` (NEW in 0.2.0, for corrupted-theme distribution)

## Current CORS config (as of 0.2.0 setup)

```
allowed_origins:  https://nikkers.cc, https://whykusanagi.xyz,
                  https://www.whykusanagi.xyz, https://github.com,
                  https://camo.githubusercontent.com,
                  https://raw.githubusercontent.com,
                  https://myoshi.co, https://oshi.to
allowed_methods:  GET, HEAD
allowed_headers:  *
max_age_seconds:  3600
```

## Why we DON'T modify this for the cdn-distribution work

1. **Same-origin loads don't trigger CORS.** When `whykusanagi.xyz` loads
   `cdn.whykusanagi.xyz/...` (or `nikkers.cc` loads `cdn.nikkers.cc/...`),
   the browser treats it as a cross-origin request because subdomains
   ARE different origins. However, the existing allowlist already includes
   both base domains for the cross-origin case.
2. **Existing curation is intentional.** The github/myoshi/oshi origins
   in the allowlist support other content (image hotlinking, etc.) on the
   shared bucket. Replacing with wildcard `*` would lose that curation.
3. **Same-origin within subdomains.** A page on `cdn.whykusanagi.xyz`
   making a fetch to itself is fully same-origin — no CORS check.

## When you'd need to modify this

- Third-party site (not in the allowlist) wants to embed corrupted-theme
  CDN assets → either ask them to fetch and rehost, OR add their origin
  to the allowlist via:
  ```bash
  npx wrangler r2 bucket cors set whykusanagi --file cors-config.json
  ```
- Cross-origin XHR/fetch from a subdomain not covered → add it explicitly
  (the existing config doesn't have `https://corrupted.whykusanagi.xyz`
  for example, which could matter if corrupted-theme's own demo site
  ever needs to fetch from cdn.* cross-origin).

## Adding subdomain coverage (optional future change)

If subdomain coverage becomes a need:

```json
[
  {
    "AllowedOrigins": [
      "https://*.whykusanagi.xyz",
      "https://*.nikkers.cc",
      "https://nikkers.cc",
      "https://whykusanagi.xyz",
      "https://github.com",
      "https://camo.githubusercontent.com",
      "https://raw.githubusercontent.com",
      "https://myoshi.co",
      "https://oshi.to"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

Apply with:
```bash
npx wrangler r2 bucket cors set whykusanagi --file cdn-worker/r2-config/cors-subdomain-expanded.json
```
