/**
 * rollup.config.js — UMD/global builds for IIFE consumers
 *
 * Produces dist/ artifacts that expose package modules as window globals,
 * letting consumers without ES module support use them via <script> tags.
 *
 * Run: npm run build:umd
 *
 * Outputs:
 *   dist/timer-registry.global.js     → window.TimerRegistry    ({ TimerRegistry })
 *   dist/toast.global.js              → window.Toast            ({ Toast })
 *   dist/clipboard-helpers.global.js  → window.ClipboardHelpers ({ copyWithFeedback })
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
  {
    input: 'src/lib/toast.js',
    output: {
      file: 'dist/toast.global.js',
      format: 'iife',
      name: 'Toast',
      // Use: const { Toast } = window.Toast;  (Toast.show/success/error/info)
    },
  },
  {
    input: 'src/core/clipboard-helpers.js',
    output: {
      file: 'dist/clipboard-helpers.global.js',
      format: 'iife',
      name: 'ClipboardHelpers',
      // Use: const { copyWithFeedback } = window.ClipboardHelpers;
    },
  },
];
