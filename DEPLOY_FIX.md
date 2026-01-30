# Deployment Fix Guide

## Issue
`npm run deploy` wasn't reflecting changes on GitHub Pages.

## Root Causes
1. **Stale build files**: Old dist files weren't being cleaned before rebuild
2. **Git subtree conflicts**: Sometimes git subtree push fails silently
3. **Cache issues**: GitHub Pages might cache old files

## Solution

### Updated Deploy Scripts

The `package.json` now includes:

1. **`npm run deploy`** - Standard deployment
   - Cleans dist folder
   - Builds fresh
   - Commits and pushes to gh-pages

2. **`npm run deploy:force`** - Force deployment (use if standard deploy fails)
   - Forces push to gh-pages branch
   - Useful if there are conflicts

### Manual Deployment Steps

If `npm run deploy` still doesn't work, try:

```bash
# 1. Clean and rebuild
npm run clean
npm run build

# 2. Check what's in dist
ls -la dist/assets/

# 3. Force add dist to git
git add dist -f

# 4. Commit
git commit -m "Deploy to GitHub Pages"

# 5. Push to gh-pages (standard)
git subtree push --prefix dist origin gh-pages

# OR force push if needed
git push origin $(git subtree split --prefix dist main):gh-pages --force
```

### Troubleshooting

1. **Clear GitHub Pages cache**: 
   - Go to repository Settings > Pages
   - Re-save the Pages settings (this clears cache)

2. **Check gh-pages branch**:
   ```bash
   git checkout gh-pages
   ls -la
   git checkout main
   ```

3. **Verify build output**:
   ```bash
   npm run build
   cat dist/index.html
   # Check that it references the latest JS/CSS files
   ```

4. **Check GitHub Actions** (if using):
   - Go to Actions tab
   - Check if deployment workflow is running

### Common Issues

- **"Everything up-to-date"**: This means dist folder hasn't changed. Make sure you've made source changes and rebuilt.
- **"Permission denied"**: Check git credentials
- **"Branch not found"**: Create gh-pages branch first: `git checkout --orphan gh-pages && git commit --allow-empty -m "Initial gh-pages commit" && git push origin gh-pages && git checkout main`

## Quick Fix Command

Run this to ensure everything is fresh:

```bash
npm run clean && npm run build && git add dist -f && git commit -m "Deploy: $(date)" && git subtree push --prefix dist origin gh-pages
```

