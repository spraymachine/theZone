#!/bin/bash

# Fix for git subtree push rejection
# This script handles the non-fast-forward error

set -e

echo "🧹 Cleaning dist folder..."
rm -rf dist

echo "📦 Building project..."
npm run build

echo "📝 Adding dist to git..."
git add dist -f

echo "💾 Committing deployment..."
git commit -m "Deploy to GitHub Pages - $(date +%Y-%m-%d\ %H:%M:%S)" || echo "No changes to commit"

echo "🚀 Force pushing to gh-pages..."
# Split the subtree and force push to avoid non-fast-forward errors
git push origin $(git subtree split --prefix dist main):gh-pages --force

echo "✅ Deployment complete!"
echo "🌐 Your site should be live at: https://spraymachine.github.io/theZone/"
echo "⏱️  Wait 1-2 minutes for GitHub Pages to update"

