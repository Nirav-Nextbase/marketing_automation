import fetch, { RequestInit, Response } from 'node-fetch';
import { config } from '../config';
import { createLogger } from '../utils/logger';
import { AspectRatioOption } from '../constants/aspectRatio';

const logger = createLogger('falImageService');

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

type FalImageReference = {
  url?: string;
  file_name?: string;
  content_type?: string;
};

type FalImageResponse = {
  images?: FalImageReference[];
  description?: string;
};

type FalImageOptions = {
  aspectRatio?: AspectRatioOption;
};

export class FalImageService {
  constructor(private readonly httpClient: FetchLike = fetch) {}

  /**
   * Vertex AI quota can be exceeded during peak traffic. To keep the pipeline
   * responsive we route overflow traffic to fal.ai's hosted Gemini endpoint.
   */
  async generateImage(
    prompt: string,
    options: FalImageOptions = {},
  ): Promise<Buffer> {
    if (!config.fal.apiKey) {
      throw new Error(
        'FAL_API_KEY must be configured to use fal.ai as a fallback provider.',
      );
    }

    logger.info('Generating image via fal.ai Gemini 2.5 Flash Image');

    const falResponse = await this.httpClient(config.fal.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Key ${config.fal.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        num_images: 1,
        aspect_ratio: options.aspectRatio ?? config.fal.aspectRatio,
        output_format: config.image.outputFormat,
      }),
    });

    if (!falResponse.ok) {
      const responseBody = await falResponse.text();
      throw new Error(
        `fal.ai request failed (${falResponse.status}): ${responseBody}`,
      );
    }

    const payload = (await falResponse.json()) as FalImageResponse;
    const imageUrl = payload.images?.[0]?.url;

    if (!imageUrl) {
      throw new Error('fal.ai response did not include an image URL.');
    }

    const imageResponse = await this.httpClient(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(
        `fal.ai image download failed with status ${imageResponse.status}.`,
      );
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

export const falImageService = new FalImageService();

