#!/bin/sh
# Put a preview build where Mika opens it from his phone:
#   https://test.ops.ev8.ge/garage/site/
# Static files on the test host, next to the garage mockup, outside EV8 Ops.
# This copies files only: it does not restart anything on the server.
# Production (ev8.ge) is not touched by this script — there is no production
# deploy yet, and when there is one it moves only on Mika's word.
set -eu
cd "$(dirname "$0")/.."

HOST=root@204.168.149.105
NAME=site
DIR=/srv/ev8-site-preview/www/garage/$NAME
export PREVIEW_BASE=/garage/$NAME/

scripts/build.sh preview
[ -f dist/index.html ] || { echo "No dist/index.html — build failed."; exit 1; }
tar -C dist -cf - . | ssh -o BatchMode=yes "$HOST" "rm -rf '$DIR.new' && mkdir -p '$DIR.new' && tar -C '$DIR.new' -xf - && rm -rf '$DIR.old' && { [ ! -d '$DIR' ] || mv '$DIR' '$DIR.old'; } && mv '$DIR.new' '$DIR' && rm -rf '$DIR.old'"
echo "Preview: https://test.ops.ev8.ge/garage/$NAME/"
