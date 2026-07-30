#!/bin/bash
# Optimizes photos for the web.
#
# Drop full-resolution photos straight into photos/. Running this script moves
# each original into photos/originals/ (kept, never published) and writes a
# lowercase, resized, compressed copy back into photos/ for the site to use.
# Safe to re-run: already-processed originals are simply re-exported.

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
PHOTOS="$DIR/photos"
ORIGINALS="$PHOTOS/originals"

MAX_EDGE=1600   # px on the long edge — plenty for the slider and lightbox
QUALITY=70      # sips formatOptions, 0-100

mkdir -p "$ORIGINALS"

shopt -s nullglob nocaseglob

# 1. Move any newly dropped full-res files into originals/ under a lowercase name.
#    A file whose name already exists in originals/ is an output this script
#    generated on an earlier run — never move it, or it would overwrite the
#    full-resolution original with the downscaled copy.
for src in "$PHOTOS"/*.jpg "$PHOTOS"/*.jpeg "$PHOTOS"/*.png "$PHOTOS"/*.heic; do
  [ -f "$src" ] || continue
  base="$(basename "$src")"
  lower="$(echo "$base" | tr '[:upper:]' '[:lower:]')"
  stem="${lower%.*}"

  if [ -e "$ORIGINALS/$lower" ] || [ -e "$ORIGINALS/$stem.jpg" ]; then
    continue
  fi

  mv -n "$src" "$ORIGINALS/$lower"
done

# 2. Export a web-sized copy of every original.
for src in "$ORIGINALS"/*.jpg "$ORIGINALS"/*.jpeg "$ORIGINALS"/*.png "$ORIGINALS"/*.heic; do
  [ -f "$src" ] || continue
  base="$(basename "$src")"
  out="$PHOTOS/${base%.*}.jpg"

  sips -s format jpeg \
       -s formatOptions "$QUALITY" \
       -Z "$MAX_EDGE" \
       "$src" --out "$out" >/dev/null

  # Strip metadata (camera EXIF can include GPS coordinates).
  sips -d profile --deleteColorManagementProperties "$out" >/dev/null 2>&1 || true

  printf '%-52s %s\n' "$(basename "$out")" "$(du -h "$out" | cut -f1)"
done

echo
echo "Originals kept in photos/originals/ (excluded from the published site)."
