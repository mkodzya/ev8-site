#!/bin/sh
# Run the step-7 check against the deployed preview, in the Playwright image
# (no Node on this Mac). One heavy task at a time; memory capped.
#
#   scripts/qa.sh                 # checks https://test.ops.ev8.ge/garage/site/
#   QA_BASE=https://ev8.ge/ scripts/qa.sh
set -eu
cd "$(dirname "$0")/.."

docker run --rm -m 2g --ipc=host -e QA_BASE="${QA_BASE:-https://test.ops.ev8.ge/garage/site/}" \
  -v "$PWD":/w -w /w mcr.microsoft.com/playwright:v1.49.0-jammy \
  sh -c 'mkdir -p /tmp/qa && cd /tmp/qa && [ -d node_modules/playwright ] || npm install --no-audit --no-fund --silent playwright@1.49.0 >/dev/null 2>&1; cp /w/scripts/qa.mjs /tmp/qa/qa.mjs && cd /tmp/qa && rm -rf qa-shots && node qa.mjs; code=$?; rm -rf /w/qa-shots && cp -r /tmp/qa/qa-shots /w/qa-shots 2>/dev/null; exit $code'
