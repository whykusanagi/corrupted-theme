#!/usr/bin/env bash
# Release gate E4 — public surfaces name no internal repository and use no
# harvest verb.
#
# Covers the published GitHub releases as well as the files: the CHANGELOG was
# scrubbed for 0.3.0 and the release notes were not, and nobody noticed for
# three months because the grep only ever ran over the working tree.
#
# This gate must FAIL LOUDLY rather than pass when it cannot see a surface.
# The first version passed vacuously three ways: grep returns 2 when any path
# is missing (so a fresh clone, where dist/ is not yet generated, printed its
# hits and still said "clean"), an unauthenticated gh exits 4 into an empty
# loop, and the terms were case-sensitive while the live v0.3.0 title is
# lowercase.
#
# The term list lives here because the gate needs it literally; the specs refer
# to it rather than repeating it.
#
# Run: npm run audit:provenance
set -uo pipefail

# Verbs carry \b so the case-insensitive match does not fire on innocent
# words: 're-exported from' contains 'ported from'.
TERMS='celeste-tts-bot|obs/transitions|obs/shared|spatial_videos|youtube_poop|thumbnail-generator|\bported from|\badapted from|\babsorbed\b|\babsorbs\b|\babsorption\b|\bcopy-pasted\b|\bvendored\b|single canonical home|drift reconvergence'
status=0

echo "== shipped files =="
paths=(README.md CHANGELOG.md index.html package.json docs examples src)
missing=()
for p in dist/manifest.json dist/llms.txt; do
  if [ -e "$p" ]; then paths+=("$p"); else missing+=("$p"); fi
done
if [ "${#missing[@]}" -gt 0 ]; then
  echo "NOT CHECKED: ${missing[*]} — run 'npm run manifest:generate' first"
  status=1
fi

hits=$(grep -rniEI "$TERMS" "${paths[@]}" \
         --exclude-dir=governance --exclude-dir=planning --exclude-dir=node_modules 2>/dev/null)
rc=$?
case "$rc" in
  0) printf '%s\n' "$hits"; status=1 ;;
  1) echo "clean" ;;
  *) echo "grep failed (rc=$rc) — files NOT checked"; status=1 ;;
esac

echo
echo "== published releases =="
if ! command -v gh >/dev/null 2>&1; then
  echo "gh not installed — releases NOT checked"
  status=1
else
  # Every release, not a window: the two that needed rewriting were the oldest.
  tags=$(gh api --paginate 'repos/{owner}/{repo}/releases?per_page=100' --jq '.[].tag_name' 2>&1)
  rc=$?
  if [ "$rc" -ne 0 ]; then
    echo "gh release list failed (rc=$rc) — releases NOT checked"
    echo "  ${tags%%$'\n'*}"
    status=1
  elif [ -z "$tags" ]; then
    echo "gh returned no releases — NOT checked (expected at least one tag)"
    status=1
  else
    release_hits=0
    while IFS= read -r tag; do
      [ -z "$tag" ] && continue
      body=$(gh release view "$tag" --json name,body --jq '"\(.name)\n\(.body)"' 2>&1)
      rc=$?
      if [ "$rc" -ne 0 ]; then
        echo "gh release view $tag failed (rc=$rc) — that release NOT checked"
        status=1
        continue
      fi
      if printf '%s' "$body" | grep -niEI "$TERMS"; then
        echo "  ^ in release $tag"
        release_hits=1
        status=1
      fi
    done <<< "$tags"
    [ "$release_hits" -eq 0 ] && echo "clean"
  fi
fi

echo
if [ "$status" -eq 0 ]; then echo "E4: clean"; else echo "E4: FAILED"; fi
exit "$status"
