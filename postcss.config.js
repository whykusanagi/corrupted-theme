import postcssImport from 'postcss-import';
import cssnano from 'cssnano';

// postcss-import MUST run first so cssnano sees a single, fully-inlined
// stylesheet. Without it, dist/theme.min.css keeps the @import statements
// verbatim — and since dist/ ships no sibling partials on the CDN, every
// @import 404s and consumers get an effectively empty stylesheet
// (the 0.2.0 regression: .card lost its glass styling on @latest).
export default {
  plugins: [
    postcssImport(),
    cssnano({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
      }]
    })
  ]
};

