// cdn-worker/index.js
//
// Routes /corrupted-theme/@latest/* on cdn.whykusanagi.xyz and cdn.nikkers.cc
// to /corrupted-theme/@<current_version>/* in the same R2-backed bucket.
//
// The @<version>/ paths are served directly by R2's custom-domain binding;
// this Worker only intercepts @latest/.

const LATEST_PREFIX = /^\/corrupted-theme\/@latest\/(.*)$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const match = url.pathname.match(LATEST_PREFIX);
    if (!match) {
      // Not a @latest request — pass through to R2 directly
      return fetch(request);
    }

    // Path-traversal guard — reject `..` segments and percent-encoded variants
    // before they can affect the rewrite target. The bucket holds only public
    // content, but defense-in-depth: keep @latest requests confined to the
    // corrupted-theme/@<version>/ subtree.
    const subPath = match[1];
    if (/(^|\/)\.\.(\/|$)|%2e%2e|%2E%2E|%2e%2E|%2E%2e/i.test(subPath)) {
      return new Response('Bad request: path traversal not permitted', { status: 400 });
    }

    // Look up the current version from KV
    const currentVersion = await env.CDN_KV.get('current_version');
    if (!currentVersion) {
      return new Response('No published version available', { status: 503 });
    }

    // Rewrite the URL to the versioned path; preserve hostname so the
    // response stays same-origin from the consumer's perspective
    const rewrittenURL = new URL(url);
    rewrittenURL.pathname = `/corrupted-theme/@${currentVersion}/${subPath}`;

    const upstream = await fetch(rewrittenURL.toString(), request);

    // Shorter cache for @latest so updates propagate quickly; versioned
    // paths keep R2's immutable cache.
    const response = new Response(upstream.body, upstream);
    response.headers.set('Cache-Control', 'public, max-age=300, must-revalidate');
    return response;
  },
};
