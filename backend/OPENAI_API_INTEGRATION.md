# OpenAI API Integration Guide

This guide covers how to integrate OpenAI API from scratch, including authentication, request formats, and payload structures.

## Table of Contents
1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Request Format](#request-format)
4. [Image Analysis with Vision Models](#image-analysis-with-vision-models)
5. [Chat Completions](#chat-completions)
6. [Error Handling](#error-handling)
7. [Implementation Examples](#implementation-examples)

## Authentication

### API Key Setup
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Store it securely in environment variables: `OPENAI_API_KEY=sk-...`

### Headers
All requests require the `Authorization` header:

```http
Authorization: Bearer sk-your-api-key-here
Content-Type: application/json
```

## API Endpoints

### Base URL
- **Production**: `https://api.openai.com/v1`
- **Chat Completions**: `https://api.openai.com/v1/chat/completions`
- **Responses API** (for image analysis): `https://api.openai.com/v1/responses`

## Request Format

### Basic Structure
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

### cURL Example
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## Image Analysis with Vision Models

### Supported Models
- `gpt-4o` - Latest vision model
- `gpt-4-turbo` - Vision capable
- `gpt-4.1-mini` - Lightweight vision model (if available)

### Image Input Formats

#### Option 1: Image URL (Public HTTPS)
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
            "url": "https://example.com/image.png"
          }
        }
      ]
    }
  ]
}
```

#### Option 2: Base64 Data URI
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Describe this image"
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

### Image Requirements
- **Formats**: PNG, JPEG, WEBP, GIF (non-animated)
- **Size**: Up to 20 MB per image
- **Total**: Up to 50 MB per request
- **URLs**: Must be publicly accessible via HTTPS

## Chat Completions

### Basic Chat Request
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
      "content": "Explain quantum computing in simple terms."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

### Response Format
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
        "content": "Quantum computing is..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}
```

## Responses API (Image Analysis)

### Request Format
```json
{
  "model": "gpt-4.1-mini",
  "input": [
    {
      "role": "system",
      "content": [
        {
          "type": "input_text",
          "text": "You are an expert image analyzer."
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Analyze this image and describe it."
        },
        {
          "type": "input_image",
          "image_url": "data:image/png;base64,..."
        }
      ]
    }
  ]
}
```

### Response Format
```json
{
  "output_text": ["Detailed image description here..."],
  "output": [
    {
      "type": "message",
      "content": [
        {
          "type": "text",
          "text": "Detailed image description here..."
        }
      ]
    }
  ]
}
```

## Error Handling

### Common Error Codes
- `401` - Invalid API key
- `429` - Rate limit exceeded
- `500` - Server error
- `400` - Invalid request

### Error Response Format
```json
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

### Retry Logic
```javascript
async function callOpenAIWithRetry(request, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}
```

## Implementation Examples

### Node.js with fetch
```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
  }),
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

### Node.js with Base64 Image
```javascript
const fs = require('fs');
const imageBuffer = fs.readFileSync('image.png');
const base64Image = imageBuffer.toString('base64');

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What is in this image?' },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${base64Image}`
            }
          }
        ]
      }
    ],
  }),
});
```

### TypeScript Service Example
```typescript
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
  }>;
}

class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chatCompletions(messages: ChatMessage[], model = 'gpt-4o') {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  async analyzeImage(imageBuffer: Buffer, prompt: string) {
    const base64 = imageBuffer.toString('base64');
    
    return this.chatCompletions([
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${base64}`
            }
          }
        ]
      }
    ], 'gpt-4o');
  }
}
```

## Rate Limits

- **Tier 1 (Free)**: 3 requests/minute
- **Tier 2 (Paid)**: 60 requests/minute
- **Tier 3+**: Higher limits based on usage

## Best Practices

1. **Store API keys securely** - Never commit keys to version control
2. **Implement retry logic** - Handle rate limits and transient errors
3. **Monitor token usage** - Track costs and optimize prompts
4. **Use appropriate models** - Choose models based on task complexity
5. **Validate inputs** - Check image sizes and formats before sending
6. **Handle errors gracefully** - Provide meaningful error messages

## Resources

- [OpenAI Platform](https://platform.openai.com/)
- [API Reference](https://platform.openai.com/docs/api-reference)
- [Models Overview](https://platform.openai.com/docs/models)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Error Codes](https://platform.openai.com/docs/guides/error-codes)

