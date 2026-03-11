#!/bin/bash
# Bulk upload all public assets to Cloudflare R2
# Usage: cd into your project root, then run: bash upload-to-r2.sh

BUCKET="angel2100"
PUBLIC_DIR="apps/web/public"

# Check wrangler is available
if ! command -v npx &> /dev/null; then
  echo "Error: npx not found"
  exit 1
fi

echo "Starting bulk upload to R2 bucket: $BUCKET"
echo "Source directory: $PUBLIC_DIR"

# Count total files
TOTAL=$(find "$PUBLIC_DIR" -type f -not -path '*/\.*' | wc -l)
echo "Total files to upload: $TOTAL"
echo ""

COUNT=0
ERRORS=0

# Upload each file
find "$PUBLIC_DIR" -type f -not -path '*/\.*' | while read -r FILE; do
  # Get the key (path relative to public dir)
  KEY="${FILE#$PUBLIC_DIR/}"

  COUNT=$((COUNT + 1))

  # Detect content type
  case "${FILE##*.}" in
    jpg|jpeg) CT="image/jpeg" ;;
    png) CT="image/png" ;;
    gif) CT="image/gif" ;;
    webp) CT="image/webp" ;;
    svg) CT="image/svg+xml" ;;
    mp4) CT="video/mp4" ;;
    webm) CT="video/webm" ;;
    json) CT="application/json" ;;
    xml) CT="application/xml" ;;
    html) CT="text/html" ;;
    css) CT="text/css" ;;
    js) CT="application/javascript" ;;
    txt) CT="text/plain" ;;
    ico) CT="image/x-icon" ;;
    *) CT="application/octet-stream" ;;
  esac

  echo "[$COUNT/$TOTAL] Uploading: $KEY"

  npx wrangler r2 object put "$BUCKET/$KEY" --file="$FILE" --content-type="$CT" --remote 2>/dev/null

  if [ $? -ne 0 ]; then
    echo "  ❌ FAILED: $KEY"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "Upload complete! Errors: $ERRORS"
