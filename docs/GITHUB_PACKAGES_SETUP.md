# GitHub Packages Setup Guide

This package is published to GitHub Packages (instead of public npm) for better access control and integration with GitHub.

## For Package Consumers (Using the Theme)

### 1. Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens/new
2. Create a new token with these permissions:
   - `read:packages` - to install packages from GitHub Packages
3. Copy the token (you won't see it again)

### 2. Configure npm Authentication

Choose one of these methods:

#### Method A: Global `.npmrc` (Recommended)

Create or edit `~/.npmrc` in your home directory:

```bash
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@whykusanagi:registry=https://npm.pkg.github.com
```

#### Method B: Project-level `.npmrc`

Create `.npmrc` in your project root:

```bash
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@whykusanagi:registry=https://npm.pkg.github.com
```

#### Method C: Environment Variable (CI/CD)

```bash
export NPM_TOKEN=YOUR_GITHUB_TOKEN
npm install
```

### 3. Install the Package

```bash
npm install @whykusanagi/corrupted-theme
```

### 4. Use in Your Project

```css
/* Import the full theme */
@import '@whykusanagi/corrupted-theme';

/* Or import individual modules */
@import '@whykusanagi/corrupted-theme/variables';
@import '@whykusanagi/corrupted-theme/components';
```

## For Package Publisher (whykusanagi)

### Publishing a New Version

1. **Update version in `package.json`:**
   ```bash
   npm version patch    # 0.1.0 → 0.1.1
   npm version minor    # 0.1.0 → 0.2.0
   npm version major    # 0.1.0 → 1.0.0
   ```

2. **Build the package:**
   ```bash
   npm run build
   ```

3. **Ensure authentication:**
   ```bash
   # Check if logged in
   npm whoami

   # If not authenticated, login with GitHub token
   npm login --registry=https://npm.pkg.github.com
   ```

4. **Publish to GitHub Packages:**
   ```bash
   npm publish
   ```

5. **Verify published:**
   - Check https://github.com/whykusanagi/corrupted-theme/packages
   - Or install in a test project

### Publishing from CI/CD (GitHub Actions)

Add to your GitHub Actions workflow:

```yaml
- name: Publish to GitHub Packages
  run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Troubleshooting

### "404 Not Found" when installing

- Verify your GitHub token has `read:packages` permission
- Check `.npmrc` configuration is correct
- Token may be expired, create a new one

### "Not authorized" when publishing

- Ensure you're logged in: `npm whoami`
- Check `.npmrc` has your valid GitHub token
- Only whykusanagi user can publish (GitHub owner)

### Package not found after publishing

- GitHub Packages can take a few seconds to index
- Check package page: https://github.com/whykusanagi/corrupted-theme/packages
- Try installing with `@whykusanagi/corrupted-theme@latest`

## References

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [npm Registry Configuration](https://docs.npmjs.com/cli/v8/configuring-npm/npmrc)
- [GitHub Personal Access Tokens](https://github.com/settings/tokens)

---

**Note:** Package is scoped (`@whykusanagi/corrupted-theme`), which means it always routes to the registry specified in `publishConfig` (GitHub Packages).
