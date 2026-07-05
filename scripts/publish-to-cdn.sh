#!/usr/bin/env bash
# scripts/publish-to-cdn.sh
#
# Uploads corrupted-theme dist/ + src/data/ to the whykusanagi R2 bucket under
# /corrupted-theme/@<version>/, then bumps the @latest KV pointer.
#
# Run AFTER `npm publish` succeeds. Requires `wrangler login` to be current.
#
# The bucket is shared with s3.{whykusanagi.xyz,nikkers.cc}; uploads
# are scoped under the /corrupted-theme/ prefix to avoid namespace
# collisions with optimized_assets/ and other content already in the
# bucket.

set -euo pipefail

VERSION=$(node -p "require('./package.json').version")
BUCKET="${CT_CDN_BUCKET:-whykusanagi}"

# Versioned paths are content-addressed and never mutate → cache forever.
CACHE_IMMUTABLE="public, max-age=31536000, immutable"

# Map file extension -> Content-Type. `wrangler r2 object put` sets NO type by
# default, which makes a <link rel=stylesheet> refuse the CSS in standards mode.
# Keep this table in sync with cdn-worker/index.js (which enforces the same
# types on @latest); this covers the direct @<version>/ paths.
content_type_for() {
  case "${1##*.}" in
    css)    echo "text/css; charset=utf-8" ;;
    js|mjs) echo "text/javascript; charset=utf-8" ;;
    json)   echo "application/json; charset=utf-8" ;;
    txt)    echo "text/plain; charset=utf-8" ;;
    map)    echo "application/json; charset=utf-8" ;;
    svg)    echo "image/svg+xml" ;;
    png)    echo "image/png" ;;
    woff2)  echo "font/woff2" ;;
    *)      echo "" ;;
  esac
}

# Upload one file to an R2 key with the correct Content-Type + immutable cache.
# Note: wrangler r2 object put REQUIRES --remote (defaults to local simulator).
put_object() {
  local key="$1" file="$2" ct
  ct="$(content_type_for "$file")"
  local args=( "${BUCKET}/${key}" --file "${file}" --remote --cache-control "${CACHE_IMMUTABLE}" )
  if [[ -n "$ct" ]]; then
    args+=( --content-type "$ct" )
  else
    echo "  WARN: no Content-Type mapping for ${file} — uploading without one" >&2
  fi
  npx wrangler r2 object put "${args[@]}" > /dev/null
}

if [[ ! -d "./dist" ]]; then
  echo "ERROR: ./dist does not exist. Run \`npm run build\` first." >&2
  exit 1
fi

if [[ ! -d "./src/data" ]]; then
  echo "ERROR: ./src/data does not exist (canonical JSON missing?)." >&2
  exit 1
fi

echo "Uploading dist/ to ${BUCKET}/corrupted-theme/@${VERSION}/dist/ ..."
find ./dist -type f | while read -r f; do
  rel="${f#./dist/}"
  key="corrupted-theme/@${VERSION}/dist/${rel}"
  echo "  -> ${key}"
  put_object "${key}" "${f}"
done

echo ""
echo "Uploading src/data/ to ${BUCKET}/corrupted-theme/@${VERSION}/data/ ..."
find ./src/data -type f -name "*.json" | while read -r f; do
  rel="${f#./src/data/}"
  key="corrupted-theme/@${VERSION}/data/${rel}"
  echo "  -> ${key}"
  put_object "${key}" "${f}"
done

# ESM module tree — manifest.json cdnUrls and no-build consumers import
# @<ver>/src/{css,lib,core,data}/... directly (0.3.0+; matches package.json
# exports so npm and CDN paths stay symmetrical).
echo ""
echo "Uploading src/ modules to ${BUCKET}/corrupted-theme/@${VERSION}/src/ ..."
find ./src/css ./src/lib ./src/core ./src/data -type f \( -name "*.js" -o -name "*.css" -o -name "*.json" \) | while read -r f; do
  rel="${f#./src/}"
  key="corrupted-theme/@${VERSION}/src/${rel}"
  echo "  -> ${key}"
  put_object "${key}" "${f}"
done

echo ""
echo "Bumping @latest pointer to ${VERSION} ..."
npx wrangler kv key put --config cdn-worker/wrangler.toml --binding=CDN_KV current_version "${VERSION}" --remote > /dev/null

echo ""
echo "Published to:"
echo "   https://cdn.whykusanagi.xyz/corrupted-theme/@${VERSION}/"
echo "   https://cdn.nikkers.cc/corrupted-theme/@${VERSION}/"
echo "   @latest now resolves to ${VERSION}"
