/**
 * OpenAI API Service
 * 
 * This service provides methods to interact with OpenAI's API for:
 * - Chat completions
 * - Image analysis with vision models
 * - Text generation
 * 
 * Documentation: See OPENAI_API_INTEGRATION.md
 */

import fetch from 'node-fetch';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('openaiService');

// OpenAI API base URL
const OPENAI_API_BASE = 'https://api.openai.com/v1';

// Supported models
export const OPENAI_MODELS = {
  CHAT: 'gpt-4o',
  VISION: 'gpt-4o',
  LIGHTWEIGHT: 'gpt-4o-mini',
} as const;

type OpenAIModel = typeof OPENAI_MODELS[keyof typeof OPENAI_MODELS];

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
  }>;
}

interface ChatCompletionRequest {
  model: OpenAIModel;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

/**
 * Structured JSON response from OpenAI for prompt generation
 */
export interface PromptGenerationResponse {
  prompt: string;
  isPromptGenerated: boolean;
}

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || config.openai?.apiKey || '';
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable.');
    }
  }

  /**
   * Makes a request to OpenAI API with proper error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    body: Record<string, any>,
  ): Promise<T> {
    const url = `${OPENAI_API_BASE}${endpoint}`;
    
    logger.info(`Making request to OpenAI API: ${endpoint}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const responseData = await response.json() as T | OpenAIError;

      if (!response.ok) {
        const error = responseData as OpenAIError;
        logger.error('OpenAI API error', {
          status: response.status,
          error: error.error,
        });
        throw new Error(
          `OpenAI API error (${response.status}): ${error.error?.message || response.statusText}`,
        );
      }

      return responseData as T;
    } catch (error) {
      logger.error('OpenAI API request failed', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('OpenAI API request failed');
    }
  }

  /**
   * Chat completions - for text-based conversations
   */
  async chatCompletions(
    messages: ChatMessage[],
    options: {
      model?: OpenAIModel;
      temperature?: number;
      maxTokens?: number;
      jsonMode?: boolean;
    } = {},
  ): Promise<string> {
    const request: ChatCompletionRequest = {
      model: options.model || OPENAI_MODELS.CHAT,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
    };

    // Enable JSON mode if requested
    if (options.jsonMode) {
      request.response_format = { type: 'json_object' };
    }

    const response = await this.makeRequest<ChatCompletionResponse>(
      '/chat/completions',
      request,
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI did not return any content');
    }

    logger.info('Chat completion successful', {
      tokens: response.usage.total_tokens,
      model: response.model,
    });

    return content;
  }

  /**
   * Chat completions with JSON structured output
   * Returns a structured response with prompt and isPromptGenerated flag
   */
  async chatCompletionsJSON(
    messages: ChatMessage[],
    options: {
      model?: OpenAIModel;
      temperature?: number;
      maxTokens?: number;
    } = {},
  ): Promise<PromptGenerationResponse> {
    // Ensure the last message instructs JSON format
    const jsonInstruction = `\n\nIMPORTANT: You must respond with a valid JSON object in this exact format:
{
  "prompt": "the generated prompt text here",
  "isPromptGenerated": true
}

If you cannot generate the prompt (e.g., content policy violation, unclear request), set isPromptGenerated to false and provide a brief explanation in the prompt field.`;

    // Add JSON instruction to the last user message
    const modifiedMessages = [...messages];
    const lastMessage = modifiedMessages[modifiedMessages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      if (typeof lastMessage.content === 'string') {
        modifiedMessages[modifiedMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + jsonInstruction,
        };
      } else if (Array.isArray(lastMessage.content)) {
        // Find the last text content and append instruction
        const contentArray = [...lastMessage.content];
        const lastTextIndex = contentArray.length - 1;
        if (contentArray[lastTextIndex]?.type === 'text') {
          contentArray[lastTextIndex] = {
            ...contentArray[lastTextIndex],
            text: (contentArray[lastTextIndex].text || '') + jsonInstruction,
          };
        } else {
          contentArray.push({ type: 'text', text: jsonInstruction });
        }
        modifiedMessages[modifiedMessages.length - 1] = {
          ...lastMessage,
          content: contentArray,
        };
      }
    }

    const content = await this.chatCompletions(modifiedMessages, {
      ...options,
      jsonMode: true,
    });

      // Parse JSON response
      try {
        // Extract JSON from response (handle cases where response might have extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          logger.info('No JSON found in response, treating as plain text', { content });
          return {
            prompt: content,
            isPromptGenerated: false,
          };
        }

        const parsed = JSON.parse(jsonMatch[0]) as Partial<PromptGenerationResponse>;

        // Validate response structure
        if (
          typeof parsed.prompt === 'string' &&
          typeof parsed.isPromptGenerated === 'boolean'
        ) {
          return {
            prompt: parsed.prompt.trim(),
            isPromptGenerated: parsed.isPromptGenerated,
          };
        }

        logger.info('Invalid JSON structure in response', { parsed });
        return {
          prompt: parsed.prompt || content,
          isPromptGenerated: parsed.isPromptGenerated ?? false,
        };
    } catch (error) {
      logger.error('Failed to parse JSON response', { error, content });
      // Check if content indicates refusal
      const isRefusal =
        content.toLowerCase().includes("i'm sorry") ||
        content.toLowerCase().includes("i can't assist") ||
        content.toLowerCase().includes("cannot") ||
        content.toLowerCase().includes("unable to");

      return {
        prompt: content,
        isPromptGenerated: !isRefusal,
      };
    }
  }

  /**
   * Analyze an image using vision model
   * 
   * @param imageBuffer - The image file buffer
   * @param mimeType - Image MIME type (e.g., 'image/png')
   * @param prompt - Text prompt describing what to analyze
   * @param systemPrompt - Optional system prompt for context
   */
  async analyzeImage(
    imageBuffer: Buffer,
    mimeType: string,
    prompt: string,
    systemPrompt?: string,
  ): Promise<string> {
    // Convert buffer to base64 data URI
    const base64 = imageBuffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;

    const messages: ChatMessage[] = [];

    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Add user message with image and prompt
    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: prompt,
        },
        {
          type: 'image_url',
          image_url: {
            url: dataUri,
          },
        },
      ],
    });

    return this.chatCompletions(messages, {
      model: OPENAI_MODELS.VISION,
    });
  }

  /**
   * Reconstruct a prompt from an image
   * Analyzes the image and generates a detailed prompt that could recreate it
   * Returns a response with prompt and isPromptGenerated flag to detect refusals
   */
  async reconstructPromptFromImage(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<PromptGenerationResponse> {
    // Use system prompt from config (reads from SYSTEM_PROMPT_IMAGE_UNDERSTAND env var)
    const systemPrompt = config.openai.systemPromptImageUnderstand;

    const userPrompt = 'Analyze this image and return a detailed prompt that could recreate it.';

    const content = await this.analyzeImage(imageBuffer, mimeType, userPrompt, systemPrompt);
    
    // Check if content indicates refusal (similar to chatCompletionsJSON)
    const isRefusal =
      content.toLowerCase().includes("i'm sorry") ||
      content.toLowerCase().includes("i can't assist") ||
      content.toLowerCase().includes("can't help") ||
      content.toLowerCase().includes("cannot") ||
      content.toLowerCase().includes("unable to");

    return {
      prompt: content,
      isPromptGenerated: !isRefusal,
    };
  }

  /**
   * Apply user instructions to modify a base prompt
   * Takes a base prompt and user instructions, returns an updated prompt with generation status
   */
  async applyUserInstructions(
    basePrompt: string,
    userInstructions: string,
    referenceImageBuffers?: Array<{ buffer: Buffer; mimeType: string }>,
  ): Promise<PromptGenerationResponse> {
    // Use system prompt from config (reads from SYSTEM_PROMPT_PROMPT_EDITOR env var)
    const systemPrompt = config.openai.systemPromptPromptEditor;

    const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [
      {
        type: 'text',
        text: `Task: Edit an image generation prompt for a text-to-image AI model.

Base prompt:
${basePrompt}

User modification instructions:
${userInstructions}

Update the base prompt by incorporating the user's modifications. Preserve all unchanged elements.`,
      },
    ];

    // Add reference images if provided
    if (referenceImageBuffers) {
      referenceImageBuffers.forEach((ref, index) => {
        const base64 = ref.buffer.toString('base64');
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:${ref.mimeType};base64,${base64}`,
          },
        });
        content.push({
          type: 'text',
          text: `Reference image #${index + 1}`,
        });
      });
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content,
      },
    ];

    return this.chatCompletionsJSON(messages, {
      model: OPENAI_MODELS.CHAT,
    });
  }
}

// Export singleton instance (will be created when config is available)
export const createOpenAIService = (apiKey?: string) => new OpenAIService(apiKey);

