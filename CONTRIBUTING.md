# Contributing to Corrupted Theme

Thank you for your interest in contributing to Corrupted Theme! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and constructive in all interactions. We welcome contributors of all skill levels and backgrounds.

## Getting Started

### Prerequisites
- Node.js 14.0.0 or higher
- npm or yarn
- A code editor (VS Code recommended)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/whykusanagi/corrupted-theme.git
cd corrupted-theme

# Install dependencies
npm install

# Watch for CSS changes during development
npm run watch
```

### File Structure

```
corrupted-theme/
├── src/css/              # CSS source files
│   ├── theme.css         # Main theme (imports all modules)
│   ├── variables.css     # CSS custom properties
│   ├── typography.css    # Font and text styling
│   ├── glassmorphism.css # Glass effect utilities
│   ├── animations.css    # Keyframe animations
│   ├── components.css    # UI component styles
│   ├── utilities.css     # Utility classes
│   └── nikke-utilities.css # Game-specific styles
├── docs/                 # Documentation files
├── examples/             # Working examples
├── package.json          # Package configuration
├── CHANGELOG.md          # Version history
└── LICENSE              # MIT License
```

## Making Changes

### CSS Guidelines

1. **Use CSS Variables** - Always use CSS custom properties defined in `variables.css`
2. **Follow existing patterns** - Maintain consistency with existing component styles
3. **Mobile-first approach** - Write base styles for mobile, then add breakpoints for larger screens
4. **Accessibility matters** - Ensure sufficient color contrast and keyboard navigation
5. **Test in multiple browsers** - Chrome, Firefox, Safari, Edge

### Adding New Components

1. Add component styles to `components.css` or create a new module
2. Follow the existing naming convention: `.component-name`
3. Create example HTML in `examples/` directory
4. Document the component in `docs/COMPONENTS.md`
5. Add CSS variables reference to `docs/VARIABLES_REFERENCE.md`

### Adding CSS Variables

1. Define variables in `variables.css` with clear naming
2. Use semantic names: `--color-primary`, `--spacing-unit`, etc.
3. Document the variable in `docs/VARIABLES_REFERENCE.md`
4. Include usage examples
5. Update CHANGELOG.md

## Commit Messages

Use clear, concise commit messages following this format:

```
[type]: Short description

Optional longer explanation if needed.

Examples:
- [feat]: Add new button variant with icon support
- [fix]: Correct color contrast ratio for dark backgrounds
- [docs]: Update component documentation with accessibility notes
- [refactor]: Consolidate animation variables
```

Types:
- `feat:` - New feature or component
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring without feature changes
- `test:` - Adding or updating tests
- `perf:` - Performance improvements
- `style:` - Formatting changes (no logic changes)

## Testing Your Changes

### Manual Testing

1. **Visual verification** - Open examples in multiple browsers
2. **Responsive testing** - Test at breakpoints: 480px, 768px, 1024px, 1200px+
3. **Color contrast** - Use a contrast checker tool (WCAG AA minimum)
4. **Keyboard navigation** - Ensure components work with Tab/Enter/Escape
5. **Accessibility** - Use browser DevTools accessibility audit

### Building for Production

```bash
npm run build
```

This creates a minified version in `dist/theme.min.css`

## Pull Request Process

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes and test thoroughly
3. Commit with clear messages following the convention above
4. Push to your fork and create a Pull Request
5. In the PR description, explain:
   - What changes you made
   - Why the changes are needed
   - How to test the changes
   - Any breaking changes

### PR Checklist
- [ ] All changes are on a feature branch
- [ ] Commit messages follow the format
- [ ] Code follows existing style conventions
- [ ] Documentation is updated
- [ ] Examples are provided for new components
- [ ] Changes are tested in multiple browsers
- [ ] No console errors or warnings
- [ ] Color contrast meets WCAG AA standards

## Documentation

All changes should include documentation updates:

- **New components** → Add to `docs/COMPONENTS.md`
- **New CSS variables** → Add to `docs/VARIABLES_REFERENCE.md`
- **Breaking changes** → Add to `CHANGELOG.md` under new version
- **Usage examples** → Add to `examples/` directory

## Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** - Breaking changes
- **MINOR** - New features (backwards compatible)
- **PATCH** - Bug fixes

Update version in `package.json` and document in `CHANGELOG.md`

## Questions?

- Open an issue for questions or suggestions
- Check existing documentation first: `docs/`
- Review examples for common use cases: `examples/`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Corrupted Theme! 🎨**
