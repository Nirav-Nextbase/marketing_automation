import { VertexAI } from '@google-cloud/vertexai';
import { config } from '../config';
import { createLogger } from '../utils/logger';
import { falImageService, FalImageService } from './falImageService';
import { AspectRatioOption } from '../constants/aspectRatio';

const logger = createLogger('geminiService');

if (config.google.credentialsPath) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = config.google.credentialsPath;
}

const vertexAI = new VertexAI({
  project: config.google.projectId,
  location: config.google.location,
});

const defaultModel = vertexAI.preview.getGenerativeModel({
  model: 'imagegeneration@005',
});

type GenerativeModel = ReturnType<typeof vertexAI.preview.getGenerativeModel>;

type ImageGenerationOptions = {
  aspectRatio?: AspectRatioOption;
};

const RESOURCE_EXHAUSTED_CODE = 8;
const RESOURCE_EXHAUSTED_STATUS = 'RESOURCE_EXHAUSTED';

export class GeminiService {
  constructor(
    private readonly model: GenerativeModel = defaultModel,
    private readonly fallbackService: FalImageService = falImageService,
  ) {}

  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {},
  ): Promise<Buffer> {
    const resolvedOptions: ImageGenerationOptions = {
      ...options,
      aspectRatio: options.aspectRatio ?? config.fal.aspectRatio,
    };

    try {
      return await this.generateWithVertex(prompt, resolvedOptions);
    } catch (error) {
      if (this.isQuotaExhaustedError(error)) {
        logger.info(
          'Vertex AI quota exhausted, routing request to fal.ai fallback',
        );
        return this.fallbackService.generateImage(prompt, resolvedOptions);
      }

      logger.error('Gemini Vertex AI image generation failed', error);
      throw error;
    }
  }

  private async generateWithVertex(
    prompt: string,
    options: ImageGenerationOptions,
  ): Promise<Buffer> {
    logger.info('Generating image via Vertex AI Gemini');
    const request: Parameters<GenerativeModel['generateContent']>[0] = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const generationConfig = this.buildVertexGenerationConfig(options);
    if (generationConfig) {
      request.generationConfig = generationConfig;
    }

    const response = await this.model.generateContent(request);

    const candidates = response.response?.candidates ?? [];
    const inlineData = candidates[0]?.content?.parts?.find(
      (part) => 'inlineData' in part,
    ) as { inlineData: { data: string } } | undefined;

    if (!inlineData?.inlineData?.data) {
      throw new Error('Gemini did not return inline image data');
    }

    return Buffer.from(inlineData.inlineData.data, 'base64');
  }

  private buildVertexGenerationConfig(
    options: ImageGenerationOptions,
  ): Record<string, unknown> | undefined {
    if (!options.aspectRatio) {
      return undefined;
    }

    return {
      imageConfig: {
        aspectRatio: options.aspectRatio,
      },
    };
  }

  private isQuotaExhaustedError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const candidate = error as {
      code?: number | string;
      status?: string;
      details?: string;
      message?: string;
    };

    if (
      candidate.code === RESOURCE_EXHAUSTED_CODE ||
      candidate.code === RESOURCE_EXHAUSTED_STATUS ||
      candidate.status === RESOURCE_EXHAUSTED_STATUS
    ) {
      return true;
    }

    const detailText = `${candidate.details ?? ''} ${candidate.message ?? ''}`.toUpperCase();
    return (
      detailText.includes(RESOURCE_EXHAUSTED_STATUS) ||
      detailText.includes('QUOTA')
    );
  }
}

export const geminiService = new GeminiService();

