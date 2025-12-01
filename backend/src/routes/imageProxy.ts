import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { HttpError } from '../middlewares/errorHandler';
import { createLogger } from '../utils/logger';
import { config } from '../config';
import fetch from 'node-fetch';

const router = Router();
const logger = createLogger('imageProxyRoute');

/**
 * Proxy endpoint to fetch images from S3 storage
 * This bypasses CORS issues by fetching images server-side
 * 
 * Query params:
 * - url: The S3 image URL to fetch
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const imageUrl = req.query.url as string | undefined;
    const imageKey = req.query.key as string | undefined;

    // Support both URL and key parameters
    let finalUrl: string;

    if (imageKey) {
      // Construct URL from S3 key
      finalUrl = new URL(imageKey, config.storage.publicBaseUrl).toString();
      logger.info('Fetching image from S3 using key', { key: imageKey, url: finalUrl });
    } else if (imageUrl) {
      // Validate that the URL is from our storage domain for security
      const storageBaseUrl = config.storage.publicBaseUrl;
      if (storageBaseUrl && !imageUrl.startsWith(storageBaseUrl)) {
        logger.warn('Attempted to fetch image from unauthorized domain', { imageUrl, allowedBase: storageBaseUrl });
        throw new HttpError(403, 'Only images from configured storage are allowed');
      }
      finalUrl = imageUrl;
      logger.info('Fetching image from S3 using URL', { imageUrl });
    } else {
      throw new HttpError(400, 'Missing required query parameter: url or key');
    }

    try {
      // Fetch the image from S3
      const response = await fetch(finalUrl, {
        headers: {
          'User-Agent': 'MarketingAutomation-Backend/1.0',
        },
      });

      if (!response.ok) {
        throw new HttpError(
          response.status,
          `Failed to fetch image: ${response.statusText}`,
        );
      }

      // Get the content type from the response
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      // Use arrayBuffer() instead of deprecated buffer() method
      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // Set appropriate headers for image response
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', imageBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Send the image buffer
      res.send(imageBuffer);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      logger.error('Error fetching image from S3', { error, url: finalUrl, key: imageKey });
      throw new HttpError(500, `Failed to fetch image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),
);

export const imageProxyRouter = router;

