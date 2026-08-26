# Rendering Theme Components to Video (Deterministic Frames)

Capture any corrupted-theme component frame-by-frame in a headless browser
and you have a video. Two utilities make the output deterministic, meaning
the same frame index always produces identical pixels:

| Utility | Import | Purpose |
|---|---|---|
| `seededRandom(seed)` | `@whykusanagi/corrupted-theme/random-utils` | mulberry32 PRNG; seed with the frame index so randomized content (phrases, particles) repeats exactly per frame |
| `seekAnimations(root, timeSeconds)` | `@whykusanagi/corrupted-theme/time-utils` | pauses every CSS animation under `root` and seeks it to an absolute time via negative `animation-delay`; each animation resolves to its own phase (`t % duration`) |
| `createFrameClock({ fps, seed })` | `@whykusanagi/corrupted-theme/canvas-seek` | the canvas equivalent of `seekAnimations`. `clock.seek(frame)` fixes a frame; `clock.rngAt(key)` derives randomness from (seed, frame, key), so any frame renders byte-identically in isolation and out of order |
| `createDissolve({ revealMs, holdMs, dissolveMs })` | `@whykusanagi/corrupted-theme/canvas-seek` | the reveal → hold → dissolve envelope; `at(tMs)` returns the phase and its progress |

## Canvas components: drive them off a frame clock

`seekAnimations` only reaches CSS animations. Canvas components need a clock of
their own, and the ones that support deterministic export take one:

| Call | Component | Notes |
|---|---|---|
| `renderFrame(frameIdx, fps)` | most canvas components | paints exactly the frame at that index |
| `renderAt(clock)` | `CorruptedFlares` | paints the frame the clock is sitting on, so a scrubbed preview and a captured frame agree |
| `CorruptedFlares.drawAt(ctx, name, clock, opts)` | `CorruptedFlares` | frame-locked single mark, composited into a context you own. Same clock + same frame → identical pixels |
| `toPNG({ scale })` | `CorruptedFlares` | repaints at the target resolution and resolves to a `Blob`, alpha preserved. Vector-crisp at any export size, and it does not disturb the live canvas |

For an overlay pass, construct with `plate: false` so the board is transparent
between marks and composites straight over your footage:

```js
import { createFrameClock } from '@whykusanagi/corrupted-theme/canvas-seek';
import { CorruptedFlares } from '@whykusanagi/corrupted-theme/corrupted-flares';

const clock = createFrameClock({ fps: 30, seed: 42 });
const flares = new CorruptedFlares(stage, { seed: 42, plate: false });

window.renderFrame = (i) => {
  clock.seek(i);
  flares.renderAt(clock);          // whole board
  // …or place individual marks yourself:
  ctx.save();
  ctx.translate(x, y);
  CorruptedFlares.drawAt(ctx, 'glitchStar', clock, { size: 80, ramp: true });
  ctx.restore();
};
```

Note that a board created with a finite `loops` count settles and stops. For a
capture longer than `loops × loopMs` either raise `loops`, or pass
`loops: Infinity` if you want it corrupting for the whole take.

## Recipe

An external tool (Playwright or Puppeteer, never a package dependency)
drives the capture. The page exposes a `renderFrame(i)` hook. The harness
screenshots after each call and pipes the frames to FFmpeg.

**Page side:**

```html
<div id="stage"><!-- your component markup --></div>
<script type="module">
  import { seekAnimations } from 'https://cdn.whykusanagi.xyz/corrupted-theme/@latest/src/core/time-utils.js';
  import { seededRandom } from 'https://cdn.whykusanagi.xyz/corrupted-theme/@latest/src/core/random-utils.js';

  const FPS = 60;
  const stage = document.getElementById('stage');

  // Wait for web fonts before any capture. Otherwise early frames render in a
  // fallback font on some runs, and the text becomes non-deterministic.
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
- `seekAnimations` sets `animation-play-state: paused` inline; call
  `el.style.animationPlayState = ''` on all descendants to resume live playback.
- This pattern pairs well with a Playwright static-server + screenshot-with-retry
  harness for frame capture.
