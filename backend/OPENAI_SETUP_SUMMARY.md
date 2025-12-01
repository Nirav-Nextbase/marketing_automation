# OpenAI API Integration - Setup Summary

## What's Been Created

### 1. Documentation
- **`OPENAI_API_INTEGRATION.md`** - Complete API reference guide
  - Authentication methods
  - Request/response formats
  - Image analysis examples
  - Error handling
  - Best practices

### 2. Service Implementation
- **`src/services/openaiService.ts`** - Ready-to-use OpenAI service
  - `reconstructPromptFromImage()` - Analyzes image and generates prompt
  - `applyUserInstructions()` - Modifies prompts with user instructions
  - `analyzeImage()` - General image analysis
  - `chatCompletions()` - Text-based chat

### 3. Integration Examples
- **`OPENAI_INTEGRATION_EXAMPLE.ts`** - Code examples showing how to integrate

### 4. Configuration
- **`src/config.ts`** - Added OpenAI config section
- **`env.template`** - Added `OPENAI_API_KEY` variable

## Quick Start

### Step 1: Get Your API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

### Step 2: Configure Environment
Add to your `backend/.env` file:
```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Step 3: Install Dependencies (if needed)
The service uses `node-fetch` which is already in your dependencies.

### Step 4: Integrate into Route
See `OPENAI_INTEGRATION_EXAMPLE.ts` for complete examples.

## API Request Format

### Authentication Header
```http
Authorization: Bearer sk-your-api-key
Content-Type: application/json
```

### Chat Completions Request
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello!"
    }
  ]
}
```

### Image Analysis Request
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What's in this image?"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/png;base64,iVBORw0KGgo..."
          }
        }
      ]
    }
  ]
}
```

## Response Format

### Success Response
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The response text here..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### Error Response
```json
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

## Image Requirements

- **Formats**: PNG, JPEG, WEBP, GIF (non-animated)
- **Size**: Up to 20 MB per image
- **Total**: Up to 50 MB per request
- **Encoding**: Base64 data URI format: `data:image/png;base64,{base64String}`

## Rate Limits

- **Free Tier**: 3 requests/minute
- **Paid Tier**: 60 requests/minute (varies by tier)
- **Higher Tiers**: Based on usage and billing

## Error Codes

- `401` - Invalid or missing API key
- `429` - Rate limit exceeded (too many requests)
- `500` - OpenAI server error
- `400` - Invalid request (bad format, missing fields, etc.)

## Next Steps

1. **Add API key** to your `.env` file
2. **Review** `OPENAI_INTEGRATION_EXAMPLE.ts` for integration patterns
3. **Update** `imageFlow.ts` route to use the OpenAI service
4. **Test** with the test script: `npm run test:request`

## Files to Modify

1. **`backend/src/routes/imageFlow.ts`**
   - Import `createOpenAIService`
   - Add prompt reconstruction step
   - Add prompt editing step
   - See example file for complete code

2. **`backend/.env`**
   - Add `OPENAI_API_KEY=sk-...`

## Testing

After integration, test with:
```bash
npm run test:request
```

The test will:
- Download a test image
- Send it to your API
- Show the full response including prompts

## Support

- [OpenAI Platform](https://platform.openai.com/)
- [API Documentation](https://platform.openai.com/docs/api-reference)
- [Error Codes](https://platform.openai.com/docs/guides/error-codes)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

