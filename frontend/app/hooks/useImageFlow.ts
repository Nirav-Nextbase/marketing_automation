"use client";

import { useCallback, useState } from 'react';
import { AspectRatio } from '../constants/aspectRatio';

export type ImageFlowResult = {
  baseImage: string; // URL (for backward compatibility)
  baseImageKey?: string; // S3 key
  referenceImages: string[]; // URLs (for backward compatibility)
  referenceImageKeys?: string[]; // S3 keys
  prompt1: string;
  prompt2: string;
  outputImage: string; // URL (for backward compatibility)
  outputImageKey?: string; // S3 key
  step2Executed?: boolean; // Indicates if Step 2 (prompt editing) was executed
};

type SubmitPayload = {
  baseImage: File;
  referenceImages: File[];
  userPrompt: string;
  aspectRatio: AspectRatio;
};

type UseImageFlowOptions = {
  onSuccess?: (result: ImageFlowResult, userPrompt: string, aspectRatio: AspectRatio) => void;
};

export const useImageFlow = (options?: UseImageFlowOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageFlowResult | null>(null);

  const runFlow = useCallback(async (payload: SubmitPayload) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      setProgressLabel('Uploading assets');
      const formData = new FormData();
      formData.append('baseImage', payload.baseImage);
      payload.referenceImages.forEach((file, index) =>
        formData.append(`referenceImages`, file, file.name ?? `reference-${index}`),
      );
      formData.append('userPrompt', payload.userPrompt);
      formData.append('aspectRatio', payload.aspectRatio);

      setProgressLabel('Orchestrating prompt pipeline');
      const response = await fetch('/api/image-flow', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Image flow failed');
      }

      const data = (await response.json()) as ImageFlowResult;
      setResult(data);
      setProgressLabel('Complete');
      
      // Call success callback if provided (for history saving)
      if (options?.onSuccess) {
        options.onSuccess(data, payload.userPrompt, payload.aspectRatio);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unexpected error while generating image',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    runFlow,
    isLoading,
    progressLabel,
    error,
    result,
  };
};

