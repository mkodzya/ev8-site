#!/bin/sh
# Build the site in Docker: this Mac has no Node, and the machine has 8 GB, so
# the build runs with a memory cap and one at a time.
#
#   scripts/build.sh            production build -> dist/   (ka, en; base /)
#   scripts/build.sh preview    preview build    -> dist/   (ka, en; noindex;
#                               served under the folder in PREVIEW_BASE)
#   THEME=light scripts/build.sh preview    the same with the light theme (a trial)
set -eu
cd "$(dirname "$0")/.."

MODE="${1:-prod}"
PREVIEW_BASE="${PREVIEW_BASE:-/garage/site/}"
if [ "$MODE" = "preview" ]; then ENVS="-e PREVIEW=1 -e SITE_BASE=$PREVIEW_BASE"; else ENVS=""; fi

# shellcheck disable=SC2086
docker run --rm -m 1536m -e THEME="${THEME:-}" -e ASTRO_TELEMETRY_DISABLED=1 -e NODE_OPTIONS=--max-old-space-size=1024 $ENVS \
  -v "$PWD":/w -w /w node:22-alpine \
  sh -c '[ -d node_modules ] && [ node_modules -nt package.json ] || npm install --no-audit --no-fund; npm run check && npm run build'
