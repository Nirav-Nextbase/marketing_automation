import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../middlewares/asyncHandler';
import { imageFlowSchema } from '../types/imageFlow';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { createOpenAIService, PromptGenerationResponse } from '../services/openaiService';
import { config } from '../config';
import { HttpError } from '../middlewares/errorHandler';
import { createLogger } from '../utils/logger';

// Image validation constants
const MAX_PAYLOAD_SIZE = 50 * 1024 * 1024; // 50 MB total per request
const SUPPORTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
] as const;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PAYLOAD_SIZE,
    files: 1 + config.image.maxReferenceImages,
  },
  fileFilter: (_req, file, cb) => {
    const isValidMimeType = SUPPORTED_MIME_TYPES.includes(
      file.mimetype as any,
    );
    if (isValidMimeType) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type: ${file.mimetype}. Supported formats: PNG, JPEG, WEBP, and non-animated GIF.`,
        ),
      );
    }
  },
});

const router = Router();
const logger = createLogger('imageFlowRoute');

/**
 * Validates image files:
 * - Supported formats: PNG, JPEG, WEBP, GIF (non-animated)
 * - Size limit: Up to 50 MB total payload per request
 */
const validateImage = (
  file: Express.Multer.File,
  context: string,
): void => {
  if (!SUPPORTED_MIME_TYPES.includes(file.mimetype as any)) {
    throw new HttpError(
      400,
      `${context}: Unsupported image format. Supported: PNG, JPEG, WEBP, GIF. Received: ${file.mimetype}`,
    );
  }

  if (file.size > MAX_PAYLOAD_SIZE) {
    throw new HttpError(
      400,
      `${context}: Image size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds 50 MB limit.`,
    );
  }
};

/**
 * Validates total payload size for all images in the request
 */
const validateTotalPayloadSize = (
  baseImage: Express.Multer.File,
  referenceImages: Express.Multer.File[],
): void => {
  const totalSize =
    baseImage.size + referenceImages.reduce((sum, img) => sum + img.size, 0);

  if (totalSize > MAX_PAYLOAD_SIZE) {
    throw new HttpError(
      400,
      `Total image payload size (${(totalSize / 1024 / 1024).toFixed(2)} MB) exceeds 50 MB limit per request.`,
    );
  }
};

router.post(
  '/',
  upload.fields([
    { name: 'baseImage', maxCount: 1 },
    { name: 'referenceImages', maxCount: config.image.maxReferenceImages },
  ]),
  asyncHandler(async (req, res) => {
    const baseImage = (req.files as Record<string, Express.Multer.File[]>)?.[
      'baseImage'
    ]?.[0];

    if (!baseImage) {
      throw new HttpError(400, 'baseImage file is required');
    }

    const referenceImages =
      (req.files as Record<string, Express.Multer.File[]>)?.['referenceImages'] ??
      [];

    // Validate all images
    validateImage(baseImage, 'Base image');
    referenceImages.forEach((img, index) => {
      validateImage(img, `Reference image ${index + 1}`);
    });
    validateTotalPayloadSize(baseImage, referenceImages);

    const payload = imageFlowSchema.parse({
      userPrompt: req.body.userPrompt,
      aspectRatio: req.body.aspectRatio,
    });

    // Upload images to storage
    const baseImageUpload = await storageService.uploadBuffer({
      buffer: baseImage.buffer,
      mimeType: baseImage.mimetype,
      prefix: 'inputs',
    });

    const referenceUploads = await Promise.all(
      referenceImages.map((image) =>
        storageService.uploadBuffer({
          buffer: image.buffer,
          mimeType: image.mimetype,
          prefix: 'inputs',
        }),
      ),
    );

    // Initialize OpenAI service
    const openaiService = createOpenAIService();

    // ============================================
    // STEP 1: Base Image → OpenAI (systemPrompt1) → prompt1
    // ============================================
    logger.info('Step 1: Reconstructing prompt from base image');
    let prompt1: string;
    try {
      const promptResponse1: PromptGenerationResponse =
        await openaiService.reconstructPromptFromImage(
          baseImage.buffer,
          baseImage.mimetype,
        );

      // Check if prompt was successfully generated
      if (!promptResponse1.isPromptGenerated) {
        logger.error('Step 1 failed: OpenAI refused to generate prompt', {
          prompt: promptResponse1.prompt,
          isPromptGenerated: promptResponse1.isPromptGenerated,
        });
        
        // Return early without proceeding to Step 2 and Step 3
        return res.status(502).json({
          baseImage: baseImageUpload.url,
          referenceImages: referenceUploads.map((upload) => upload.url),
          prompt1: promptResponse1.prompt || 'Prompt reconstruction failed',
          prompt2: null,
          outputImage: null,
          error: `OpenAI could not reconstruct the prompt: ${promptResponse1.prompt || 'Request was refused. Please try with a different image.'}`,
          isPromptGenerated: false,
        });
      }

      const trimmedPrompt1 = promptResponse1.prompt.trim();
      if (!trimmedPrompt1 || trimmedPrompt1.length < 3) {
        logger.error('Step 1 failed: OpenAI returned invalid prompt', {
          length: trimmedPrompt1.length,
          preview: trimmedPrompt1.substring(0, 50),
        });
        
        // Return early without proceeding to Step 2 and Step 3
        return res.status(502).json({
          baseImage: baseImageUpload.url,
          referenceImages: referenceUploads.map((upload) => upload.url),
          prompt1: trimmedPrompt1 || 'Invalid prompt',
          prompt2: null,
          outputImage: null,
          error: 'OpenAI did not return a valid reconstructed prompt. Please try again with a different image.',
          isPromptGenerated: false,
        });
      }
      prompt1 = trimmedPrompt1;
      logger.info('Step 1 complete: Prompt reconstructed', {
        length: prompt1.length,
        preview: prompt1.substring(0, 100),
      });
    } catch (error) {
      logger.error('Step 1 failed: Prompt reconstruction error', error);
      
      // Return early without proceeding to Step 2 and Step 3
      return res.status(502).json({
        baseImage: baseImageUpload.url,
        referenceImages: referenceUploads.map((upload) => upload.url),
        prompt1: null,
        prompt2: null,
        outputImage: null,
        error: error instanceof Error
          ? `OpenAI prompt reconstruction failed: ${error.message}`
          : 'OpenAI prompt reconstruction failed',
        isPromptGenerated: false,
      });
    }

    // ============================================
    // STEP 2: prompt1 + User Instructions + Reference Images → OpenAI (systemPrompt2) → prompt2
    // Skip Step 2 if userPrompt is empty/not provided - use prompt1 directly for Step 3
    // ============================================
    let prompt2: string;
    let step2Executed = false; // Track if Step 2 was actually executed
    
    // Check if user provided modification instructions
    const userPrompt = payload.userPrompt?.trim() || '';
    const hasUserInstructions = userPrompt.length > 0;
    
    if (!hasUserInstructions) {
      // Skip Step 2: Use prompt1 directly for image generation
      logger.info('Step 2 skipped: No user instructions provided, using prompt1 directly');
      prompt2 = prompt1;
      step2Executed = false;
    } else {
      // Proceed with Step 2: Apply user instructions to prompt1
      logger.info('Step 2: Applying user instructions to prompt');
      try {
        // Prepare reference images if provided
        const referenceImageBuffers =
          referenceImages.length > 0
            ? referenceImages.map((img) => ({
                buffer: img.buffer,
                mimeType: img.mimetype,
              }))
            : undefined;

        const promptResponse: PromptGenerationResponse =
          await openaiService.applyUserInstructions(
            prompt1,
            userPrompt,
            referenceImageBuffers,
          );

        // Check if prompt was successfully generated
        if (!promptResponse.isPromptGenerated) {
          logger.error('Step 2 failed: OpenAI refused to generate prompt', {
            prompt: promptResponse.prompt,
            isPromptGenerated: promptResponse.isPromptGenerated,
          });
          
          // Return early without generating image
          return res.status(502).json({
            baseImage: baseImageUpload.url,
            referenceImages: referenceUploads.map((upload) => upload.url),
            prompt1: prompt1,
            prompt2: promptResponse.prompt || 'Prompt generation failed',
            outputImage: null,
            error: `OpenAI could not generate the prompt: ${promptResponse.prompt || 'Request was refused. Please try different instructions.'}`,
            isPromptGenerated: false,
          });
        }

        const trimmedPrompt2 = promptResponse.prompt.trim();
        if (!trimmedPrompt2 || trimmedPrompt2.length < 3) {
          logger.error('Step 2 failed: OpenAI returned invalid updated prompt', {
            length: trimmedPrompt2.length,
            preview: trimmedPrompt2.substring(0, 50),
            isPromptGenerated: promptResponse.isPromptGenerated,
          });
          
          // Return early without generating image
          return res.status(502).json({
            baseImage: baseImageUpload.url,
            referenceImages: referenceUploads.map((upload) => upload.url),
            prompt1: prompt1,
            prompt2: trimmedPrompt2 || 'Invalid prompt',
            outputImage: null,
            error: 'OpenAI did not return a valid updated prompt. Please try again.',
            isPromptGenerated: false,
          });
        }
        prompt2 = trimmedPrompt2;
        step2Executed = true; // Step 2 was successfully executed
        logger.info('Step 2 complete: Prompt updated', {
          length: prompt2.length,
          preview: prompt2.substring(0, 100),
          isPromptGenerated: promptResponse.isPromptGenerated,
        });
      } catch (error) {
        logger.error('Step 2 failed: Prompt editing error', error);
        
        // Return early without generating image
        return res.status(502).json({
          baseImage: baseImageUpload.url,
          referenceImages: referenceUploads.map((upload) => upload.url),
          prompt1: prompt1,
          prompt2: null,
          outputImage: null,
          error: error instanceof Error
            ? `OpenAI prompt editing failed: ${error.message}`
            : 'OpenAI prompt editing failed',
          isPromptGenerated: false,
        });
      }
    }

    // ============================================
    // STEP 3: prompt2 → Gemini/Vertex AI → Generated Image
    // Only proceed if prompt was successfully generated
    // ============================================
    logger.info('Step 3: Generating image with final prompt');
    const generatedImageBuffer = await geminiService.generateImage(
      prompt2,
      {
        aspectRatio: payload.aspectRatio,
      },
    );

    const outputUpload = await storageService.uploadBuffer({
      buffer: generatedImageBuffer,
      mimeType: `image/${config.image.outputFormat}`,
      prefix: 'outputs',
      extension: config.image.outputFormat,
    });

    return res.json({
      baseImage: baseImageUpload.url,
      baseImageKey: baseImageUpload.key,
      referenceImages: referenceUploads.map((upload) => upload.url),
      referenceImageKeys: referenceUploads.map((upload) => upload.key),
      prompt1: prompt1,
      prompt2: prompt2,
      outputImage: outputUpload.url,
      outputImageKey: outputUpload.key,
      isPromptGenerated: true,
      step2Executed: step2Executed, // Indicate if Step 2 was executed
    });
  }),
);

export const imageFlowRouter = router;

