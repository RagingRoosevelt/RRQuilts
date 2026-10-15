#!/usr/bin/env bash
# make release: pick the kind of release here, then Claude writes the changelog, commits, pushes and
# tags (scripts/release.md).
set -euo pipefail
cd "$(dirname "$0")/.."
current=$(sed -n 's/^  "version": "\([0-9]*\.[0-9]*\.[0-9]*\)".*/\1/p' package.json)
IFS=. read -r major minor patch <<<"$current"
echo "Current version: $current"
echo "  1) major   $((major + 1)).0.0"
echo "  2) minor   $major.$((minor + 1)).0"
echo "  3) hotfix  $major.$minor.$((patch + 1))"
read -rp "Release kind [1-3]: " pick
case "$pick" in
  1) kind=major next="$((major + 1)).0.0" ;;
  2) kind=minor next="$major.$((minor + 1)).0" ;;
  3) kind=hotfix next="$major.$minor.$((patch + 1))" ;;
  *) echo "Cancelled."; exit 1 ;;
esac
echo "Releasing $next ($kind)…"
exec claude "$(cat scripts/release.md)

The user chose a $kind release: the new version is $next (from $current)."
