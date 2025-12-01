# Testing the Image Flow API

This directory contains test scripts to verify the image-flow API is working correctly.

## Quick Test

1. **Start the backend server** (in a separate terminal):
   ```bash
   cd backend
   npm run dev
   ```

2. **Run the test** (in another terminal):
   ```bash
   cd backend
   npm run test:request
   ```

   Or directly:
   ```bash
   node test-request-simple.js
   ```

## What the Test Does

The test script:
- ✅ Creates a minimal valid PNG image (1x1 pixel)
- ✅ Sends a POST request to `/api/image-flow` with:
  - `baseImage`: The dummy PNG file
  - `userPrompt`: "Make the image more vibrant and colorful"
  - `aspectRatio`: "1:1"
- ✅ Displays the response including:
  - Reconstructed prompt (prompt1)
  - Edited prompt (prompt2)
  - Generated output image URL

## Expected Output

If everything works, you should see:
```
✅ Request successful!
Response data:
{
  "baseImage": "http://...",
  "referenceImages": [],
  "prompt1": "...",
  "prompt2": "...",
  "outputImage": "http://..."
}
```

## Troubleshooting

- **Connection refused**: Make sure the backend server is running on port 4000
- **Validation errors**: Check that your `.env` file has all required variables
- **OpenAI errors**: Verify your `OPENAI_API_KEY` is valid and has credits
- **Storage errors**: Check your S3/R2 credentials
- **Empty prompt response**: 
  - Check backend logs for "GPT prompt reconstruction response structure"
  - The logs will show what OpenAI actually returned
  - Verify the image format is supported (PNG, JPEG, WEBP, GIF)
  - Ensure the image is not corrupted or too large (>50MB)

## Alternative: Using curl

You can also test with curl:

```bash
# Create a test image first
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > test.png

# Send request
curl -X POST http://localhost:4000/api/image-flow \
  -F "baseImage=@test.png;type=image/png" \
  -F "userPrompt=Make the image more vibrant" \
  -F "aspectRatio=1:1"
```

## Test Scripts

- `test-request-simple.js` - Uses native Node.js http module (recommended)
- `test-request.js` - Uses node-fetch (requires Node 18+ or node-fetch)
- `test-request.sh` - Bash script using curl (Unix/Mac only)

