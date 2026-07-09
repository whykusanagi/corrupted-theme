// Security-only lint: guards the innerHTML XSS bug class found in the 0.3.0
// review (SECURITY.md "Version history" 0.3.0 row). Not a style linter.
import noUnsanitized from 'eslint-plugin-no-unsanitized';

// escapeHtml (countdown-widget) is this repo's sanitizer — writes wrapped in
// it are safe by SECURITY.md's audited contract.
const escapers = { escape: { methods: ['escapeHtml'] } };

export default [
  {
    files: ['src/**/*.js', 'scripts/**/*.js', 'worker/**/*.js'],
    plugins: { 'no-unsanitized': noUnsanitized },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unsanitized/property': ['error', escapers],
      'no-unsanitized/method': ['error', escapers],
    },
  },
];
