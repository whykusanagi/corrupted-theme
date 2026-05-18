#!/usr/bin/env bash
# scripts/generate-sri.sh
#
# Generates SRI hashes (sha384) for every JS/CSS/JSON file in ./dist/.
# Output is paste-ready for consumer sites' <script integrity="..."> /
# <link integrity="..."> attrs.

set -euo pipefail

if [[ ! -d "./dist" ]]; then
  echo "ERROR: ./dist does not exist. Run \`npm run build\` first." >&2
  exit 1
fi

VERSION=$(node -p "require('./package.json').version")
echo "SRI hashes for corrupted-theme@${VERSION}:"
echo ""

find ./dist -type f \( -name "*.js" -o -name "*.css" -o -name "*.json" \) | sort | while read -r f; do
  HASH=$(openssl dgst -sha384 -binary "$f" | openssl base64 -A)
  REL="${f#./}"
  echo "  ${REL}"
  echo "    integrity=\"sha384-${HASH}\""
done
