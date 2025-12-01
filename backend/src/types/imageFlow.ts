import { z } from 'zod';
import { ASPECT_RATIO_OPTIONS } from '../constants/aspectRatio';

export const imageFlowSchema = z.object({
  // userPrompt is optional - if empty/not provided, Step 2 will be skipped and prompt1 will be used directly
  userPrompt: z.string().optional(),
  baseImageUrl: z.string().optional(),
  referenceImageUrls: z.array(z.string()).optional(),
  aspectRatio: z.enum(ASPECT_RATIO_OPTIONS).optional(),
});

export type ImageFlowPayload = z.infer<typeof imageFlowSchema>;

