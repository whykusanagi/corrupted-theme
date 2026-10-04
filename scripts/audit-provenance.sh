#!/usr/bin/env bash
# Release gate E4 — public surfaces name no internal repository and use no
# harvest verb.
#
# Covers the published GitHub releases as well as the files: the CHANGELOG was
# scrubbed for 0.3.0 and the release notes were not, and nobody noticed for
# three months because the grep only ever ran over the working tree.
#
# Run: npm run audit:provenance
set -uo pipefail

TERMS='celeste-tts-bot|obs/transitions|obs/shared|spatial_videos|youtube_poop|thumbnail-generator|Ported from|Adapted from|Absorbed|absorption|copy-pasted|vendored|single canonical home|drift reconvergence'
status=0

echo "== shipped files =="
if grep -rnEI "$TERMS" README.md CHANGELOG.md docs examples src dist/manifest.json dist/llms.txt \
     --exclude-dir=governance --exclude-dir=planning --exclude-dir=specs 2>/dev/null; then
  status=1
else
  echo "clean"
fi

echo
echo "== published releases =="
if command -v gh >/dev/null 2>&1; then
  release_hits=0
  for tag in $(gh release list --limit 20 --json tagName --jq '.[].tagName' 2>/dev/null); do
    if gh release view "$tag" --json name,body --jq '"\(.name)\n\(.body)"' 2>/dev/null | grep -nEI "$TERMS"; then
      echo "  ^ in release $tag"
      release_hits=1
      status=1
    fi
  done
  [ "$release_hits" -eq 0 ] && echo "clean"
else
  echo "gh not available — release bodies NOT checked"
  status=1
fi

echo
if [ "$status" -eq 0 ]; then echo "E4: clean"; else echo "E4: FAILED"; fi
exit "$status"
