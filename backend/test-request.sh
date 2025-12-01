#!/bin/bash
# Simple curl test for image-flow API
# Usage: ./test-request.sh

BACKEND_URL="${BACKEND_URL:-http://localhost:4000}"
ENDPOINT="${BACKEND_URL}/api/image-flow"

echo "🧪 Testing image-flow API at: ${ENDPOINT}"
echo ""

# Create a minimal 1x1 PNG file
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/test-image.png

echo "📤 Sending request..."
curl -X POST "${ENDPOINT}" \
  -F "baseImage=@/tmp/test-image.png;type=image/png" \
  -F "userPrompt=Make the image more vibrant and colorful" \
  -F "aspectRatio=1:1" \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -v

rm -f /tmp/test-image.png

