#!/bin/bash

# Deploy script for GitHub Pages
# This script ensures a clean build and proper deployment

set -e  # Exit on error

echo "🧹 Cleaning dist folder..."
rm -rf dist

echo "📦 Building project..."
npm run build

echo "📝 Checking git status..."
git status

echo "📤 Adding dist folder to git..."
git add dist -f

echo "💾 Committing deployment..."
git commit -m "Deploy to GitHub Pages - $(date +%Y-%m-%d\ %H:%M:%S)" || echo "No changes to commit"

echo "🚀 Pushing to GitHub Pages..."
git subtree push --prefix dist origin gh-pages

echo "✅ Deployment complete!"
echo "🌐 Your site should be live at: https://spraymachine.github.io/theZone/"

