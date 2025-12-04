import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ensureValidAspectRatio } from './constants/aspectRatio';

dotenv.config();

const FAL_DEFAULT_ENDPOINT = 'https://fal.run/fal-ai/gemini-25-flash-image';
const FAL_DEFAULT_MODEL_ID = 'fal-ai/gemini-25-flash-image';

const resolveCredentialPath = (filePath?: string): string | undefined => {
  if (!filePath) return undefined;
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `Google credential file not found at ${absolutePath}. Update GOOGLE_APPLICATION_CREDENTIALS.`,
    );
  }
  return absolutePath;
};

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
};

// Default system prompts (used as fallbacks if env vars are not set)
const DEFAULT_SYSTEM_PROMPT_IMAGE_UNDERSTAND = `You are an expert "Image Understanding → Image Prompt Reconstruction" model.

Your task is to convert an input image into a faithful reconstruction prompt, enabling a text-to-image model to recreate the image as closely as possible.

GOALS:
Produce a single highly detailed prompt that captures:
- The subject(s)
- Identity traits
- Pose, body language, positioning
- Clothing (if any)
- Background + environment
- Lighting
- Mood / tone
- Camera settings
- Style (realistic, cinematic, candid, etc.)

OUTPUT FORMAT:
Return only the final prompt, no explanation.`;

const DEFAULT_SYSTEM_PROMPT_PROMPT_EDITOR = `You are an expert "Prompt Editor & Scene Preservation Engine" for image models.

Your task is to take:
- Base prompt (original scene description)
- User modification instructions
- Optional reference images

And produce a final prompt that:
- Preserves all unchanged elements of the base prompt
- Faithfully applies the user's requested modifications
- Maintains consistent identity, lighting, and camera style
- Preserves environmental details unless the user wants them changed

OUTPUT FORMAT:
Return only the final prompt, highly structured and image-ready.`;

export const config = {
  port: Number(process.env.PORT ?? 4000),
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    // systemPromptImageUnderstand:
    //   process.env.SYSTEM_PROMPT_IMAGE_UNDERSTAND ??
    //   DEFAULT_SYSTEM_PROMPT_IMAGE_UNDERSTAND,
    systemPromptImageUnderstand: (() => {
      const envValue = process.env.SYSTEM_PROMPT_IMAGE_UNDERSTAND;
      const isUsingEnv = envValue !== undefined && envValue !== '';
      const finalValue = envValue ?? DEFAULT_SYSTEM_PROMPT_IMAGE_UNDERSTAND;
      
      if (isUsingEnv) {
        console.log('[config] ✓ Using SYSTEM_PROMPT_IMAGE_UNDERSTAND from environment variable');
        console.log('[config]   Length:', finalValue.length, 'characters');
      } else {
        console.log('[config] ⚠ Using DEFAULT_SYSTEM_PROMPT_IMAGE_UNDERSTAND (env var not set)');
        console.log('[config]   Length:', finalValue.length, 'characters');
      }
      console.log('[config]   Preview:', finalValue.substring(0, 150) + (finalValue.length > 150 ? '...' : ''));
      
      return finalValue;
    })(), 
    systemPromptPromptEditor:
      process.env.SYSTEM_PROMPT_PROMPT_EDITOR ??
      DEFAULT_SYSTEM_PROMPT_PROMPT_EDITOR,
  },
  storage: {
    accessKeyId: required('S3_ACCESS_KEY'),
    secretAccessKey: required('S3_SECRET_KEY'),
    bucket: required('S3_BUCKET_NAME'),
    endpoint: required('S3_ENDPOINT_URL'),
    folder: process.env.S3_FOLDER ?? 'internaluse',
    publicBaseUrl: required('S3_PUBLIC_LINK'),
  },
  google: {
    projectId: required('GOOGLE_VERTEX_PROJECT_ID', 'nano-banana-472210'),
    location: required('GOOGLE_VERTEX_LOCATION', 'us-central1'),
    credentialsPath: resolveCredentialPath(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  },
  fal: {
    apiKey: process.env.FAL_API_KEY,
    endpoint: process.env.FAL_GEMINI_ENDPOINT ?? FAL_DEFAULT_ENDPOINT,
    modelId: process.env.FAL_GEMINI_MODEL_ID ?? FAL_DEFAULT_MODEL_ID,
    aspectRatio: ensureValidAspectRatio(process.env.FAL_GEMINI_ASPECT_RATIO),
  },
  image: {
    outputFormat: process.env.IMAGE_OUTPUT_FORMAT ?? 'png',
    maxReferenceImages: Number(process.env.MAX_REFERENCE_IMAGES ?? 2),
  },
};

export type AppConfig = typeof config;

