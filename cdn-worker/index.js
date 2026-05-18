// cdn-worker/index.js
// Routes /corrupted-theme/@latest/* to versioned R2 path via KV pointer.
// Real implementation lands in T3. This stub keeps the route reachable
// before T3 deploys.
export default {
  async fetch(request) {
    return new Response('cdn-worker stub — real impl in T3', { status: 200 });
  },
};
