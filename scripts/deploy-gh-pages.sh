#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Birthday Quest GitHub Pages helper"
echo

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This folder is not a git repository."
  exit 1
fi

REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"

if [[ -z "$REMOTE_URL" ]]; then
  echo "No 'origin' remote is configured yet."
  echo "Add one first, for example:"
  echo "  git remote add origin git@github.com:YOUR_USER/YOUR_REPO.git"
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"

echo "Remote: $REMOTE_URL"
echo "Current branch: ${CURRENT_BRANCH:-detached}"
echo
echo "Recommended setup:"
echo "1. Commit your files:"
echo "   git add ."
echo "   git commit -m \"Build birthday game\""
echo
echo "2. Push your branch:"
echo "   git push -u origin ${CURRENT_BRANCH:-main}"
echo
echo "3. In GitHub:"
echo "   Settings -> Pages -> Build and deployment -> Source"
echo "   Choose 'Deploy from a branch'"
echo "   Branch: ${CURRENT_BRANCH:-main}"
echo "   Folder: / (root)"
echo
echo "This project is already GitHub Pages ready. No build step is required."
