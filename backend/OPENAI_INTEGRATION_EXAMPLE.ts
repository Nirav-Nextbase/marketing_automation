/**
 * Example: How to integrate OpenAI service into imageFlow route
 * 
 * This shows how to use the OpenAI service for:
 * 1. Image analysis and prompt reconstruction
 * 2. Prompt editing with user instructions
 * 
 * Copy the relevant parts into your imageFlow.ts route
 */

import { createOpenAIService } from './src/services/openaiService';

// Initialize the service
const openaiService = createOpenAIService();

// ============================================
// EXAMPLE 1: Reconstruct prompt from image
// ============================================

async function exampleReconstructPrompt() {
  // In your route handler, you have:
  const baseImage = {
    buffer: Buffer.from('...'), // Your image buffer
    mimetype: 'image/png',
  };

  // Reconstruct prompt from image
  const reconstructedPrompt = await openaiService.reconstructPromptFromImage(
    baseImage.buffer,
    baseImage.mimetype,
  );

  console.log('Reconstructed prompt:', reconstructedPrompt);
}

// ============================================
// EXAMPLE 2: Apply user instructions
// ============================================

async function exampleApplyInstructions() {
  const basePrompt = 'A person standing in a room';
  const userInstructions = 'Change the background to a beach';
  const referenceImages = [
    {
      buffer: Buffer.from('...'),
      mimeType: 'image/jpeg',
    },
  ];

  // Apply user instructions
  const updatedPrompt = await openaiService.applyUserInstructions(
    basePrompt,
    userInstructions,
    referenceImages, // Optional
  );

  console.log('Updated prompt:', updatedPrompt);
}

// ============================================
// EXAMPLE 3: Custom image analysis
// ============================================

async function exampleCustomAnalysis() {
  const imageBuffer = Buffer.from('...');
  const mimeType = 'image/png';
  const prompt = 'Describe this image in detail';
  const systemPrompt = 'You are an expert image analyzer.';

  const analysis = await openaiService.analyzeImage(
    imageBuffer,
    mimeType,
    prompt,
    systemPrompt,
  );

  console.log('Analysis:', analysis);
}

// ============================================
// INTEGRATION INTO imageFlow.ts
// ============================================

/*
// In your imageFlow.ts route handler:

import { createOpenAIService } from '../services/openaiService';

// Initialize service (do this once, maybe at module level)
const openaiService = createOpenAIService();

// Inside your route handler:

// Step 1: Reconstruct prompt from base image
const reconstructedPrompt = await openaiService.reconstructPromptFromImage(
  baseImage.buffer,
  baseImage.mimetype,
);

// Step 2: Apply user instructions (with optional reference images)
const referenceImageBuffers = referenceImages.map(img => ({
  buffer: img.buffer,
  mimeType: img.mimetype,
}));

const finalPrompt = await openaiService.applyUserInstructions(
  reconstructedPrompt,
  payload.userPrompt,
  referenceImageBuffers.length > 0 ? referenceImageBuffers : undefined,
);

// Step 3: Generate image using the final prompt
const generatedImageBuffer = await geminiService.generateImage(
  finalPrompt,
  {
    aspectRatio: payload.aspectRatio,
  },
);

// Return response
return res.json({
  baseImage: baseImageUpload.url,
  referenceImages: referenceUploads.map((upload) => upload.url),
  prompt1: reconstructedPrompt,
  prompt2: finalPrompt,
  outputImage: outputUpload.url,
});
*/

// ============================================
// ERROR HANDLING EXAMPLE
// ============================================

async function exampleWithErrorHandling() {
  try {
    const prompt = await openaiService.reconstructPromptFromImage(
      Buffer.from('...'),
      'image/png',
    );
    return prompt;
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes('401')) {
        throw new Error('Invalid OpenAI API key');
      }
      if (error.message.includes('429')) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('400')) {
        throw new Error('Invalid request to OpenAI API');
      }
    }
    throw error;
  }
}

// ============================================
// FULL ROUTE INTEGRATION EXAMPLE
// ============================================

/*
// Complete example for imageFlow.ts route:

router.post(
  '/',
  upload.fields([...]),
  asyncHandler(async (req, res) => {
    // ... existing validation and upload code ...

    // Initialize OpenAI service
    const openaiService = createOpenAIService();

    // Reconstruct prompt from base image
    let reconstructedPrompt: string;
    try {
      reconstructedPrompt = await openaiService.reconstructPromptFromImage(
        baseImage.buffer,
        baseImage.mimetype,
      );
      
      if (!reconstructedPrompt || reconstructedPrompt.trim().length < 3) {
        throw new HttpError(
          502,
          'OpenAI did not return a valid prompt. Please try again.',
        );
      }
    } catch (error) {
      logger.error('OpenAI prompt reconstruction failed', error);
      throw new HttpError(
        502,
        error instanceof Error 
          ? `OpenAI error: ${error.message}`
          : 'OpenAI prompt reconstruction failed',
      );
    }

    // Apply user instructions
    let finalPrompt: string;
    try {
      const referenceImageBuffers = referenceUploads.length > 0
        ? referenceImages.map((img, index) => ({
            buffer: img.buffer,
            mimeType: img.mimetype,
          }))
        : undefined;

      finalPrompt = await openaiService.applyUserInstructions(
        reconstructedPrompt,
        payload.userPrompt,
        referenceImageBuffers,
      );

      if (!finalPrompt || finalPrompt.trim().length < 3) {
        throw new HttpError(
          502,
          'OpenAI did not return a valid updated prompt. Please try again.',
        );
      }
    } catch (error) {
      logger.error('OpenAI prompt editing failed', error);
      throw new HttpError(
        502,
        error instanceof Error
          ? `OpenAI error: ${error.message}`
          : 'OpenAI prompt editing failed',
      );
    }

    // Generate image using final prompt
    const generatedImageBuffer = await geminiService.generateImage(
      finalPrompt,
      {
        aspectRatio: payload.aspectRatio,
      },
    );

    // ... rest of your code ...
  }),
);
*/

