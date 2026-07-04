# Rendering Theme Components to Video (Deterministic Frames)

Any corrupted-theme component can be rendered to a video file by capturing it
frame-by-frame in a headless browser. Two utilities make the output
deterministic — the same frame index always produces identical pixels:

| Utility | Import | Purpose |
|---|---|---|
| `seededRandom(seed)` | `@whykusanagi/corrupted-theme/random-utils` | mulberry32 PRNG; seed with the frame index so randomized content (phrases, particles) repeats exactly per frame |
| `seekAnimations(root, timeSeconds)` | `@whykusanagi/corrupted-theme/time-utils` | pauses every CSS animation under `root` and seeks it to an absolute time via negative `animation-delay` — each animation resolves to its own phase (`t % duration`) |

## Recipe

Frame capture is driven by an external tool (Playwright, Puppeteer — **not** a
package dependency). The page exposes a `renderFrame(i)` hook; the harness
screenshots after each call and pipes the frames to FFmpeg.

**Page side:**

```html
<div id="stage"><!-- your component markup --></div>
<script type="module">
  import { seekAnimations } from 'https://cdn.whykusanagi.xyz/corrupted-theme/@latest/src/core/time-utils.js';
  import { seededRandom } from 'https://cdn.whykusanagi.xyz/corrupted-theme/@latest/src/core/random-utils.js';

  const FPS = 60;
  const stage = document.getElementById('stage');

  // Wait for web fonts before any capture — otherwise early frames render in a
  // fallback font on some runs (flaky, non-deterministic text).
  await document.fonts.ready;

  window.renderFrame = (i) => {
    seekAnimations(stage, i / FPS);          // freeze CSS animations at frame time
    const rng = seededRandom(i);             // deterministic randomness for JS-driven content
    // components with a renderFrame(frameIdx, fps) mode: call it here
  };
</script>
```

**Harness side (Playwright, external):**

```js
for (let i = 0; i < totalFrames; i++) {
  await page.evaluate((n) => window.renderFrame(n), i);
  await page.screenshot({ path: `frames/${String(i).padStart(6, '0')}.png` });
}
// ffmpeg -framerate 60 -i frames/%06d.png -c:v libx264 -pix_fmt yuv420p out.mp4
```

## Notes

- JS-driven canvas/DOM components in this package expose `renderFrame(frameIdx, fps)`
  + a `seed` option where deterministic export is supported (see each component's docs).
- `seekAnimations` sets `animation-play-state: paused` inline — call
  `el.style.animationPlayState = ''` on all descendants to resume live playback.
- Reference implementation of this pattern: the spatial_videos pipeline
  (Playwright static-server + screenshot-with-retry harness).
