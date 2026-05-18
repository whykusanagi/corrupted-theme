/**
 * rollup.config.js — UMD/global builds for IIFE consumers
 *
 * Produces dist/ artifacts that expose package modules as window globals,
 * letting consumers without ES module support use them via <script> tags.
 *
 * Run: npm run build:umd
 *
 * Outputs:
 *   dist/timer-registry.global.js  → window.TimerRegistry
 */

export default [
  {
    input: 'src/core/timer-registry.js',
    output: {
      file: 'dist/timer-registry.global.js',
      format: 'iife',
      name: 'TimerRegistry',
      // Named exports are spread onto window.TimerRegistry
      // so window.TimerRegistry.TimerRegistry is the class.
      // Use: const { TimerRegistry } = window.TimerRegistry;
    },
  },
  // Future UMD targets go here, e.g.:
  // { input: 'src/core/event-tracker.js', output: { file: 'dist/event-tracker.global.js', format: 'iife', name: 'EventTracker' } },
];
