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

if [[ ! -d "./dist" ]]; then
  echo "ERROR: ./dist does not exist. Run \`npm run build\` first." >&2
  exit 1
fi

if [[ ! -d "./src/data" ]]; then
  echo "ERROR: ./src/data does not exist (canonical JSON missing?)." >&2
  exit 1
fi

echo "Uploading dist/ to ${BUCKET}/corrupted-theme/@${VERSION}/dist/ ..."
# Upload each file individually with the correct R2 key.
# Note: wrangler r2 object put REQUIRES --remote flag (defaults to local R2 simulator).
find ./dist -type f | while read -r f; do
  rel="${f#./dist/}"
  key="corrupted-theme/@${VERSION}/dist/${rel}"
  echo "  -> ${key}"
  npx wrangler r2 object put "${BUCKET}/${key}" --file "${f}" --remote > /dev/null
done

echo ""
echo "Uploading src/data/ to ${BUCKET}/corrupted-theme/@${VERSION}/data/ ..."
find ./src/data -type f -name "*.json" | while read -r f; do
  rel="${f#./src/data/}"
  key="corrupted-theme/@${VERSION}/data/${rel}"
  echo "  -> ${key}"
  npx wrangler r2 object put "${BUCKET}/${key}" --file "${f}" --remote > /dev/null
done

echo ""
echo "Bumping @latest pointer to ${VERSION} ..."
npx wrangler kv key put --config cdn-worker/wrangler.toml --binding=CDN_KV current_version "${VERSION}" --remote > /dev/null

echo ""
echo "Published to:"
echo "   https://cdn.whykusanagi.xyz/corrupted-theme/@${VERSION}/"
echo "   https://cdn.nikkers.cc/corrupted-theme/@${VERSION}/"
echo "   @latest now resolves to ${VERSION}"
